'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useUserStore } from '@/stores/userStore';
import { useSpaceStore } from '@/stores/spaceStore';
import type { Space } from '@/types';
import AppShell from '@/components/layout/AppShell';
import { toast } from 'sonner';

export default function InvitePage() {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const addSpace = useSpaceStore((s) => s.addSpace);
  const [space, setSpace] = useState<Space | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.spaces
      .getByInvite(params.code)
      .then(setSpace)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [params.code]);

  async function handleJoin() {
    if (!user) return;
    setJoining(true);
    try {
      const joined = await api.spaces.join(params.code);
      addSpace(joined);
      toast.success(`Joined "${joined.name}"!`);
      router.push(`/spaces/${joined.id}`);
    } catch {
      toast.error('Failed to join space.');
    } finally {
      setJoining(false);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="min-h-screen flex items-center justify-center">
          <div className="glass rounded-2xl p-8 w-80 animate-pulse" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          {error || !space ? (
            <div className="glass rounded-2xl p-8 text-center border border-border">
              <p className="text-muted-foreground mb-4">
                This invite link is invalid or has expired.
              </p>
              <Button onClick={() => router.push('/spaces')}>
                Go to your spaces
              </Button>
            </div>
          ) : (
            <div className="glass rounded-2xl p-8 border border-border shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Compass className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  You&apos;re invited to join
                </span>
              </div>

              <div className="text-center mb-6">
                <div className="text-5xl mb-3">{space.emoji}</div>
                <h1 className="text-xl font-bold text-foreground">{space.name}</h1>
                {space.description && (
                  <p className="text-sm text-muted-foreground mt-2">{space.description}</p>
                )}
                <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-muted-foreground">
                  <Users className="w-3.5 h-3.5" />
                  {space.member_count ?? 0} member{space.member_count !== 1 ? 's' : ''}
                </div>
              </div>

              <Button
                onClick={handleJoin}
                disabled={joining}
                className="w-full"
              >
                {joining ? 'Joining…' : `Join "${space.name}"`}
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.push('/spaces')}
                className="w-full mt-2"
              >
                Not now
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </AppShell>
  );
}
