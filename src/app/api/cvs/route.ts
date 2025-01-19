import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cvs = await prisma.cv.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(cvs);
  } catch (error) {
    console.error('Error fetching CVs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch CVs' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { filename, fileUrl, key } = await request.json();

    const cv = await prisma.cv.create({
      data: {
        filename,
        fileUrl,
        key,
        userId: session.user.id,
      },
    });

    return NextResponse.json(cv);
  } catch (error) {
    console.error('Error creating CV:', error);
    return NextResponse.json(
      { error: 'Failed to create CV' },
      { status: 500 }
    );
  }
}