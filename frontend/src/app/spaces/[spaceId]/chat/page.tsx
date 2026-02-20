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
  const { messages, fetchMessages, addMessage } = useSpaceStore();
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
  }, [user, spaceId, fetchMessages, addMessage]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden">
        <ChatWindow messages={messages} currentUserId={user?.id} />
      </div>
      <div className="shrink-0 border-t border-border p-4">
        <ChatInput spaceId={spaceId} />
      </div>
    </div>
  );
}
