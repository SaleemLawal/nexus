'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, Compass, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSpaceStore } from '@/stores/spaceStore';
import SpaceCard from '@/components/spaces/SpaceCard';
import CreateSpaceSheet from '@/components/spaces/CreateSpaceSheet';
import JoinSpaceModal from '@/components/spaces/JoinSpaceModal';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
};

export default function SpacesPage() {
  const spaces = useSpaceStore((s) => s.spaces);
  const loading = useSpaceStore((s) => s.loading);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(() => searchParams.get('new') === '1');
  const [showJoin, setShowJoin] = useState(false);

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      router.replace('/spaces', { scroll: false });
    }
  }, [searchParams, router]);

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1
            className="font-display font-800 text-3xl tracking-tight"
            style={{ color: 'oklch(0.22 0.03 52)', letterSpacing: '-0.02em' }}
          >
            Your Spaces
          </h1>
          <p
            className="font-editorial text-base mt-1"
            style={{ color: 'oklch(0.50 0.025 58)', fontStyle: 'italic', fontWeight: 400 }}
          >
            Collaborate on trips, parties, and events with your group.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowJoin(true)}
            className="gap-1.5 font-display font-500"
          >
            <LinkIcon className="w-3.5 h-3.5" />
            Join
          </Button>
          <Button
            size="sm"
            onClick={() => setShowCreate(true)}
            className="gap-1.5 font-display font-600"
            style={{ background: '#D4654A' }}
          >
            <Plus className="w-3.5 h-3.5" />
            New Space
          </Button>
        </div>
      </motion.div>

      {/* Spaces grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl p-5 h-32 animate-pulse"
              style={{ background: 'oklch(0.93 0.012 72)' }}
            />
          ))}
        </div>
      ) : spaces.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
            style={{ background: '#FEF3EF' }}
          >
            <Compass className="w-8 h-8" style={{ color: '#D4654A' }} />
          </div>
          <h2
            className="font-display font-700 text-xl mb-2"
            style={{ color: 'oklch(0.22 0.03 52)' }}
          >
            No spaces yet
          </h2>
          <p
            className="font-editorial text-base max-w-sm mb-6"
            style={{ color: 'oklch(0.50 0.025 58)', fontStyle: 'italic', fontWeight: 400 }}
          >
            Create your first space to start planning trips, parties, or any
            event with your group.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowJoin(true)}
              className="gap-1.5 font-display font-500"
            >
              <LinkIcon className="w-4 h-4" />
              Join with link
            </Button>
            <Button
              onClick={() => setShowCreate(true)}
              className="gap-1.5 font-display font-600"
              style={{ background: '#D4654A' }}
            >
              <Plus className="w-4 h-4" />
              Create Space
            </Button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {spaces.map((space) => (
            <motion.div key={space.id} variants={cardVariant}>
              <SpaceCard space={space} />
            </motion.div>
          ))}
          <motion.button
            variants={cardVariant}
            onClick={() => setShowCreate(true)}
            className="rounded-2xl p-5 border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center gap-2 min-h-[120px] font-display font-500 text-sm"
            style={{
              borderColor: 'oklch(0.85 0.018 68)',
              color: 'oklch(0.55 0.025 58)',
            }}
            whileHover={{
              borderColor: '#D4654A99',
              color: '#D4654A',
              backgroundColor: '#FEF3EF',
              transition: { duration: 0.15 },
            }}
          >
            <Plus className="w-5 h-5" />
            <span>New Space</span>
          </motion.button>
        </motion.div>
      )}

      <CreateSpaceSheet open={showCreate} onClose={() => setShowCreate(false)} />
      <JoinSpaceModal open={showJoin} onClose={() => setShowJoin(false)} />
    </div>
  );
}
