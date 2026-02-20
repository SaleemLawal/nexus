'use client';

import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Message } from '@/types';
import MessageBubble from './MessageBubble';
import { MessageSquare } from 'lucide-react';

interface ChatWindowProps {
  messages: Message[];
  currentUserId?: string;
}

export default function ChatWindow({ messages, currentUserId }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <MessageSquare className="w-10 h-10 text-muted-foreground/30 mb-3" />
        <p className="text-muted-foreground text-sm">No messages yet</p>
        <p className="text-muted-foreground/60 text-xs mt-1">
          Be the first to say something!
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full px-4 py-4">
      <div className="space-y-1 max-w-3xl mx-auto">
        {messages.map((msg, i) => {
          const prevMsg = messages[i - 1];
          const isFirstInGroup =
            !prevMsg || prevMsg.user_id !== msg.user_id;

          return (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.user_id === currentUserId}
              showAvatar={isFirstInGroup}
            />
          );
        })}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
