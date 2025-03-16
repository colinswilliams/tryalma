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
import { Box, Popover, Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import { KeyboardArrowDown, ArrowUpward, ArrowDownward, Search as SearchIcon } from '@mui/icons-material';

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
  const [searchQuery, setSearchQuery] = useState<string>('');
    
  // Add state for status filter
  const [statusFilter, setStatusFilter] = useState<{
    PENDING: boolean;
    REACHED_OUT: boolean;
  }>({
    PENDING: true,
    REACHED_OUT: true
  });
  
  // Popover state
  const [statusAnchorEl, setStatusAnchorEl] = useState<HTMLButtonElement | null>(null);
  const isStatusPopoverOpen = Boolean(statusAnchorEl);
  
  // Open/close handlers for popover
  const handleStatusClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setStatusAnchorEl(event.currentTarget);
  };
  
  const handleStatusClose = () => {
    setStatusAnchorEl(null);
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
        const currentStatus = info.getValue() || 'PENDING';
        
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
    columnHelper.accessor('country', {
      header: 'Country',
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
  ], []);
  
  // Update the filter logic to include status filter
  const filteredData = useMemo(() => {
    let filtered = leads;
    
    // Apply status filter
    filtered = filtered.filter((lead) => {
      const status = lead.status || 'PENDING';
      return statusFilter[status];
    });
    
    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(lead => {
        const searchableValues = [
          lead.firstName,
          lead.lastName,
          lead.email,
          lead.country,
          lead.message,
          lead.visaCategoryO1 ? 'O-1' : '',
          lead.visaCategoryEB1A ? 'EB-1A' : '',
          lead.visaCategoryEB2NIW ? 'EB-2 NIW' : '',
          lead.visaCategoryUnknown ? 'Unknown' : '',
          lead.status || 'PENDING'
        ].join(' ').toLowerCase();
        
        return searchableValues.includes(searchQuery.toLowerCase());
      });
    }
    
    return filtered;
  }, [leads, searchQuery, statusFilter]);
  
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
    data: filteredData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
  
  // Reset pagination when filters change
  useEffect(() => {
    table?.setPageIndex(0);
  }, [searchQuery, statusFilter, table]);
  
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
      <Box className="mb-4 gap-4 flex">
				<Box className="relative">
					<SearchIcon className="user-select-none pointer-events-none absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" fontSize="small" />
					<input
						type="text"
						placeholder="Search"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-[20rem] focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</Box>
				<button 
					className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 normal-case text-sm flex items-center gap-2"
					onClick={handleStatusClick}
				>
					Status <KeyboardArrowDown fontSize="small" className="flex items-center" />
				</button>
				
				{/* Status Filter Popover */}
				<Popover
					open={isStatusPopoverOpen}
					anchorEl={statusAnchorEl}
					onClose={handleStatusClose}
					anchorOrigin={{
						vertical: 'bottom',
						horizontal: 'left',
					}}
					transformOrigin={{
						vertical: 'top',
						horizontal: 'left',
					}}
				>
					<Box className="p-4">
						<FormGroup>
							<FormControlLabel
								control={
									<Checkbox
										checked={statusFilter.PENDING}
										onChange={(e) => setStatusFilter({
											...statusFilter,
											PENDING: e.target.checked
										})}
									/>
								}
								label="Pending"
							/>
							<FormControlLabel
								control={
									<Checkbox
										checked={statusFilter.REACHED_OUT}
										onChange={(e) => setStatusFilter({
											...statusFilter,
											REACHED_OUT: e.target.checked
										})}
									/>
								}
								label="Reached Out"
							/>
						</FormGroup>
					</Box>
				</Popover>
      </Box>
      
      <Box className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300 rounded-md overflow-hidden">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th 
                    key={header.id}
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <Box className="flex items-center gap-2">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      <span>
                        {{
                          asc: <ArrowUpward fontSize="small" className="flex items-center" />,
                          desc: <ArrowDownward fontSize="small" className="flex items-center" />,
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
                {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, filteredData.length)}
              </span>
              {' '}of{' '}
              <span className="font-medium">{filteredData.length}</span> results
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