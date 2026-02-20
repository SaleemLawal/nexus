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
          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-display text-xs font-700 shrink-0 mt-0.5"
          style={{ backgroundColor: user?.avatar_color || '#D4654A' }}
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
            <span
              className="font-display text-xs font-600"
              style={{ color: 'oklch(0.25 0.03 52)' }}
            >
              {user?.display_name || 'Unknown'}
            </span>
            <span
              className="font-display text-[10px]"
              style={{ color: 'oklch(0.60 0.025 58)' }}
            >
              {formatRelative(message.created_at)}
            </span>
          </div>
        )}

        {/* Bubble */}
        <div
          className="px-3.5 py-2.5 rounded-2xl font-editorial text-sm leading-relaxed"
          style={
            isOwn
              ? {
                  background: '#D4654A',
                  color: '#fff',
                  borderBottomRightRadius: '4px',
                  fontWeight: 400,
                }
              : {
                  background: '#fff',
                  color: 'oklch(0.25 0.03 52)',
                  borderBottomLeftRadius: '4px',
                  border: '1px solid oklch(0.88 0.015 68)',
                  boxShadow: '0 1px 4px oklch(0.22 0.03 52 / 5%)',
                  fontWeight: 400,
                }
          }
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
            <span className="whitespace-pre-wrap wrap-break-word">{message.content}</span>
          )}
        </div>
      </div>
    </div>
  );
}
