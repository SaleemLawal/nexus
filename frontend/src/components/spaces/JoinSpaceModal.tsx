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

  // Accept full URLs or raw codes
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
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Join a Space</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          <div className="space-y-2">
            <Label htmlFor="invite-code">Invite link or code</Label>
            <Input
              id="invite-code"
              placeholder="Paste invite link or code..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="bg-secondary/50 border-border/50"
              autoFocus
            />
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={!code.trim() || loading} className="flex-1">
              {loading ? 'Joining…' : 'Join Space'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
