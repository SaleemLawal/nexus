'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { useSpaceStore } from '@/stores/spaceStore';
import { toast } from 'sonner';

interface JoinSpaceModalProps {
  open: boolean;
  onClose: () => void;
}

export default function JoinSpaceModal({ open, onClose }: JoinSpaceModalProps) {
  const router = useRouter();
  const addSpace = useSpaceStore((s) => s.addSpace);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  function extractCode(input: string): string {
    try {
      const url = new URL(input);
      const parts = url.pathname.split('/');
      return parts[parts.length - 1];
    } catch {
      return input.trim();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const inviteCode = extractCode(code);
    if (!inviteCode) return;
    setLoading(true);
    try {
      const space = await api.spaces.join(inviteCode);
      addSpace(space);
      toast.success(`Joined "${space.name}"!`);
      onClose();
      router.push(`/spaces/${space.id}`);
    } catch {
      toast.error('Invalid invite link. Please check and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle
            className="font-display font-700 text-lg"
            style={{ color: 'oklch(0.22 0.03 52)', letterSpacing: '-0.01em' }}
          >
            Join a Space
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          <div className="space-y-2">
            <Label
              htmlFor="invite-code"
              className="font-display font-600 text-sm"
              style={{ color: 'oklch(0.30 0.04 52)' }}
            >
              Invite link or code
            </Label>
            <Input
              id="invite-code"
              placeholder="Paste invite link or code..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="font-display text-sm h-10"
              style={{
                background: 'oklch(0.96 0.009 70)',
                border: '1px solid oklch(0.88 0.015 68)',
              }}
              autoFocus
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-9 rounded-lg font-display font-500 text-sm transition-all"
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
              disabled={!code.trim() || loading}
              className="flex-1 h-9 rounded-lg font-display font-600 text-sm text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: '#D4654A' }}
            >
              {loading ? 'Joining…' : 'Join Space'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
