'use client';

import { useState } from 'react';
import { nanoid } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useSpaceStore } from '@/stores/spaceStore';
import { toast } from 'sonner';
import type { ChecklistItem } from '@/types';

interface CreatePinModalProps {
  open: boolean;
  onClose: () => void;
  boardId: string;
}

export default function CreatePinModal({ open, onClose, boardId }: CreatePinModalProps) {
  const addPin = useSpaceStore((s) => s.addPin);
  const [loading, setLoading] = useState(false);

  // Note fields
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  // Link fields
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkDesc, setLinkDesc] = useState('');

  // Image fields
  const [imageTitle, setImageTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Checklist
  const [clTitle, setClTitle] = useState('');
  const [clItems, setClItems] = useState<ChecklistItem[]>([
    { id: nanoid(), text: '', done: false },
  ]);

  function resetForm() {
    setNoteTitle(''); setNoteContent('');
    setLinkTitle(''); setLinkUrl(''); setLinkDesc('');
    setImageTitle(''); setImageUrl('');
    setClTitle('');
    setClItems([{ id: nanoid(), text: '', done: false }]);
  }

  async function handleCreate(
    type: string,
    data: {
      title?: string;
      content?: string;
      image_url?: string;
      link_url?: string;
      metadata?: Record<string, unknown>;
    },
  ) {
    setLoading(true);
    try {
      const pin = await api.pins.create(boardId, { type, ...data });
      addPin(pin);
      toast.success('Pin added!');
      onClose();
      resetForm();
    } catch {
      toast.error('Failed to add pin.');
    } finally {
      setLoading(false);
    }
  }

  function handleAddChecklistItem() {
    setClItems((prev) => [...prev, { id: nanoid(), text: '', done: false }]);
  }

  function handleRemoveChecklistItem(id: string) {
    setClItems((prev) => prev.filter((i) => i.id !== id));
  }

  function handleChecklistItemChange(id: string, text: string) {
    setClItems((prev) => prev.map((i) => (i.id === id ? { ...i, text } : i)));
  }

  const inputStyle = {
    background: 'oklch(0.96 0.009 70)',
    border: '1px solid oklch(0.88 0.015 68)',
  };

  const labelStyle = { color: 'oklch(0.30 0.04 52)' };

  function ActionButtons({ onAdd, disabled }: { onAdd: () => void; disabled: boolean }) {
    return (
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 h-9 rounded-lg font-display font-500 text-sm transition-all"
          style={{
            border: '1px solid oklch(0.88 0.015 68)',
            color: 'oklch(0.40 0.03 52)',
            background: '#fff',
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onAdd}
          disabled={disabled}
          className="flex-1 h-9 rounded-lg font-display font-600 text-sm text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: '#D4654A' }}
        >
          {loading ? 'Adding…' : 'Add Pin'}
        </button>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle
            className="font-display font-700 text-lg"
            style={{ color: 'oklch(0.22 0.03 52)', letterSpacing: '-0.01em' }}
          >
            Add a Pin
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="note" className="mt-2">
          <TabsList className="w-full" style={{ background: 'oklch(0.94 0.009 68)' }}>
            <TabsTrigger value="note" className="flex-1 font-display font-500 text-xs">Note</TabsTrigger>
            <TabsTrigger value="link" className="flex-1 font-display font-500 text-xs">Link</TabsTrigger>
            <TabsTrigger value="image" className="flex-1 font-display font-500 text-xs">Image</TabsTrigger>
            <TabsTrigger value="checklist" className="flex-1 font-display font-500 text-xs">Checklist</TabsTrigger>
          </TabsList>

          {/* Note */}
          <TabsContent value="note" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="font-display font-600 text-sm" style={labelStyle}>
                Title <span style={{ color: 'oklch(0.60 0.025 58)', fontWeight: 400 }}>(optional)</span>
              </Label>
              <Input
                placeholder="Note title..."
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className="font-display text-sm"
                style={inputStyle}
              />
            </div>
            <div className="space-y-2">
              <Label className="font-display font-600 text-sm" style={labelStyle}>Content</Label>
              <Textarea
                placeholder="Write your note..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="font-editorial text-sm resize-none"
                style={inputStyle}
                rows={5}
                autoFocus
              />
            </div>
            <ActionButtons
              onAdd={() => handleCreate('note', { title: noteTitle || undefined, content: noteContent })}
              disabled={!noteContent.trim() || loading}
            />
          </TabsContent>

          {/* Link */}
          <TabsContent value="link" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="font-display font-600 text-sm" style={labelStyle}>URL</Label>
              <Input
                placeholder="https://..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="font-display text-sm"
                style={inputStyle}
                type="url"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label className="font-display font-600 text-sm" style={labelStyle}>
                Title <span style={{ color: 'oklch(0.60 0.025 58)', fontWeight: 400 }}>(optional)</span>
              </Label>
              <Input
                placeholder="Link title..."
                value={linkTitle}
                onChange={(e) => setLinkTitle(e.target.value)}
                className="font-display text-sm"
                style={inputStyle}
              />
            </div>
            <div className="space-y-2">
              <Label className="font-display font-600 text-sm" style={labelStyle}>
                Description <span style={{ color: 'oklch(0.60 0.025 58)', fontWeight: 400 }}>(optional)</span>
              </Label>
              <Textarea
                placeholder="What's great about this link?"
                value={linkDesc}
                onChange={(e) => setLinkDesc(e.target.value)}
                className="font-editorial text-sm resize-none"
                style={inputStyle}
                rows={3}
              />
            </div>
            <ActionButtons
              onAdd={() => handleCreate('link', { title: linkTitle || undefined, link_url: linkUrl, content: linkDesc || undefined })}
              disabled={!linkUrl.trim() || loading}
            />
          </TabsContent>

          {/* Image */}
          <TabsContent value="image" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="font-display font-600 text-sm" style={labelStyle}>Image URL</Label>
              <Input
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="font-display text-sm"
                style={inputStyle}
                autoFocus
              />
            </div>
            {imageUrl && (
              <div className="rounded-xl overflow-hidden max-h-48" style={{ border: '1px solid oklch(0.88 0.015 68)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full object-cover max-h-48"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label className="font-display font-600 text-sm" style={labelStyle}>
                Title <span style={{ color: 'oklch(0.60 0.025 58)', fontWeight: 400 }}>(optional)</span>
              </Label>
              <Input
                placeholder="Image title..."
                value={imageTitle}
                onChange={(e) => setImageTitle(e.target.value)}
                className="font-display text-sm"
                style={inputStyle}
              />
            </div>
            <ActionButtons
              onAdd={() => handleCreate('image', { title: imageTitle || undefined, image_url: imageUrl })}
              disabled={!imageUrl.trim() || loading}
            />
          </TabsContent>

          {/* Checklist */}
          <TabsContent value="checklist" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="font-display font-600 text-sm" style={labelStyle}>Title</Label>
              <Input
                placeholder="Packing list, To-do, ..."
                value={clTitle}
                onChange={(e) => setClTitle(e.target.value)}
                className="font-display text-sm"
                style={inputStyle}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label className="font-display font-600 text-sm" style={labelStyle}>Items</Label>
              <div className="space-y-2">
                {clItems.map((item, i) => (
                  <div key={item.id} className="flex gap-2">
                    <Input
                      placeholder={`Item ${i + 1}`}
                      value={item.text}
                      onChange={(e) => handleChecklistItemChange(item.id, e.target.value)}
                      className="font-display text-sm flex-1"
                      style={inputStyle}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveChecklistItem(item.id)}
                      disabled={clItems.length === 1}
                      className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30"
                      style={{ color: 'oklch(0.55 0.22 25)' }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'oklch(0.65 0.22 25 / 10%)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={handleAddChecklistItem}
                className="flex items-center gap-1.5 font-display text-xs font-600 px-3 py-1.5 rounded-lg transition-colors"
                style={{ color: '#D4654A', background: '#FEF3EF' }}
              >
                <Plus className="w-3.5 h-3.5" />
                Add item
              </button>
            </div>
            <ActionButtons
              onAdd={() => handleCreate('checklist', { title: clTitle || undefined, metadata: { items: clItems.filter((i) => i.text.trim()) } })}
              disabled={!clItems.some((i) => i.text.trim()) || loading}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
