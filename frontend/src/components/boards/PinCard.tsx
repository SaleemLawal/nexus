'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, ExternalLink, GripVertical, CheckSquare, FileText, Image as ImageIcon, Link } from 'lucide-react';
import type { Pin, ChecklistItem } from '@/types';
import { api } from '@/lib/api';
import { useSpaceStore } from '@/stores/spaceStore';
import { toast } from 'sonner';

interface PinCardProps {
  pin: Pin;
}

const PIN_ICONS: Record<string, React.ElementType> = {
  image: ImageIcon,
  link: Link,
  note: FileText,
  checklist: CheckSquare,
};

export default function PinCard({ pin }: PinCardProps) {
  const removePin = useSpaceStore((s) => s.removePin);
  const setPins = useSpaceStore((s) => s.setPins);
  const pins = useSpaceStore((s) => s.pins);
  const [deleting, setDeleting] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: pin.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    setDeleting(true);
    try {
      await api.pins.delete(pin.id);
      removePin(pin.id);
    } catch {
      toast.error('Failed to delete pin');
      setDeleting(false);
    }
  }

  const PinIcon = PIN_ICONS[pin.type] || FileText;

  const checklist: ChecklistItem[] = (() => {
    if (pin.type !== 'checklist') return [];
    try {
      const items = (pin.metadata as { items?: ChecklistItem[] })?.items;
      return Array.isArray(items) ? items : [];
    } catch {
      return [];
    }
  })();

  async function toggleCheck(itemId: string) {
    const newItems = checklist.map((c) =>
      c.id === itemId ? { ...c, done: !c.done } : c,
    );
    const updatedPins = pins.map((p) =>
      p.id === pin.id
        ? { ...p, metadata: { ...(p.metadata || {}), items: newItems } }
        : p,
    );
    setPins(updatedPins);
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group glass rounded-xl overflow-hidden border border-border/50 hover:border-primary/30 transition-all duration-200 hover:shadow-lg"
    >
      {/* Image */}
      {pin.type === 'image' && pin.image_url && (
        <div className="relative overflow-hidden">
          <img
            src={pin.image_url}
            alt={pin.title || 'Pin image'}
            className="w-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      <div className="p-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <span
              className="p-1 rounded-md text-muted-foreground"
              style={{ fontSize: 13 }}
              {...attributes}
              {...listeners}
            >
              <GripVertical className="w-3 h-3 cursor-grab active:cursor-grabbing" />
            </span>
            <PinIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            {pin.title && (
              <h4 className="text-sm font-semibold text-foreground truncate">
                {pin.title}
              </h4>
            )}
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-destructive/20 text-muted-foreground hover:text-destructive shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Note content */}
        {pin.type === 'note' && pin.content && (
          <p className="text-sm text-foreground/80 mt-2 whitespace-pre-wrap leading-relaxed">
            {pin.content}
          </p>
        )}

        {/* Link */}
        {pin.type === 'link' && pin.link_url && (
          <a
            href={pin.link_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 mt-2 text-xs text-primary hover:underline truncate"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="w-3 h-3 shrink-0" />
            {pin.link_url}
          </a>
        )}
        {pin.type === 'link' && pin.content && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{pin.content}</p>
        )}

        {/* Checklist */}
        {pin.type === 'checklist' && checklist.length > 0 && (
          <ul className="mt-2 space-y-1.5">
            {checklist.map((item) => (
              <li key={item.id} className="flex items-center gap-2">
                <button
                  onClick={() => toggleCheck(item.id)}
                  className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                    item.done
                      ? 'bg-primary border-primary'
                      : 'border-border hover:border-primary/60'
                  }`}
                >
                  {item.done && (
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                      <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
                <span
                  className={`text-xs ${
                    item.done ? 'line-through text-muted-foreground' : 'text-foreground'
                  }`}
                >
                  {item.text}
                </span>
              </li>
            ))}
          </ul>
        )}

        {/* Creator */}
        {pin.creator && (
          <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-border/30">
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
              style={{ backgroundColor: pin.creator.avatar_color }}
            >
              {pin.creator.display_name[0].toUpperCase()}
            </div>
            <span className="text-[10px] text-muted-foreground truncate">
              {pin.creator.display_name}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
