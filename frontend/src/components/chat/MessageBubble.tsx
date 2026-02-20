'use client';

import type { Message } from '@/types';
import { formatRelative } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
}

export default function MessageBubble({ message, isOwn, showAvatar }: MessageBubbleProps) {
  const user = message.user;

  return (
    <div
      className={cn(
        'flex gap-2.5 group',
        isOwn ? 'flex-row-reverse' : 'flex-row',
        !showAvatar && (isOwn ? 'pr-10' : 'pl-10'),
      )}
    >
      {/* Avatar */}
      {showAvatar ? (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
          style={{ backgroundColor: user?.avatar_color || '#6366f1' }}
        >
          {user?.display_name?.[0]?.toUpperCase() || '?'}
        </div>
      ) : (
        <div className="w-8 shrink-0" />
      )}

      <div className={cn('flex flex-col max-w-[70%]', isOwn && 'items-end')}>
        {/* Name + time */}
        {showAvatar && (
          <div
            className={cn(
              'flex items-baseline gap-2 mb-1',
              isOwn && 'flex-row-reverse',
            )}
          >
            <span className="text-xs font-semibold text-foreground">
              {user?.display_name || 'Unknown'}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {formatRelative(message.created_at)}
            </span>
          </div>
        )}

        {/* Bubble */}
        <div
          className={cn(
            'px-3 py-2 rounded-2xl text-sm leading-relaxed',
            isOwn
              ? 'bg-primary text-primary-foreground rounded-tr-sm'
              : 'bg-secondary text-foreground rounded-tl-sm',
          )}
        >
          {message.message_type === 'image' ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={message.content}
              alt="Image"
              className="max-w-full rounded-lg"
              loading="lazy"
            />
          ) : (
            <span className="whitespace-pre-wrap break-words">{message.content}</span>
          )}
        </div>
      </div>
    </div>
  );
}
