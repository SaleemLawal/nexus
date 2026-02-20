'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Layout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSpaceStore } from '@/stores/spaceStore';
import { useUserStore } from '@/stores/userStore';
import BoardCard from '@/components/boards/BoardCard';
import CreateBoardModal from '@/components/boards/CreateBoardModal';
import UpcomingEvents from '@/components/calendar/UpcomingEvents';

export default function SpaceOverviewPage() {
  const params = useParams<{ spaceId: string }>();
  const spaceId = params.spaceId;
  const user = useUserStore((s) => s.user);
  const { boards, fetchBoards, loading, fetchEvents, events } = useSpaceStore();
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    if (user) {
      fetchBoards(spaceId);
      fetchEvents(spaceId);
    }
  }, [user, spaceId, fetchBoards, fetchEvents]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Boards section */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-foreground">Boards</h2>
            <Button size="sm" onClick={() => setShowCreate(true)} className="gap-1.5">
              <Plus className="w-4 h-4" />
              Add Board
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-40 rounded-2xl bg-secondary/30 animate-pulse" />
              ))}
            </div>
          ) : boards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center glass rounded-2xl border border-border/50">
              <Layout className="w-10 h-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground font-medium">No boards yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1 mb-4">
                Create a board to start collecting ideas
              </p>
              <Button size="sm" onClick={() => setShowCreate(true)} className="gap-1.5">
                <Plus className="w-4 h-4" />
                Create First Board
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {boards.map((board) => (
                <BoardCard key={board.id} board={board} spaceId={spaceId} />
              ))}
              <button
                onClick={() => setShowCreate(true)}
                className="h-40 rounded-2xl border-2 border-dashed border-border/50 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary"
              >
                <Plus className="w-6 h-6" />
                <span className="text-sm font-medium">New Board</span>
              </button>
            </div>
          )}
        </div>

        {/* Upcoming events sidebar */}
        <div>
          <UpcomingEvents events={events} spaceId={spaceId} />
        </div>
      </div>

      <CreateBoardModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        spaceId={spaceId}
      />
    </div>
  );
}
