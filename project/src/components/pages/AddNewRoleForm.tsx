// AddNewRoleForm.tsx
import React, { useEffect, useState } from 'react';

interface AddNewRoleFormProps {
  roleTypes: { roleTypeId: number; roleTypeDescription: string }[];
  governances: { id: number | string; name: string }[];
  selectedGovernance: string;
  rolesForGovernance: any[];
  submitting?: boolean;
  mode?: 'create' | 'edit';
  initialValues?: {
    roleName: string;
    roleShortName: string;
    description: string;
    status: 'active' | 'inactive';
    roleTypeId: number | '';
    governanceId: number | '';
  };
  onSubmit: (data: {
    roleName: string;
    roleShortName: string;
    description: string;
    status: 'active' | 'inactive';
    roleTypeId: number;
    governanceId: number;
  }) => void;
  onCancel: () => void;
}

const AddNewRoleForm: React.FC<AddNewRoleFormProps> = ({
  roleTypes,
  governances,
  selectedGovernance,
  submitting = false,
  mode = 'create',
  initialValues,
  onSubmit,
  onCancel,
}) => {
  const [roleName, setRoleName] = useState('');
  const [roleShortName, setRoleShortName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [selectedRoleType, setSelectedRoleType] = useState<number | ''>('');
  const [selectedGovId, setSelectedGovId] = useState<number | ''>(
    selectedGovernance ? Number(selectedGovernance) : ''
  );

  useEffect(() => {
    if (initialValues) {
      setRoleName(initialValues.roleName ?? '');
      setRoleShortName(initialValues.roleShortName ?? '');
      setDescription(initialValues.description ?? '');
      setStatus(initialValues.status ?? 'active');
      setSelectedRoleType(initialValues.roleTypeId ?? '');
      setSelectedGovId(initialValues.governanceId ?? '');
    } else {
      setRoleName('');
      setRoleShortName('');
      setDescription('');
      setStatus('active');
      setSelectedRoleType('');
      setSelectedGovId(selectedGovernance ? Number(selectedGovernance) : '');
    }
  }, [initialValues, selectedGovernance]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName || !roleShortName || !selectedRoleType || !selectedGovId) return;

    onSubmit({
      roleName,
      roleShortName,
      description,
      status,
      roleTypeId: Number(selectedRoleType),
      governanceId: Number(selectedGovId),
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl mx-auto">
      <h3 className="text-xl font-semibold mb-4">
        {mode === 'edit' ? 'Edit Role' : 'Add New Role'}
      </h3>
      <form onSubmit={handleFormSubmit}>
        <div className="space-y-4">
          {/* Role Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Role Name</label>
            <input
              type="text"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2"
              required
            />
          </div>

          {/* Role Short Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Role Short Name</label>
            <input
              type="text"
              value={roleShortName}
              onChange={(e) => setRoleShortName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2"
              required
            />
          </div>

          {/* Governance (disabled in edit mode) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Governance</label>
            <select
              value={selectedGovId}
              onChange={(e) => setSelectedGovId(e.target.value ? Number(e.target.value) : '')}
              className="w-full border border-gray-300 rounded-lg p-2"
              required
              disabled={mode === 'edit'}
            >
              <option value="">Select Governance</option>
              {governances.map((gov) => (
                <option key={gov.id} value={gov.id}>
                  {gov.name}
                </option>
              ))}
            </select>
          </div>

          {/* Role Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Role Type</label>
            <select
              value={selectedRoleType}
              onChange={(e) => setSelectedRoleType(e.target.value ? Number(e.target.value) : '')}
              className="w-full border border-gray-300 rounded-lg p-2"
              required
            >
              <option value="">Select Role Type</option>
              {roleTypes.map((type) => (
                <option key={type.roleTypeId} value={type.roleTypeId}>
                  {type.roleTypeDescription}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2"
              rows={4}
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <div className="flex gap-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="status"
                  value="active"
                  checked={status === 'active'}
                  onChange={() => setStatus('active')}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="status"
                  value="inactive"
                  checked={status === 'inactive'}
                  onChange={() => setStatus('inactive')}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Inactive</span>
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-4">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg disabled:opacity-70"
              disabled={submitting}
            >
              {submitting ? (mode === 'edit' ? 'Updating…' : 'Submitting…') : mode === 'edit' ? 'Update' : 'Submit'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg"
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddNewRoleForm;