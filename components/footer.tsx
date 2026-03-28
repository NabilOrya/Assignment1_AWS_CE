'use client';

import { useEffect, useState } from 'react';

interface FooterProps {
  instanceId: string;
}

export function Footer({ instanceId }: FooterProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <footer className="border-t border-border bg-background/50 mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="font-bold text-foreground mb-4">UniEvent</h3>
            <p className="text-sm text-foreground/60">
              Discover and upload university events seamlessly.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="text-foreground/60 hover:text-foreground transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/upload" className="text-foreground/60 hover:text-foreground transition-colors">
                  Upload Event
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-foreground/60 hover:text-foreground transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/60 hover:text-foreground transition-colors">
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* Instance Info */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Server Info</h4>
            <div className="text-sm">
              <p className="text-foreground/60">Instance ID</p>
              <p className="font-mono text-xs bg-muted/50 px-2 py-1 rounded mt-1 text-foreground/80 break-all">
                {instanceId}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border/50 mt-8 pt-8 flex justify-between items-center">
          <p className="text-sm text-foreground/60">
            © 2024 UniEvent. All rights reserved.
          </p>
          <p className="text-xs text-foreground/40">
            Built for cloud-native deployment with load balancing
          </p>
        </div>
      </div>
    </footer>
  );
}
