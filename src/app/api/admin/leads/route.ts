import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';

// Add these exports to fix Vercel build issues
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  // Initialize Prisma inside the handler
  const prisma = new PrismaClient();
  
  try {
    // Check if user is authenticated
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    // Get all leads, sorted by newest first
    const leads = await prisma.lead.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json({ success: true, leads });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch leads' }, { status: 500 });
  } finally {
    // Important: always disconnect
    await prisma.$disconnect();
  }
} 