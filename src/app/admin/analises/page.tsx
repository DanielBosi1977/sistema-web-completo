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
  Clock, 
  FileText, 
  Loader2, 
  Search, 
  XCircle 
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { STATUS_ANALISE } from '@/lib/constants';

export default function AdminAnalisesPage() {
  const { user } = useAuth();
  const [analises, setAnalises] = useState<any[]>([]);
  const [imobiliarias, setImobiliarias] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  const [imobiliariaFiltro, setImobiliariaFiltro] = useState('');

  useEffect(() => {
    if (user) {
      carregarDados();
    }
  }, [user]);

  const carregarDados = async () => {
    setIsLoading(true);
    try {
      // Buscar todas as análises
      const { data: analisesData, error: analisesError } = await supabase
        .from('analises')
        .select(`
          *,
          imobiliaria:imobiliaria_id(id, nome_empresa, email)
        `)
        .order('data_envio', { ascending: false });
      
      if (analisesError) throw analisesError;
      
      setAnalises(analisesData || []);
      
      // Buscar todas as imobiliárias para o filtro
      const { data: imobiliariasData, error: imobiliariasError } = await supabase
        .from('profiles')
        .select('id, nome_empresa, email')
        .eq('tipo_usuario', 'imobiliaria')
        .order('nome_empresa', { ascending: true });
      
      if (imobiliariasError) throw imobiliariasError;
      
      setImobiliarias(imobiliariasData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Aguardando':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'Aprovado':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Rejeitado':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Aguardando':
        return 'bg-yellow-100 text-yellow-800';
      case 'Aprovado':
        return 'bg-green-100 text-green-800';
      case 'Rejeitado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filtrarAnalises = () => {
    if (!filtro && !statusFiltro && !imobiliariaFiltro) return analises;
    
    return analises.filter(analise => {
      const matchFiltro = !filtro || 
        analise.nome_locatario.toLowerCase().includes(filtro.toLowerCase()) ||
        analise.cpf_locatario.includes(filtro);
      
      const matchStatus = !statusFiltro || analise.status === statusFiltro;
      
      const matchImobiliaria = !imobiliariaFiltro || analise.imobiliaria_id === imobiliariaFiltro;
      
      return matchFiltro && matchStatus && matchImobiliaria;
    });
  };

  const analisesFiltradas = filtrarAnalises();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestão de Análises</h2>
          <p className="text-muted-foreground">
            Visualize e gerencie todas as análises de locatários no sistema
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Todas as Análises</CardTitle>
            <CardDescription>
              Aprove ou rejeite análises de locatários das imobiliárias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por nome ou CPF..."
                  className="pl-8"
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                />
              </div>
              <Select
                value={statusFiltro}
                onValueChange={setStatusFiltro}
              >
                <SelectTrigger className="sm:w-[180px]">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os status</SelectItem>
                  {STATUS_ANALISE.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={imobiliariaFiltro}
                onValueChange={setImobiliariaFiltro}
              >
                <SelectTrigger className="sm:w-[200px]">
                  <SelectValue placeholder="Todas as imobiliárias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as imobiliárias</SelectItem>
                  {imobiliarias.map((imobiliaria) => (
                    <SelectItem key={imobiliaria.id} value={imobiliaria.id}>
                      {imobiliaria.nome_empresa || imobiliaria.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : analisesFiltradas.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Locatário</TableHead>
                      <TableHead>Imobiliária</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Data de Envio</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analisesFiltradas.map((analise) => (
                      <TableRow key={analise.id}>
                        <TableCell className="font-medium">
                          <div>
                            {analise.nome_locatario}
                            <div className="text-xs text-muted-foreground">
                              CPF: {analise.cpf_locatario}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {analise.imobiliaria?.nome_empresa || analise.imobiliaria?.email || 'N/A'}
                        </TableCell>
                        <TableCell>{analise.plano}</TableCell>
                        <TableCell>{formatDate(analise.data_envio)}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusBadgeClass(analise.status)}`}>
                              {getStatusIcon(analise.status)}
                              <span className="ml-1">{analise.status}</span>
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/admin/analises/${analise.id}`}>
                              <FileText className="mr-2 h-4 w-4" />
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
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium">Nenhuma análise encontrada</h3>
                <p className="mt-1 text-muted-foreground">
                  {filtro || statusFiltro || imobiliariaFiltro
                    ? 'Tente ajustar os filtros para encontrar o que procura.'
                    : 'Ainda não há análises registradas no sistema.'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}