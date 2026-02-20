'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid,
  MessageSquare,
  BarChart3,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  LogOut,
  Compass,
} from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { useSpaceStore } from '@/stores/spaceStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  spaceID?: string;
}

const spaceNavItems = (spaceID: string) => [
  {
    href: `/spaces/${spaceID}`,
    label: 'Boards',
    icon: LayoutGrid,
    exact: true,
  },
  { href: `/spaces/${spaceID}/chat`, label: 'Chat', icon: MessageSquare },
  { href: `/spaces/${spaceID}/polls`, label: 'Polls', icon: BarChart3 },
  { href: `/spaces/${spaceID}/calendar`, label: 'Calendar', icon: Calendar },
];

export default function Sidebar({ spaceID }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const user = useUserStore((s) => s.user);
  const clearUser = useUserStore((s) => s.clearUser);
  const spaces = useSpaceStore((s) => s.spaces);
  const currentSpace = useSpaceStore((s) => s.currentSpace);

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="relative flex flex-col h-full bg-sidebar border-r border-sidebar-border shrink-0 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-sidebar-border shrink-0">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <Compass className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground tracking-tight">Nexus</span>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="ml-auto p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-3 space-y-1">
        {/* All spaces link */}
        <SidebarItem
          href="/spaces"
          icon={LayoutGrid}
          label="All Spaces"
          collapsed={collapsed}
          active={pathname === '/spaces'}
        />

        {/* Space-specific nav */}
        {spaceID && currentSpace && (
          <>
            <div className={cn('px-3 py-2', collapsed && 'px-0')}>
              {!collapsed && (
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-2 mb-1">
                  {currentSpace.name}
                </p>
              )}
              {spaceNavItems(spaceID).map((item) => (
                <SidebarItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  collapsed={collapsed}
                  active={
                    item.exact
                      ? pathname === item.href
                      : pathname.startsWith(item.href)
                  }
                />
              ))}
            </div>

            {!collapsed && (
              <div className="px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-2 mb-1">
                  Your Spaces
                </p>
              </div>
            )}
          </>
        )}

        {/* Spaces list */}
        {spaces.slice(0, 8).map((space) => (
          <SidebarItem
            key={space.id}
            href={`/spaces/${space.id}`}
            label={space.name}
            emoji={space.emoji}
            collapsed={collapsed}
            active={pathname.startsWith(`/spaces/${space.id}`)}
          />
        ))}

        {/* Create new space */}
        <div className={cn('px-3 pt-2', collapsed && 'flex justify-center px-0')}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/spaces?new=1')}
            className={cn(
              'text-muted-foreground hover:text-foreground w-full justify-start gap-2',
              collapsed && 'w-9 justify-center px-0',
            )}
          >
            <Plus className="w-4 h-4 shrink-0" />
            {!collapsed && <span>New Space</span>}
          </Button>
        </div>
      </div>

      {/* Footer: user */}
      <div className={cn(
        'p-3 border-t border-sidebar-border flex items-center gap-2',
        collapsed && 'justify-center',
      )}>
        {user && (
          <>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ backgroundColor: user.avatar_color }}
            >
              {user.display_name[0].toUpperCase()}
            </div>
            {!collapsed && (
              <span className="text-sm font-medium text-foreground truncate flex-1">
                {user.display_name}
              </span>
            )}
            {!collapsed && (
              <button
                onClick={clearUser}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </>
        )}
      </div>
    </motion.aside>
  );
}

function SidebarItem({
  href,
  icon: Icon,
  label,
  emoji,
  collapsed,
  active,
}: {
  href: string;
  icon?: React.ElementType;
  label: string;
  emoji?: string;
  collapsed: boolean;
  active: boolean;
}) {
  return (
    <Link href={href}>
      <div
        className={cn(
          'flex items-center gap-2.5 px-3 py-2 mx-2 rounded-lg text-sm transition-all duration-150 cursor-pointer',
          active
            ? 'bg-primary/15 text-primary font-medium'
            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
          collapsed && 'justify-center mx-1 px-0 w-10 h-10',
        )}
        title={collapsed ? label : undefined}
      >
        {Icon ? (
          <Icon className="w-4 h-4 shrink-0" />
        ) : (
          <span className="text-base leading-none shrink-0">{emoji}</span>
        )}
        {!collapsed && <span className="truncate">{label}</span>}
      </div>
    </Link>
  );
}
