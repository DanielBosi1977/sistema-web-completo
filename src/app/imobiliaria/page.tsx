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
  UserPlus, 
  CheckCircle, 
  XCircle, 
  Clock,
  Calendar,
  Upload,
  PieChart,
  Info
} from 'lucide-react';

export default function ImobiliariaDashboard() {
  const { user, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    analises: {
      total: 0,
      aguardando: 0,
      aprovadas: 0,
      rejeitadas: 0
    },
    documentos: {
      total: 0
    }
  });
  const [analiseRecentes, setAnalisesRecentes] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      carregarDados();
    }
  }, [user]);

  const carregarDados = async () => {
    setIsLoading(true);
    try {
      // Buscar contagem de análises da imobiliária
      const { count: totalAnalises, error: analiseError } = await supabase
        .from('analises')
        .select('*', { count: 'exact', head: true })
        .eq('imobiliaria_id', user?.id);

      // Buscar análises por status
      const { data: aguardandoData } = await supabase
        .from('analises')
        .select('*', { count: 'exact', head: true })
        .eq('imobiliaria_id', user?.id)
        .eq('status', 'Aguardando');
        
      const { data: aprovadasData } = await supabase
        .from('analises')
        .select('*', { count: 'exact', head: true })
        .eq('imobiliaria_id', user?.id)
        .eq('status', 'Aprovado');
        
      const { data: rejeitadasData } = await supabase
        .from('analises')
        .select('*', { count: 'exact', head: true })
        .eq('imobiliaria_id', user?.id)
        .eq('status', 'Rejeitado');
        
      // Buscar IDs das análises primeiro
      const { data: analiseIds } = await supabase
        .from('analises')
        .select('id')
        .eq('imobiliaria_id', user?.id);
      
      // Buscar contagem de documentos
      let totalDocumentos = 0;
      if (analiseIds && analiseIds.length > 0) {
        const { count, error: documentoError } = await supabase
          .from('documentos')
          .select('*', { count: 'exact', head: true })
          .in('analise_id', analiseIds.map(a => a.id));
          
        if (!documentoError) {
          totalDocumentos = count || 0;
        }
      }

      // Buscar análises recentes
      const { data: analisesRecentes, error: recentesError } = await supabase
        .from('analises')
        .select('*')
        .eq('imobiliaria_id', user?.id)
        .order('data_envio', { ascending: false })
        .limit(5);
        
      // Calcular estatísticas
      setStats({
        analises: {
          total: totalAnalises || 0,
          aguardando: aguardandoData?.length || 0,
          aprovadas: aprovadasData?.length || 0,
          rejeitadas: rejeitadasData?.length || 0
        },
        documentos: {
          total: totalDocumentos
        }
      });

      // Definir dados recentes
      setAnalisesRecentes(analisesRecentes || []);

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
            <h2 className="text-2xl font-bold tracking-tight">Dashboard da Imobiliária</h2>
            <p className="text-muted-foreground">
              Bem-vindo, {profile?.nome_responsavel || profile?.nome_empresa || 'Usuário'}
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
                    Análises de fiança enviadas
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-white dark:bg-gray-950">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Aguardando
                  </CardTitle>
                  <Clock className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.analises.aguardando}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Análises pendentes
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-white dark:bg-gray-950">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Aprovadas
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.analises.aprovadas}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Análises aprovadas
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-white dark:bg-gray-950">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Rejeitadas
                  </CardTitle>
                  <XCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.analises.rejeitadas}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Análises rejeitadas
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
                      Últimas análises enviadas
                    </CardDescription>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/imobiliaria/analises">
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
                              Plano: {analise.plano} • {formatDate(analise.data_envio)}
                            </p>
                            <div className="mt-1 flex items-center">
                              {getStatusIcon(analise.status)}
                              <span className="ml-1 text-xs">
                                {analise.status}
                              </span>
                            </div>
                          </div>
                          <Button size="sm" asChild>
                            <Link href={`/imobiliaria/analises/${analise.id}`}>
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
                      <Button asChild className="mt-4">
                        <Link href="/imobiliaria/analises/nova">
                          <UserPlus className="mr-2 h-4 w-4" />
                          Nova Análise
                        </Link>
                      </Button>
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
                        <Link href="/imobiliaria/analises?status=Aprovado">
                          <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                          Aprovadas
                        </Link>
                      </Button>
                      <Button asChild className="w-full" variant="outline">
                        <Link href="/imobiliaria/documentos">
                          <FileText className="mr-2 h-4 w-4" />
                          Documentos
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
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
                      <Link href="/imobiliaria/analises/nova">
                        <UserPlus className="mr-2 h-5 w-5 text-primary" />
                        <div className="text-left">
                          <div className="font-medium">Nova Análise</div>
                          <div className="text-xs text-muted-foreground">
                            Enviar nova solicitação
                          </div>
                        </div>
                      </Link>
                    </Button>

                    <Button asChild className="h-auto py-4 justify-start" variant="outline">
                      <Link href="/imobiliaria/analises?status=Aguardando">
                        <Clock className="mr-2 h-5 w-5 text-yellow-500" />
                        <div className="text-left">
                          <div className="font-medium">Pendentes</div>
                          <div className="text-xs text-muted-foreground">
                            {stats.analises.aguardando} aguardando análise
                          </div>
                        </div>
                      </Link>
                    </Button>

                    <Button asChild className="h-auto py-4 justify-start" variant="outline">
                      <Link href="/imobiliaria/documentos/upload">
                        <Upload className="mr-2 h-5 w-5 text-blue-500" />
                        <div className="text-left">
                          <div className="font-medium">Upload</div>
                          <div className="text-xs text-muted-foreground">
                            Enviar documentos
                          </div>
                        </div>
                      </Link>
                    </Button>

                    <Button asChild className="h-auto py-4 justify-start" variant="outline">
                      <Link href="/imobiliaria/perfil">
                        <Info className="mr-2 h-5 w-5 text-gray-500" />
                        <div className="text-left">
                          <div className="font-medium">Meu Perfil</div>
                          <div className="text-xs text-muted-foreground">
                            Atualizar informações
                          </div>
                        </div>
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-950">
                <CardHeader>
                  <CardTitle>Sobre a S8 Garante</CardTitle>
                  <CardDescription>
                    Sistema de Fiança Locatícia
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm">
                      Bem-vindo ao sistema da S8 Garante, sua plataforma para gerenciamento de fiança locatícia.
                    </p>
                    
                    <p className="text-sm">
                      Com a S8 Garante, você pode solicitar análises de fiança para seus locatários, acompanhar o status das solicitações, gerenciar documentos e muito mais.
                    </p>
                    
                    <div className="rounded-md bg-primary/10 p-4">
                      <h4 className="text-sm font-medium text-primary mb-2">Dicas rápidas:</h4>
                      <ul className="list-disc pl-5 space-y-1 text-xs">
                        <li>Use "Nova Análise" para enviar solicitações de fiança</li>
                        <li>Acompanhe o status de cada solicitação</li>
                        <li>Envie documentos complementares para análises aprovadas</li>
                        <li>Mantenha seus dados atualizados no perfil</li>
                      </ul>
                    </div>
                    
                    <p className="text-sm text-muted-foreground text-center">
                      Precisa de ajuda? Entre em contato com nosso suporte.
                    </p>
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