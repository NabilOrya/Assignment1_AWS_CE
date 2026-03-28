// Ticketmaster API client with mock data fallback
export interface Event {
  id: string;
  name: string;
  date: string;
  time: string;
  venue: string;
  location: string;
  description: string;
  image: string;
  category: string;
  attendees: number;
}

// Mock university events for fallback
const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    name: 'Welcome Back BBQ',
    date: '2024-04-15',
    time: '16:00',
    venue: 'Campus Green',
    location: 'Main Campus',
    description: 'Annual welcome back barbecue for all students. Free food and games!',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561404?w=500&h=300&fit=crop',
    category: 'Social',
    attendees: 350,
  },
  {
    id: '2',
    name: 'Tech Talk: AI in Production',
    date: '2024-04-18',
    time: '14:00',
    venue: 'Engineering Building',
    location: 'Room 201',
    description: 'Industry experts discuss deploying AI systems at scale. Q&A included.',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop',
    category: 'Academic',
    attendees: 120,
  },
  {
    id: '3',
    name: 'Spring Concert',
    date: '2024-04-22',
    time: '19:00',
    venue: 'Auditorium',
    location: 'Arts Complex',
    description: 'Annual spring concert featuring student bands and special guest performances.',
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=300&fit=crop',
    category: 'Entertainment',
    attendees: 800,
  },
  {
    id: '4',
    name: 'Career Fair 2024',
    date: '2024-04-25',
    time: '10:00',
    venue: 'Student Center',
    location: 'Exhibition Hall',
    description: '100+ companies recruiting for internships and full-time positions. Bring your resume!',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop',
    category: 'Career',
    attendees: 500,
  },
  {
    id: '5',
    name: 'Hackathon 24',
    date: '2024-05-02',
    time: '09:00',
    venue: 'Innovation Hub',
    location: 'Building B',
    description: '24-hour hackathon with $10K in prizes. Build something amazing!',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=300&fit=crop',
    category: 'Competition',
    attendees: 200,
  },
  {
    id: '6',
    name: 'Sports: Soccer Championship',
    date: '2024-05-05',
    time: '15:00',
    venue: 'Athletic Field',
    location: 'Sports Complex',
    description: 'Intramural soccer championship finals. Free admission for all students.',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&h=300&fit=crop',
    category: 'Sports',
    attendees: 400,
  },
  {
    id: '7',
    name: 'Psychology Guest Lecture',
    date: '2024-05-08',
    time: '13:00',
    venue: 'Science Building',
    location: 'Lecture Hall A',
    description: 'Renowned psychologist discusses mental health in the digital age.',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop',
    category: 'Academic',
    attendees: 150,
  },
  {
    id: '8',
    name: 'International Food Festival',
    date: '2024-05-12',
    time: '17:00',
    venue: 'Quad',
    location: 'Outdoor',
    description: 'Celebrate diversity with food, music, and performances from around the world.',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561404?w=500&h=300&fit=crop',
    category: 'Social',
    attendees: 600,
  },
];

export async function fetchEvents(): Promise<{
  events: Event[];
  source: 'api' | 'mock';
  error?: string;
}> {
  const apiKey = process.env.TICKETMASTER_API_KEY;

  if (!apiKey) {
    console.warn('[Ticketmaster] API key not configured, using mock data');
    return {
      events: MOCK_EVENTS,
      source: 'mock',
    };
  }

  try {
    // In a real scenario, this would call the Ticketmaster API
    // For now, we return mock data to avoid external API calls in demo
    console.log('[Ticketmaster] Using mock data for demo (real API call would go here)');
    return {
      events: MOCK_EVENTS,
      source: 'mock',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Ticketmaster] API fetch failed:', errorMessage);
    return {
      events: MOCK_EVENTS,
      source: 'mock',
      error: errorMessage,
    };
  }
}

export function searchEvents(events: Event[], query: string): Event[] {
  if (!query.trim()) {
    return events;
  }

  const lowerQuery = query.toLowerCase();
  return events.filter(
    (event) =>
      event.name.toLowerCase().includes(lowerQuery) ||
      event.description.toLowerCase().includes(lowerQuery) ||
      event.category.toLowerCase().includes(lowerQuery) ||
      event.venue.toLowerCase().includes(lowerQuery)
  );
}
