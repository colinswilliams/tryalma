'use client';

import { useState } from 'react';
import { Button } from '@mui/material';

interface StatusUpdateButtonProps {
  leadId: string;
  currentStatus?: 'PENDING' | 'REACHED_OUT';
}

export default function StatusUpdateButton({ leadId, currentStatus = 'PENDING' }: StatusUpdateButtonProps) {
  const [status, setStatus] = useState(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const updateLeadStatus = async () => {
    const newStatus = status === 'PENDING' ? 'REACHED_OUT' : 'PENDING';
    setIsUpdating(true);
    
    try {
      const response = await fetch(`/api/leads/${leadId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      
      // Update local state on success
      setStatus(newStatus);
      
    } catch (error) {
      console.error('Error updating lead status:', error);
      alert('Failed to update lead status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Only show for pending leads
  if (status !== 'PENDING') {
    return null;
  }
  
  return (
    <Button 
      variant="outlined"
      fullWidth
      className="mb-2 normal-case"
      disabled={isUpdating}
      onClick={updateLeadStatus}
    >
      {isUpdating ? 'Updating...' : 'Mark as Reached Out'}
    </Button>
  );
} 