import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import LeadList from '@/components/LeadList/LeadList';
import { Box } from '@mui/material';
import AdminSidebar from '@/components/AdminSidebar/AdminSidebar';
import Providers from '@/components/Providers';
export const metadata = {
  title: 'Lead Management Dashboard',
  description: 'Manage your leads and track their status',
};

export default async function Dashboard() {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/login');
  }
  
  return (
		<Providers>
			<Box className="flex gap-4 w-full min-h-screen admin-background">
				<AdminSidebar />
				<Box className="flex flex-col gap-4 px-8 py-12 w-[80%]">
					<h1 className="text-3xl font-bold mb-6">Leads</h1>
					<LeadList />
				</Box>
			</Box>
		</Providers>
  );
} 