'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Home, 
  ClipboardList, 
  UserPlus, 
  Users, 
  FileText, 
  Settings, 
  ShieldCheck 
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

interface SidebarProps {
  className?: string;
  isOpen?: boolean;
}

export function Sidebar({ className, isOpen = true }: SidebarProps) {
  const pathname = usePathname();
  const { isAdmin, isImobiliaria } = useAuth();

  // Links para Administrador
  const adminLinks = [
    {
      title: 'Dashboard',
      href: '/admin',
      icon: Home,
    },
    {
      title: 'Análises',
      href: '/admin/analises',
      icon: ClipboardList,
    },
    {
      title: 'Imobiliárias',
      href: '/admin/imobiliarias',
      icon: Users,
    },
    {
      title: 'Usuários Admin',
      href: '/admin/usuarios',
      icon: ShieldCheck,
    },
    {
      title: 'Configurações',
      href: '/admin/configuracoes',
      icon: Settings,
    },
  ];

  // Links para Imobiliária
  const imobiliariaLinks = [
    {
      title: 'Dashboard',
      href: '/imobiliaria',
      icon: Home,
    },
    {
      title: 'Nova Análise',
      href: '/imobiliaria/analises/nova',
      icon: UserPlus,
    },
    {
      title: 'Análises',
      href: '/imobiliaria/analises',
      icon: ClipboardList,
    },
    {
      title: 'Documentos',
      href: '/imobiliaria/documentos',
      icon: FileText,
    },
    {
      title: 'Perfil',
      href: '/imobiliaria/perfil',
      icon: Settings,
    },
  ];

  // Selecionar links de acordo com o tipo de usuário
  const links = isAdmin ? adminLinks : imobiliariaLinks;

  if (!isOpen) return null;

  return (
    <div className={cn('pb-12 border-r h-full', className)}>
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
            Menu
          </h2>
          <ScrollArea className="h-[calc(100vh-9rem)]">
            <div className="space-y-1">
              {links.map((link) => (
                <Button
                  key={link.href}
                  variant={pathname === link.href ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start',
                    pathname === link.href ? 'bg-accent' : ''
                  )}
                  asChild
                >
                  <Link href={link.href}>
                    <link.icon className="mr-2 h-4 w-4" />
                    {link.title}
                  </Link>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}