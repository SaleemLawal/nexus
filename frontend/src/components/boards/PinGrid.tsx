'use client';

import { useSpaceStore } from '@/stores/spaceStore';
import PinCard from './PinCard';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { Pin } from '@/types';
import { Layers } from 'lucide-react';

interface PinGridProps {
  boardId: string;
}

export default function PinGrid({ boardId }: PinGridProps) {
  const pins = useSpaceStore((s) => s.pins);
  const setPins = useSpaceStore((s) => s.setPins);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = pins.findIndex((p) => p.id === active.id);
    const newIndex = pins.findIndex((p) => p.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const newPins = [...pins];
    const [moved] = newPins.splice(oldIndex, 1);
    newPins.splice(newIndex, 0, moved);
    const reindexed: Pin[] = newPins.map((p, i) => ({ ...p, position: i }));
    setPins(reindexed);

    api.pins
      .updatePositions(
        boardId,
        reindexed.map((p) => ({ id: p.id, position: p.position })),
      )
      .catch(console.error);
  }

  if (pins.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: '#FEF3EF' }}
        >
          <Layers className="w-6 h-6" style={{ color: '#D4654A88' }} />
        </div>
        <p className="font-display font-600 text-sm" style={{ color: 'oklch(0.40 0.03 52)' }}>
          No pins yet
        </p>
        <p
          className="font-editorial text-sm mt-1"
          style={{ color: 'oklch(0.60 0.025 58)', fontStyle: 'italic' }}
        >
          Add your first pin to start collecting ideas
        </p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={pins.map((p) => p.id)} strategy={rectSortingStrategy}>
        <div className="masonry-grid">
          {pins.map((pin, i) => (
            <motion.div
              key={pin.id}
              className="masonry-item"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: Math.min(i * 0.06, 0.48),
                ease: 'easeOut',
              }}
            >
              <PinCard pin={pin} />
            </motion.div>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
