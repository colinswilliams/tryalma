import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import LeadList from '@/components/LeadList/LeadList';
import { Box } from '@mui/material';
import AdminSidebar from '@/components/AdminSidebar/AdminSidebar';
import Providers from '@/components/Providers';
import TextInput from '@/components/Inputs/TextInput/TextInput';
export const metadata = {
  title: 'Lead Management Settings',
  description: 'Manage your profile',
};

export default async function 	() {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/login');
  }
  
  return (
		<Providers>
			<Box 
				className="flex gap-4 w-full min-h-screen"
				sx={{
					background: 'radial-gradient(circle at top left, #f8fdca 0%, #ffffff 30%)'
				}}
			>
				<AdminSidebar />
				<Box className="flex flex-col gap-4 px-8 py-12 w-[80%]">
					<h1 className="text-3xl font-bold mb-6">Settings</h1>
					<Box className="flex flex-col gap-4">
						<TextInput id="name" label="Name" value={session?.user?.name || ''} disabled />
						<TextInput id="email" label="Email" value={session?.user?.email || ''} disabled />
					</Box>
				</Box>
			</Box>
		</Providers>
  );
} 