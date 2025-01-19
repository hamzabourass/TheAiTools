import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '@/lib/s3';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get CV record
    const cv = await prisma.cv.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!cv) {
      return Response.json({ error: 'CV not found' }, { status: 404 });
    }

    // Delete from S3
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: cv.key,
      })
    );

    // Delete from database
    await prisma.cv.delete({
      where: { id: params.id },
    });

    return Response.json({ message: 'CV deleted successfully' });
  } catch (error) {
    console.error('Error deleting CV:', error);
    return Response.json(
      { error: 'Failed to delete CV' },
      { status: 500 }
    );
  }
}