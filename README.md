# UniEvent - University Events Platform

A cloud-native event discovery and upload platform built with Next.js 16, designed for stateless deployment on AWS EC2 with load balancing support.

## Key Features

### Event Management
- Browse university events with real-time search
- Event caching with 60-second TTL for optimal performance
- Event details page with complete information
- Auto-refresh every 60 seconds with manual refresh option
- Search filtering by event name, category, and venue

### File Upload System
- Drag-and-drop file upload interface
- S3-ready architecture (minimal changes needed for real AWS integration)
- File validation with size and type checks
- Upload history tracking with instance metadata

### Cloud-Native Architecture
- **Stateless Design**: No disk storage, everything memory-based or external
- **Instance Identification**: Each server displays its instance ID for load balancing demos
- **System Status Monitoring**: Real-time API status, fetch timestamps, and instance tracking
- **Error Resilience**: Graceful fallbacks with cached data on API failures
- **Structured Logging**: Console logs for monitoring and debugging

### Production Ready
- Environment variable configuration for all secrets
- Responsive design with dark/light mode support
- API error handling with user-friendly messages
- Load balancer compatible (stateless, no sticky sessions required)

## Tech Stack

- **Frontend**: Next.js 16 with React 19
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **API**: Next.js App Router with serverless functions
- **Theme**: next-themes for dark mode
- **Notifications**: Sonner for toast messages
- **Icons**: Lucide React

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── events/route.ts       # Event fetching with caching
│   │   └── upload/route.ts       # File upload handling
│   ├── event/[id]/page.tsx       # Event details page
│   ├── upload/page.tsx           # Upload page
│   ├── page.tsx                  # Homepage with search
│   ├── layout.tsx                # Root layout with ThemeProvider
│   └── globals.css               # Global styles
├── components/
│   ├── navbar.tsx                # Navigation with theme toggle
│   ├── footer.tsx                # Footer with instance ID
│   ├── event-card.tsx            # Event card component
│   ├── system-status.tsx         # API status indicator
│   └── ui/                       # shadcn/ui components
├── lib/
│   ├── ticketmaster.ts           # Event API client with mock data
│   ├── server/
│   │   ├── instance.ts           # Instance ID generation/retrieval
│   │   └── cache.ts              # In-memory caching with TTL
│   └── utils.ts                  # Utility functions
├── .env.example                  # Environment variable template
├── .env.local                    # Local development config
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- pnpm (or npm/yarn)

### Local Development

1. **Clone and install dependencies:**
   ```bash
   pnpm install
   ```

2. **Configure environment variables:**
   ```bash
   # Copy example to local config
   cp .env.example .env.local
   
   # Edit .env.local with your configuration
   ```

3. **Set required environment variables:**
   - `TICKETMASTER_API_KEY`: Get from [Ticketmaster Developer](https://developer.ticketmaster.com/)
   - `AWS_ACCESS_KEY_ID`: Your AWS access key
   - `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
   - `AWS_REGION`: AWS region (default: us-east-1)
   - `S3_BUCKET_NAME`: Your S3 bucket name
   - `INSTANCE_ID`: Optional, auto-generated if not set

4. **Start development server:**
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## API Endpoints

### GET /api/events
Fetch university events with optional search and refresh.

**Query Parameters:**
- `q`: Search query (optional)
- `refresh`: Force cache refresh (optional, default: false)

**Response:**
```json
{
  "success": true,
  "events": [
    {
      "id": "1",
      "name": "Event Name",
      "date": "2024-04-15",
      "time": "16:00",
      "venue": "Venue Name",
      "location": "Location",
      "description": "Event description",
      "image": "image_url",
      "category": "Social",
      "attendees": 350
    }
  ],
  "metadata": {
    "total": 8,
    "filtered": 1,
    "lastFetchedAt": 1234567890,
    "source": "cache|api|mock",
    "instanceId": "instance-abc123",
    "timestamp": 1234567890
  },
  "error": null
}
```

### POST /api/upload
Upload files with S3 key generation.

**Request:**
- Content-Type: multipart/form-data
- Field: `file` (required)

**Supported Types:**
- Images: JPG, PNG, GIF
- Documents: PDF, DOCX

**Max Size:** 50MB

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "file": {
    "name": "document.pdf",
    "size": 1024000,
    "type": "application/pdf",
    "s3Key": "uploads/instance-1/timestamp-document.pdf"
  },
  "metadata": {
    "instanceId": "instance-abc123",
    "timestamp": 1234567890
  }
}
```

## Caching System

The app implements an in-memory caching system with TTL:

- **Cache TTL**: 60 seconds
- **Cache Key**: `university-events`
- **On API Failure**: Returns cached data with error message
- **Metadata**: Includes `lastFetchedAt` timestamp and `ageMs`

### Cache Behavior
1. Initial request → Fetch from API → Cache results
2. Subsequent requests within 60s → Return from cache
3. After 60s → Cache expires, next request fetches fresh data
4. Force refresh → Bypass cache, fetch new data
5. API failure → Return cached data as fallback

## Auto-Refresh

The homepage implements automatic refresh every 60 seconds:

```typescript
useEffect(() => {
  const interval = setInterval(() => {
    console.log('[HomePage] Auto-refresh triggered');
    fetchEvents();
  }, 60000); // 60 seconds

  return () => clearInterval(interval);
}, [fetchEvents]);
```

Users can also manually refresh with the "Refresh" button.

## Instance ID & Load Balancing

Each server instance displays its unique ID:

- **Generation**: Auto-generated as `instance-{random-hex}` or from `INSTANCE_ID` env var
- **Display Locations**: 
  - Navbar (bottom right)
  - Footer (Server Info section)
  - System Status component
  - API responses in metadata

This enables demonstration of load balancing across multiple EC2 instances.

## S3 Integration

The upload endpoint is structured for easy S3 integration:

**Current State (Development):**
- Files validated and prepared for upload
- S3 keys generated: `uploads/{instanceId}/{timestamp}-{filename}`
- Metadata tracked with instance ID

**For Production (AWS Integration):**
Replace the simulation in `/api/upload/route.ts` with:

```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// In the upload handler:
const command = new PutObjectCommand({
  Bucket: process.env.S3_BUCKET_NAME,
  Key: s3Key,
  Body: await file.arrayBuffer(),
  ContentType: file.type,
});

await s3Client.send(command);
```

## Deployment on AWS EC2

### Prerequisites
- EC2 instance running Node.js 18+
- Security groups allowing HTTP/HTTPS
- Environment variables configured
- Load balancer (optional, for multi-instance setup)

### Deployment Steps

1. **Pull code to EC2:**
   ```bash
   git clone <repo>
   cd unievents
   ```

2. **Install and build:**
   ```bash
   pnpm install
   pnpm build
   ```

3. **Configure environment:**
   ```bash
   # Set env vars on the instance
   export TICKETMASTER_API_KEY=your_key
   export AWS_ACCESS_KEY_ID=your_key
   export AWS_SECRET_ACCESS_KEY=your_secret
   export AWS_REGION=us-east-1
   export S3_BUCKET_NAME=your_bucket
   export INSTANCE_ID=$(hostname)  # Use hostname as instance ID
   ```

4. **Start server:**
   ```bash
   NODE_ENV=production pnpm start
   ```

5. **Use with load balancer:**
   - Configure load balancer to distribute traffic to EC2 instances
   - No sticky sessions needed (stateless design)
   - Each instance displays its own ID in footer

## Error Handling

The app implements graceful error handling:

1. **API Failures**: Falls back to cached data
2. **Network Issues**: Displays error message with retry option
3. **File Upload Errors**: Validates files before upload, shows specific error messages
4. **Missing Env Vars**: Falls back to mock data for Ticketmaster API

All errors are logged to console for monitoring:
- `[API/Events]` - Event API operations
- `[API/Upload]` - Upload operations
- `[HomePage]` - Homepage interactions
- `[Cache]` - Cache operations

## Logging

The app includes structured console logging for observability:

```
[UniEvent] Server instance ID: instance-abc123
[Cache] Set cache for key: university-events
[API/Events] Fetched 8 events from mock
[HomePage] Events fetched successfully
[API/Upload] File upload processed: document.pdf
```

These logs are suitable for:
- CloudWatch (AWS)
- Application Performance Monitoring (APM)
- Log aggregation services
- Local debugging

## Contributing

This is a demo/starter template for cloud-native university event management.

## License

MIT

## Support

For issues or questions about deployment, refer to:
- [Next.js Documentation](https://nextjs.org/docs)
- [AWS EC2 Guide](https://docs.aws.amazon.com/ec2/)
- [Ticketmaster API Docs](https://developer.ticketmaster.com/)
