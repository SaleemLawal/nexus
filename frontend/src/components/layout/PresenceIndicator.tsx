'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/stores/userStore';

interface PresenceUser {
  userId: string;
  displayName: string;
  avatarColor: string;
  onlineAt: string;
}

interface PresenceIndicatorProps {
  spaceID: string;
}

export default function PresenceIndicator({ spaceID }: PresenceIndicatorProps) {
  const user = useUserStore((s) => s.user);
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel(`presence:${spaceID}`, {
      config: { presence: { key: user.id } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<PresenceUser>();
        const users: PresenceUser[] = [];
        for (const presences of Object.values(state)) {
          for (const p of presences) {
            if (p.userId !== user.id) {
              users.push(p as unknown as PresenceUser);
            }
          }
        }
        setOnlineUsers(users);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            userId: user.id,
            displayName: user.display_name,
            avatarColor: user.avatar_color,
            onlineAt: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [user, spaceID]);

  if (onlineUsers.length === 0) return null;

  return (
    <div className="flex items-center gap-1" title="Online now">
      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
      <div className="flex -space-x-2">
        {onlineUsers.slice(0, 3).map((u) => (
          <div
            key={u.userId}
            className="w-6 h-6 rounded-full border-2 border-background flex items-center justify-center text-white text-[9px] font-bold"
            style={{ backgroundColor: u.avatarColor }}
            title={`${u.displayName} is online`}
          >
            {u.displayName[0]?.toUpperCase()}
          </div>
        ))}
      </div>
      {onlineUsers.length > 3 && (
        <span className="text-xs text-muted-foreground ml-1">
          +{onlineUsers.length - 3}
        </span>
      )}
    </div>
  );
}
