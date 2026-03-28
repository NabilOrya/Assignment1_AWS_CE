'use client';

import { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { EventCard } from '@/components/event-card';
import { SystemStatus } from '@/components/system-status';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Event } from '@/lib/ticketmaster';
import { Search, RefreshCw, AlertCircle } from 'lucide-react';

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState<'working' | 'failed' | 'loading'>('loading');
  const [lastFetchedAt, setLastFetchedAt] = useState<number | null>(null);
  const [instanceId, setInstanceId] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Fetch events from API
  const fetchEvents = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      setApiStatus('loading');

      const params = new URLSearchParams();
      if (forceRefresh) params.append('refresh', 'true');
      if (searchQuery) params.append('q', searchQuery);

      const response = await fetch(`/api/events?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setEvents(data.events);
        setFilteredEvents(data.events);
        setLastFetchedAt(data.metadata.lastFetchedAt);
        setInstanceId(data.metadata.instanceId);
        setApiStatus('working');
        console.log('[HomePage] Events fetched successfully', {
          count: data.events.length,
          instanceId: data.metadata.instanceId,
        });
      } else {
        setApiStatus('failed');
        setError(data.error || 'Failed to fetch events');
        console.error('[HomePage] API returned error:', data.error);
      }
    } catch (err) {
      setApiStatus('failed');
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      console.error('[HomePage] Fetch error:', errorMsg);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  // Initial fetch
  useEffect(() => {
    fetchEvents();
  }, []);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('[HomePage] Auto-refresh triggered');
      fetchEvents();
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchEvents]);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const filtered = events.filter((event) =>
        event.name.toLowerCase().includes(query.toLowerCase()) ||
        event.description.toLowerCase().includes(query.toLowerCase()) ||
        event.category.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredEvents(filtered);
    } else {
      setFilteredEvents(events);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="max-w-2xl mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Discover University Events
            </h1>
            <p className="text-lg text-foreground/60">
              Find and share amazing events happening on campus. Browse thousands of events and connect with your university community.
            </p>
          </div>

          {/* Search Bar */}
          <div className="flex gap-2 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/40 pointer-events-none" />
              <Input
                placeholder="Search events by name, category, or venue..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <Button
              onClick={() => fetchEvents(true)}
              disabled={loading}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* System Status */}
          <SystemStatus
            apiStatus={apiStatus}
            lastFetchedAt={lastFetchedAt}
            instanceId={instanceId}
          />
        </div>

        {/* Error Alert */}
        {error && apiStatus === 'failed' && (
          <div className="mb-6 p-4 rounded-lg border border-red-500/30 bg-red-500/10 flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-700 dark:text-red-400">API Error</p>
              <p className="text-sm text-red-600/70 dark:text-red-400/70">{error}</p>
              <p className="text-xs text-red-600/50 dark:text-red-400/50 mt-1">
                Retrying in 60 seconds or click Refresh to try now.
              </p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && events.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Spinner />
            <p className="text-foreground/60">Loading events...</p>
          </div>
        )}

        {/* Events Grid */}
        {!loading && filteredEvents.length > 0 && (
          <div>
            <div className="mb-6">
              <p className="text-sm text-foreground/60">
                Showing {filteredEvents.length} of {events.length} events
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredEvents.length === 0 && events.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="text-6xl">📭</div>
            <p className="text-lg font-semibold text-foreground">No events found</p>
            <p className="text-foreground/60">Try adjusting your search or check back later.</p>
          </div>
        )}

        {/* No Results */}
        {!loading && filteredEvents.length === 0 && events.length > 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="text-6xl">🔍</div>
            <p className="text-lg font-semibold text-foreground">No matching events</p>
            <p className="text-foreground/60">Try a different search query.</p>
            <Button variant="outline" onClick={() => handleSearch('')}>
              Clear Search
            </Button>
          </div>
        )}
      </main>

      <Footer instanceId={instanceId} />
    </div>
  );
}
