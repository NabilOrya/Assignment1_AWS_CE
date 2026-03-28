'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Calendar } from 'lucide-react';

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-foreground">
          <Calendar className="h-5 w-5" />
          <span>UniEvent</span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
            Home
          </Link>
          <Link href="/upload" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
            Upload
          </Link>
        </div>

        {/* Theme Toggle */}
        <div className="flex items-center gap-2">
          {mounted && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-full w-9 h-9 p-0"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
