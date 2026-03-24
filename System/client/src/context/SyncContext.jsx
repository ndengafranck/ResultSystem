import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';

const SyncContext = createContext(null);

export const SyncProvider = ({ children }) => {
  const [isSyncing, setIsSyncing]     = useState(false);
  const [syncError, setSyncError]     = useState(null);
  const [syncSuccess, setSyncSuccess] = useState(false);
  // const [user, setUser] = useState(null);

  const startSync = useCallback(async () => {
    setIsSyncing(true);
    setSyncError(null);
    setSyncSuccess(false);
    // const storedUser = JSON.stringify(localStorage.getItem("user"));

    // setUser(storedUser);
    try {
      await api.get('sync/data');
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    } catch (err) {
      setSyncError('Synchronisation failed. Please try again.');
      setTimeout(() => setSyncError(null), 4000);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  return (
    <SyncContext.Provider value={{ isSyncing, syncError, syncSuccess, startSync }}>
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error('useSync must be used inside SyncProvider');
  return ctx;
};
