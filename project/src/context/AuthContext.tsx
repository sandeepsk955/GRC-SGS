// import React, { createContext, useContext, useState, ReactNode } from 'react';
// import { GovernanceDomain } from '../types';
// import { loginService } from '../services/loginService';

// interface AuthContextType {
//   isAuthenticated: boolean;
//   currentStep: 'login' | 'mfa' | 'domain-selection' | 'role-selection' | 'dashboard';
//   selectedDomain: GovernanceDomain | null;
//   selectedRole: UserRole | null;
//   userEmail: string;
//   login: (email: string, password: string, scid: string) => Promise<boolean>;
//   verifyMFA: (code: string) => Promise<boolean>;
//   selectRole: (role: UserRole) => void;
//   selectDomain: (domain: GovernanceDomain) => Promise<void>;
//   logout: () => void;
//   isClientAdmin: boolean;
//   isSystemAdmin: boolean;
//   domains: GovernanceDomain[];
//   roles: UserRole[];
//   fetchDomains: (customerId: number, userId: number) => Promise<void>;
//   fetchRoles: (govId: number, customerId: number,userId: number) => Promise<void>;
// }

// interface UserRole {
//   id: number;
//   name: string;
//   description: string;
//   icon: string;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [currentStep, setCurrentStep] = useState<'login' | 'mfa' | 'domain-selection' | 'role-selection' | 'dashboard'>('login');
//   const [selectedDomain, setSelectedDomain] = useState<GovernanceDomain | null>(null);
//   const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
//   const [userEmail, setUserEmail] = useState('');
//   const [isClientAdmin, setIsClientAdmin] = useState(false);
//   const [isSystemAdmin, setIsSystemAdmin] = useState(false);
//   const [domains, setDomains] = useState<GovernanceDomain[]>([]);
//   const [roles, setRoles] = useState<UserRole[]>([]);




//   const login = async (email: string, password: string, scid: string): Promise<boolean> => {
//   try {
//     const res = await loginService.addLogin(email, password, scid);
//     const data = res.data;

//     console.log("Login response data:", data); // Debug log

//     if (data?.userid) {
//       setUserEmail(email);
//       sessionStorage.setItem('userDetails', JSON.stringify(data));
//       sessionStorage.setItem('userid', data.userid);
//       sessionStorage.setItem('scid', scid);

//       // Log and check if customerId exists in the response
//       console.log("Customer ID from response:", data.customerId);

//       // Store customerId if it exists
//       if (data.customerId) {
//         sessionStorage.setItem('customerId', data.customerId);
//       } else {
//         console.error("customerId not found in the response");
//       }

//       setCurrentStep('mfa');
//       return true;
//     }

//     return false;
//   } catch (err) {
//     console.error('Login error:', err);
//     return false;
//   }
// };


//   // 🔹 Verify MFA
//   const verifyMFA = async (code: string): Promise<boolean> => {
//     try {
//       const userid = Number(sessionStorage.getItem('userid'));
//       const scid = sessionStorage.getItem('scid');

//       if (!scid) {
//         console.error("Missing scid in sessionStorage");
//         return false;
//       }

//       const res = await loginService.addMfa(userid, code, scid);
//       const data = res.data;

//       if (data?.statusCode === 100) {
//         sessionStorage.setItem('userDetails', JSON.stringify(data));
//         sessionStorage.setItem('authToken', data.authenticationToken);
//         sessionStorage.setItem("customerId", data.customerId || ''); // Ensure customerId is stored

//         setIsClientAdmin(data.isClientAdmin);
//         setIsSystemAdmin(data.isSystemAdmin);


//         // After MFA → Governance Domain selection
//         setCurrentStep('domain-selection');
//         return true;
//       }
//       return false;
//     } catch (err) {
//       console.error('MFA error:', err);
//       return false;
//     }
//   };


// const fetchDomains = async (customerId: number, userId: number) => {
//   try {
//     const res = await loginService.getGovernance(customerId, userId);  // API call
//     console.log("Governance domains response:", res);  // Log the full response to debug

//     if (res.data && Array.isArray(res.data)) {
//       // Map the response data to the domain format
//       const mapped = res.data.map((domain: any) => ({
//         id: domain.domainId,           // Ensure the API field is correct
//         name: domain.govDomainName,    // Map governance name correctly
//         description: domain.description || "No description",  // Default description
//         icon: "Shield",  // Default icon, can be updated based on the domain type
//         userId: domain.userId || 0, // Ensure userId is included
//       }));

//       setDomains(mapped);  // Update the state with the domains
//     } else {
//       console.error("Invalid response format:", res.data);
//       setDomains([]);  // Clear domains if response format is invalid
//     }
//   } catch (err) {
//     console.error("Error fetching governance domains:", err);
//     setDomains([]);  // Handle error and clear domains if necessary
//   }
// };



//   // 🔹 Fetch Roles by Governance

// const selectDomain = async (domain: GovernanceDomain) => {
//   setSelectedDomain(domain);
//   const customerId = Number(sessionStorage.getItem("customerId"));
//   const userId = Number(sessionStorage.getItem("userid"));
//   const govId = Number(domain.id); // domainId == GovId

//   console.log("selectDomain ->", { govId, customerId, userId });

//   await fetchRoles(govId, customerId, userId);
//   setCurrentStep("role-selection");
// };



// const fetchRoles = async (govId: number, customerId: number, userId: number) => {
//   try {
//     const res = await loginService.getGovernanceRoles(govId, customerId, userId);
//     console.log("Roles raw response:", res.data);

//     const mappedRoles: UserRole[] = res.data.map((r: any) => ({
//       id: r.roleId,             // use API’s field
//       name: r.roleName,
//       description: `Type: ${r.roleType}`,
//       icon: "Users",
//     }));

//     setRoles(mappedRoles);
//   } catch (err) {
//     console.error("Error fetching roles:", err);
//     setRoles([]);
//   }
// };



//   // 🔹 Select Role
//   const selectRole = (role: UserRole) => {
//     setSelectedRole(role);
//     setCurrentStep('dashboard');
//     setIsAuthenticated(true);
//   };

//   // 🔹 Logout
//   const logout = () => {
//     setIsAuthenticated(false);
//     setCurrentStep('login');
//     setSelectedDomain(null);
//     setSelectedRole(null);
//     setUserEmail('');
//     sessionStorage.clear();
//     localStorage.removeItem('rememberedUser');
//   };

//   return (
//     <AuthContext.Provider value={{
//       isAuthenticated,
//       currentStep,
//       selectedDomain,
//       selectedRole,
//       userEmail,
//       login,
//       verifyMFA,
//       selectRole,
//       selectDomain,
//       logout,
//       isClientAdmin,
//       isSystemAdmin,
//       domains,

//       roles,
//       fetchDomains,
//       fetchRoles
//     }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) throw new Error('useAuth must be used within AuthProvider');
//   return context;
// };


import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { GovernanceDomain } from '../types';
import { loginService } from '../services/loginService';

interface UserRole {
  id: number;
  name: string;
  description: string;
  icon: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  currentStep: 'login' | 'mfa' | 'domain-selection' | 'role-selection' | 'dashboard';
  selectedDomain: GovernanceDomain | null;
  selectedRole: UserRole | null;
  userEmail: string;
  login: (email: string, password: string, scid: string) => Promise<boolean>;
  verifyMFA: (code: string) => Promise<boolean>;
  selectRole: (role: UserRole) => void;
  selectDomain: (domain: GovernanceDomain) => Promise<void>;
  logout: () => void;
  isClientAdmin: boolean;
  isSystemAdmin: boolean;
  domains: GovernanceDomain[];
  roles: UserRole[];
  fetchDomains: (customerId: number, userId: number) => Promise<void>;
  fetchRoles: (govId: number, customerId: number, userId: number) => Promise<void>;
  isLoading: boolean;
}

/** Named export so other files can import { AuthContext } */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ✅ centralize keys (avoid typos)
const STORAGE_KEYS = {
  userDetails: 'userDetails',
  authToken: 'authToken',
  customerId: 'customerId',
  userId: 'userid',
  scid: 'scid',
  userEmail: 'userEmail', // ✅ IMPORTANT: store email separately
  selectedDomain: 'selectedDomain',
  selectedRole: 'selectedRole',
} as const;

function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentStep, setCurrentStep] =
    useState<'login' | 'mfa' | 'domain-selection' | 'role-selection' | 'dashboard'>('login');
  const [selectedDomain, setSelectedDomain] = useState<GovernanceDomain | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [isClientAdmin, setIsClientAdmin] = useState(false);
  const [isSystemAdmin, setIsSystemAdmin] = useState(false);
  const [domains, setDomains] = useState<GovernanceDomain[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUserDetails = sessionStorage.getItem('userDetails');
    const storedAuthToken = sessionStorage.getItem('authToken');
    const storedCustomerId = sessionStorage.getItem('customerId');
    const storedUserId = sessionStorage.getItem('userid');
    const storedScid = sessionStorage.getItem('scid');

    const storedDomain = sessionStorage.getItem('selectedDomain');
    const storedRole = sessionStorage.getItem('selectedRole');
    //NEW: Read the userEmail from sessionStorage so it survives page reloads
    const storedEmail = sessionStorage.getItem('userEmail');

    if (storedUserDetails && storedAuthToken && storedCustomerId && storedUserId && storedScid) {
      try {
        const userData = JSON.parse(storedUserDetails);
        //NEW: Prefer the storedEmail from sessionStorage (fixes it resetting to "User")
        setUserEmail(storedEmail || userData.email || '');
        setIsClientAdmin(userData.isClientAdmin || false);
        setIsSystemAdmin(userData.isSystemAdmin || false);
        setIsAuthenticated(true);

        // ✅ restore domain
        if (storedDomain) {
          setSelectedDomain(JSON.parse(storedDomain));
        }

        // ✅ restore role
        if (storedRole) {
          setSelectedRole(JSON.parse(storedRole));
        }
        setCurrentStep('dashboard');
      } catch (error) {
        console.error('Error parsing stored user details:', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string, scid: string): Promise<boolean> => {
    try {
      const res = await loginService.addLogin(email, password, scid);
      const data = res.data;
      if (data?.userid) {
        setUserEmail(email);
        // NEW: Explicitly save email to sessionStorage here so we don't lose it on refresh
        sessionStorage.setItem('userEmail', email);
        sessionStorage.setItem('userDetails', JSON.stringify(data));
        sessionStorage.setItem('userid', data.userid);
        sessionStorage.setItem('scid', scid);
        if (data.customerId) sessionStorage.setItem('customerId', data.customerId);
        setCurrentStep('mfa');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  };

  const verifyMFA = async (code: string): Promise<boolean> => {
    try {
      const userid = Number(sessionStorage.getItem('userid'));
      const scid = sessionStorage.getItem('scid');
      if (!scid) return false;

      const res = await loginService.addMfa(userid, code, scid);
      const data = res.data;

      if (data?.statusCode === 100) {
        sessionStorage.setItem('userDetails', JSON.stringify(data));
        sessionStorage.setItem('authToken', data.authenticationToken);
        sessionStorage.setItem('customerId', data.customerId || '');
        setIsClientAdmin(data.isClientAdmin);
        setIsSystemAdmin(data.isSystemAdmin);
        setCurrentStep('domain-selection');
        return true;
      }
      return false;
    } catch (err) {
      console.error('MFA error:', err);
      return false;
    }
  };

  const fetchDomains = async (customerId: number, userId: number) => {
    try {
      const res = await loginService.getGovernance(customerId, userId);
      if (res.data && Array.isArray(res.data)) {
        const mapped = res.data.map((domain: any) => ({
          id: domain.domainId,
          name: domain.govDomainName,
          description: domain.description || 'No description',
          icon: 'Shield',
        }));
        setDomains(mapped);
      } else {
        setDomains([]);
      }
    } catch (err) {
      console.error('Error fetching governance domains:', err);
      setDomains([]);
    }
  };

  const fetchRoles = async (govId: number, customerId: number, userId: number) => {
    try {
      const res = await loginService.getGovernanceRoles(govId, customerId, userId);
      const mappedRoles: UserRole[] = (res.data || []).map((r: any) => ({
        id: r.roleId,
        name: r.roleName,
        description: `Type: ${r.roleType}`,
        icon: 'Users',
      }));
      setRoles(mappedRoles);
    } catch (err) {
      console.error('Error fetching roles:', err);
      setRoles([]);
    }
  };

  const selectDomain = async (domain: GovernanceDomain) => {
    setSelectedDomain(domain);
    // NEW: Store the domain stringified so we can read it in useEffect on reload
    sessionStorage.setItem('selectedDomain', JSON.stringify(domain));

    const customerId = Number(sessionStorage.getItem('customerId'));
    const userId = Number(sessionStorage.getItem('userid'));
    await fetchRoles(Number(domain.id), customerId, userId);
    setCurrentStep('role-selection');
  };

  const selectRole = (role: UserRole) => {
    setSelectedRole(role);
    // NEW: Store the role stringified so Header.tsx remembers it on reload
    sessionStorage.setItem('selectedRole', JSON.stringify(role));
    setCurrentStep('dashboard');
    setIsAuthenticated(true);
  };



  const logout = () => {
    setIsAuthenticated(false);
    setCurrentStep('login');
    setSelectedDomain(null);
    setSelectedRole(null);
    setUserEmail('');
    sessionStorage.clear();
    localStorage.removeItem('rememberedUser');
    window.history.replaceState({}, '', '/');
  };

  const value: AuthContextType = {
    isAuthenticated,
    currentStep,
    selectedDomain,
    selectedRole,
    userEmail,
    login,
    verifyMFA,
    selectRole,
    selectDomain,
    logout,
    isClientAdmin,
    isSystemAdmin,
    domains,
    roles,
    fetchDomains,
    fetchRoles,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/** Named hook export */
export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

/** Default export too (so both `import AuthProvider` and `import { AuthProvider }` work) */
export default AuthProvider;