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
  Loader2, 
  FileText, 
  Building, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  PieChart,
  TrendingUp,
  Calendar
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    analises: {
      total: 0,
      aguardando: 0,
      aprovadas: 0,
      rejeitadas: 0
    },
    imobiliarias: {
      total: 0,
      ativas: 0,
      inativas: 0
    },
    documentos: {
      total: 0
    }
  });
  const [analiseRecentes, setAnalisesRecentes] = useState<any[]>([]);
  const [imobiliariasRecentes, setImobiliariasRecentes] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      carregarDados();
    }
  }, [user]);

  const carregarDados = async () => {
    setIsLoading(true);
    try {
      // Buscar contagem de análises
      const { count: totalAnalises, error: analiseError } = await supabase
        .from('analises')
        .select('*', { count: 'exact', head: true });

      // Buscar análises por status
      const { data: aguardandoData } = await supabase
        .from('analises')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Aguardando');
        
      const { data: aprovadasData } = await supabase
        .from('analises')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Aprovado');
        
      const { data: rejeitadasData } = await supabase
        .from('analises')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Rejeitado');

      // Buscar contagem de imobiliárias
      const { count: totalImobiliarias, error: imobiliariaError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('tipo_usuario', 'imobiliaria');
        
      // Buscar imobiliárias ativas (senha alterada)
      const { data: imobiliariasAtivasData } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('tipo_usuario', 'imobiliaria')
        .eq('senha_alterada', true);
        
      // Buscar contagem de documentos
      const { count: totalDocumentos, error: documentoError } = await supabase
        .from('documentos')
        .select('*', { count: 'exact', head: true });

      // Buscar análises recentes
      const { data: analisesRecentes, error: recentesError } = await supabase
        .from('analises')
        .select(`
          *,
          imobiliaria:imobiliaria_id(nome_empresa, email)
        `)
        .order('data_envio', { ascending: false })
        .limit(5);

      // Buscar imobiliárias recentes
      const { data: imobiliariasRecentes, error: imobRecentsError } = await supabase
        .from('profiles')
        .select('*')
        .eq('tipo_usuario', 'imobiliaria')
        .order('created_at', { ascending: false })
        .limit(5);
        
      // Calcular estatísticas
      setStats({
        analises: {
          total: totalAnalises || 0,
          aguardando: aguardandoData?.length || 0,
          aprovadas: aprovadasData?.length || 0,
          rejeitadas: rejeitadasData?.length || 0
        },
        imobiliarias: {
          total: totalImobiliarias || 0,
          ativas: imobiliariasAtivasData?.length || 0,
          inativas: (totalImobiliarias || 0) - (imobiliariasAtivasData?.length || 0)
        },
        documentos: {
          total: totalDocumentos || 0
        }
      });

      // Definir dados recentes
      setAnalisesRecentes(analisesRecentes || []);
      setImobiliariasRecentes(imobiliariasRecentes || []);

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      toast.error('Erro ao carregar estatísticas');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Dashboard Administrativo</h2>
            <p className="text-muted-foreground">
              Visão geral das operações da S8 Garante
            </p>
          </div>
          <Button 
            onClick={carregarDados} 
            variant="outline" 
            size="sm"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Atualizando...
              </>
            ) : (
              <>
                <Calendar className="mr-2 h-4 w-4" />
                Atualizar dados
              </>
            )}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-white dark:bg-gray-950">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total de Análises
                  </CardTitle>
                  <FileText className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.analises.total}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Análises de fiança processadas
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-white dark:bg-gray-950">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Análises Pendentes
                  </CardTitle>
                  <Clock className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.analises.aguardando}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Aguardando avaliação
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-white dark:bg-gray-950">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Imobiliárias
                  </CardTitle>
                  <Building className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.imobiliarias.total}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="text-green-500">{stats.imobiliarias.ativas} ativas</span> •{' '} 
                    <span className="text-yellow-500">{stats.imobiliarias.inativas} inativas</span>
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-white dark:bg-gray-950">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Documentos
                  </CardTitle>
                  <FileText className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.documentos.total}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Documentos processados
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-4 md:grid-cols-7">
              <Card className="md:col-span-4 bg-white dark:bg-gray-950">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Análises Recentes</CardTitle>
                    <CardDescription>
                      Últimas análises recebidas
                    </CardDescription>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/admin/analises">
                      <FileText className="mr-2 h-4 w-4" />
                      Ver todas
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {analiseRecentes.length > 0 ? (
                    <div className="space-y-4">
                      {analiseRecentes.map((analise) => (
                        <div key={analise.id} className="flex items-center justify-between border-b pb-4">
                          <div>
                            <p className="font-medium">{analise.nome_locatario}</p>
                            <p className="text-sm text-muted-foreground">
                              {analise.imobiliaria?.nome_empresa || analise.imobiliaria?.email || 'N/A'} • {formatDate(analise.data_envio)}
                            </p>
                            <div className="mt-1 flex items-center">
                              {getStatusIcon(analise.status)}
                              <span className="ml-1 text-xs">
                                {analise.status}
                              </span>
                            </div>
                          </div>
                          <Button size="sm" asChild>
                            <Link href={`/admin/analises/${analise.id}`}>
                              Ver detalhes
                            </Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      <FileText className="mx-auto h-8 w-8 opacity-50" />
                      <p className="mt-2">Nenhuma análise encontrada</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="md:col-span-3 bg-white dark:bg-gray-950">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Visão Geral</CardTitle>
                    <CardDescription>
                      Distribuição de análises
                    </CardDescription>
                  </div>
                  <PieChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="mr-2 h-4 w-4 rounded-full bg-yellow-500"></div>
                        <span>Aguardando</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium">{stats.analises.aguardando}</span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({stats.analises.total > 0 ? Math.round((stats.analises.aguardando / stats.analises.total) * 100) : 0}%)
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="mr-2 h-4 w-4 rounded-full bg-green-500"></div>
                        <span>Aprovadas</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium">{stats.analises.aprovadas}</span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({stats.analises.total > 0 ? Math.round((stats.analises.aprovadas / stats.analises.total) * 100) : 0}%)
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="mr-2 h-4 w-4 rounded-full bg-red-500"></div>
                        <span>Rejeitadas</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium">{stats.analises.rejeitadas}</span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({stats.analises.total > 0 ? Math.round((stats.analises.rejeitadas / stats.analises.total) * 100) : 0}%)
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <Button asChild className="w-full" variant="outline">
                        <Link href="/admin/analises?status=Aguardando">
                          <Clock className="mr-2 h-4 w-4 text-yellow-500" />
                          Pendentes
                        </Link>
                      </Button>
                      <Button asChild className="w-full" variant="outline">
                        <Link href="/admin/imobiliarias">
                          <Building className="mr-2 h-4 w-4" />
                          Imobiliárias
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="bg-white dark:bg-gray-950">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Imobiliárias Recentes</CardTitle>
                    <CardDescription>
                      Últimas imobiliárias cadastradas
                    </CardDescription>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/admin/imobiliarias">
                      <Building className="mr-2 h-4 w-4" />
                      Ver todas
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {imobiliariasRecentes.length > 0 ? (
                    <div className="space-y-4">
                      {imobiliariasRecentes.map((imobiliaria) => (
                        <div key={imobiliaria.id} className="flex items-center justify-between border-b pb-4">
                          <div>
                            <p className="font-medium">{imobiliaria.nome_empresa || 'Nome não informado'}</p>
                            <p className="text-sm text-muted-foreground">
                              {imobiliaria.email} • {formatDate(imobiliaria.created_at)}
                            </p>
                            <div className="mt-1 flex items-center">
                              {imobiliaria.senha_alterada ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <Clock className="h-4 w-4 text-yellow-500" />
                              )}
                              <span className="ml-1 text-xs">
                                {imobiliaria.senha_alterada ? 'Ativa' : 'Pendente'}
                              </span>
                            </div>
                          </div>
                          <Button size="sm" asChild>
                            <Link href={`/admin/imobiliarias/${imobiliaria.id}`}>
                              Ver detalhes
                            </Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      <Building className="mx-auto h-8 w-8 opacity-50" />
                      <p className="mt-2">Nenhuma imobiliária cadastrada</p>
                    </div>
                  )}

                  <div className="mt-6 text-center">
                    <Button asChild>
                      <Link href="/admin/imobiliarias/nova">
                        <Building className="mr-2 h-4 w-4" />
                        Nova Imobiliária
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
                <CardHeader>
                  <CardTitle>Ações Rápidas</CardTitle>
                  <CardDescription>
                    Acesso rápido às funcionalidades mais importantes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button asChild className="h-auto py-4 justify-start" variant="outline">
                      <Link href="/admin/analises/pendentes">
                        <Clock className="mr-2 h-5 w-5 text-yellow-500" />
                        <div className="text-left">
                          <div className="font-medium">Análises Pendentes</div>
                          <div className="text-xs text-muted-foreground">
                            {stats.analises.aguardando} aguardando análise
                          </div>
                        </div>
                      </Link>
                    </Button>

                    <Button asChild className="h-auto py-4 justify-start" variant="outline">
                      <Link href="/admin/imobiliarias/nova">
                        <Building className="mr-2 h-5 w-5 text-primary" />
                        <div className="text-left">
                          <div className="font-medium">Nova Imobiliária</div>
                          <div className="text-xs text-muted-foreground">
                            Cadastrar parceiro
                          </div>
                        </div>
                      </Link>
                    </Button>

                    <Button asChild className="h-auto py-4 justify-start" variant="outline">
                      <Link href="/admin/usuarios/novo">
                        <Users className="mr-2 h-5 w-5 text-blue-500" />
                        <div className="text-left">
                          <div className="font-medium">Novo Administrador</div>
                          <div className="text-xs text-muted-foreground">
                            Gerenciar acesso admin
                          </div>
                        </div>
                      </Link>
                    </Button>

                    <Button asChild className="h-auto py-4 justify-start" variant="outline">
                      <Link href="/admin/relatorios">
                        <TrendingUp className="mr-2 h-5 w-5 text-green-500" />
                        <div className="text-left">
                          <div className="font-medium">Relatórios</div>
                          <div className="text-xs text-muted-foreground">
                            Análise de desempenho
                          </div>
                        </div>
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}