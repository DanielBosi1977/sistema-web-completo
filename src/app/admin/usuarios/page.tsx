'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { toast } from 'sonner';
import { 
  CheckCircle, 
  Loader2, 
  Search, 
  Shield, 
  UserPlus
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { formatDate } from '@/lib/utils';

export default function AdminUsuariosPage() {
  const { user } = useAuth();
  const [administradores, setAdministradores] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    if (user) {
      carregarAdministradores();
    }
  }, [user]);

  const carregarAdministradores = async () => {
    setIsLoading(true);
    try {
      // Buscar todos os administradores
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('tipo_usuario', 'admin')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setAdministradores(data || []);
    } catch (error) {
      console.error('Erro ao carregar administradores:', error);
      toast.error('Erro ao carregar administradores');
    } finally {
      setIsLoading(false);
    }
  };

  const filtrarAdministradores = () => {
    if (!filtro) return administradores;
    
    const termoLowerCase = filtro.toLowerCase();
    
    return administradores.filter(admin => {
      return (
        (admin.nome_responsavel && admin.nome_responsavel.toLowerCase().includes(termoLowerCase)) ||
        (admin.email && admin.email.toLowerCase().includes(termoLowerCase))
      );
    });
  };

  const administradoresFiltrados = filtrarAdministradores();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Usuários Administradores</h2>
            <p className="text-muted-foreground">
              Gerencie os usuários administradores do sistema
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/usuarios/novo">
              <UserPlus className="mr-2 h-4 w-4" />
              Novo Administrador
            </Link>
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Todos os Administradores</CardTitle>
            <CardDescription>
              Usuários com acesso administrativo ao sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por nome ou e-mail..."
                  className="pl-8"
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                />
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : administradoresFiltrados.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data de Cadastro</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {administradoresFiltrados.map((admin) => (
                      <TableRow key={admin.id}>
                        <TableCell className="font-medium">
                          {admin.nome_responsavel || 'Não informado'}
                        </TableCell>
                        <TableCell>{admin.email}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Ativo
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(admin.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/admin/usuarios/${admin.id}`}>
                              <Shield className="mr-2 h-4 w-4" />
                              Detalhes
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="py-24 text-center">
                <Shield className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium">Nenhum administrador encontrado</h3>
                <p className="mt-1 text-muted-foreground">
                  {filtro
                    ? 'Tente ajustar os filtros para encontrar o que procura.'
                    : 'Comece cadastrando um novo administrador no sistema.'}
                </p>
                <div className="mt-6">
                  <Button asChild>
                    <Link href="/admin/usuarios/novo">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Novo Administrador
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}