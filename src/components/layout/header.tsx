'use client';

import { useAuth } from '@/contexts/auth-context';
import { APP_NAME } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Settings, Menu, Shield } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogoText } from '@/components/logo-text';

export function Header({ toggleSidebar }: { toggleSidebar?: () => void }) {
  const { user, profile, signOut, isAdmin } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const handlePerfilClick = () => {
    if (isAdmin) {
      router.push('/admin/perfil');
    } else {
      router.push('/imobiliaria/perfil');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="flex h-16 items-center px-4 sm:px-6">
        {toggleSidebar && (
          <Button variant="ghost" size="icon" className="mr-2 md:hidden" onClick={toggleSidebar}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        )}
        
        <div className="flex items-center">
          <LogoText width={120} height={40} className="mr-2" />
          {isAdmin && (
            <span className="ml-2 inline-flex items-center rounded-full bg-primary px-2 py-1 text-xs font-medium text-white">
              <Shield className="mr-1 h-3 w-3" />
              Admin
            </span>
          )}
        </div>
        
        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Menu de usuário</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {profile?.nome_responsavel || profile?.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handlePerfilClick}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-2">
              <Button asChild variant="default">
                <Link href="/login">Entrar</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin-login">
                  <Shield className="mr-2 h-4 w-4" />
                  Área Admin
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}