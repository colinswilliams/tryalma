'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const visaOptions = [
  { value: 'h1b', label: 'H-1B Visa' },
  { value: 'l1', label: 'L-1 Visa' },
  { value: 'o1', label: 'O-1 Visa' },
  { value: 'eb1', label: 'EB-1 Visa' },
  { value: 'eb2', label: 'EB-2 Visa' },
  { value: 'eb3', label: 'EB-3 Visa' },
];

export default function LeadForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    linkedInProfile: '',
    visasOfInterest: [],
    resume: null,
    additionalInfo: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleVisaChange = (e) => {
    const { options } = e.target;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }
    setFormData(prev => ({ ...prev, visasOfInterest: selected }));
  };
  
  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, resume: e.target.files[0] }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      const formPayload = new FormData();
      
      // Add all form fields to FormData
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'visasOfInterest') {
          formPayload.append(key, JSON.stringify(value));
        } else if (key === 'resume') {
          if (value) formPayload.append(key, value);
        } else {
          formPayload.append(key, value);
        }
      });
      
      const response = await fetch('/api/leads', {
        method: 'POST',
        body: formPayload,
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit lead information');
      }
      
      // Redirect to thank you page or reset form
      router.push('/lead-form/thank-you');
      
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Submit Your Information</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="firstName" className="block mb-1 font-medium">
              First Name *
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label htmlFor="lastName" className="block mb-1 font-medium">
              Last Name *
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="email" className="block mb-1 font-medium">
            Email *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="linkedInProfile" className="block mb-1 font-medium">
            LinkedIn Profile *
          </label>
          <input
            id="linkedInProfile"
            name="linkedInProfile"
            type="url"
            required
            value={formData.linkedInProfile}
            onChange={handleChange}
            placeholder="https://linkedin.com/in/yourprofile"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="visasOfInterest" className="block mb-1 font-medium">
            Visas of Interest *
          </label>
          <select
            id="visasOfInterest"
            name="visasOfInterest"
            multiple
            required
            onChange={handleVisaChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            {visaOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-1">Hold Ctrl (or Cmd) to select multiple options</p>
        </div>
        
        <div className="mb-4">
          <label htmlFor="resume" className="block mb-1 font-medium">
            Resume/CV Upload *
          </label>
          <input
            id="resume"
            name="resume"
            type="file"
            required
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <p className="text-sm text-gray-500 mt-1">Accepted formats: PDF, DOC, DOCX</p>
        </div>
        
        <div className="mb-6">
          <label htmlFor="additionalInfo" className="block mb-1 font-medium">
            Additional Information
          </label>
          <textarea
            id="additionalInfo"
            name="additionalInfo"
            rows={4}
            value={formData.additionalInfo}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
} 