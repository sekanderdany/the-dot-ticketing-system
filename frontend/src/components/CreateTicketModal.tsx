import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ticketsApi, projectsApi } from '../services/api';
import { useAuthStore } from '../store/auth';
import toast from 'react-hot-toast';

interface CreateTicketModalProps {
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
  projectId: string;
}

interface Project {
  id: string;
  name: string;
  status: string;
}

const CreateTicketModal: React.FC<CreateTicketModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState<TicketFormData>({
    title: '',
    description: '',
    type: 'INCIDENT',
    priority: 'MEDIUM',
    impact: 'LOW',
    urgency: 'LOW',
    category: '',
    subcategory: '',
    projectId: '',
  });
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const { user } = useAuthStore();

  // Fetch projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await projectsApi.getProjects();
        setProjects(response.data || []);
      } catch (error) {
        console.error('Error fetching projects:', error);
        // Don't show error toast here as it's not critical
      }
    };

    fetchProjects();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (!formData.projectId) {
      toast.error('Please select a project');
      return;
    }

    try {
      setLoading(true);
      
      const ticketData = {
        ...formData,
        source: 'WEB'
      };

      await ticketsApi.createTicket(ticketData);
      onSuccess();
    } catch (error: any) {
      console.error('Failed to create ticket:', error);
      toast.error(error.response?.data?.message || 'Failed to create ticket');
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create New Ticket</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Brief description of the issue"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Detailed description of the issue, including steps to reproduce"
              rows={4}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {/* Type and Priority Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                id="type"
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
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                id="priority"
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
              <label htmlFor="impact" className="block text-sm font-medium text-gray-700 mb-1">
                Impact
              </label>
              <select
                id="impact"
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
              <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-1">
                Urgency
              </label>
              <select
                id="urgency"
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

          {/* Project Selection */}
          <div>
            <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-1">
              Project *
            </label>
            <select
              id="projectId"
              value={formData.projectId}
              onChange={(e) => handleInputChange('projectId', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              <option value="">Select a project...</option>
              {projects
                .filter(project => project.status === 'ACTIVE' || project.status === 'PLANNING')
                .map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
            </select>
            {projects.length === 0 && (
              <p className="mt-1 text-sm text-red-600">
                No active projects found. Please create a project first.
              </p>
            )}
          </div>

          {/* Category and Subcategory Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
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
              <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 mb-1">
                Subcategory
              </label>
              <select
                id="subcategory"
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

          {/* User Info Display */}
          {user && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Ticket will be created by:</h3>
              <p className="text-sm text-gray-600">
                {user.firstName} {user.lastName} ({user.email}) - {user.role}
              </p>
            </div>
          )}

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
              {loading ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicketModal;
