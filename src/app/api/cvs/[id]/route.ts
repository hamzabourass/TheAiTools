import { NextRequest, NextResponse } from 'next/server';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '@/lib/s3';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    // Get CV record and verify ownership
    const cv = await prisma.cv.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,  // Ensure CV belongs to user
      },
    });

    if (!cv) {
      return NextResponse.json(
        { error: 'CV not found' }, 
        { status: 404 }
      );
    }

    // Delete from S3 first
    try {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME!,
          Key: cv.key,
        })
      );
    } catch (s3Error) {
      console.error('S3 deletion error:', s3Error);
      return NextResponse.json(
        { error: 'Failed to delete file from storage' }, 
        { status: 500 }
      );
    }

    // If S3 deletion successful, delete from database
    await prisma.cv.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { message: 'CV deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting CV:', error);
    return NextResponse.json(
      { error: 'Failed to delete CV' },
      { status: 500 }
    );
  }
}