'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Trash2,
  ExternalLink,
  GripVertical,
  CheckSquare,
  FileText,
  Image as ImageIcon,
  Link,
} from 'lucide-react';
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

const PIN_ACCENT: Record<string, string> = {
  image: '#7C6FCD',
  link: '#3B9E8C',
  note: '#C08B3A',
  checklist: '#D4654A',
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
    opacity: isDragging ? 0.4 : 1,
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
  const accent = PIN_ACCENT[pin.type] || '#D4654A';

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
    <motion.div
      ref={setNodeRef}
      className="group rounded-2xl overflow-hidden"
      whileHover={{
        y: -2,
        boxShadow:
          '0 6px 20px oklch(0.22 0.03 52 / 10%), 0 16px 40px oklch(0.22 0.03 52 / 8%)',
        transition: { duration: 0.2 },
      }}
      style={{
        background: '#fff',
        boxShadow:
          '0 1px 4px oklch(0.22 0.03 52 / 6%), 0 4px 12px oklch(0.22 0.03 52 / 7%)',
        ...style,
      } as React.CSSProperties}
    >
      {/* Image */}
      {pin.type === 'image' && pin.image_url && (
        <div className="relative overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pin.image_url}
            alt={pin.title || 'Pin image'}
            className="w-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            loading="lazy"
          />
        </div>
      )}

      <div className="p-3.5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <span
              className="p-1 rounded-md transition-colors cursor-grab active:cursor-grabbing"
              style={{ color: 'oklch(0.70 0.02 68)' }}
              {...attributes}
              {...listeners}
            >
              <GripVertical className="w-3 h-3" />
            </span>
            <div
              className="p-1 rounded-md"
              style={{ background: `${accent}18`, color: accent }}
            >
              <PinIcon className="w-3 h-3" />
            </div>
            {pin.title && (
              <h4
                className="font-display font-600 text-sm truncate"
                style={{ color: 'oklch(0.22 0.03 52)' }}
              >
                {pin.title}
              </h4>
            )}
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md shrink-0"
            style={{ color: 'oklch(0.55 0.22 25)' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'oklch(0.65 0.22 25 / 12%)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            }}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Note content */}
        {pin.type === 'note' && pin.content && (
          <p
            className="font-editorial text-sm mt-2 whitespace-pre-wrap leading-relaxed"
            style={{ color: 'oklch(0.35 0.025 52)', fontWeight: 400 }}
          >
            {pin.content}
          </p>
        )}

        {/* Link */}
        {pin.type === 'link' && pin.link_url && (
          <a
            href={pin.link_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 mt-2 font-display text-xs hover:underline truncate transition-colors"
            style={{ color: '#3B9E8C' }}
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="w-3 h-3 shrink-0" />
            {pin.link_url}
          </a>
        )}
        {pin.type === 'link' && pin.content && (
          <p
            className="font-editorial text-xs mt-1 line-clamp-3"
            style={{ color: 'oklch(0.50 0.025 58)', fontWeight: 400 }}
          >
            {pin.content}
          </p>
        )}

        {/* Checklist */}
        {pin.type === 'checklist' && checklist.length > 0 && (
          <ul className="mt-2.5 space-y-1.5">
            {checklist.map((item) => (
              <li key={item.id} className="flex items-center gap-2">
                <button
                  onClick={() => toggleCheck(item.id)}
                  className="w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors"
                  style={{
                    background: item.done ? '#D4654A' : '#fff',
                    borderColor: item.done ? '#D4654A' : 'oklch(0.80 0.015 68)',
                  }}
                >
                  {item.done && (
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                      <path
                        d="M10 3L5 8.5 2 5.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
                <span
                  className="font-display text-xs"
                  style={{
                    color: item.done ? 'oklch(0.65 0.025 58)' : 'oklch(0.30 0.03 52)',
                    textDecoration: item.done ? 'line-through' : 'none',
                  }}
                >
                  {item.text}
                </span>
              </li>
            ))}
          </ul>
        )}

        {/* Creator */}
        {pin.creator && (
          <div
            className="flex items-center gap-1.5 mt-3 pt-2.5"
            style={{ borderTop: '1px solid oklch(0.92 0.012 68)' }}
          >
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center text-white font-display font-700"
              style={{ backgroundColor: pin.creator.avatar_color, fontSize: 9 }}
            >
              {pin.creator.display_name[0].toUpperCase()}
            </div>
            <span
              className="font-display truncate"
              style={{ color: 'oklch(0.60 0.025 58)', fontSize: 10 }}
            >
              {pin.creator.display_name}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
