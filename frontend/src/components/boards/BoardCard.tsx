'use client';

import Link from 'next/link';
import { Trash2, Pin } from 'lucide-react';
import type { Board } from '@/types';
import { api } from '@/lib/api';
import { useSpaceStore } from '@/stores/spaceStore';
import { toast } from 'sonner';

interface BoardCardProps {
  board: Board;
  spaceId: string;
}

export default function BoardCard({ board, spaceId }: BoardCardProps) {
  const removeBoard = useSpaceStore((s) => s.removeBoard);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete "${board.title}"?`)) return;
    try {
      await api.boards.delete(board.id);
      removeBoard(board.id);
      toast.success('Board deleted');
    } catch {
      toast.error('Failed to delete board');
    }
  }

  return (
    <Link href={`/spaces/${spaceId}/board/${board.id}`}>
      <div
        className="group relative h-40 rounded-2xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-all duration-200 hover:shadow-xl"
        style={{
          background: `linear-gradient(135deg, ${board.cover_color}33 0%, ${board.cover_color}66 100%)`,
          borderColor: `${board.cover_color}44`,
          border: `1px solid ${board.cover_color}44`,
        }}
      >
        {/* Color accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: board.cover_color }}
        />

        <div className="p-4 h-full flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-foreground text-base group-hover:text-white transition-colors">
              {board.title}
            </h3>
            {board.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {board.description}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Pin className="w-3 h-3" />
              {board.pin_count ?? 0} pin{board.pin_count !== 1 ? 's' : ''}
            </span>
            <button
              onClick={handleDelete}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md bg-destructive/20 hover:bg-destructive/40 text-destructive"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
