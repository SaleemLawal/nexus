'use client';

import { useState } from 'react';
import { Copy, Check, Users } from 'lucide-react';
import { useSpaceStore } from '@/stores/spaceStore';
import { Button } from '@/components/ui/button';
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
    <header className="h-14 border-b border-border flex items-center justify-between px-6 shrink-0 bg-background/80 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <span className="text-xl">{currentSpace.emoji}</span>
        <h1 className="font-semibold text-foreground">{currentSpace.name}</h1>
        {currentSpace.description && (
          <span className="text-sm text-muted-foreground hidden md:block">
            — {currentSpace.description}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <PresenceIndicator spaceID={spaceID} />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShowMembers}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <Users className="w-4 h-4" />
          <span className="text-xs">{currentSpace.member_count ?? 0}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={copyInvite}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          <span className="text-xs hidden md:inline">Invite</span>
        </Button>
      </div>

      {/* Members popover */}
      {showMembers && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMembers(false)}
          />
          <div className="absolute right-4 top-14 z-50 bg-card border border-border rounded-xl shadow-xl p-4 w-64">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Members
            </p>
            <MemberAvatars members={members} />
          </div>
        </>
      )}
    </header>
  );
}
