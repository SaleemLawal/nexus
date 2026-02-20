'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import SpaceTopNav from '@/components/layout/SpaceTopNav';
import { useSpaceStore } from '@/stores/spaceStore';
import { useUserStore } from '@/stores/userStore';
import { api } from '@/lib/api';

export default function SpaceLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ spaceId: string }>();
  const spaceId = params.spaceId;
  const user = useUserStore((s) => s.user);
  const { setCurrentSpace, fetchSpaces, spaces, clearSpaceData } = useSpaceStore();

  useEffect(() => {
    if (!user) return;
    clearSpaceData();
    if (spaces.length === 0) fetchSpaces();
    api.spaces.get(spaceId).then(setCurrentSpace).catch(console.error);
  }, [user, spaceId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <SpaceTopNav spaceID={spaceId} />
      <main className="flex-1 overflow-hidden flex flex-col">{children}</main>
    </>
  );
}
