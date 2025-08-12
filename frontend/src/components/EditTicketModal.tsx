import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ticketsApi } from '../services/api';
import { useAuthStore } from '../store/auth';
import toast from 'react-hot-toast';

interface EditTicketModalProps {
  ticket: any;
  onClose: () => void;
  onSuccess: () => void;
}

interface TicketFormData {
  title: string;
  description: string;
  type: 'INCIDENT' | 'SERVICE_REQUEST' | 'PROBLEM' | 'CHANGE';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  impact: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  subcategory: string;
}

const EditTicketModal: React.FC<EditTicketModalProps> = ({ ticket, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<TicketFormData>({
    title: '',
    description: '',
    type: 'INCIDENT',
    priority: 'MEDIUM',
    impact: 'LOW',
    urgency: 'LOW',
    category: '',
    subcategory: '',
  });
  const [loading, setLoading] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [checkingPermissions, setCheckingPermissions] = useState(true);
  const { user } = useAuthStore();

  const categories = [
    'Hardware',
    'Software',
    'Network',
    'Email',
    'Printer',
    'Access & Permissions',
    'Phone System',
    'Database',
    'Web Application',
    'Mobile App',
    'Security',
    'Other'
  ];

  const getSubcategories = (category: string) => {
    const subcategoryMap: Record<string, string[]> = {
      'Hardware': ['Desktop', 'Laptop', 'Monitor', 'Keyboard', 'Mouse', 'Peripherals'],
      'Software': ['Application Install', 'Application Error', 'License', 'Update'],
      'Network': ['Connection', 'WiFi', 'VPN', 'Speed', 'Firewall'],
      'Email': ['Cannot Send', 'Cannot Receive', 'Attachment Issues', 'Spam'],
      'Printer': ['Cannot Print', 'Print Quality', 'Paper Jam', 'Driver'],
      'Access & Permissions': ['Password Reset', 'Account Locked', 'New User', 'Role Change'],
      'Phone System': ['Cannot Make Calls', 'Cannot Receive Calls', 'Voicemail', 'Conference'],
      'Database': ['Performance', 'Connection', 'Data Issue', 'Backup'],
      'Web Application': ['Cannot Login', 'Page Error', 'Feature Not Working', 'Performance'],
      'Mobile App': ['App Crash', 'Cannot Login', 'Sync Issues', 'Update'],
      'Security': ['Virus/Malware', 'Suspicious Activity', 'Data Breach', 'Policy Violation'],
      'Other': ['General', 'Consultation', 'Training', 'Documentation']
    };
    return subcategoryMap[category] || [];
  };

  useEffect(() => {
    // Initialize form data with ticket values
    if (ticket) {
      setFormData({
        title: ticket.title || '',
        description: ticket.description || '',
        type: ticket.type || 'INCIDENT',
        priority: ticket.priority || 'MEDIUM',
        impact: ticket.impact || 'LOW',
        urgency: ticket.urgency || 'LOW',
        category: ticket.category || '',
        subcategory: ticket.subcategory || '',
      });
    }

    // Check if user can edit this ticket
    checkEditPermissions();
  }, [ticket]);

  const checkEditPermissions = async () => {
    try {
      setCheckingPermissions(true);
      const response = await ticketsApi.canEdit(ticket.id);
      setCanEdit(response.data.canEdit);
    } catch (error) {
      console.error('Failed to check edit permissions:', error);
      setCanEdit(false);
      toast.error('Unable to verify edit permissions');
    } finally {
      setCheckingPermissions(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (!canEdit) {
      toast.error('You do not have permission to edit this ticket');
      return;
    }

    try {
      setLoading(true);
      
      await ticketsApi.updateTicket(ticket.id, formData);
      toast.success('Ticket updated successfully!');
      onSuccess();
    } catch (error: any) {
      console.error('Failed to update ticket:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update ticket';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof TicketFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      // Reset subcategory when category changes
      ...(field === 'category' ? { subcategory: '' } : {})
    }));
  };

  const getEditabilityMessage = () => {
    if (ticket.assignedToId) {
      return 'This ticket has been assigned and can only be edited by support staff or the assigned person.';
    }
    if (ticket.status === 'IN_PROGRESS') {
      return 'This ticket is in progress and can only be edited by support staff.';
    }
    if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') {
      return 'This ticket has been resolved or closed and cannot be edited.';
    }
    return 'You can edit this ticket since it has not been accepted yet.';
  };

  if (checkingPermissions) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Checking permissions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Edit Ticket {ticket.ticketNumber}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {!canEdit ? (
          <div className="p-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Cannot Edit Ticket
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>{getEditabilityMessage()}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Status Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    {getEditabilityMessage()}
                  </p>
                </div>
              </div>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="edit-title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Brief description of the issue"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Detailed description of the issue"
                rows={4}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            {/* Type and Priority Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-type" className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  id="edit-type"
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value as TicketFormData['type'])}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="INCIDENT">Incident - Something is broken</option>
                  <option value="SERVICE_REQUEST">Service Request - Request for service</option>
                  <option value="PROBLEM">Problem - Root cause investigation</option>
                  <option value="CHANGE">Change - Change management</option>
                </select>
              </div>

              <div>
                <label htmlFor="edit-priority" className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  id="edit-priority"
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value as TicketFormData['priority'])}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
            </div>

            {/* Impact and Urgency Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-impact" className="block text-sm font-medium text-gray-700 mb-1">
                  Impact
                </label>
                <select
                  id="edit-impact"
                  value={formData.impact}
                  onChange={(e) => handleInputChange('impact', e.target.value as TicketFormData['impact'])}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="LOW">Low - Minimal impact</option>
                  <option value="MEDIUM">Medium - Single user/system moderately affected</option>
                  <option value="HIGH">High - Single user/system significantly affected</option>
                  <option value="CRITICAL">Critical - Multiple users/systems affected</option>
                </select>
              </div>

              <div>
                <label htmlFor="edit-urgency" className="block text-sm font-medium text-gray-700 mb-1">
                  Urgency
                </label>
                <select
                  id="edit-urgency"
                  value={formData.urgency}
                  onChange={(e) => handleInputChange('urgency', e.target.value as TicketFormData['urgency'])}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="LOW">Low - Can wait</option>
                  <option value="MEDIUM">Medium - Attention required within day</option>
                  <option value="HIGH">High - Attention required within hours</option>
                  <option value="CRITICAL">Critical - Immediate attention required</option>
                </select>
              </div>
            </div>

            {/* Category and Subcategory Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="edit-category"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="edit-subcategory" className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategory
                </label>
                <select
                  id="edit-subcategory"
                  value={formData.subcategory}
                  onChange={(e) => handleInputChange('subcategory', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  disabled={!formData.category}
                >
                  <option value="">Select a subcategory</option>
                  {getSubcategories(formData.category).map(subcategory => (
                    <option key={subcategory} value={subcategory}>{subcategory}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Ticket'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditTicketModal;
