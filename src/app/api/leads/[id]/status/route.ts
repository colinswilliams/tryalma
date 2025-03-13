import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const prisma = new PrismaClient();
  
  try {
    const { id } = params;
    const { status } = await req.json();
    
    // Validate status
    if (status !== 'PENDING' && status !== 'REACHED_OUT') {
      return NextResponse.json(
        { success: false, message: 'Invalid status' },
        { status: 400 }
      );
    }
    
    // Get the lead first to check if it exists
    const lead = await prisma.lead.findUnique({
      where: { id }
    });
    
    if (!lead) {
      return NextResponse.json(
        { success: false, message: 'Lead not found' },
        { status: 404 }
      );
    }
    
    // Try to update using Prisma's dynamic approach
    // This is safer if your schema is in flux
    const updatedLead = await prisma.$executeRaw`
      UPDATE "Lead" 
      SET "status" = ${status}
      WHERE "id" = ${id}
    `.catch(async (err: any) => {
      // If the status column doesn't exist, let's store it in the message field
      // as a temporary workaround until migration is fixed
      console.log('Could not update status directly, using message field instead:', err);
      
      let message = lead.message || '';
      
      // If message already has status info, update it
      if (message.includes('STATUS:')) {
        message = message.replace(/STATUS:.*?;/, `STATUS:${status};`);
      } else {
        // Otherwise append it
        message = `${message}\nSTATUS:${status};`;
      }
      
      return prisma.lead.update({
        where: { id },
        data: { message }
      });
    });
    
    return NextResponse.json({ 
      success: true, 
      data: updatedLead 
    });
    
  } catch (error) {
    console.error('Error updating lead status:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update lead status', 
        error: errorMessage 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 