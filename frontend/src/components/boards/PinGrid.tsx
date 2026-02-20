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
        <Layers className="w-10 h-10 text-muted-foreground/30 mb-3" />
        <p className="text-muted-foreground text-sm">No pins yet</p>
        <p className="text-muted-foreground/60 text-xs mt-1">
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
          {pins.map((pin) => (
            <div key={pin.id} className="masonry-item">
              <PinCard pin={pin} />
            </div>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
