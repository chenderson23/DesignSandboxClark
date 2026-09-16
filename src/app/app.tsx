'use client';

import { useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  PhxTopNav,
  PhxSidenav,
  PhxBreadcrumb,
} from '@Allegion/phoenix-react';
import type { NavItem, BreadcrumbItem } from '@Allegion/phoenix-react';

// ─── Nav configuration ────────────────────────────────────────────────────────
// Edit this array to add/remove SideNav items.
// Icons are Material Icons names: https://fonts.google.com/icons
const NAV_ITEMS: NavItem[] = [
  { name: 'Home',        path: '/',            icon: 'home'  },
  { name: 'Users',       path: '/users',       icon: 'group' },
  { name: 'Credentials', path: '/credentials', icon: 'key'   },
];

// ─── Breadcrumb helpers ───────────────────────────────────────────────────────
function buildBreadcrumbs(pathname: string): BreadcrumbItem[] {
  if (pathname === '/') return [];

  const segments = pathname.split('/').filter(Boolean);

  return segments.map((segment, index, arr) => {
    const path = '/' + arr.slice(0, index + 1).join('/');
    const navMatch = NAV_ITEMS.find(item => item.path === path);
    const label = navMatch
      ? navMatch.name
      : segment.charAt(0).toUpperCase() + segment.slice(1);

    return {
      label,
      path: index < arr.length - 1 ? path : undefined,
    };
  });
}

// ─── AppShell ─────────────────────────────────────────────────────────────────
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const handleNavigate = useCallback(
    (path: string) => router.push(path),
    [router]
  );

  const handleCollapseToggle = useCallback(
    () => setCollapsed(prev => !prev),
    []
  );

  return (
    <div className="app-shell">
      <PhxTopNav
        logo={{ type: 'overtur' }}
        showCollapseButton
        sideNavState={collapsed ? 'closed' : 'open'}
        onCollapseToggle={handleCollapseToggle}
        showProfile
        profile={{ name: 'Demo User', initials: 'DU' }}
        activePath={pathname}
      />

      <PhxSidenav
        topNavMode
        navItems={NAV_ITEMS}
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        activePath={pathname}
      />

      <main className={`app-content${collapsed ? ' sidenav-collapsed' : ''}`}>
        <PhxBreadcrumb
          items={buildBreadcrumbs(pathname)}
          showHomeIcon
          homeHref="/"
          onNavigate={handleNavigate}
        />
        {children}
      </main>
    </div>
  );
}
