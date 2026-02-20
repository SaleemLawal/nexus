'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { useSpaceStore } from '@/stores/spaceStore';
import { toast } from 'sonner';
import { nanoid } from '@/lib/utils';

interface CreatePollModalProps {
  open: boolean;
  onClose: () => void;
  spaceId: string;
}

export default function CreatePollModal({ open, onClose, spaceId }: CreatePollModalProps) {
  const addPoll = useSpaceStore((s) => s.addPoll);
  const [question, setQuestion] = useState('');
  const [isMulti, setIsMulti] = useState(false);
  const [options, setOptions] = useState([
    { id: nanoid(), label: '' },
    { id: nanoid(), label: '' },
  ]);
  const [closesAt, setClosesAt] = useState('');
  const [loading, setLoading] = useState(false);

  function addOption() {
    setOptions((o) => [...o, { id: nanoid(), label: '' }]);
  }

  function removeOption(id: string) {
    setOptions((o) => o.filter((opt) => opt.id !== id));
  }

  function updateOption(id: string, label: string) {
    setOptions((o) => o.map((opt) => (opt.id === id ? { ...opt, label } : opt)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validOptions = options.filter((o) => o.label.trim());
    if (!question.trim() || validOptions.length < 2) {
      toast.error('Please add a question and at least 2 options.');
      return;
    }
    setLoading(true);
    try {
      const poll = await api.polls.create(spaceId, {
        question: question.trim(),
        is_multi_select: isMulti,
        closes_at: closesAt || undefined,
        options: validOptions.map((o) => ({ label: o.label.trim() })),
      });
      addPoll(poll);
      toast.success('Poll created!');
      onClose();
      setQuestion('');
      setOptions([{ id: nanoid(), label: '' }, { id: nanoid(), label: '' }]);
      setClosesAt('');
      setIsMulti(false);
    } catch {
      toast.error('Failed to create poll.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle>Create a Poll</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          <div className="space-y-2">
            <Label>Question</Label>
            <Input
              placeholder="Where should we stay?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="bg-secondary/50 border-border/50"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Options</Label>
            <div className="space-y-2">
              {options.map((opt, i) => (
                <div key={opt.id} className="flex gap-2">
                  <Input
                    placeholder={`Option ${i + 1}`}
                    value={opt.label}
                    onChange={(e) => updateOption(opt.id, e.target.value)}
                    className="bg-secondary/50 border-border/50 flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(opt.id)}
                    disabled={options.length <= 2}
                    className="shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addOption}
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <Plus className="w-3.5 h-3.5" />
              Add option
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMulti((v) => !v)}
              className={`w-10 h-5.5 rounded-full relative transition-colors ${
                isMulti ? 'bg-primary' : 'bg-secondary'
              }`}
              style={{ height: '22px', minWidth: '40px' }}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  isMulti ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
            <Label className="cursor-pointer" onClick={() => setIsMulti((v) => !v)}>
              Allow multiple choices
            </Label>
          </div>

          <div className="space-y-2">
            <Label>
              Close date{' '}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              type="datetime-local"
              value={closesAt}
              onChange={(e) => setClosesAt(e.target.value)}
              className="bg-secondary/50 border-border/50"
            />
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!question.trim() || loading}
              className="flex-1"
            >
              {loading ? 'Creating…' : 'Create Poll'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
