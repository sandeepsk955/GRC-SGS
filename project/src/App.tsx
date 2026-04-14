

// import React from 'react';
// import { AuthProvider, useAuth } from './context/AuthContext';
// import { StandardsProvider } from './context/StandardsContext'; // <-- ADD
// import { LoginForm } from './components/auth/LoginForm';
// import { MFAForm } from './components/auth/MFAForm';
// import { RoleSelection } from './components/auth/RoleSelection';
// import { DomainSelection } from './components/auth/DomainSelection';
// import { MainApp } from './components/MainApp';

// const AppContent: React.FC = () => {
//   const { currentStep, isAuthenticated } = useAuth();

//   if (isAuthenticated) {
//     return <MainApp />;
//   }

//   switch (currentStep) {
//     case 'login':
//       return <LoginForm />;
//     case 'mfa':
//       return <MFAForm />;
//     case 'role-selection':
//       return <RoleSelection />;
//     case 'domain-selection':
//       return <DomainSelection />;
//     default:
//       return <LoginForm />;
//   }
// };

// function App() {
//   return (
//     <AuthProvider>
//       <StandardsProvider>   {/* <-- wrap once here */}
//         <AppContent />
//       </StandardsProvider>
//     </AuthProvider>
//   );
// }

// export default App;


import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StandardsProvider } from './context/StandardsContext';
import { LoginForm } from './components/auth/LoginForm';
import { MFAForm } from './components/auth/MFAForm';
import { RoleSelection } from './components/auth/RoleSelection';
import { DomainSelection } from './components/auth/DomainSelection';
import { MainApp } from './components/MainApp';
import ProtectedRoute from './components/ProtectedRoute';

const AppContent: React.FC = () => {
  const { currentStep, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div />;

  if (isAuthenticated) {
    return (
      <ProtectedRoute>
        <MainApp />
      </ProtectedRoute>
    );
  }

  switch (currentStep) {
    case 'login':
      return <LoginForm />;
    case 'mfa':
      return <MFAForm />;
    case 'role-selection':
      return <RoleSelection />;
    case 'domain-selection':
      return <DomainSelection />;
    default:
      return <LoginForm />;
  }
};

function App() {
  return (
    <AuthProvider>
      <StandardsProvider>
        <AppContent />
      </StandardsProvider>
    </AuthProvider>
  );
}

export default App;
