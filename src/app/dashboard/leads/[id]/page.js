import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import Link from 'next/link';

async function getLead(id) {
  // In a real app, fetch from your API
  // const response = await fetch(`${process.env.API_URL}/api/leads/${id}`);
  // return response.json();
  
  // For this example, we'll return mock data
  return {
    id,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    linkedInProfile: 'https://linkedin.com/in/johndoe',
    visasOfInterest: ['h1b', 'l1'],
    resumePath: '/uploads/resume.pdf',
    additionalInfo: 'Looking for opportunities in software development',
    status: 'NEW',
    createdAt: '2023-01-01T00:00:00Z',
  };
}

export default async function LeadDetailPage({ params }) {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/login');
  }
  
  const lead = await getLead(params.id);
  
  if (!lead) {
    notFound();
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Lead Details</h1>
        <div>
          <Link 
            href={`/dashboard/leads/${params.id}/edit`}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 mr-2"
          >
            Edit
          </Link>
          <Link 
            href="/dashboard"
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
          >
            Back to List
          </Link>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">
                {lead.firstName} {lead.lastName}
              </h2>
              <p className="text-gray-600">{lead.email}</p>
            </div>
            <div>
              <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                {lead.status}
              </span>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Email:</span>{' '}
                  <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">
                    {lead.email}
                  </a>
                </p>
                <p>
                  <span className="font-medium">LinkedIn:</span>{' '}
                  <a href={lead.linkedInProfile} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {lead.linkedInProfile}
                  </a>
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Visa Information</h3>
              <div className="flex flex-wrap gap-2">
                {lead.visasOfInterest.map(visa => (
                  <span key={visa} className="px-2 py-1 bg-gray-100 rounded text-sm">
                    {visa.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Additional Information</h3>
            <p className="text-gray-700">{lead.additionalInfo || 'No additional information provided.'}</p>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Resume</h3>
            {lead.resumePath ? (
              <a 
                href={lead.resumePath} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12l-6-6h4V2h4v4h4l-6 6zm-1 7V15H5l7-7 7 7h-4v4H9z" />
                </svg>
                Download Resume
              </a>
            ) : (
              <p className="text-gray-500">No resume available</p>
            )}
          </div>
          
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-gray-500">
              Created on {new Date(lead.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 