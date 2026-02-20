'use client';

import { useState } from 'react';
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

const COLORS = [
  '#D4654A', '#C08B3A', '#3B9E8C', '#7C6FCD',
  '#4A9BD4', '#D4884A', '#9E3B8C', '#3B7C9E',
  '#8C9E3B', '#D44A84',
];

interface CreateBoardModalProps {
  open: boolean;
  onClose: () => void;
  spaceId: string;
}

export default function CreateBoardModal({ open, onClose, spaceId }: CreateBoardModalProps) {
  const addBoard = useSpaceStore((s) => s.addBoard);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      const board = await api.boards.create(spaceId, {
        title: title.trim(),
        description: description.trim() || undefined,
        cover_color: color,
      });
      addBoard(board);
      toast.success('Board created!');
      onClose();
      setTitle('');
      setDescription('');
    } catch {
      toast.error('Failed to create board.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display font-700 text-lg" style={{ color: 'oklch(0.22 0.03 52)', letterSpacing: '-0.01em' }}>
            Create a Board
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          <div className="space-y-2.5">
            <Label className="font-display font-600 text-sm" style={{ color: 'oklch(0.30 0.04 52)' }}>
              Color
            </Label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full transition-all hover:scale-110"
                  style={{
                    backgroundColor: c,
                    outline: color === c ? `3px solid ${c}` : 'none',
                    outlineOffset: '2px',
                    transform: color === c ? 'scale(1.15)' : undefined,
                    boxShadow: color === c ? `0 2px 8px ${c}55` : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="board-title" className="font-display font-600 text-sm" style={{ color: 'oklch(0.30 0.04 52)' }}>
              Title
            </Label>
            <Input
              id="board-title"
              placeholder="Accommodation, Food Ideas, Activities..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="font-display text-sm h-10"
              style={{ background: 'oklch(0.96 0.009 70)', border: '1px solid oklch(0.88 0.015 68)' }}
              autoFocus
              maxLength={60}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="board-desc" className="font-display font-600 text-sm" style={{ color: 'oklch(0.30 0.04 52)' }}>
              Description{' '}
              <span className="font-400" style={{ color: 'oklch(0.60 0.025 58)' }}>(optional)</span>
            </Label>
            <Textarea
              id="board-desc"
              placeholder="What's this board for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="font-editorial text-sm resize-none"
              style={{ background: 'oklch(0.96 0.009 70)', border: '1px solid oklch(0.88 0.015 68)' }}
              rows={2}
            />
          </div>

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 font-display font-500">
              Cancel
            </Button>
            <button
              type="submit"
              disabled={!title.trim() || loading}
              className="flex-1 h-9 rounded-lg font-display font-600 text-sm text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: '#D4654A' }}
            >
              {loading ? 'Creating…' : 'Create Board'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
