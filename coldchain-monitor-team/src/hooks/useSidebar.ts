import { useContext } from 'react';
import { SidebarContext, type SidebarContextValue } from '@/contexts/sidebarContext';

/** Access sidebar layout state. Must be used inside `<SidebarProvider>`. */
export function useSidebar(): SidebarContextValue {
  const context = useContext(SidebarContext);
  if (!context) throw new Error('useSidebar must be used within a SidebarProvider');
  return context;
}
