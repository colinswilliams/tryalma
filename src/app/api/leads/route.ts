import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

async function saveFile(file: File): Promise<{ fileName: string, filePath: string }> {
  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Generate unique filename
  const originalName = file.name;
  const extension = path.extname(originalName);
  const uniqueFileName = `${uuidv4()}${extension}`;
  const serverFilePath = path.join(uploadsDir, uniqueFileName);
  
  // Convert File to Buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  // Write file to disk
  fs.writeFileSync(serverFilePath, buffer);
  
  // Return public path and original filename
  return {
    fileName: originalName,
    filePath: `/uploads/${uniqueFileName}`
  };
}

export async function POST(req: NextRequest) {
	const prisma = new PrismaClient();
  try {
    // Only support FormData for file uploads
    const formData = await req.formData();
    
    // Process files
    const filesField = formData.getAll('files');
    let fileData = [];
    
    if (filesField && filesField.length > 0) {
      for (const fileItem of filesField) {
        if (fileItem instanceof File && fileItem.size > 0) {
          try {
            const { fileName, filePath } = await saveFile(fileItem);
            fileData.push({ name: fileName, path: filePath });
          } catch (fileError) {
            console.error("Error saving file:", fileError);
          }
        }
      }
    }
    
    // Extract standard form fields
    const leadData = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      country: formData.get('country') as string || null,
      website: formData.get('website') as string,
      message: formData.get('message') as string || '',
      files: fileData.length > 0 ? JSON.stringify(fileData) : null,
      visaCategoryO1: formData.get('visaCategoryO1') === 'true',
      visaCategoryEB1A: formData.get('visaCategoryEB1A') === 'true',
      visaCategoryEB2NIW: formData.get('visaCategoryEB2NIW') === 'true',
      visaCategoryUnknown: formData.get('visaCategoryUnknown') === 'true',
			status: 'PENDING'
    };
    
    // Create a lead with just the standard fields
    const lead = await prisma.lead.create({
      data: leadData,
    });
    
    return NextResponse.json({ success: true, lead }, { status: 201 });
  } catch (error) {
    console.error('Error saving lead:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to save lead',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function GET(): Promise<NextResponse> {
	const prisma = new PrismaClient();
  try {
    // Fetch all leads from the database, ordered by most recent first
    const leads = await prisma.lead.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        country: true,
        website: true,
        message: true,
        visaCategoryO1: true, 
        visaCategoryEB1A: true,
        visaCategoryEB2NIW: true,
        visaCategoryUnknown: true,
        files: true,
        createdAt: true,
        status: true
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      data: leads 
    });
    
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch leads',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 