'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
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

const EVENT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f97316', '#22c55e', '#14b8a6', '#3b82f6',
];

interface CreateEventModalProps {
  open: boolean;
  onClose: () => void;
  spaceId: string;
  defaultDate?: Date;
}

export default function CreateEventModal({
  open,
  onClose,
  spaceId,
  defaultDate,
}: CreateEventModalProps) {
  const addEvent = useSpaceStore((s) => s.addEvent);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [color, setColor] = useState(EVENT_COLORS[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (defaultDate && open) {
      setStartsAt(format(defaultDate, "yyyy-MM-dd'T'09:00"));
      setEndsAt(format(defaultDate, "yyyy-MM-dd'T'10:00"));
    }
  }, [defaultDate, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !startsAt) return;
    setLoading(true);
    try {
      const event = await api.events.create(spaceId, {
        title: title.trim(),
        description: description.trim() || undefined,
        location: location.trim() || undefined,
        starts_at: new Date(startsAt).toISOString(),
        ends_at: endsAt ? new Date(endsAt).toISOString() : undefined,
        color,
      });
      addEvent(event);
      toast.success('Event created!');
      onClose();
      setTitle(''); setDescription(''); setLocation('');
      setStartsAt(''); setEndsAt('');
    } catch {
      toast.error('Failed to create event.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle>Add Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2 flex-wrap">
              {EVENT_COLORS.map((c) => (
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
                  }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              placeholder="Flight to Tokyo, Check-in, Birthday dinner..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-secondary/50 border-border/50"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Starts</Label>
              <Input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="bg-secondary/50 border-border/50"
              />
            </div>
            <div className="space-y-2">
              <Label>Ends (optional)</Label>
              <Input
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="bg-secondary/50 border-border/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Location (optional)</Label>
            <Input
              placeholder="Narita Airport, Airbnb..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-secondary/50 border-border/50"
            />
          </div>

          <div className="space-y-2">
            <Label>Description (optional)</Label>
            <Textarea
              placeholder="Any notes about this event?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-secondary/50 border-border/50 resize-none"
              rows={2}
            />
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || !startsAt || loading}
              className="flex-1"
            >
              {loading ? 'Creating…' : 'Add Event'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
