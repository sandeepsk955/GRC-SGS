import React, { useState } from 'react';
import { 
  File, FileText, Download, Upload, Search, Filter, Eye, Edit, Trash2, 
  X, Calendar, User, FileUp 
} from 'lucide-react';

export const Documents: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Form state – all requested fields
  const [formData, setFormData] = useState({
    name: '',
    policyDate: '',
    reviewer: '',
    version: '',
    approver: '',
    approvalDate: '',
    clarification: '',
    standard: '',
    file: null as File | null,
  });

  const documents = [
    // Your original dummy data remains unchanged
    {
      id: '1',
      name: 'Information Security Policy v3.0',
      type: 'Policy',
      category: 'Security',
      size: '2.4 MB',
      lastModified: '2024-01-15',
      modifiedBy: 'John Smith',
      status: 'approved',
      downloadCount: 45
    },
    // ... rest of your documents array ...
  ];

  const categories = ['all', 'Security', 'Risk Management', 'Compliance', 'BCMS', 'Audit'];

  const standards = [
    'ISO 27001',
    
    'ISO 22301',
    
    
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'review': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFileIcon = (type: string) => {
    // your existing icon logic
    switch (type) {
      case 'Policy': return <FileText className="w-5 h-5 text-blue-600" />;
      case 'Template': return <File className="w-5 h-5 text-green-600" />;
      case 'Guide': return <FileText className="w-5 h-5 text-purple-600" />;
      case 'Plan': return <FileText className="w-5 h-5 text-orange-600" />;
      case 'Checklist': return <FileText className="w-5 h-5 text-red-600" />;
      default: return <File className="w-5 h-5 text-gray-600" />;
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFormData(prev => ({ ...prev, file: e.target.files![0] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting document:', formData);
    // → In real app: send to API, refresh list, show success message
    setFormData({
      name: '', policyDate: '', reviewer: '', version: '', approver: '',
      approvalDate: '', clarification: '', standard: '', file: null
    });
    setIsUploadModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header + Upload Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Documents</h2>
          <p className="text-gray-600">Manage and access your compliance documents and resources</p>
        </div>
        <button 
          onClick={() => setIsUploadModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload Document
        </button>
      </div>

      {/* Search + Filter – unchanged */}

      {/* Stats cards – unchanged */}

      {/* Document Library Table – unchanged */}

      {/* ──────────────────────────────────────────────── */}
      {/*               WIDER UPLOAD MODAL                 */}
      {/* ──────────────────────────────────────────────── */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-xl font-semibold text-gray-900">Upload New Document</h3>
              <button 
                onClick={() => setIsUploadModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              {/* 1. Name of the document */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Name of the Document <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="e.g. Information Security Policy v3.1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 2. Date of policies */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Date of Policy
                  </label>
                  <input
                    type="date"
                    name="policyDate"
                    value={formData.policyDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                {/* 3. Document version */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Document Version <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="version"
                    value={formData.version}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="v1.0 / 2025.03 / Rev. 2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 4. Reviewer */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Reviewer
                  </label>
                  <input
                    type="text"
                    name="reviewer"
                    value={formData.reviewer}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="John Doe"
                  />
                </div>

                {/* 5. Approver */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Approver
                  </label>
                  <input
                    type="text"
                    name="approver"
                    value={formData.approver}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Jane Smith"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 6. Approval date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Approval Date
                  </label>
                  <input
                    type="date"
                    name="approvalDate"
                    value={formData.approvalDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                {/* 7. Standard */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Standard / Framework
                  </label>
                  <select
                    name="standard"
                    value={formData.standard}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                  >
                    <option value="">Select standard...</option>
                    {standards.map(std => (
                      <option key={std} value={std}>{std}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 8. Clarification */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Clarification / Notes / Comments
                </label>
                <textarea
                  name="clarification"
                  value={formData.clarification}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
                  placeholder="Scope, applicability, exceptions, additional context..."
                />
              </div>

              {/* 9. File upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Document File <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 flex justify-center px-6 pt-8 pb-10 border-2 border-gray-300 border-dashed rounded-xl bg-gray-50 hover:bg-gray-100 transition">
                  <div className="space-y-2 text-center">
                    <FileUp className="mx-auto h-10 w-10 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                        <span>Upload a file</span>
                        <input
                          type="file"
                          name="file"
                          onChange={handleFileChange}
                          required
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PDF, DOCX, XLSX, PPTX up to 15MB
                    </p>
                    {formData.file && (
                      <p className="mt-3 text-sm font-medium text-green-700">
                        Selected: {formData.file.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 transition shadow-sm"
                >
                  <Upload className="w-4 h-4" />
                  Upload Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};