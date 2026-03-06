import React, { createContext, useContext, useState, useEffect } from 'react';

const GoldRateContext = createContext();

export const useGoldRate = () => useContext(GoldRateContext);

export const GoldRateProvider = ({ children }) => {
  const [rates, setRates] = useState({
    gold24k: 0,
    gold22k: 0,
    silver: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;
    const loadRates = async () => {
      try {
        const mockRates = {
          gold24k: 7850.50 + Math.random() * 10,
          gold22k: 7200.25 + Math.random() * 10,
          silver: 95.20 + Math.random(),
        };
        
        if (isMounted) {
          setRates({
            ...mockRates,
            loading: false,
            error: null,
          });
        }
      } catch {
        if (isMounted) {
          setRates(prev => ({ ...prev, loading: false, error: 'Failed to fetch rates' }));
        }
      }
    };
    loadRates();
    const interval = setInterval(loadRates, 60000); // 60 seconds
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <GoldRateContext.Provider value={rates}>
      {children}
    </GoldRateContext.Provider>
  );
};
