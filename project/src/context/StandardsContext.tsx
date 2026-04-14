




import React, { createContext, useEffect, useState } from 'react';

export type SelectedStandard = {
  stdId: number;
  slug: string;
  name: string;
} | null;

type StandardsCtx = {
  selectedStandard: SelectedStandard;
  setSelectedStandard: (s: SelectedStandard) => void;
};

const StandardsContext = createContext<StandardsCtx>({
  selectedStandard: null,
  setSelectedStandard: () => { },
});

export const StandardsProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [selectedStandard, setSelectedStandard] = useState<SelectedStandard>(() => {
    try {
      const raw = sessionStorage.getItem('selectedStandard');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // Keep sessionStorage in sync
  useEffect(() => {
    if (selectedStandard) {
      sessionStorage.setItem('selectedStandard', JSON.stringify(selectedStandard));
    } else {
      sessionStorage.removeItem('selectedStandard');
    }
  }, [selectedStandard]);

  return (
    <StandardsContext.Provider value={{ selectedStandard, setSelectedStandard }}>
      {children}
    </StandardsContext.Provider>
  );
};

export const useStandards = () => React.useContext(StandardsContext);
