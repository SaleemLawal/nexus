'use client';

import { useState, useRef } from 'react';
import { Send } from 'lucide-react';
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
          placeholder="Message… (Enter to send, Shift+Enter for new line)"
          rows={1}
          className="w-full resize-none rounded-xl px-4 py-3 font-editorial text-sm focus:outline-none transition-all"
          style={{
            minHeight: '44px',
            maxHeight: '120px',
            height: 'auto',
            background: '#fff',
            border: '1px solid oklch(0.88 0.015 68)',
            color: 'oklch(0.22 0.03 52)',
            fontWeight: 400,
            boxShadow: '0 1px 4px oklch(0.22 0.03 52 / 4%)',
          }}
          onFocus={(e) => {
            (e.target as HTMLTextAreaElement).style.borderColor = '#D4654A88';
            (e.target as HTMLTextAreaElement).style.boxShadow = '0 0 0 3px #D4654A18';
          }}
          onBlur={(e) => {
            (e.target as HTMLTextAreaElement).style.borderColor = 'oklch(0.88 0.015 68)';
            (e.target as HTMLTextAreaElement).style.boxShadow = '0 1px 4px oklch(0.22 0.03 52 / 4%)';
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
          }}
        />
      </div>
      <button
        onClick={handleSend}
        disabled={!content.trim() || sending}
        className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: '#D4654A', boxShadow: '0 2px 8px #D4654A33' }}
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  );
}
