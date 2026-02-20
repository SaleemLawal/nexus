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
    <div className="p-6">
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
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: currentBoard.cover_color }}
              />
              <h2 className="text-lg font-semibold text-foreground">{currentBoard.title}</h2>
              {currentBoard.description && (
                <span className="text-sm text-muted-foreground">
                  — {currentBoard.description}
                </span>
              )}
            </div>
          )}
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)} className="gap-1.5 shrink-0">
          <Plus className="w-4 h-4" />
          Add Pin
        </Button>
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
