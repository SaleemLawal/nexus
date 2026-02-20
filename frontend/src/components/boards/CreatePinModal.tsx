'use client';

import { useState } from 'react';
import { nanoid } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle>Add a Pin</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="note" className="mt-2">
          <TabsList className="w-full bg-secondary/50">
            <TabsTrigger value="note" className="flex-1">Note</TabsTrigger>
            <TabsTrigger value="link" className="flex-1">Link</TabsTrigger>
            <TabsTrigger value="image" className="flex-1">Image</TabsTrigger>
            <TabsTrigger value="checklist" className="flex-1">Checklist</TabsTrigger>
          </TabsList>

          {/* Note */}
          <TabsContent value="note" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Title (optional)</Label>
              <Input
                placeholder="Note title..."
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className="bg-secondary/50 border-border/50"
              />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea
                placeholder="Write your note..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="bg-secondary/50 border-border/50 resize-none"
                rows={5}
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
              <Button
                onClick={() =>
                  handleCreate('note', {
                    title: noteTitle || undefined,
                    content: noteContent,
                  })
                }
                disabled={!noteContent.trim() || loading}
                className="flex-1"
              >
                {loading ? 'Adding…' : 'Add Note'}
              </Button>
            </div>
          </TabsContent>

          {/* Link */}
          <TabsContent value="link" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>URL</Label>
              <Input
                placeholder="https://..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="bg-secondary/50 border-border/50"
                type="url"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label>Title (optional)</Label>
              <Input
                placeholder="Link title..."
                value={linkTitle}
                onChange={(e) => setLinkTitle(e.target.value)}
                className="bg-secondary/50 border-border/50"
              />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                placeholder="What's great about this link?"
                value={linkDesc}
                onChange={(e) => setLinkDesc(e.target.value)}
                className="bg-secondary/50 border-border/50 resize-none"
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
              <Button
                onClick={() =>
                  handleCreate('link', {
                    title: linkTitle || undefined,
                    link_url: linkUrl,
                    content: linkDesc || undefined,
                  })
                }
                disabled={!linkUrl.trim() || loading}
                className="flex-1"
              >
                {loading ? 'Adding…' : 'Add Link'}
              </Button>
            </div>
          </TabsContent>

          {/* Image */}
          <TabsContent value="image" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="bg-secondary/50 border-border/50"
                autoFocus
              />
            </div>
            {imageUrl && (
              <div className="rounded-xl overflow-hidden border border-border/50 max-h-48">
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
              <Label>Title (optional)</Label>
              <Input
                placeholder="Image title..."
                value={imageTitle}
                onChange={(e) => setImageTitle(e.target.value)}
                className="bg-secondary/50 border-border/50"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
              <Button
                onClick={() =>
                  handleCreate('image', {
                    title: imageTitle || undefined,
                    image_url: imageUrl,
                  })
                }
                disabled={!imageUrl.trim() || loading}
                className="flex-1"
              >
                {loading ? 'Adding…' : 'Add Image'}
              </Button>
            </div>
          </TabsContent>

          {/* Checklist */}
          <TabsContent value="checklist" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                placeholder="Packing list, To-do, ..."
                value={clTitle}
                onChange={(e) => setClTitle(e.target.value)}
                className="bg-secondary/50 border-border/50"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label>Items</Label>
              <div className="space-y-2">
                {clItems.map((item, i) => (
                  <div key={item.id} className="flex gap-2">
                    <Input
                      placeholder={`Item ${i + 1}`}
                      value={item.text}
                      onChange={(e) => handleChecklistItemChange(item.id, e.target.value)}
                      className="bg-secondary/50 border-border/50 flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveChecklistItem(item.id)}
                      disabled={clItems.length === 1}
                      className="shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAddChecklistItem}
                className="gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <Plus className="w-3.5 h-3.5" />
                Add item
              </Button>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
              <Button
                onClick={() =>
                  handleCreate('checklist', {
                    title: clTitle || undefined,
                    metadata: { items: clItems.filter((i) => i.text.trim()) },
                  })
                }
                disabled={!clItems.some((i) => i.text.trim()) || loading}
                className="flex-1"
              >
                {loading ? 'Adding…' : 'Add Checklist'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
