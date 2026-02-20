'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useSpaceStore } from '@/stores/spaceStore';
import { useUserStore } from '@/stores/userStore';
import PinGrid from '@/components/boards/PinGrid';
import CreatePinModal from '@/components/boards/CreatePinModal';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';

export default function BoardPage() {
  const params = useParams<{ spaceId: string; boardId: string }>();
  const { spaceId, boardId } = params;
  const user = useUserStore((s) => s.user);
  const { fetchPins, setCurrentBoard, addPin } = useSpaceStore();
  const [showCreate, setShowCreate] = useState(false);
  const currentBoard = useSpaceStore((s) => s.currentBoard);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchPins(boardId);
    api.boards.get(boardId).then(setCurrentBoard).catch(console.error);

    // Realtime: new pins from other collaborators
    const channel = supabase
      .channel(`pins:${boardId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'pins', filter: `board_id=eq.${boardId}` },
        () => {
          fetchPins(boardId);
        },
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'pins', filter: `board_id=eq.${boardId}` },
        () => {
          fetchPins(boardId);
        },
      )
      .subscribe();

    channelRef.current = channel;
    return () => { channel.unsubscribe(); };
  }, [user, boardId, fetchPins, setCurrentBoard, addPin]);

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/spaces/${spaceId}`}>
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          {currentBoard && (
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: currentBoard.cover_color }}
              />
              <h2
                className="font-display font-700 text-lg"
                style={{ color: 'oklch(0.22 0.03 52)', letterSpacing: '-0.01em' }}
              >
                {currentBoard.title}
              </h2>
              {currentBoard.description && (
                <span className="font-editorial text-sm" style={{ color: 'oklch(0.50 0.025 58)', fontStyle: 'italic' }}>
                  — {currentBoard.description}
                </span>
              )}
            </div>
          )}
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-display font-600 text-sm text-white transition-all hover:opacity-90 shrink-0"
          style={{ background: '#D4654A', boxShadow: '0 2px 8px #D4654A33' }}
        >
          <Plus className="w-3.5 h-3.5" />
          Add Pin
        </button>
      </div>

      <PinGrid boardId={boardId} />

      <CreatePinModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        boardId={boardId}
      />
    </div>
  );
}
