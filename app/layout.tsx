import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrueMedia — Deepfake Detection (Design Mockup)",
  description:
    "Design mockup of the TrueMedia.org platform — an open-source deepfake detection project of Georgetown University's Media Integrity Lab.",
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
