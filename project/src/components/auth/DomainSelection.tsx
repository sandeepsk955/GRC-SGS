import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export const DomainSelection: React.FC = () => {
  const { domains, fetchDomains, selectDomain, userEmail } = useAuth();

  useEffect(() => {
  const customerId = Number(sessionStorage.getItem("customerId"));
  const userId = Number(sessionStorage.getItem("userid"));
  
  // Log the sessionStorage values for debugging
  console.log("customerId:", customerId, "userId:", userId);

  if (customerId && userId) {
    fetchDomains(customerId, userId);
  } else {
    console.error("customerId or userId is missing.");
  }
}, [fetchDomains]);


  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">Select Governance Domain</h2>
        <p className="text-gray-600 mb-6">Welcome, <span className="font-medium">{userEmail}</span></p>

        {domains.length === 0 ? (
          <p className="text-gray-500">No governance domains available.</p>
        ) : (
          <div className="grid gap-4">
            {domains.map((domain) => (
              <button
                key={domain.id}
                onClick={() => {
                  // Persist selected governance (GovId) for Configuration page
                  sessionStorage.setItem('govId', String(domain.id));
                  selectDomain(domain);
                }}
                className="p-4 border rounded-lg shadow hover:bg-blue-50 text-left"
              >
                <h3 className="font-semibold text-lg">{domain.name}</h3>
                <p className="text-sm text-gray-500">{domain.description}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
