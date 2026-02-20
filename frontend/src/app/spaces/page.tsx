'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Compass, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSpaceStore } from '@/stores/spaceStore';
import SpaceCard from '@/components/spaces/SpaceCard';
import CreateSpaceSheet from '@/components/spaces/CreateSpaceSheet';
import JoinSpaceModal from '@/components/spaces/JoinSpaceModal';

export default function SpacesPage() {
  const spaces = useSpaceStore((s) => s.spaces);
  const loading = useSpaceStore((s) => s.loading);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(() => searchParams.get('new') === '1');
  const [showJoin, setShowJoin] = useState(false);

  // Clean the ?new=1 query param without a navigation flash
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      router.replace('/spaces', { scroll: false });
    }
  }, [searchParams, router]);

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Your Spaces</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Collaborate on trips, parties, and events with your group.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowJoin(true)} className="gap-1.5">
            <LinkIcon className="w-4 h-4" />
            Join
          </Button>
          <Button size="sm" onClick={() => setShowCreate(true)} className="gap-1.5">
            <Plus className="w-4 h-4" />
            New Space
          </Button>
        </div>
      </div>

      {/* Spaces grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl p-5 h-32 animate-pulse bg-secondary/30" />
          ))}
        </div>
      ) : spaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Compass className="w-8 h-8 text-primary/60" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">No spaces yet</h2>
          <p className="text-muted-foreground text-sm max-w-sm mb-6">
            Create your first space to start planning trips, parties, or any event with your group.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowJoin(true)} className="gap-1.5">
              <LinkIcon className="w-4 h-4" />
              Join with link
            </Button>
            <Button onClick={() => setShowCreate(true)} className="gap-1.5">
              <Plus className="w-4 h-4" />
              Create Space
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {spaces.map((space) => (
            <SpaceCard key={space.id} space={space} />
          ))}
          <button
            onClick={() => setShowCreate(true)}
            className="glass rounded-2xl p-5 border-2 border-dashed border-border/50 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary min-h-[120px]"
          >
            <Plus className="w-6 h-6" />
            <span className="text-sm font-medium">New Space</span>
          </button>
        </div>
      )}

      <CreateSpaceSheet open={showCreate} onClose={() => setShowCreate(false)} />
      <JoinSpaceModal open={showJoin} onClose={() => setShowJoin(false)} />
    </div>
  );
}
