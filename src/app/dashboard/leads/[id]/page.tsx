import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { Box, Typography, Chip, Paper, Button, Link as MuiLink } from '@mui/material';
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

export default async function LeadDetailPage({ params }: PageProps) {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/login');
  }
  
  const lead = await getLead(params.id);
  
  if (!lead) {
    notFound();
  }
  
  // Extract files from message if they're stored in message
  let fileData: any[] = [];
  if (lead.files) {
    fileData = Array.isArray(lead.files) ? lead.files : [];
  } else if (lead.message && lead.message.includes('Files:')) {
    try {
      const fileMatch = lead.message.match(/Files: (\[.*?\])/);
      if (fileMatch) {
        fileData = JSON.parse(fileMatch[1]);
      }
    } catch (e) {
      console.error('Error parsing file data:', e);
    }
  }
  
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
              <Typography variant="h4" className="font-bold">
                Lead Details: {lead.firstName} {lead.lastName}
              </Typography>
            </Box>
            <Chip 
              label={lead.status === 'REACHED_OUT' ? 'Reached Out' : 'Pending'} 
              color={lead.status === 'REACHED_OUT' ? 'success' : 'warning'}
            />
          </Box>

          <Box className="flex gap-4">
            <Box className="w-[80%]">
              <Paper className="p-6 mb-6">
                <Typography variant="h6" className="font-medium mb-4">Contact Information</Typography>
                <Box className="flex gap-4 flex-wrap">
                  <Box className="w-[50%]">
                    <Typography variant="body2" color="text.secondary">Name</Typography>
                    <Typography variant="body1" className="font-medium">
                      {lead.firstName} {lead.lastName}
                    </Typography>
                  </Box>
                  <Box className="w-[50%]">
                    <Typography variant="body2" color="text.secondary">Email</Typography>
                    <Typography variant="body1">
                      <MuiLink href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">
                        {lead.email}
                      </MuiLink>
                    </Typography>
                  </Box>
                  <Box className="w-[50%]">
                    <Typography variant="body2" color="text.secondary">Country</Typography>
                    <Typography variant="body1">{lead.country || 'Not specified'}</Typography>
                  </Box>
                  <Box className="w-[50%]">
                    <Typography variant="body2" color="text.secondary">Website</Typography>
                    {lead.website ? (
                      <Typography variant="body1">
                        <MuiLink href={lead.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {lead.website.replace(/^https?:\/\//, '')}
                        </MuiLink>
                      </Typography>
                    ) : (
                      <Typography variant="body1">Not specified</Typography>
                    )}
                  </Box>
                  <Box className="w-[50%]">
                    <Typography variant="body2" color="text.secondary">Submitted On</Typography>
                    <Typography variant="body1">{formattedDate}</Typography>
                  </Box>
                </Box>
              </Paper>

              <Paper className="p-6 mb-6">
                <Typography variant="h6" className="font-medium mb-4">Message</Typography>
                <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
                  {lead.message?.replace(/Files: \[.*?\]/, '') || 'No message provided'}
                </Typography>
              </Paper>
            </Box>

            <Box className="w-[20%]">
              <Paper className="p-6 mb-6">
                <Typography variant="h6" className="font-medium mb-4">Visa Categories</Typography>
                {visaCategories.length > 0 ? (
                  <Box className="flex flex-wrap gap-2">
                    {visaCategories.map((category) => (
                      <Chip key={category} label={category} />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2">No visa categories selected</Typography>
                )}
              </Paper>

              {fileData.length > 0 && (
                <Paper className="p-6 mb-6">
                  <Typography variant="h6" className="font-medium mb-4">Files</Typography>
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
                <Typography variant="h6" className="font-medium mb-4">Actions</Typography>
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
              </Paper>
            </Box>
          </Box>
        </Box>
      </Box>
    </Providers>
  );
} 