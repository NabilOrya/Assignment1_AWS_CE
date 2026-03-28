import { NextRequest, NextResponse } from 'next/server';
import { fetchEvents, searchEvents } from '@/lib/ticketmaster';
import { getCache, setCache, getCacheMetadata } from '@/lib/server/cache';
import { getInstanceId } from '@/lib/server/instance';

const CACHE_KEY = 'university-events';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || '';
  const forceRefresh = searchParams.get('refresh') === 'true';
  const instanceId = getInstanceId();

  console.log(`[API/Events] Request - query: "${query}", forceRefresh: ${forceRefresh}, instanceId: ${instanceId}`);

  try {
    let events;
    let source: 'cache' | 'api' | 'fallback' = 'cache';
    let fetchError: string | undefined;

    // Check cache first (unless force refresh)
    const cachedEvents = !forceRefresh ? getCache<any>(CACHE_KEY) : null;

    if (cachedEvents) {
      events = cachedEvents.events;
      source = 'cache';
      console.log(`[API/Events] Using cached events (${events.length} total)`);
    } else {
      // Fetch from Ticketmaster API
      console.log('[API/Events] Cache miss or force refresh, fetching from API...');
      const result = await fetchEvents();
      events = result.events;
      fetchError = result.error;
      source = result.source as 'cache' | 'api' | 'fallback';

      // Cache the results
      setCache(CACHE_KEY, { events, fetchedAt: Date.now() });
      console.log(`[API/Events] Fetched ${events.length} events from ${result.source}`);
    }

    // Apply search filter
    let filteredEvents = events;
    if (query) {
      filteredEvents = searchEvents(events, query);
      console.log(`[API/Events] Search query "${query}" returned ${filteredEvents.length} results`);
    }

    // Get cache metadata
    const metadata = getCacheMetadata(CACHE_KEY);
    const lastFetchedAt = metadata?.lastFetchedAt || Date.now();

    return NextResponse.json(
      {
        success: true,
        events: filteredEvents,
        metadata: {
          total: events.length,
          filtered: filteredEvents.length,
          lastFetchedAt,
          source,
          instanceId,
          timestamp: Date.now(),
        },
        error: fetchError || null,
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API/Events] Unexpected error:', errorMessage);

    // Try to return cached data as fallback
    const cachedEvents = getCache<any>(CACHE_KEY);
    const metadata = getCacheMetadata(CACHE_KEY);

    if (cachedEvents) {
      console.log('[API/Events] Returning cached data due to error');
      return NextResponse.json(
        {
          success: true,
          events: cachedEvents.events,
          metadata: {
            total: cachedEvents.events.length,
            filtered: cachedEvents.events.length,
            lastFetchedAt: metadata?.lastFetchedAt || Date.now(),
            source: 'cache_fallback',
            instanceId: getInstanceId(),
            timestamp: Date.now(),
          },
          error: errorMessage,
        },
        { status: 200 }
      );
    }

    // No cache available, return error
    return NextResponse.json(
      {
        success: false,
        events: [],
        metadata: {
          total: 0,
          filtered: 0,
          lastFetchedAt: null,
          source: 'none',
          instanceId: getInstanceId(),
          timestamp: Date.now(),
        },
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
