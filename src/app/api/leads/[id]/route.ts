import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const prisma = new PrismaClient();
  
  try {
    const leadId = params.id;
    
    const lead = await prisma.lead.findUnique({
      where: {
        id: leadId
      }
    });
    
    if (!lead) {
      return NextResponse.json({ success: false, message: 'Lead not found' }, { status: 404 });
    }
    
    // Add default status if it doesn't exist in the DB yet
    const leadWithStatus = {
      ...lead,
      status: (lead as any).status || 'PENDING'
    };
    
    return NextResponse.json({ 
      success: true, 
      data: leadWithStatus
    });
    
  } catch (error) {
    console.error('Error fetching lead:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return NextResponse.json(
      { success: false, message: 'Failed to fetch lead', error: errorMessage }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 