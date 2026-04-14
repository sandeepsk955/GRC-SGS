// AddNewUserForm.tsx
import React, { useEffect, useState } from 'react';

type RoleOption = { sysRoleId: number; roleFName: string };
type Governance = { id: number | string; name: string };

interface AddNewUserFormProps {
  roles: RoleOption[];
  governances: Governance[];
  submitting?: boolean;
  mode?: 'create' | 'edit';
  initialValues?: {
    name: string;
    email: string;
    status: 'active' | 'inactive';
    roleIds: number[];        // will map to cliRoleId
    governanceId: number | ''; // will map to govId
  };
  onSubmit: (data: {
    name: string;
    email: string;
    status: 'active' | 'inactive';
    roleIds: number[];
    governanceId: number;
  }) => void;
  onCancel: () => void;
}

const AddNewUserForm: React.FC<AddNewUserFormProps> = ({
  roles,
  governances,
  submitting = false,
  mode = 'create',
  initialValues,
  onSubmit,
  onCancel,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [selectedGovId, setSelectedGovId] = useState<number | ''>('');

  useEffect(() => {
    if (initialValues) {
      setName(initialValues.name ?? '');
      setEmail(initialValues.email ?? '');
      setStatus(initialValues.status ?? 'active');
      setSelectedRoles(Array.isArray(initialValues.roleIds) ? initialValues.roleIds : []);
      setSelectedGovId((initialValues.governanceId as any) ?? '');
    } else {
      setName('');
      setEmail('');
      setStatus('active');
      setSelectedRoles([]);
      setSelectedGovId('');
    }
  }, [initialValues]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !selectedGovId) return;
    onSubmit({
      name,
      email,
      status,
      roleIds: selectedRoles,
      governanceId: Number(selectedGovId),
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl mx-auto">
      <h3 className="text-xl font-semibold mb-4">
        {mode === 'edit' ? 'Edit User' : 'Add New User'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2"
            required
          />
        </div>

        {/* Governance */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Governance</label>
          <select
            value={selectedGovId}
            onChange={(e) => setSelectedGovId(e.target.value ? Number(e.target.value) : '')}
            className="w-full border border-gray-300 rounded-lg p-2"
            required
          >
            <option value="">Select Governance</option>
            {governances.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>

        {/* Roles multi-select -> cliRoleId[] */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Roles</label>
          <select
            multiple
            value={selectedRoles.map(String)}
            onChange={(e) => {
              const values = Array.from(e.target.selectedOptions).map(o => Number(o.value));
              setSelectedRoles(values);
            }}
            className="w-full border border-gray-300 rounded-lg p-2 h-32"
          >
            {roles.map(r => (
              <option key={r.sysRoleId} value={r.sysRoleId}>
                {r.roleFName}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple.</p>
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
      </form>
    </div>
  );
};

export default AddNewUserForm;
