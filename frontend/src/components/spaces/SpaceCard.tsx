'use client';

import Link from 'next/link';
import { Users, Layout } from 'lucide-react';
import type { Space } from '@/types';

interface SpaceCardProps {
  space: Space;
}

export default function SpaceCard({ space }: SpaceCardProps) {
  return (
    <Link href={`/spaces/${space.id}`}>
      <div className="group glass rounded-2xl p-5 hover:bg-white/8 transition-all duration-200 cursor-pointer hover:scale-[1.02] hover:shadow-lg border border-border/50 hover:border-primary/30">
        <div className="flex items-start gap-4">
          <div className="text-4xl leading-none shrink-0">{space.emoji}</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-base truncate group-hover:text-primary transition-colors">
              {space.name}
            </h3>
            {space.description && (
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                {space.description}
              </p>
            )}
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                {space.member_count ?? 0} member{space.member_count !== 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1.5">
                <Layout className="w-3.5 h-3.5" />
                {space.board_count ?? 0} board{space.board_count !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
