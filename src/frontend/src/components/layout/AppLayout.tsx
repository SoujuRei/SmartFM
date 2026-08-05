import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../constants/enums';

interface NavItem {
  to: string;
  icon: string;
  label: string;
}

const CUSTOMER_NAV: NavItem[] = [
  { to: '/customer', icon: 'inventory_2', label: 'My Orders' },
  { to: '/customer/new-order', icon: 'add_box', label: 'New Order' },
  { to: '/customer/tracking', icon: 'timeline', label: 'Tracking' },
];

const STAFF_NAV: NavItem[] = [
  { to: '/staff', icon: 'assignment_turned_in', label: 'Dispatch' },
  { to: '/staff/reports', icon: 'analytics', label: 'Reports' },
];

const DRIVER_NAV: NavItem[] = [
  { to: '/driver', icon: 'local_shipping', label: 'My Shipments' },
];

function getNav(role?: UserRole): NavItem[] {
  switch (role) {
    case UserRole.CUSTOMER: return CUSTOMER_NAV;
    case UserRole.STAFF:
    case UserRole.ADMIN: return STAFF_NAV;
    case UserRole.DRIVER: return DRIVER_NAV;
    default: return [];
  }
}

export function AppLayout() {
  const { loggedInUser, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = getNav(loggedInUser?.role);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] font-inter">
      {/* ── Sidebar ────────────────────────────────────────── */}
      <aside className="fixed left-0 top-0 h-full w-[280px] bg-[#ffffff] border-r border-[#262f3d] flex flex-col py-6 z-40">
        {/* Logo */}
        <div className="px-6 mb-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#2563eb] rounded-md flex items-center justify-center">
            <span
              className="material-symbols-outlined text-white text-xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              local_shipping
            </span>
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-[#ffffff] leading-tight">Freight Ledger</h1>
            <p className="text-[11px] text-[#b8ad9d]">Logistics Management</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/customer' || item.to === '/staff' || item.to === '/driver'}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 px-4 py-3 rounded-md text-sm font-semibold transition-all duration-150',
                  isActive
                    ? 'bg-[#faf8ff] text-[#131b2e]'
                    : 'text-[#505f76] hover:bg-[#f2f3ff] hover:text-[#ffffff]',
                ].join(' ')
              }
            >
              <span
                className="material-symbols-outlined text-xl"
                style={{ fontVariationSettings: "'wght' 300" }}
              >
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="mt-auto px-4 pt-4 border-t border-[#303948] mx-4 space-y-2">
          {loggedInUser && (
            <div className="px-4 py-3 rounded-md bg-[#f2f3ff] flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-[#2563eb] flex items-center justify-center text-[#ffffff] text-sm font-bold">
                {loggedInUser.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#ffffff] truncate">{loggedInUser.name}</p>
                <p className="font-mono text-[10px] text-[#b8ad9d] truncate">{loggedInUser.role}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-semibold text-[#ba1a1a] hover:bg-[#ffdad6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563eb]/60"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
            Logout
          </button>
        </div>
      </aside>

      {/* ── Top Bar ────────────────────────────────────────── */}
      <header className="fixed top-0 right-0 w-[calc(100%-280px)] h-14 bg-[#faf8ff] border-b border-[#c3c6d7] flex items-center justify-between px-8 z-30">
        <div className="relative hidden sm:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#737686] text-lg">
            search
          </span>
          <input
            type="text"
            placeholder="Search orders, shipments…"
            className="pl-10 pr-4 py-1.5 bg-[#ffffff] border border-[#c3c6d7] rounded-md text-sm text-[#131b2e] placeholder:text-[#737686] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 focus:border-[#2563eb] w-64 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button className="text-[#505f76] hover:bg-[#f2f3ff] rounded-md p-2 transition-colors relative">
            <span className="material-symbols-outlined">notifications</span>
          </button>
        </div>
      </header>

      {/* ── Main Content ────────────────────────────────────── */}
      <main className="ml-[280px] pt-14 min-h-screen">
        <div className="max-w-[1440px] mx-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
