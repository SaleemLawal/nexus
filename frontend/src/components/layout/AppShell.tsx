'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/stores/userStore';
import UserOnboarding from './UserOnboarding';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, initFromStorage } = useUserStore();

  useEffect(() => {
    initFromStorage();
  }, [initFromStorage]);

  if (!user) {
    return <UserOnboarding />;
  }

  return <>{children}</>;
}
