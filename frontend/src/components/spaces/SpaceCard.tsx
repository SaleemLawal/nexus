'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users, Layout } from 'lucide-react';
import type { Space } from '@/types';

interface SpaceCardProps {
  space: Space;
}

export default function SpaceCard({ space }: SpaceCardProps) {
  return (
    <Link href={`/spaces/${space.id}`}>
      <motion.div
        className="rounded-2xl p-5 cursor-pointer"
        style={{
          background: '#fff',
          border: '1px solid oklch(0.88 0.015 68)',
          boxShadow:
            '0 1px 3px oklch(0.22 0.03 52 / 5%), 0 4px 12px oklch(0.22 0.03 52 / 7%)',
        }}
        whileHover={{
          y: -3,
          boxShadow:
            '0 4px 12px oklch(0.22 0.03 52 / 8%), 0 14px 32px oklch(0.22 0.03 52 / 10%)',
          transition: { duration: 0.2, ease: 'easeOut' },
        }}
      >
        <div className="flex items-start gap-4">
          <div className="text-3xl leading-none shrink-0 mt-0.5">{space.emoji}</div>
          <div className="flex-1 min-w-0">
            <h3
              className="font-display font-700 text-base truncate"
              style={{ color: 'oklch(0.22 0.03 52)' }}
            >
              {space.name}
            </h3>
            {space.description && (
              <p
                className="font-editorial text-sm mt-0.5 line-clamp-2"
                style={{ color: 'oklch(0.50 0.025 58)', fontWeight: 400 }}
              >
                {space.description}
              </p>
            )}
            <div
              className="flex items-center gap-4 mt-3 font-display text-xs"
              style={{ color: 'oklch(0.60 0.025 58)' }}
            >
              <span className="flex items-center gap-1.5">
                <Users className="w-3 h-3" />
                {space.member_count ?? 0} member{space.member_count !== 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1.5">
                <Layout className="w-3 h-3" />
                {space.board_count ?? 0} board{space.board_count !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
