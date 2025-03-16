import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { Box, Chip, Paper, Button, Link as MuiLink } from '@mui/material';
import AdminSidebar from '@/components/AdminSidebar/AdminSidebar';
import Providers from '@/components/Providers';
import Link from 'next/link';
import StatusUpdateButton from '@/components/ActionButtons/StatusUpdateButton';

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string | null;
  website: string | null;
  message: string;
  visaCategoryO1: boolean;
  visaCategoryEB1A: boolean;
  visaCategoryEB2NIW: boolean;
  visaCategoryUnknown: boolean;
  status?: 'PENDING' | 'REACHED_OUT';
  createdAt: string;
  files?: any; // This can be flushed out better
}

async function getLead(id: string): Promise<Lead | null> {
  try {
    // Use absolute URL with the host from the environment
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const response = await fetch(`${apiUrl}/api/leads/${id}`, {
      cache: 'no-store', // Don't cache this request
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch lead: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.data || data.lead || null;
  } catch (error) {
    console.error('Error fetching lead:', error);
    return null;
  }
}

interface PageProps {
  params: {
    id: string;
  };
}

function parseFilesData(filesStr: string | any): Array<{name: string, path: string}> {
  if (!filesStr) return [];
  
  try {
    // First, ensure it's a string
    const str = typeof filesStr === 'string' ? filesStr : JSON.stringify(filesStr);
    
    // Parse the string - might be double-encoded JSON
    let parsed;
    try {
      // Try to parse once
      parsed = JSON.parse(str);
      
      // If it's still a string, parse again
      if (typeof parsed === 'string') {
        parsed = JSON.parse(parsed);
      }
    } catch {
      // If direct parsing fails, try to extract JSON from message format
      const match = str.match(/\[(.*)\]/);
      if (match) {
        parsed = JSON.parse(`[${match[1]}]`);
      }
    }
    
    // Ensure we have an array
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error parsing files data:', error, filesStr);
    return [];
  }
}

export default async function LeadDetailPage({ params }: PageProps) {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/login');
  }
  
  const lead = await getLead(params.id);
  
  if (!lead) {
    notFound();
  }
  
  let fileData = parseFilesData(lead.files);
  
  // Get selected visa categories
  const visaCategories = [];
  if (lead.visaCategoryO1) visaCategories.push('O-1 Visa');
  if (lead.visaCategoryEB1A) visaCategories.push('EB-1A Visa');
  if (lead.visaCategoryEB2NIW) visaCategories.push('EB-2 NIW');
  if (lead.visaCategoryUnknown) visaCategories.push('Unknown/Other');
  
  // Format date
  const formattedDate = new Date(lead.createdAt).toLocaleString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return (
    <Providers>
      <Box className="flex gap-4 w-full min-h-screen admin-background">
        <AdminSidebar />
        <Box className="flex-1 p-6">
          <Box className="mb-6 flex items-center justify-between">
            <Box>
              <Link href="/dashboard" className="text-blue-500 hover:underline mb-2 inline-block">
                &larr; Back to Leads
              </Link>
              <h2 className="text-3xl font-bold mb-6">
                Lead Details: {lead.firstName} {lead.lastName}
              </h2>
            </Box>
            <Chip 
              label={lead.status === 'REACHED_OUT' ? 'Reached Out' : 'Pending'} 
              color={lead.status === 'REACHED_OUT' ? 'success' : 'warning'}
            />
          </Box>

          <Box className="flex gap-4">
            <Box className="w-[80%]">
              <Paper className="p-6 mb-6">
                <h6 className="font-medium mb-4">Contact Information</h6>
                <Box className="flex gap-4 flex-wrap">
                  <Box className="w-[50%]">
                    <p className="text-sm font-medium text-gray-500">Name</p>
                    <p className="font-medium">
                      {lead.firstName} {lead.lastName}
                    </p>
                  </Box>
                  <Box className="w-[50%]">
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p>
                      <MuiLink href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">
                        {lead.email}
                      </MuiLink>
                    </p>
                  </Box>
                  <Box className="w-[50%]">
                    <p className="text-sm font-medium text-gray-500">Country</p>
                    <p>{lead.country || 'Not specified'}</p>
                  </Box>
                  <Box className="w-[50%]">
                    <p className="text-sm font-medium text-gray-500">Website</p>
                    {lead.website ? (
                      <p>
                        <MuiLink href={lead.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {lead.website.replace(/^https?:\/\//, '')}
                        </MuiLink>
                      </p>
                    ) : (
                      <p>Not specified</p>
                    )}
                  </Box>
                  <Box className="w-[50%]">
                    <p className="text-sm font-medium text-gray-500">Submitted On</p>
                    <p>{formattedDate}</p>
                  </Box>
                </Box>
              </Paper>

              <Paper className="p-6 mb-6">
                <h6 className="text-sm font-medium text-gray-500">Message</h6>
                <p style={{ whiteSpace: 'pre-wrap' }}>
                  {lead.message || 'No message provided'}
                </p>
              </Paper>
            </Box>

            <Box className="w-[20%]">
              <Paper className="p-6 mb-6">
                <h6 className="font-medium mb-4">Visa Categories</h6>
                {visaCategories.length > 0 ? (
                  <Box className="flex flex-wrap gap-2">
                    {visaCategories.map((category) => (
                      <Chip key={category} label={category} />
                    ))}
                  </Box>
                ) : (
                  <p>No visa categories selected</p>
                )}
              </Paper>

              {fileData.length > 0 && (
                <Paper className="p-6 mb-6">
                  <h6 className="font-medium mb-4">Files</h6>
                  <Box className="space-y-2">
                    {fileData.map((file, index) => (
                      <Box key={index} className="flex items-center">
                        <Box className="mr-2">📎</Box>
                        <MuiLink 
                          href={file.path} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {file.name || `File ${index + 1}`}
                        </MuiLink>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              )}

              <Paper className="p-6">
                <h6 className="font-medium mb-4">Actions</h6>
								<Box className="flex gap-1 flex-col">
									<Button 
										variant="contained" 
										color="primary" 
										fullWidth 
										className="mb-2 normal-case"
										href={`mailto:${lead.email}`}
									>
										Email Lead
									</Button>
									<StatusUpdateButton 
										leadId={lead.id} 
										currentStatus={lead.status}
									/>
								</Box>
              </Paper>
            </Box>
          </Box>
        </Box>
      </Box>
    </Providers>
  );
} 