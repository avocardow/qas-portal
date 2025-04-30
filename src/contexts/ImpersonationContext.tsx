"use client";
import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { Role } from '@/policies/permissions';
import { impersonationService } from '@/lib/impersonationService';

export interface ImpersonationContextValue {
  impersonatedRole: Role | null;
  impersonate: (role: Role) => void;
  revert: () => void;
}

const ImpersonationContext = createContext<ImpersonationContextValue | undefined>(undefined);

export const useImpersonationContext = (): ImpersonationContextValue => {
  const context = useContext(ImpersonationContext);
  if (!context) {
    throw new Error('useImpersonationContext must be used within ImpersonationProvider');
  }
  return context;
};

interface ImpersonationProviderProps {
  children: ReactNode;
}

export const ImpersonationProvider = ({ children }: ImpersonationProviderProps) => {
  const [impersonatedRole, setImpersonatedRole] = useState<Role | null>(null);

  useEffect(() => {
    const role = impersonationService.getImpersonatedRole();
    setImpersonatedRole(role);
  }, []);

  const impersonate = useCallback((role: Role) => {
    impersonationService.setImpersonatedRole(role);
    setImpersonatedRole(role);
  }, []);

  const revert = useCallback(() => {
    impersonationService.clearImpersonation();
    setImpersonatedRole(null);
  }, []);

  return (
    <ImpersonationContext.Provider value={{ impersonatedRole, impersonate, revert }}>
      {children}
    </ImpersonationContext.Provider>
  );
};