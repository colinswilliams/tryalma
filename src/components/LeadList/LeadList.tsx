'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState
} from '@tanstack/react-table';
import { Box } from '@mui/material';

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  website: string;
  message: string;
  visaCategoryO1: boolean;
  visaCategoryEB1A: boolean;
  visaCategoryEB2NIW: boolean;
  visaCategoryUnknown: boolean;
  files: any; // it's a string, for now, but this is would be improved
  createdAt: string;
  status?: 'PENDING' | 'REACHED_OUT';
}

const columnHelper = createColumnHelper<Lead>();

export default function LeadList() {
  const session = useSession();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [updatingLeadId, setUpdatingLeadId] = useState<string | null>(null);
  
  const updateLeadStatus = async (leadId: string, newStatus: 'PENDING' | 'REACHED_OUT') => {
    setUpdatingLeadId(leadId);
    try {
			// not the best, this optimistically updates the status, but ideally this should refetch the page
			setLeads(prevLeads => 
				prevLeads.map(lead => 
					lead.id === leadId ? { ...lead, status: newStatus } : lead
				)
			);
			
      const response = await fetch(`/api/leads/${leadId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update status');
      }

    } catch (err) {
      // Revert change on error
      setLeads(prevLeads => 
        prevLeads.map(lead => 
          lead.id === leadId ? { ...lead, status: lead.status === 'PENDING' ? 'REACHED_OUT' : 'PENDING' } : lead
        )
      );
      console.error('Error updating status:', err);
      alert('Failed to update status. Please try again.');
    } finally {
      setUpdatingLeadId(null);
    }
  };
  
  const columns = useMemo(() => [
    columnHelper.accessor(row => `${row.firstName} ${row.lastName}`, {
      id: 'fullName',
      header: 'Name',
      cell: info => info.getValue(),
    }),
		columnHelper.accessor('createdAt', {
      header: 'Submitted',
      cell: info => {
        const date = new Date(info.getValue());
        return date.toLocaleString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      },
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => {
        const leadId = info.row.original.id;
        const currentStatus = info.getValue() || 'PENDING';
        const isUpdating = updatingLeadId === leadId;
        
        return (
          <Box className="flex items-center">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              currentStatus === 'REACHED_OUT' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {currentStatus === 'REACHED_OUT' ? 'Reached Out' : 'Pending'}
            </span>
          </Box>
        );
      }
    }),
    columnHelper.accessor('email', {
      header: 'Email',
      cell: info => (
        <a href={`mailto:${info.getValue()}`} className="text-blue-600 hover:underline">
          {info.getValue()}
        </a>
      ),
    }),
    columnHelper.accessor('country', {
      header: 'Country',
    }),
    columnHelper.accessor('website', {
      header: 'Website',
      cell: info => {
        const website = info.getValue();
        return website ? (
          <a href={website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            {website.replace(/^https?:\/\//, '')}
          </a>
        ) : '-';
      },
    }),
    columnHelper.accessor('message', {
      header: 'Message',
      cell: info => (
        <Box className="max-w-xs truncate" title={info.getValue()}>
          {info.getValue()}
        </Box>
      ),
    }),
    columnHelper.accessor(row => {
      const categories = [];
      if (row.visaCategoryO1) categories.push('O-1');
      if (row.visaCategoryEB1A) categories.push('EB-1A');
      if (row.visaCategoryEB2NIW) categories.push('EB-2 NIW');
      if (row.visaCategoryUnknown) categories.push('Unknown');
      return categories.join(', ');
    }, {
      id: 'visaCategories',
      header: 'Visa Categories',
    }),
    columnHelper.accessor('files', {
      header: 'Files',
      cell: info => {
        const files = info.getValue();
        if (!files || files.length === 0) return '-';
        
        // Extract files from message if they're stored as string
        const fileData = typeof files === 'string' ? 
          (() => {
            try {
              const fileMatch = files.match(/Files: (\[.*?\])/);
              return fileMatch ? JSON.parse(fileMatch[1]) : [];
            } catch (e) {
              return [];
            }
          })() : files;
          
        return Array.isArray(fileData) ? (
          <Box className="space-y-1">
            {fileData.map((file: any, index: number) => (
              <a 
                key={index}
                href={file.path}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-blue-600 hover:underline"
              >
                {file.name || `File ${index + 1}`}
              </a>
            ))}
          </Box>
        ) : '-';
      }
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: info => (
        <Box className="flex space-x-2">
          <Link 
            href={`/dashboard/leads/${info.row.original.id}`}
            className="px-2 py-1 bg-blue-600 text-white rounded text-xs"
          >
            View
          </Link>
        </Box>
      ),
    }),
  ], [updatingLeadId]);
  
  useEffect(() => {
    if (session.status === 'unauthenticated') {
      redirect('/login');
    }
    
    async function fetchLeads() {
      try {
        const response = await fetch('/api/leads');
        
        if (!response.ok) {
          throw new Error('Failed to fetch leads');
        }
        
        const { data } = await response.json();
        
        // Set default status for all leads if not present
        const leadsWithStatus = data.map((lead: Lead) => ({
          ...lead,
          status: lead.status || 'PENDING'
        }));
        
        setLeads(leadsWithStatus);
      } catch (err) {
        setError((err as Error).message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    }
    
    fetchLeads();
  }, [session.status]);
  
  const table = useReactTable({
    data: leads,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
  
  if (loading) {
    return (
      <Box className="text-center p-6">
        <Box className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" />
        <p className="mt-2">Loading leads...</p>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box className="bg-red-50 p-4 rounded-md text-red-700">
        Error: {error}
      </Box>
    );
  }
  
  if (leads.length === 0) {
    return (
      <Box className="text-center p-6 bg-gray-50 rounded-md">
        <p className="text-gray-500">No leads found</p>
      </Box>
    );
  }
  
  return (
    <Box className="w-full px-4 py-4 container">
      <Box className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th 
                    key={header.id}
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <Box className="flex items-center">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      <span>
                        {{
                          asc: ' 🔼',
                          desc: ' 🔽',
                        }[header.column.getIsSorted() as string] ?? null}
                      </span>
                    </Box>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map(cell => (
                  <td 
                    key={cell.id}
                    className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
      
      {/* Pagination */}
      <Box className="flex items-center justify-between mt-4">
        <Box className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </Box>
        <Box className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <Box>
            <p className="text-sm text-gray-700">
              Showing{' '}
              <span className="font-medium">{table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}</span>
              {' '}to{' '}
              <span className="font-medium">
                {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, leads.length)}
              </span>
              {' '}of{' '}
              <span className="font-medium">{leads.length}</span> results
            </p>
          </Box>
          <Box>
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              First
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="relative inline-flex items-center px-2 py-2 border-t border-b border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              Prev
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="relative inline-flex items-center px-2 py-2 border-t border-b border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
            <button
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              Last
            </button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
} 