'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
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
      <motion.div
        className="group relative h-40 rounded-2xl overflow-hidden cursor-pointer"
        style={{
          background: `linear-gradient(145deg, ${board.cover_color}22 0%, ${board.cover_color}44 100%)`,
          border: `1px solid ${board.cover_color}33`,
          boxShadow: `0 2px 8px ${board.cover_color}1A, 0 4px 16px oklch(0.22 0.03 52 / 6%)`,
        }}
        whileHover={{
          y: -3,
          boxShadow: `0 8px 24px ${board.cover_color}2A, 0 16px 40px oklch(0.22 0.03 52 / 10%)`,
          transition: { duration: 0.2, ease: 'easeOut' },
        }}
      >
        {/* Color accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: board.cover_color }}
        />

        <div className="p-4 h-full flex flex-col justify-between">
          <div>
            <h3
              className="font-display font-700 text-base"
              style={{ color: 'oklch(0.22 0.03 52)' }}
            >
              {board.title}
            </h3>
            {board.description && (
              <p
                className="font-editorial text-xs mt-1 line-clamp-2"
                style={{ color: 'oklch(0.45 0.025 58)', fontWeight: 400 }}
              >
                {board.description}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span
              className="flex items-center gap-1.5 font-display text-xs"
              style={{ color: 'oklch(0.50 0.025 58)' }}
            >
              <Pin className="w-3 h-3" />
              {board.pin_count ?? 0} pin{board.pin_count !== 1 ? 's' : ''}
            </span>
            <button
              onClick={handleDelete}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md"
              style={{ background: 'oklch(0.65 0.22 25 / 15%)', color: 'oklch(0.50 0.22 25)' }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
