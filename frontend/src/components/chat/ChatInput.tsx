'use client';

import { useState, useRef } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useSpaceStore } from '@/stores/spaceStore';
import { toast } from 'sonner';

interface ChatInputProps {
  spaceId: string;
}

export default function ChatInput({ spaceId }: ChatInputProps) {
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const addMessage = useSpaceStore((s) => s.addMessage);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  async function handleSend() {
    const text = content.trim();
    if (!text || sending) return;
    setSending(true);
    setContent('');
    try {
      const msg = await api.messages.create(spaceId, { content: text });
      // De-dupe: Realtime might also deliver it
      addMessage(msg);
    } catch {
      toast.error('Failed to send message');
      setContent(text);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex gap-2 items-end max-w-3xl mx-auto">
      <div className="flex-1 relative">
        <textarea
          ref={inputRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message... (Enter to send, Shift+Enter for new line)"
          rows={1}
          className="w-full resize-none bg-secondary/50 border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
          style={{
            minHeight: '44px',
            maxHeight: '120px',
            height: 'auto',
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
          }}
        />
      </div>
      <Button
        onClick={handleSend}
        disabled={!content.trim() || sending}
        size="icon"
        className="w-11 h-11 shrink-0 rounded-xl"
      >
        <Send className="w-4 h-4" />
      </Button>
    </div>
  );
}
