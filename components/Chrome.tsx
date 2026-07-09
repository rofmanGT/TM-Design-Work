"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  HiOutlineBars3,
  HiOutlineShare,
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

  useEffect(() => {
    setMounted(true);
    try {
      setCollapsed(localStorage.getItem(SIDEBAR_KEY) === "1");
      setDark(document.documentElement.classList.contains("dark"));
    } catch {}
  }, []);

  function toggleSidebar() {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem(SIDEBAR_KEY, next ? "1" : "0");
      } catch {}
      return next;
    });
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
      <Header onToggleSidebar={toggleSidebar} />
      <Sidebar
        collapsed={mounted ? collapsed : false}
        onToggle={toggleSidebar}
        dark={dark}
        onToggleTheme={toggleTheme}
      />
      <div className={`mt-20 transition-[margin-left] duration-200 ${sidebarMargin}`}>
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
  // Share is a "share this result" affordance — it belongs on result pages,
  // not the home/query page where there is nothing yet to share.
  const pathname = usePathname() ?? "";
  const showShare = pathname !== "/";
  return (
    <header className="bg-[#041E42] fixed top-0 left-0 right-0 h-20 border-b border-slate-700 px-4 grid grid-cols-3 items-center z-50 text-white">
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
        {showShare && (
          <button className="flex items-center gap-2 hover:text-[#00B5E2] transition">
            <HiOutlineShare className="w-5 h-5" />
            <span className="text-sm">Share</span>
          </button>
        )}
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
      className={`hidden md:flex flex-col fixed mt-20 top-0 left-0 bottom-0 bg-[#E2E2E2] dark:bg-slate-900 border-r border-slate-300 dark:border-slate-700 z-40 transition-[width] duration-200 py-2 px-1.5 ${
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

      {/* Primary nav */}
      <ul className="space-y-0.5">
        {NAV_PRIMARY.map((n) => (
          <SidebarLink key={n.href} item={n} collapsed={collapsed} pathname={pathname} />
        ))}
      </ul>

      <div className="grow" />

      {/* Footer: theme toggle + nav + user + copyright */}
      <div className="border-t border-slate-300 dark:border-slate-700 pt-2 mt-2 space-y-0.5">
        <ThemeToggle dark={dark} onToggle={onToggleTheme} collapsed={collapsed} />

        <ul className="space-y-0.5">
          {NAV_FOOTER.map((n) => (
            <SidebarLink key={n.label} item={n} collapsed={collapsed} pathname={pathname} />
          ))}
        </ul>

        {/* User chip */}
        <div className="mt-3 flex items-center gap-2 px-2.5 py-2 rounded-md hover:bg-white/60 dark:hover:bg-slate-700/60 transition cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-[#00B5E2] text-[#3A3A3A] text-[10px] font-semibold flex items-center justify-center shrink-0">
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
    </aside>
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
      className="flex items-center gap-3 w-full pl-2.5 pr-3 py-2 rounded-md text-[#041E42] dark:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-700/60 transition"
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
}: {
  item: NavItem;
  collapsed: boolean;
  pathname: string;
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
        className={`flex items-center gap-3 px-2.5 py-2 rounded-md transition relative ${
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
