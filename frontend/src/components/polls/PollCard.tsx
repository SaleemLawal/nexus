'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Users } from 'lucide-react';
import type { Poll } from '@/types';
import { api } from '@/lib/api';
import { useSpaceStore } from '@/stores/spaceStore';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface PollCardProps {
  poll: Poll;
  currentUserId?: string;
}

export default function PollCard({ poll }: PollCardProps) {
  const updatePoll = useSpaceStore((s) => s.updatePoll);
  const [loading, setLoading] = useState<string | null>(null);

  const isClosed = poll.closes_at ? new Date(poll.closes_at) < new Date() : false;
  const totalVotes = poll.options.reduce((sum, o) => sum + o.vote_count, 0);

  async function handleVote(optionId: string, alreadyVoted: boolean) {
    if (isClosed || loading) return;
    setLoading(optionId);
    try {
      let updated: Poll;
      if (alreadyVoted) {
        updated = await api.polls.unvote(poll.id, optionId);
      } else {
        updated = await api.polls.vote(poll.id, optionId);
      }
      updatePoll(updated);
    } catch {
      toast.error('Failed to vote');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: '#fff',
        border: '1px solid oklch(0.88 0.015 68)',
        boxShadow: '0 2px 8px oklch(0.22 0.03 52 / 5%), 0 4px 16px oklch(0.22 0.03 52 / 6%)',
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <h3
          className="font-display font-700 text-base leading-snug flex-1"
          style={{ color: 'oklch(0.22 0.03 52)' }}
        >
          {poll.question}
        </h3>
        <div className="flex items-center gap-2 shrink-0">
          {poll.is_multi_select && (
            <Badge
              variant="secondary"
              className="font-display text-xs"
              style={{ background: '#FEF3EF', color: '#D4654A', border: '1px solid #F5C9BC' }}
            >
              Multi-select
            </Badge>
          )}
          {isClosed && (
            <Badge variant="destructive" className="font-display text-xs">
              Closed
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {poll.options.map((option) => {
          const pct = totalVotes > 0 ? Math.round((option.vote_count / totalVotes) * 100) : 0;
          const isVoting = loading === option.id;

          return (
            <button
              key={option.id}
              onClick={() => handleVote(option.id, option.user_voted)}
              disabled={isClosed || isVoting}
              className="w-full relative rounded-xl overflow-hidden transition-all duration-200 text-left"
              style={{
                border: option.user_voted
                  ? '1px solid #D4654A66'
                  : '1px solid oklch(0.88 0.015 68)',
                background: option.user_voted ? '#FEF3EF' : '#fff',
                cursor: isClosed ? 'default' : 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!option.user_voted && !isClosed) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'oklch(0.96 0.009 70)';
                }
              }}
              onMouseLeave={(e) => {
                if (!option.user_voted) {
                  (e.currentTarget as HTMLButtonElement).style.background = '#fff';
                }
              }}
            >
              {/* Background progress bar */}
              <motion.div
                className="absolute inset-y-0 left-0"
                style={{ background: option.user_voted ? '#D4654A18' : 'oklch(0.93 0.012 72 / 60%)' }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
              />

              <div className="relative flex items-center justify-between px-3.5 py-3 z-10">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
                    style={{
                      borderColor: option.user_voted ? '#D4654A' : 'oklch(0.70 0.02 68)',
                      background: option.user_voted ? '#D4654A' : '#fff',
                    }}
                  >
                    {option.user_voted && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <span
                    className="font-display text-sm"
                    style={{
                      color: 'oklch(0.25 0.03 52)',
                      fontWeight: option.user_voted ? 600 : 500,
                    }}
                  >
                    {option.label}
                  </span>
                </div>
                <div
                  className="flex items-center gap-2 font-display text-xs"
                  style={{ color: 'oklch(0.55 0.025 58)' }}
                >
                  <span style={{ fontWeight: 600 }}>{pct}%</span>
                  <span style={{ color: 'oklch(0.65 0.02 68)' }}>({option.vote_count})</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div
        className="flex items-center justify-between mt-4 pt-3 font-display text-xs"
        style={{
          borderTop: '1px solid oklch(0.92 0.012 68)',
          color: 'oklch(0.55 0.025 58)',
        }}
      >
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          <span>{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-3">
          {poll.creator && (
            <span>by {poll.creator.display_name}</span>
          )}
          {poll.closes_at && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {isClosed ? 'Closed' : `Closes ${formatDate(poll.closes_at)}`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
