import { NextRequest, NextResponse } from 'next/server';
import { getInstanceId } from '@/lib/server/instance';

interface UploadResponse {
  success: boolean;
  message: string;
  file?: {
    name: string;
    size: number;
    type: string;
    s3Key: string;
    uploadedAt: string;
  };
  metadata?: {
    instanceId: string;
    timestamp: number;
  };
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<UploadResponse>> {
  const instanceId = getInstanceId();

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.warn('[API/Upload] No file provided');
      return NextResponse.json(
        {
          success: false,
          message: 'No file provided',
          error: 'File is required',
          metadata: {
            instanceId,
            timestamp: Date.now(),
          },
        },
        { status: 400 }
      );
    }

    // Validate file
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      console.warn(`[API/Upload] File too large: ${file.size} bytes`);
      return NextResponse.json(
        {
          success: false,
          message: 'File too large',
          error: `File size must be less than ${maxSize / 1024 / 1024}MB`,
          metadata: {
            instanceId,
            timestamp: Date.now(),
          },
        },
        { status: 400 }
      );
    }

    // Check file type (allow images and documents)
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(file.type)) {
      console.warn(`[API/Upload] Invalid file type: ${file.type}`);
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid file type',
          error: 'Only images and documents are allowed',
          metadata: {
            instanceId,
            timestamp: Date.now(),
          },
        },
        { status: 400 }
      );
    }

    // Generate S3 key (S3-ready structure)
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop() || 'bin';
    const sanitizedFileName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .substring(0, 50);
    const s3Key = `uploads/${instanceId}/${timestamp}-${sanitizedFileName}`;

    // In production, here you would:
    // 1. Create AWS S3 client using AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION
    // 2. Upload file to S3_BUCKET_NAME
    // 3. Return S3 URL
    // For now, we simulate the upload

    console.log(`[API/Upload] File upload processed:`, {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      s3Key,
      instanceId,
    });

    // Simulate S3 upload
    const s3BucketName = process.env.S3_BUCKET_NAME || 'my-bucket';
    const s3Region = process.env.AWS_REGION || 'us-east-1';
    const simulatedS3Url = `https://${s3BucketName}.s3.${s3Region}.amazonaws.com/${s3Key}`;

    return NextResponse.json(
      {
        success: true,
        message: 'File uploaded successfully',
        file: {
          name: file.name,
          size: file.size,
          type: file.type,
          s3Key,
        },
        metadata: {
          instanceId,
          timestamp,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API/Upload] Error:', errorMessage);

    return NextResponse.json(
      {
        success: false,
        message: 'Upload failed',
        error: errorMessage,
        metadata: {
          instanceId,
          timestamp: Date.now(),
        },
      },
      { status: 500 }
    );
  }
}

// Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
