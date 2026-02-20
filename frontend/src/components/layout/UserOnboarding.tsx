'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUserStore } from '@/stores/userStore';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const AVATAR_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#06b6d4',
];

export default function UserOnboarding() {
  const [name, setName] = useState('');
  const [color, setColor] = useState(AVATAR_COLORS[0]);
  const [loading, setLoading] = useState(false);
  const setUser = useUserStore((s) => s.setUser);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const user = await api.users.create(name.trim(), color);
      setUser(user, user.token!);
    } catch (err) {
      toast.error('Failed to create profile. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md mx-4"
      >
        <div className="glass rounded-2xl p-8 shadow-2xl border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Welcome to Nexus</h1>
              <p className="text-sm text-muted-foreground">Set up your profile to get started</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Your name</Label>
              <Input
                id="name"
                placeholder="e.g. Alex, Sam..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground/60 h-11"
                autoFocus
                maxLength={40}
              />
            </div>

            <div className="space-y-3">
              <Label>Pick a color</Label>
              <div className="flex flex-wrap gap-3">
                {AVATAR_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="w-8 h-8 rounded-full transition-all duration-200 hover:scale-110"
                    style={{
                      backgroundColor: c,
                      outline: color === c ? `3px solid ${c}` : 'none',
                      outlineOffset: '2px',
                      transform: color === c ? 'scale(1.15)' : undefined,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{ backgroundColor: color }}
              >
                {name ? name[0].toUpperCase() : '?'}
              </div>
              <span className="text-sm text-foreground font-medium">
                {name || 'Your name'}
              </span>
            </div>

            <Button
              type="submit"
              disabled={!name.trim() || loading}
              className="w-full h-11 font-semibold"
            >
              {loading ? 'Creating profile…' : 'Get started'}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
