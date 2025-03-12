import LeadForm from '@/components/leads/LeadForm';

export const metadata = {
  title: 'Submit Your Information',
  description: 'Fill out this form to submit your information as a lead.',
};

export default function LeadFormPage() {
  return (
    <main className="py-10">
      <div className="container mx-auto px-4">
        <LeadForm />
      </div>
    </main>
  );
} 