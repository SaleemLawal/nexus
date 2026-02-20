'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { useSpaceStore } from '@/stores/spaceStore';
import { toast } from 'sonner';

const EMOJIS = [
  '🗓️', '✈️', '🎉', '🏖️', '🏔️', '🍕',
  '🎵', '🎨', '⚽', '🌍', '🏠', '🎭',
  '🚗', '🎪', '🍻', '🌸', '🎯', '🧳',
];

interface CreateSpaceSheetProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateSpaceSheet({ open, onClose }: CreateSpaceSheetProps) {
  const router = useRouter();
  const addSpace = useSpaceStore((s) => s.addSpace);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('🗓️');
  const [loading, setLoading] = useState(false);

  function reset() {
    setName('');
    setDescription('');
    setEmoji('🗓️');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const space = await api.spaces.create({
        name: name.trim(),
        description: description.trim() || undefined,
        emoji,
      });
      addSpace(space);
      toast.success(`"${space.name}" created!`);
      onClose();
      reset();
      router.push(`/spaces/${space.id}`);
    } catch {
      toast.error('Failed to create space.');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    background: 'oklch(0.96 0.009 70)',
    border: '1px solid oklch(0.88 0.015 68)',
  };

  const labelStyle = { color: 'oklch(0.30 0.04 52)' };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col gap-0 p-0"
        style={{
          background: '#fff',
          borderLeft: '1px solid oklch(0.88 0.015 68)',
        }}
      >
        <SheetHeader
          className="px-6 py-5 shrink-0"
          style={{ borderBottom: '1px solid oklch(0.88 0.015 68)' }}
        >
          <SheetTitle
            className="font-display font-700 text-lg"
            style={{ color: 'oklch(0.22 0.03 52)', letterSpacing: '-0.01em' }}
          >
            New Space
          </SheetTitle>
          <SheetDescription
            className="font-editorial text-sm"
            style={{ color: 'oklch(0.50 0.025 58)', fontStyle: 'italic' }}
          >
            A space is a shared workspace for planning an event with your group.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto">
          <div className="flex-1 px-6 py-6 space-y-6">
            {/* Emoji picker */}
            <div className="space-y-3">
              <Label
                className="font-display font-600 text-sm"
                style={labelStyle}
              >
                Icon
              </Label>
              <div className="grid grid-cols-9 gap-1.5">
                {EMOJIS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setEmoji(e)}
                    className="h-9 w-9 rounded-lg text-xl flex items-center justify-center transition-all duration-150 hover:scale-110"
                    style={{
                      background: emoji === e ? '#FEF3EF' : 'oklch(0.94 0.009 68)',
                      outline: emoji === e ? '2px solid #D4654A66' : 'none',
                      outlineOffset: '1px',
                    }}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview banner */}
            <div
              className="flex items-center gap-3 p-4 rounded-2xl"
              style={{ background: 'oklch(0.96 0.009 70)', border: '1px solid oklch(0.90 0.012 68)' }}
            >
              <span className="text-3xl leading-none">{emoji}</span>
              <div>
                <p className="font-display font-600 text-sm" style={{ color: 'oklch(0.22 0.03 52)' }}>
                  {name || <span style={{ color: 'oklch(0.65 0.025 58)', fontWeight: 400 }}>Space name</span>}
                </p>
                {description && (
                  <p className="font-editorial text-xs mt-0.5 line-clamp-1" style={{ color: 'oklch(0.50 0.025 58)' }}>
                    {description}
                  </p>
                )}
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="sheet-space-name" className="font-display font-600 text-sm" style={labelStyle}>
                Name
              </Label>
              <Input
                id="sheet-space-name"
                placeholder="Summer Road Trip, Birthday Party..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="font-display text-sm h-11"
                style={inputStyle}
                autoFocus
                maxLength={60}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="sheet-space-desc" className="font-display font-600 text-sm" style={labelStyle}>
                Description{' '}
                <span style={{ color: 'oklch(0.60 0.025 58)', fontWeight: 400 }}>(optional)</span>
              </Label>
              <Textarea
                id="sheet-space-desc"
                placeholder="What are you planning?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="font-editorial text-sm resize-none"
                style={inputStyle}
                rows={3}
                maxLength={200}
              />
            </div>
          </div>

          {/* Sticky footer */}
          <div
            className="px-6 py-4 shrink-0 flex gap-3"
            style={{ borderTop: '1px solid oklch(0.88 0.015 68)' }}
          >
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-xl font-display font-500 text-sm transition-all"
              style={{
                border: '1px solid oklch(0.88 0.015 68)',
                color: 'oklch(0.40 0.03 52)',
                background: '#fff',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || loading}
              className="flex-1 h-10 rounded-xl font-display font-600 text-sm text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: '#D4654A', boxShadow: '0 2px 8px #D4654A33' }}
            >
              {loading ? 'Creating…' : 'Create Space'}
            </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
