'use client';

import { useState } from 'react';
import { Copy, Check, Users } from 'lucide-react';
import { useSpaceStore } from '@/stores/spaceStore';
import { toast } from 'sonner';
import MemberAvatars from '@/components/spaces/MemberAvatars';
import PresenceIndicator from './PresenceIndicator';

interface SpaceTopNavProps {
  spaceID: string;
}

export default function SpaceTopNav({ spaceID }: SpaceTopNavProps) {
  const currentSpace = useSpaceStore((s) => s.currentSpace);
  const members = useSpaceStore((s) => s.members);
  const fetchMembers = useSpaceStore((s) => s.fetchMembers);
  const [copied, setCopied] = useState(false);
  const [showMembers, setShowMembers] = useState(false);

  const inviteUrl =
    typeof window !== 'undefined' && currentSpace
      ? `${window.location.origin}/invite/${currentSpace.invite_code}`
      : '';

  async function copyInvite() {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    toast.success('Invite link copied!');
    setTimeout(() => setCopied(false), 2000);
  }

  function handleShowMembers() {
    setShowMembers(true);
    fetchMembers(spaceID);
  }

  if (!currentSpace) return null;

  return (
    <header
      className="h-14 flex items-center justify-between px-6 shrink-0"
      style={{
        background: '#fff',
        borderBottom: '1px solid oklch(0.88 0.015 68)',
        boxShadow: '0 1px 0 oklch(0.88 0.015 68)',
      }}
    >
      <div className="flex items-center gap-2.5">
        <span className="text-xl leading-none">{currentSpace.emoji}</span>
        <h1
          className="font-display font-700 text-base"
          style={{ color: 'oklch(0.22 0.03 52)' }}
        >
          {currentSpace.name}
        </h1>
        {currentSpace.description && (
          <span
            className="font-editorial text-sm hidden md:block"
            style={{ color: 'oklch(0.55 0.025 58)', fontStyle: 'italic' }}
          >
            — {currentSpace.description}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <PresenceIndicator spaceID={spaceID} />

        <button
          onClick={handleShowMembers}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-display text-xs font-500 transition-colors"
          style={{ color: 'oklch(0.50 0.025 58)' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'oklch(0.93 0.012 72)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          }}
        >
          <Users className="w-3.5 h-3.5" />
          <span>{currentSpace.member_count ?? 0}</span>
        </button>

        <button
          onClick={copyInvite}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-display text-xs font-600 transition-all"
          style={{
            background: copied ? '#EDFAF7' : '#FEF3EF',
            color: copied ? '#3B9E8C' : '#D4654A',
          }}
        >
          {copied ? (
            <Check className="w-3.5 h-3.5" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
          <span className="hidden md:inline">{copied ? 'Copied!' : 'Invite'}</span>
        </button>
      </div>

      {/* Members popover */}
      {showMembers && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMembers(false)}
          />
          <div
            className="absolute right-4 top-14 z-50 rounded-xl p-4 w-64"
            style={{
              background: '#fff',
              border: '1px solid oklch(0.88 0.015 68)',
              boxShadow: '0 8px 32px oklch(0.22 0.03 52 / 12%)',
            }}
          >
            <p
              className="font-display text-xs font-700 uppercase tracking-widest mb-3"
              style={{ color: 'oklch(0.55 0.025 58)' }}
            >
              Members
            </p>
            <MemberAvatars members={members} />
          </div>
        </>
      )}
    </header>
  );
}
