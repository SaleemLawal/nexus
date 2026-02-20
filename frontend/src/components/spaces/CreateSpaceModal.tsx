'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { useSpaceStore } from '@/stores/spaceStore';
import { toast } from 'sonner';

const EMOJIS = ['🗓️', '✈️', '🎉', '🏖️', '🏔️', '🍕', '🎵', '🎨', '⚽', '🌍', '🏠', '🎭'];

interface CreateSpaceModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateSpaceModal({ open, onClose }: CreateSpaceModalProps) {
  const router = useRouter();
  const addSpace = useSpaceStore((s) => s.addSpace);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('🗓️');
  const [loading, setLoading] = useState(false);

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
      router.push(`/spaces/${space.id}`);
    } catch (err) {
      toast.error('Failed to create space.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Create a new Space</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          <div className="space-y-2">
            <Label>Emoji</Label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`text-2xl p-2 rounded-lg transition-all hover:scale-110 ${
                    emoji === e
                      ? 'bg-primary/20 ring-2 ring-primary'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="space-name">Name</Label>
            <Input
              id="space-name"
              placeholder="Summer Road Trip, Birthday Party..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-secondary/50 border-border/50"
              autoFocus
              maxLength={60}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="space-desc">
              Description{' '}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              id="space-desc"
              placeholder="What's this space for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-secondary/50 border-border/50 resize-none"
              rows={3}
              maxLength={200}
            />
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || loading} className="flex-1">
              {loading ? 'Creating…' : 'Create Space'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
