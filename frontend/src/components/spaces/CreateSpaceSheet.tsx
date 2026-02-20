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
import { Button } from '@/components/ui/button';
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

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md bg-card border-l border-border flex flex-col gap-0 p-0"
      >
        <SheetHeader className="px-6 py-5 border-b border-border shrink-0">
          <SheetTitle className="text-foreground text-lg">New Space</SheetTitle>
          <SheetDescription className="text-muted-foreground text-sm">
            A space is a shared workspace for planning an event with your group.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto">
          <div className="flex-1 px-6 py-6 space-y-6">
            {/* Emoji picker */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Icon</Label>
              <div className="grid grid-cols-9 gap-1.5">
                {EMOJIS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setEmoji(e)}
                    className={`
                      h-9 w-9 rounded-lg text-xl flex items-center justify-center
                      transition-all duration-150 hover:scale-110
                      ${emoji === e
                        ? 'bg-primary/20 ring-2 ring-primary shadow-sm'
                        : 'bg-secondary/60 hover:bg-secondary'}
                    `}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview banner */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/40 border border-border/50">
              <span className="text-3xl leading-none">{emoji}</span>
              <div>
                <p className="font-semibold text-foreground text-sm">
                  {name || <span className="text-muted-foreground/60 font-normal">Space name</span>}
                </p>
                {description && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{description}</p>
                )}
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="sheet-space-name">Name</Label>
              <Input
                id="sheet-space-name"
                placeholder="Summer Road Trip, Birthday Party..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-secondary/50 border-border/50 h-11"
                autoFocus
                maxLength={60}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="sheet-space-desc">
                Description{' '}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Textarea
                id="sheet-space-desc"
                placeholder="What are you planning?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-secondary/50 border-border/50 resize-none"
                rows={3}
                maxLength={200}
              />
            </div>
          </div>

          {/* Sticky footer */}
          <div className="px-6 py-4 border-t border-border shrink-0 flex gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || loading}
              className="flex-1"
            >
              {loading ? 'Creating…' : 'Create Space'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
