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
  Building, 
  CheckCircle, 
  Clock, 
  Loader2, 
  Search, 
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

export default function ImobiliariasPage() {
  const { user } = useAuth();
  const [imobiliarias, setImobiliarias] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    if (user) {
      carregarImobiliarias();
    }
  }, [user]);

  const carregarImobiliarias = async () => {
    setIsLoading(true);
    try {
      // Buscar todas as imobiliárias
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('tipo_usuario', 'imobiliaria')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setImobiliarias(data || []);
    } catch (error) {
      console.error('Erro ao carregar imobiliárias:', error);
      toast.error('Erro ao carregar imobiliárias');
    } finally {
      setIsLoading(false);
    }
  };

  const filtrarImobiliarias = () => {
    if (!filtro) return imobiliarias;
    
    const termoLowerCase = filtro.toLowerCase();
    
    return imobiliarias.filter(imobiliaria => {
      return (
        (imobiliaria.nome_empresa && imobiliaria.nome_empresa.toLowerCase().includes(termoLowerCase)) ||
        (imobiliaria.email && imobiliaria.email.toLowerCase().includes(termoLowerCase)) ||
        (imobiliaria.nome_responsavel && imobiliaria.nome_responsavel.toLowerCase().includes(termoLowerCase)) ||
        (imobiliaria.cnpj && imobiliaria.cnpj.includes(filtro))
      );
    });
  };

  const imobiliariasFiltradas = filtrarImobiliarias();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Imobiliárias</h2>
            <p className="text-muted-foreground">
              Gerencie as imobiliárias cadastradas no sistema
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/imobiliarias/nova">
              <Building className="mr-2 h-4 w-4" />
              Nova Imobiliária
            </Link>
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Todas as Imobiliárias</CardTitle>
            <CardDescription>
              Visualize e gerencie as imobiliárias cadastradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por nome, e-mail, CNPJ..."
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
            ) : imobiliariasFiltradas.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Imobiliária</TableHead>
                      <TableHead>Responsável</TableHead>
                      <TableHead>CNPJ</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data de Cadastro</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {imobiliariasFiltradas.map((imobiliaria) => (
                      <TableRow key={imobiliaria.id}>
                        <TableCell className="font-medium">
                          <div>
                            {imobiliaria.nome_empresa || 'Não informado'}
                            <div className="text-xs text-muted-foreground">
                              {imobiliaria.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{imobiliaria.nome_responsavel || 'Não informado'}</TableCell>
                        <TableCell>{imobiliaria.cnpj || 'Não informado'}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              imobiliaria.senha_alterada 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {imobiliaria.senha_alterada ? (
                                <>
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                  Ativo
                                </>
                              ) : (
                                <>
                                  <Clock className="mr-1 h-3 w-3" />
                                  Pendente
                                </>
                              )}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(imobiliaria.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/admin/imobiliarias/${imobiliaria.id}`}>
                              <Building className="mr-2 h-4 w-4" />
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
                <Building className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium">Nenhuma imobiliária encontrada</h3>
                <p className="mt-1 text-muted-foreground">
                  {filtro
                    ? 'Tente ajustar os filtros para encontrar o que procura.'
                    : 'Comece cadastrando uma nova imobiliária no sistema.'}
                </p>
                <div className="mt-6">
                  <Button asChild>
                    <Link href="/admin/imobiliarias/nova">
                      <Building className="mr-2 h-4 w-4" />
                      Nova Imobiliária
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