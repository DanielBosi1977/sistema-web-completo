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
  UserPlus, 
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

export default function AnalisesPage() {
  const { user } = useAuth();
  const [analises, setAnalises] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('todos'); // Modificado para um valor válido

  useEffect(() => {
    if (user) {
      carregarAnalises();
    }
  }, [user]);

  const carregarAnalises = async () => {
    setIsLoading(true);
    try {
      // Buscar todas as análises da imobiliária
      const { data, error } = await supabase
        .from('analises')
        .select('*')
        .eq('imobiliaria_id', user?.id)
        .order('data_envio', { ascending: false });
      
      if (error) throw error;
      
      setAnalises(data || []);
    } catch (error) {
      console.error('Erro ao carregar análises:', error);
      toast.error('Erro ao carregar análises');
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
    if (filtro === '' && statusFiltro === 'todos') return analises;
    
    return analises.filter(analise => {
      const matchFiltro = filtro === '' || 
        analise.nome_locatario.toLowerCase().includes(filtro.toLowerCase()) ||
        analise.cpf_locatario.includes(filtro);
      
      const matchStatus = statusFiltro === 'todos' || analise.status === statusFiltro;
      
      return matchFiltro && matchStatus;
    });
  };

  const analisesFiltradas = filtrarAnalises();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Análises de Locatários</h2>
            <p className="text-muted-foreground">
              Gerencie todas as análises enviadas pela sua imobiliária
            </p>
          </div>
          <Button asChild>
            <Link href="/imobiliaria/analises/nova">
              <UserPlus className="mr-2 h-4 w-4" />
              Nova Análise
            </Link>
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Todas as Análises</CardTitle>
            <CardDescription>
              Visualize o histórico e status de todas as análises
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
                  <SelectItem value="todos">Todos os status</SelectItem>
                  {STATUS_ANALISE.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
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
                            <Link href={`/imobiliaria/analises/${analise.id}`}>
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
                  {filtro || statusFiltro !== 'todos'
                    ? 'Tente ajustar os filtros para encontrar o que procura.'
                    : 'Comece criando uma nova análise de locatário.'}
                </p>
                <div className="mt-6">
                  <Button asChild>
                    <Link href="/imobiliaria/analises/nova">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Nova Análise
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