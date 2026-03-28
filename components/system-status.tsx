'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Clock, Server } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SystemStatusProps {
  apiStatus: 'working' | 'failed' | 'loading';
  lastFetchedAt: number | null;
  instanceId: string;
}

export function SystemStatus({ apiStatus, lastFetchedAt, instanceId }: SystemStatusProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const getTimeAgo = (timestamp: number | null) => {
    if (!timestamp) return 'Never';
    const now = Date.now();
    const diff = Math.floor((now - timestamp) / 1000);

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="rounded-lg border border-border/50 bg-card p-3 text-sm space-y-2">
      {/* API Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {apiStatus === 'working' && (
            <>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-foreground/70">API Status:</span>
              <span className="font-medium text-green-500">Working</span>
            </>
          )}
          {apiStatus === 'failed' && (
            <>
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-foreground/70">API Status:</span>
              <span className="font-medium text-red-500">Failed</span>
            </>
          )}
          {apiStatus === 'loading' && (
            <>
              <Clock className="h-4 w-4 text-yellow-500 animate-spin" />
              <span className="text-foreground/70">API Status:</span>
              <span className="font-medium text-yellow-500">Loading</span>
            </>
          )}
        </div>
      </div>

      {/* Last Fetch Time */}
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-foreground/50" />
        <span className="text-foreground/70">Last updated:</span>
        <span className="font-medium text-foreground/90">{getTimeAgo(lastFetchedAt)}</span>
      </div>

      {/* Instance ID */}
      <div className="flex items-center gap-2">
        <Server className="h-4 w-4 text-foreground/50" />
        <span className="text-foreground/70">Instance:</span>
        <span className="font-mono text-xs bg-muted/50 px-2 py-0.5 rounded text-foreground/80">{instanceId}</span>
      </div>
    </div>
  );
}
