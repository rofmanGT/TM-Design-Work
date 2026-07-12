"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  HiOutlineBars3,
  HiOutlineDocumentMagnifyingGlass,
  HiOutlineClock,
  HiOutlineBeaker,
  HiOutlineGift,
  HiOutlineClipboardDocumentList,
  HiOutlineCube,
  HiOutlineLifebuoy,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineXMark,
} from "react-icons/hi2";
import { FaStar } from "react-icons/fa6";
import { Footer } from "./Footer";

const SIDEBAR_KEY = "tm:sidebar-collapsed";
const THEME_KEY = "tm:theme";

type NavItem = {
  href: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
};

const NAV_PRIMARY: NavItem[] = [
  { href: "/", label: "Query", Icon: HiOutlineDocumentMagnifyingGlass },
  { href: "/media/history", label: "History", Icon: HiOutlineClock },
  { href: "/media/notable", label: "Notable Cases", Icon: FaStar },
  {
    href: "https://www.truemedia.org/",
    label: "About",
    Icon: HiOutlineArrowTopRightOnSquare,
  },
  { href: "/lab", label: "Component Lab", Icon: HiOutlineCube },
];

const NAV_FOOTER: NavItem[] = [
  { href: "#", label: "Donate", Icon: HiOutlineGift },
  { href: "#", label: "Privacy Policy", Icon: HiOutlineClipboardDocumentList },
  { href: "#", label: "Help & Contact", Icon: HiOutlineLifebuoy },
];

// ─────────────────────────────────────────────────────────────────────
// Chrome — owns sidebar collapse + theme state. Both persist to localStorage.
// ─────────────────────────────────────────────────────────────────────

export function Chrome({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  // Mobile-only slide-in nav drawer (the sidebar is hidden below md).
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      setCollapsed(localStorage.getItem(SIDEBAR_KEY) === "1");
      setDark(document.documentElement.classList.contains("dark"));
    } catch {}
  }, []);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  function toggleSidebar() {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem(SIDEBAR_KEY, next ? "1" : "0");
      } catch {}
      return next;
    });
  }

  // The header hamburger: on desktop it collapses the sidebar (unchanged
  // behavior); below md — where the sidebar doesn't render — it opens the
  // mobile drawer instead.
  function handleHamburger() {
    if (typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches) {
      toggleSidebar();
    } else {
      setMobileOpen(true);
    }
  }

  function toggleTheme() {
    setDark((d) => {
      const next = !d;
      document.documentElement.classList.toggle("dark", next);
      try {
        localStorage.setItem(THEME_KEY, next ? "dark" : "light");
      } catch {}
      return next;
    });
  }

  const sidebarMargin = mounted ? (collapsed ? "md:ml-16" : "md:ml-64") : "md:ml-64";

  return (
    <>
      <Header onToggleSidebar={handleHamburger} />
      <Sidebar
        collapsed={mounted ? collapsed : false}
        onToggle={toggleSidebar}
        dark={dark}
        onToggleTheme={toggleTheme}
      />
      <MobileDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        dark={dark}
        onToggleTheme={toggleTheme}
      />
      <div className={`mt-20 print:!mt-0 print:!ml-0 transition-[margin-left] duration-200 ${sidebarMargin}`}>
        <div className="flex flex-col min-h-[calc(100vh-5rem)]">
          <div className="flex-1">{children}</div>
          <Footer />
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Header
// ─────────────────────────────────────────────────────────────────────

function Header({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  return (
    <header className="bg-[#041E42] fixed top-0 left-0 right-0 h-20 border-b border-slate-700 px-4 grid grid-cols-3 items-center z-50 text-white print:hidden">
      <div className="flex items-center">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-md hover:bg-slate-700/60 transition"
          aria-label="Toggle sidebar"
        >
          <HiOutlineBars3 className="w-6 h-6" />
        </button>
      </div>

      <div className="flex justify-center">
        {/* Flat checkmark + "TrueMedia" lockup on navy, per the live site */}
        <a href="/" className="flex items-center">
          <img src="/logos/truemedialogo.png" alt="TrueMedia" className="h-10 w-auto" />
        </a>
      </div>

      <div className="flex justify-end items-center gap-6 pr-4">
        {/* Header Share removed — result pages carry their own share action
            beneath the verdict banner. */}
        <img
          src="/logos/georgetownlogo.png"
          alt="Georgetown University"
          className="h-12 w-auto hidden sm:block"
        />
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Sidebar — collapsible. Caret toggle on right edge. Dark mode in footer.
// ─────────────────────────────────────────────────────────────────────

function Sidebar({
  collapsed,
  onToggle,
  dark,
  onToggleTheme,
}: {
  collapsed: boolean;
  onToggle: () => void;
  dark: boolean;
  onToggleTheme: () => void;
}) {
  const pathname = usePathname() ?? "";

  return (
    <aside
      className={`hidden md:flex print:!hidden flex-col fixed mt-20 top-0 left-0 bottom-0 bg-[#E2E2E2] dark:bg-slate-900 border-r border-slate-300 dark:border-slate-700 z-40 transition-[width] duration-200 py-2 px-1.5 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Caret toggle — floats on right edge, vertically centered */}
      <button
        onClick={onToggle}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 rounded-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 shadow hover:bg-slate-50 dark:hover:bg-slate-600 flex items-center justify-center text-[#041E42] dark:text-slate-200 transition z-10"
      >
        {collapsed ? (
          <HiOutlineChevronRight className="w-3 h-3" />
        ) : (
          <HiOutlineChevronLeft className="w-3 h-3" />
        )}
      </button>

      <SidebarContent
        collapsed={collapsed}
        pathname={pathname}
        dark={dark}
        onToggleTheme={onToggleTheme}
      />
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────
// SidebarContent — the nav itself, shared verbatim by the desktop sidebar
// and the mobile drawer. `onNavigate` lets the drawer close on link tap.
// ─────────────────────────────────────────────────────────────────────

function SidebarContent({
  collapsed,
  pathname,
  dark,
  onToggleTheme,
  onNavigate,
}: {
  collapsed: boolean;
  pathname: string;
  dark: boolean;
  onToggleTheme: () => void;
  onNavigate?: () => void;
}) {
  return (
    <>
      {/* Primary nav */}
      <ul className="space-y-0.5">
        {NAV_PRIMARY.map((n) => (
          <SidebarLink
            key={n.href}
            item={n}
            collapsed={collapsed}
            pathname={pathname}
            onNavigate={onNavigate}
          />
        ))}
      </ul>

      <div className="grow" />

      {/* Footer: theme toggle + nav + user + copyright */}
      <div className="border-t border-slate-300 dark:border-slate-700 pt-2 mt-2 space-y-0.5">
        <ThemeToggle dark={dark} onToggle={onToggleTheme} collapsed={collapsed} />

        <ul className="space-y-0.5">
          {NAV_FOOTER.map((n) => (
            <SidebarLink
              key={n.label}
              item={n}
              collapsed={collapsed}
              pathname={pathname}
              onNavigate={onNavigate}
            />
          ))}
        </ul>

        {/* User chip */}
        <div className="mt-3 flex items-center gap-2 px-2.5 py-2 min-h-[44px] md:min-h-0 rounded-md hover:bg-white/60 dark:hover:bg-slate-700/60 transition cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-[#00B5E2] text-[#041E42] text-[10px] font-semibold flex items-center justify-center shrink-0">
            RO
          </div>
          <span
            className={`text-sm font-medium text-[#041E42] dark:text-slate-100 truncate transition-opacity ${
              collapsed ? "opacity-0 w-0" : "opacity-100"
            }`}
          >
            Ryan O.
          </span>
        </div>

        <div
          className={`px-2.5 pt-2 text-[10px] text-slate-500 dark:text-slate-500 overflow-hidden transition-opacity ${
            collapsed ? "opacity-0 h-0" : "opacity-100"
          }`}
        >
          © 2026 TrueMedia · Georgetown
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// MobileDrawer — slide-in nav for < md, where the sidebar doesn't render.
// Scrim + panel; closes on scrim tap, ✕, ESC, or any nav link.
// ─────────────────────────────────────────────────────────────────────

function MobileDrawer({
  open,
  onClose,
  dark,
  onToggleTheme,
}: {
  open: boolean;
  onClose: () => void;
  dark: boolean;
  onToggleTheme: () => void;
}) {
  const pathname = usePathname() ?? "";

  // Close on Escape while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      className={`md:hidden print:!hidden fixed inset-0 z-[60] ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      {/* Scrim */}
      <div
        className={`absolute inset-0 bg-[#041E42]/60 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        className={`absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-[#E2E2E2] dark:bg-slate-900 shadow-2xl flex flex-col transition-transform duration-200 ease-out pt-[env(safe-area-inset-top)] ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Navy masthead — matches the app header so the white logo reads */}
        <div className="flex items-center justify-between h-14 pl-4 pr-1.5 bg-[#041E42] text-white shrink-0">
          <img src="/logos/truemedialogo.png" alt="TrueMedia" className="h-7 w-auto" />
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="w-11 h-11 flex items-center justify-center rounded-md hover:bg-slate-700/60 transition"
          >
            <HiOutlineXMark className="w-6 h-6" />
          </button>
        </div>

        {/* Same nav content as the desktop sidebar, always expanded */}
        <div className="flex-1 flex flex-col overflow-y-auto py-2 px-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <SidebarContent
            collapsed={false}
            pathname={pathname}
            dark={dark}
            onToggleTheme={onToggleTheme}
            onNavigate={onClose}
          />
        </div>
      </div>
    </div>
  );
}

function ThemeToggle({
  dark,
  onToggle,
  collapsed,
}: {
  dark: boolean;
  onToggle: () => void;
  collapsed: boolean;
}) {
  if (collapsed) {
    return (
      <button
        onClick={onToggle}
        title={dark ? "Switch to light mode" : "Switch to dark mode"}
        aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
        className="flex items-center justify-center w-full px-2.5 py-2 rounded-md text-[#041E42] dark:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-700/60 transition"
      >
        {dark ? <HiOutlineSun className="w-5 h-5" /> : <HiOutlineMoon className="w-5 h-5" />}
      </button>
    );
  }
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-3 w-full pl-2.5 pr-3 py-2 min-h-[44px] md:min-h-0 rounded-md text-[#041E42] dark:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-700/60 transition"
    >
      {dark ? <HiOutlineSun className="w-5 h-5 shrink-0" /> : <HiOutlineMoon className="w-5 h-5 shrink-0" />}
      <span className="text-sm flex-1 text-left truncate">
        {dark ? "Light mode" : "Dark mode"}
      </span>
      <span
        className={`relative inline-block rounded-full transition shrink-0 ${dark ? "bg-[#00B5E2]" : "bg-slate-400 dark:bg-slate-600"}`}
        style={{ width: 30, height: 16 }}
        aria-hidden
      >
        <span
          className="absolute bg-white rounded-full transition-[left] duration-150"
          style={{ width: 12, height: 12, top: 2, left: dark ? 16 : 2 }}
        />
      </span>
    </button>
  );
}

function SidebarLink({
  item,
  collapsed,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  collapsed: boolean;
  pathname: string;
  onNavigate?: () => void;
}) {
  const active = pathname === item.href;
  const isExternal = item.href.startsWith("http");
  return (
    <li>
      <a
        href={item.href}
        title={collapsed ? item.label : undefined}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        onClick={onNavigate}
        className={`flex items-center gap-3 px-2.5 py-2 min-h-[44px] md:min-h-0 rounded-md transition relative ${
          active
            ? "bg-[#041E42] text-white dark:bg-[#00B5E2]/15 dark:text-white dark:ring-1 dark:ring-[#00B5E2]/30"
            : "text-[#041E42] dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800/80"
        }`}
      >
        <item.Icon className="w-5 h-5 shrink-0" />
        <span
          className={`text-sm whitespace-nowrap transition-opacity ${
            collapsed ? "opacity-0 w-0" : "opacity-100"
          }`}
        >
          {item.label}
        </span>
        {active && !collapsed && (
          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00B5E2]" />
        )}
      </a>
    </li>
  );
}
