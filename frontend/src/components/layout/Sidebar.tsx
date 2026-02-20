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
  Sparkles,
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
      animate={{ width: collapsed ? 60 : 232 }}
      transition={{ type: 'spring', stiffness: 340, damping: 34 }}
      className="relative flex flex-col h-full shrink-0 overflow-hidden"
      style={{
        background: 'oklch(0.96 0.009 70)',
        borderRight: '1px solid oklch(0.88 0.015 68)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3.5 h-14 shrink-0"
        style={{ borderBottom: '1px solid oklch(0.88 0.015 68)' }}
      >
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
              className="flex items-center gap-2"
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: '#D4654A' }}
              >
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span
                className="font-display font-700 text-base tracking-tight"
                style={{ color: 'oklch(0.22 0.03 52)' }}
              >
                Nexus
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="ml-auto p-1.5 rounded-lg transition-colors"
          style={{ color: 'oklch(0.55 0.025 58)' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'oklch(0.91 0.014 68)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          }}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2.5 space-y-0.5">
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
            <div className={cn('px-3 pt-3 pb-1', collapsed && 'px-0')}>
              {!collapsed && (
                <p
                  className="font-display text-[10px] font-700 uppercase tracking-widest px-2 mb-1"
                  style={{ color: 'oklch(0.65 0.025 58)' }}
                >
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
              <div className="px-3 pt-3 pb-1">
                <p
                  className="font-display text-[10px] font-700 uppercase tracking-widest px-2 mb-1"
                  style={{ color: 'oklch(0.65 0.025 58)' }}
                >
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
        <div className={cn('px-2 pt-2', collapsed && 'flex justify-center px-0')}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/spaces?new=1')}
            className={cn(
              'w-full justify-start gap-2 font-display font-500 text-sm transition-colors',
              collapsed && 'w-9 justify-center px-0',
            )}
            style={{ color: 'oklch(0.55 0.025 58)' }}
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            {!collapsed && <span>New Space</span>}
          </Button>
        </div>
      </div>

      {/* Footer: user */}
      <div
        className={cn(
          'p-3 flex items-center gap-2',
          collapsed && 'justify-center',
        )}
        style={{ borderTop: '1px solid oklch(0.88 0.015 68)' }}
      >
        {user && (
          <>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-display font-700 shrink-0"
              style={{ backgroundColor: user.avatar_color }}
            >
              {user.display_name[0].toUpperCase()}
            </div>
            {!collapsed && (
              <span
                className="font-display text-sm font-500 truncate flex-1"
                style={{ color: 'oklch(0.30 0.04 52)' }}
              >
                {user.display_name}
              </span>
            )}
            {!collapsed && (
              <button
                onClick={clearUser}
                className="p-1.5 rounded-md transition-colors"
                style={{ color: 'oklch(0.55 0.025 58)' }}
                title="Sign out"
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'oklch(0.91 0.014 68)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                }}
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
          'flex items-center gap-2.5 px-2.5 py-2 mx-1.5 rounded-lg font-display text-sm transition-all duration-150 cursor-pointer',
          collapsed && 'justify-center mx-1 px-0 w-9 h-9',
        )}
        style={{
          background: active ? '#FEF3EF' : 'transparent',
          color: active ? '#D4654A' : 'oklch(0.40 0.03 52)',
          fontWeight: active ? 600 : 500,
        }}
        onMouseEnter={(e) => {
          if (!active) {
            (e.currentTarget as HTMLDivElement).style.background = 'oklch(0.91 0.014 68)';
          }
        }}
        onMouseLeave={(e) => {
          if (!active) {
            (e.currentTarget as HTMLDivElement).style.background = 'transparent';
          }
        }}
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
