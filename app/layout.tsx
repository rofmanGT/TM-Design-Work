import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrueMedia.org — Analysis (replica)",
  description: "Faithful React replica of the TrueMedia.org analysis page, used as a design canvas.",
};

// Inline script that sets the `dark` class on <html> BEFORE first paint to avoid a
// flash of the wrong theme. Reads the same localStorage key the Chrome component writes.
const themeInit = `
try {
  var t = localStorage.getItem('tm:theme');
  if (t === 'dark') document.documentElement.classList.add('dark');
} catch(e){}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col min-h-svh font-sans">
        {children}
      </body>
    </html>
  );
}
