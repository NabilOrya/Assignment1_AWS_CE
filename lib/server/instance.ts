import { randomBytes } from 'crypto';

// Generate or retrieve instance ID on server startup
let instanceId: string;

export function getInstanceId(): string {
  if (!instanceId) {
    // Use environment variable if provided, otherwise generate random ID
    instanceId = process.env.INSTANCE_ID || `instance-${randomBytes(4).toString('hex')}`;
    console.log(`[UniEvent] Server instance ID: ${instanceId}`);
  }
  return instanceId;
}
