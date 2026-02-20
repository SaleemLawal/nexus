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
  '#D4654A', '#C08B3A', '#3B9E8C', '#7C6FCD',
  '#4A9BD4', '#D4884A', '#9E3B8C', '#3B7C9E',
  '#8C9E3B', '#D44A84',
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'oklch(0.978 0.006 72 / 95%)', backdropFilter: 'blur(8px)' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md mx-4"
      >
        <div
          className="rounded-3xl p-8"
          style={{
            background: '#fff',
            boxShadow:
              '0 8px 32px oklch(0.22 0.03 52 / 10%), 0 24px 64px oklch(0.22 0.03 52 / 8%)',
            border: '1px solid oklch(0.88 0.015 68)',
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-7">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: '#D4654A' }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1
                className="font-display font-800 text-xl"
                style={{ color: 'oklch(0.22 0.03 52)', letterSpacing: '-0.02em' }}
              >
                Welcome to Nexus
              </h1>
              <p
                className="font-editorial text-sm"
                style={{ color: 'oklch(0.55 0.025 58)', fontStyle: 'italic' }}
              >
                Set up your profile to get started
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="font-display font-600 text-sm"
                style={{ color: 'oklch(0.30 0.04 52)' }}
              >
                Your name
              </Label>
              <Input
                id="name"
                placeholder="e.g. Alex, Sam..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="font-display text-sm h-11"
                style={{
                  background: 'oklch(0.96 0.009 70)',
                  border: '1px solid oklch(0.88 0.015 68)',
                  color: 'oklch(0.22 0.03 52)',
                }}
                autoFocus
                maxLength={40}
              />
            </div>

            <div className="space-y-3">
              <Label
                className="font-display font-600 text-sm"
                style={{ color: 'oklch(0.30 0.04 52)' }}
              >
                Pick a color
              </Label>
              <div className="flex flex-wrap gap-2.5">
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
                      transform: color === c ? 'scale(1.18)' : undefined,
                      boxShadow: color === c ? `0 2px 8px ${c}55` : 'none',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Preview */}
            <div
              className="flex items-center gap-3 p-3.5 rounded-2xl"
              style={{ background: 'oklch(0.96 0.009 70)' }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-display font-700 text-sm shrink-0"
                style={{ backgroundColor: color, boxShadow: `0 2px 8px ${color}44` }}
              >
                {name ? name[0].toUpperCase() : '?'}
              </div>
              <span
                className="font-display font-500 text-sm"
                style={{ color: 'oklch(0.30 0.04 52)' }}
              >
                {name || 'Your name'}
              </span>
            </div>

            <button
              type="submit"
              disabled={!name.trim() || loading}
              className="w-full h-11 rounded-xl font-display font-700 text-sm text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: '#D4654A', boxShadow: '0 4px 16px #D4654A33' }}
            >
              {loading ? 'Creating profile…' : 'Get started'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
