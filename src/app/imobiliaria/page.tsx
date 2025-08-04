'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { Navbar } from '@/components/layout/navbar';
import { ImobiliariaDashboard } from '@/components/imobiliaria/dashboard';
import { USER_ROLES } from '@/lib/constants';
import { Loader2 } from 'lucide-react';

export default function ImobiliariaPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.profile?.role !== USER_ROLES.IMOBILIARIA) {
        router.push('/login');
      } else if (!user.profile?.senha_alterada) {
        router.push('/alterar-senha');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || user.profile?.role !== USER_ROLES.IMOBILIARIA) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <ImobiliariaDashboard />
        </div>
      </main>
    </div>
  );
}