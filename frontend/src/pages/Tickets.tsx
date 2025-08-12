import React, { useState, useEffect } from 'react';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon } from '@heroicons/react/24/outline';
import { ticketsApi } from '../services/api';
import CreateTicketModal from '../components/CreateTicketModal';
import EditTicketModal from '../components/EditTicketModal';
import { useAuthStore } from '../store/auth';
import toast from 'react-hot-toast';

interface Ticket {
  id: string;
  ticketNumber: string;
  title: string;
  description?: string;
  type: string;
  priority: string;
  status: string;
  impact?: string;
  urgency?: string;
  category?: string;
  subcategory?: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

const Tickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    priority: '',
    search: '',
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuthStore();

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page,
        limit: 20,
      };
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (!params[key as keyof typeof params]) {
          delete params[key as keyof typeof params];
        }
      });

      const response = await ticketsApi.getTickets(params);
      setTickets(response.data.tickets || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [filters, page]);

  const handleCreateTicket = () => {
    setShowCreateModal(true);
  };

  const handleTicketCreated = () => {
    setShowCreateModal(false);
    fetchTickets(); // Refresh the list
    toast.success('Ticket created successfully!');
  };

  const handleEditTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowEditModal(true);
  };

  const handleTicketUpdated = () => {
    setShowEditModal(false);
    setSelectedTicket(null);
    fetchTickets(); // Refresh the list
  };

  const canUserEditTicket = (ticket: Ticket) => {
    // User can edit if they created it and it's not assigned/accepted
    if (user && ticket.createdBy.id === user.id) {
      return (ticket.status === 'NEW' || ticket.status === 'OPEN') && !ticket.assignedTo;
    }
    // Support staff can always edit
    if (user && ['ADMIN', 'SUPPORT_L1', 'SUPPORT_L2', 'SUPPORT_L3'].includes(user.role)) {
      return true;
    }
    // Assigned user can edit
    if (user && ticket.assignedTo && ticket.assignedTo.id === user.id) {
      return true;
    }
    return false;
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
    setPage(1); // Reset to first page when filtering
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-blue-100 text-blue-800';
      case 'OPEN': return 'bg-indigo-100 text-indigo-800';
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800';
      case 'PENDING_USER': return 'bg-yellow-100 text-yellow-800';
      case 'PENDING_VENDOR': return 'bg-orange-100 text-orange-800';
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      case 'CLOSED': return 'bg-gray-100 text-gray-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
          <p className="text-gray-600">Manage support tickets and issues</p>
        </div>
        <button
          onClick={handleCreateTicket}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Create Ticket
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="NEW">New</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="PENDING_USER">Pending User</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">All Types</option>
              <option value="INCIDENT">Incident</option>
              <option value="SERVICE_REQUEST">Service Request</option>
              <option value="PROBLEM">Problem</option>
              <option value="CHANGE">Change</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            {loading ? 'Loading...' : `${tickets.length} Tickets`}
          </h2>
        </div>
        
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No tickets found</p>
            <button
              onClick={handleCreateTicket}
              className="mt-2 text-indigo-600 hover:text-indigo-500"
            >
              Create your first ticket
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {ticket.ticketNumber}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-gray-900 font-medium mb-1">{ticket.title}</p>
                    {ticket.description && (
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        {ticket.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Type: {ticket.type.replace('_', ' ')}</span>
                      <span>Created by: {ticket.createdBy.firstName} {ticket.createdBy.lastName}</span>
                      {ticket.assignedTo && (
                        <span>Assigned to: {ticket.assignedTo.firstName} {ticket.assignedTo.lastName}</span>
                      )}
                      <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 ml-4">
                    {canUserEditTicket(ticket) && (
                      <button
                        onClick={() => handleEditTicket(ticket)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit ticket"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
            <button
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <CreateTicketModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleTicketCreated}
        />
      )}

      {/* Edit Ticket Modal */}
      {showEditModal && selectedTicket && (
        <EditTicketModal
          ticket={selectedTicket}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleTicketUpdated}
        />
      )}
    </div>
  );
};

export default Tickets;
