// New file: src/lib/impersonationService.ts
"use client";
import { Role } from '@/policies/permissions';

const STORAGE_KEY = 'impersonatedRole';

export const impersonationService = {
  getImpersonatedRole(): Role | null {
    if (typeof window === 'undefined') return null;
    const role = sessionStorage.getItem(STORAGE_KEY);
    return (role as Role) || null;
  },

  setImpersonatedRole(role: Role): void {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(STORAGE_KEY, role);
    console.info(`[ImpersonationService] Impersonation started: ${role}`);
  },

  clearImpersonation(): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(STORAGE_KEY);
    console.info('[ImpersonationService] Impersonation cleared');
  }
};