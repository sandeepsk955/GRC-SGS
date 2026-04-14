// project/src/components/auth/RoleSelection.tsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';

export const RoleSelection: React.FC = () => {
  const { roles, selectRole, userEmail, selectedDomain } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">Select Role</h2>

        <p className="text-gray-600 mb-6">
          {selectedDomain ? (
            <>
              Domain: <span className="font-medium">{selectedDomain.name}</span>
              <span className="mx-2 text-gray-400">•</span>
              User: <span className="font-medium">{userEmail}</span>
            </>
          ) : (
            <>Welcome, <span className="font-medium">{userEmail}</span></>
          )}
        </p>

        {roles.length === 0 ? (
          <p className="text-gray-500">No roles available for this domain.</p>
        ) : (
          <div className="grid gap-4">
            {roles.map((r) => (
              <button
                key={r.id}
                onClick={() => selectRole(r)}
                className="p-4 border rounded-lg shadow hover:bg-blue-50 text-left transition"
              >
                <h3 className="font-semibold text-lg">{r.name}</h3>
                {r.description ? (
                  <p className="text-sm text-gray-500 mt-1">{r.description}</p>
                ) : null}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
