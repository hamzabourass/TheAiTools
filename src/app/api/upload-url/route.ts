// app/api/upload-url/route.ts
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { s3Client } from '@/lib/s3';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const key = `cvs/${session.user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}`;

    // Create the presigned POST without ACL
    const { url, fields } = await createPresignedPost(s3Client, {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
      Conditions: [
        ['content-length-range', 0, 10 * 1024 * 1024],
      ],
      Expires: 600,
    });

    return Response.json({
      url,
      fields,
      key
    });
  } catch (error) {
    console.error('Error creating upload URL:', error);
    return Response.json(
      { error: 'Failed to create upload URL' },
      { status: 500 }
    );
  }
}