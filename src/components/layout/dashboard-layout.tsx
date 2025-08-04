'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Header } from './header';
import { Sidebar } from './sidebar';
import { useRouter } from 'next/navigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { Loader2 } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isLoading, profile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useIsMobile();
  const router = useRouter();

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  useEffect(() => {
    // Redirecionar se não estiver autenticado
    if (!isLoading && !user) {
      router.push('/login');
    }

    // Redirecionar para alteração de senha se necessário
    if (!isLoading && user && profile && !profile.senha_alterada) {
      router.push('/alterar-senha');
    }
  }, [user, isLoading, router, profile]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <Header toggleSidebar={toggleSidebar} />
      <div className="flex flex-1 overflow-hidden">
        <aside 
          className={`${
            sidebarOpen ? 'w-64' : 'w-0 -ml-64'
          } transition-all duration-200 ease-in-out md:ml-0 md:block`}
        >
          <Sidebar isOpen={sidebarOpen} />
        </aside>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}