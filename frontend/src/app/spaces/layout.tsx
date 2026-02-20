'use client';

import { useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import Sidebar from '@/components/layout/Sidebar';
import { useSpaceStore } from '@/stores/spaceStore';
import { useUserStore } from '@/stores/userStore';
import { useParams } from 'next/navigation';

export default function SpacesLayout({ children }: { children: React.ReactNode }) {
  const user = useUserStore((s) => s.user);
  const fetchSpaces = useSpaceStore((s) => s.fetchSpaces);
  const params = useParams<{ spaceId?: string }>();

  useEffect(() => {
    if (user) fetchSpaces();
  }, [user, fetchSpaces]);

  return (
    <AppShell>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar spaceID={params?.spaceId} />
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {children}
        </div>
      </div>
    </AppShell>
  );
}
