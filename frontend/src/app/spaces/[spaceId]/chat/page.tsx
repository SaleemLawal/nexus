'use client';

import { useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useUserStore } from '@/stores/userStore';
import { useSpaceStore } from '@/stores/spaceStore';
import ChatWindow from '@/components/chat/ChatWindow';
import ChatInput from '@/components/chat/ChatInput';
import { supabase } from '@/lib/supabase';
import type { Message } from '@/types';

export default function ChatPage() {
  const params = useParams<{ spaceId: string }>();
  const { spaceId } = params;
  const user = useUserStore((s) => s.user);
  const { messages, fetchMessages, loadingMessages, addMessage } = useSpaceStore();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchMessages(spaceId);

    // Supabase Realtime: listen for new messages
    const channel = supabase
      .channel(`messages:${spaceId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `space_id=eq.${spaceId}`,
        },
        (payload) => {
          const msg = payload.new as Message;
          // Avoid duplicate if we already added it optimistically
          addMessage(msg);
        },
      )
      .subscribe();

    channelRef.current = channel;
    return () => {
      channel.unsubscribe();
    };
  }, [user, spaceId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 min-h-0 overflow-hidden">
        {loadingMessages ? (
          <div className="flex flex-col gap-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={`flex gap-2 ${i % 3 === 2 ? 'flex-row-reverse' : ''}`}>
                <div className="w-8 h-8 rounded-full animate-pulse shrink-0" style={{ background: 'oklch(0.88 0.015 68)' }} />
                <div
                  className="h-10 rounded-2xl animate-pulse"
                  style={{ background: 'oklch(0.93 0.012 72)', width: `${120 + (i * 37) % 120}px` }}
                />
              </div>
            ))}
          </div>
        ) : (
          <ChatWindow messages={messages} currentUserId={user?.id} />
        )}
      </div>
      <div className="shrink-0 p-4" style={{ borderTop: '1px solid oklch(0.88 0.015 68)' }}>
        <ChatInput spaceId={spaceId} />
      </div>
    </div>
  );
}
