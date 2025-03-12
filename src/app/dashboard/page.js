import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import LeadList from '@/components/leads/LeadList';

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
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Lead Management Dashboard</h1>
      <LeadList />
    </div>
  );
} 