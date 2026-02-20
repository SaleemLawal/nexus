'use client';

import type { SpaceMember } from '@/types';

interface MemberAvatarsProps {
  members: SpaceMember[];
  max?: number;
}

export default function MemberAvatars({ members, max = 5 }: MemberAvatarsProps) {
  const visible = members.slice(0, max);
  const rest = members.length - visible.length;

  if (members.length === 0) {
    return <p className="text-sm text-muted-foreground">No members yet</p>;
  }

  return (
    <div className="space-y-2">
      {members.map((m) => (
        <div key={m.id} className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ backgroundColor: m.user?.avatar_color || '#6366f1' }}
          >
            {m.user?.display_name?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {m.user?.display_name}
            </p>
            <p className="text-xs text-muted-foreground capitalize">{m.role}</p>
          </div>
        </div>
      ))}
      {rest > 0 && (
        <p className="text-xs text-muted-foreground pl-10">+{rest} more</p>
      )}
    </div>
  );
}
