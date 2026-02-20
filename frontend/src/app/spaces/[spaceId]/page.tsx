'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, Layout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSpaceStore } from '@/stores/spaceStore';
import { useUserStore } from '@/stores/userStore';
import BoardCard from '@/components/boards/BoardCard';
import CreateBoardModal from '@/components/boards/CreateBoardModal';
import UpcomingEvents from '@/components/calendar/UpcomingEvents';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 14, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
};

export default function SpaceOverviewPage() {
  const params = useParams<{ spaceId: string }>();
  const spaceId = params.spaceId;
  const user = useUserStore((s) => s.user);
  const { boards, fetchBoards, loadingBoards, fetchEvents, events } = useSpaceStore();
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    if (user) {
      fetchBoards(spaceId);
      fetchEvents(spaceId);
    }
  }, [user, spaceId, fetchBoards, fetchEvents]);

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-6xl mx-auto w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Boards section */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex items-center justify-between mb-5"
          >
            <h2
              className="font-display font-700 text-xl"
              style={{ color: 'oklch(0.22 0.03 52)', letterSpacing: '-0.01em' }}
            >
              Boards
            </h2>
            <Button
              size="sm"
              onClick={() => setShowCreate(true)}
              className="gap-1.5 font-display font-600"
              style={{ background: '#D4654A' }}
            >
              <Plus className="w-3.5 h-3.5" />
              Add Board
            </Button>
          </motion.div>

          {loadingBoards ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-40 rounded-2xl animate-pulse"
                  style={{ background: 'oklch(0.93 0.012 72)' }}
                />
              ))}
            </div>
          ) : boards.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex flex-col items-center justify-center py-16 text-center rounded-2xl"
              style={{
                background: '#fff',
                border: '1px solid oklch(0.88 0.015 68)',
                boxShadow: '0 2px 8px oklch(0.22 0.03 52 / 4%)',
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                style={{ background: '#FEF3EF' }}
              >
                <Layout className="w-6 h-6" style={{ color: '#D4654A88' }} />
              </div>
              <p className="font-display font-600 text-sm" style={{ color: 'oklch(0.30 0.03 52)' }}>
                No boards yet
              </p>
              <p
                className="font-editorial text-sm mt-1 mb-4"
                style={{ color: 'oklch(0.55 0.025 58)', fontStyle: 'italic' }}
              >
                Create a board to start collecting ideas
              </p>
              <Button
                size="sm"
                onClick={() => setShowCreate(true)}
                className="gap-1.5 font-display font-600"
                style={{ background: '#D4654A' }}
              >
                <Plus className="w-3.5 h-3.5" />
                Create First Board
              </Button>
            </motion.div>
          ) : (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {boards.map((board) => (
                <motion.div key={board.id} variants={cardVariant}>
                  <BoardCard board={board} spaceId={spaceId} />
                </motion.div>
              ))}
              <motion.button
                variants={cardVariant}
                onClick={() => setShowCreate(true)}
                className="h-40 rounded-2xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center gap-2 font-display font-500 text-sm"
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
                <span>New Board</span>
              </motion.button>
            </motion.div>
          )}
        </div>

        {/* Upcoming events sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <UpcomingEvents events={events} spaceId={spaceId} />
        </motion.div>
      </div>

      <CreateBoardModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        spaceId={spaceId}
      />
    </div>
  );
}
