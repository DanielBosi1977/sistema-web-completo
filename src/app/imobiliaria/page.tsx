'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth-context';
import { Loader2, FileText, UserPlus, CheckCircle, XCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ImobiliariaDashboard() {
  const { user } = useAuth();
  const [resumo, setResumo] = useState({
    total: 0,
    aguardando: 0,
    aprovados: 0,
    rejeitados: 0,
  });
  const [analises, setAnalises] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      carregarDados();
    }
  }, [user]);

  const carregarDados = async () => {
    setIsLoading(true);
    try {
      // Buscar análises da imobiliária
      const { data, error } = await supabase
        .from('analises')
        .select('*')
        .eq('imobiliaria_id', user?.id)
        .order('data_envio', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      
      setAnalises(data || []);
      
      // Calcular resumo
      const total = data?.length || 0;
      const aguardando = data?.filter((a: any) => a.status === 'Aguardando').length || 0;
      const aprovados = data?.filter((a: any) => a.status === 'Aprovado').length || 0;
      const rejeitados = data?.filter((a: any) => a.status === 'Rejeitado').length || 0;
      
      setResumo({ total, aguardando, aprovados, rejeitados });
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard da Imobiliária</h1>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Análises
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resumo.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Aguardando
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resumo.aguardando}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Aprovados
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resumo.aprovados}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Rejeitados
              </CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resumo.rejeitados}</div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Análises Recentes</CardTitle>
              <CardDescription>
                Últimas análises enviadas pela sua imobiliária
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : analises.length > 0 ? (
                <div className="space-y-4">
                  {analises.map((analise: any) => (
                    <div key={analise.id} className="flex items-center justify-between border-b pb-4">
                      <div>
                        <p className="font-medium">{analise.nome_locatario}</p>
                        <p className="text-sm text-muted-foreground">
                          Plano: {analise.plano}
                        </p>
                        <div className="mt-1">
                          {analise.status === 'Aguardando' && (
                            <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                              <Clock className="mr-1 h-3 w-3" />
                              Aguardando
                            </span>
                          )}
                          {analise.status === 'Aprovado' && (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Aprovado
                            </span>
                          )}
                          {analise.status === 'Rejeitado' && (
                            <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                              <XCircle className="mr-1 h-3 w-3" />
                              Rejeitado
                            </span>
                          )}
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
                <p className="py-4 text-center text-muted-foreground">
                  Nenhuma análise encontrada. Comece enviando uma nova análise.
                </p>
              )}
              
              <div className="mt-4 flex justify-center">
                <Button asChild>
                  <Link href="/imobiliaria/analises/nova">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Nova Análise
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Bem-vindo à S8 Garante</CardTitle>
              <CardDescription>
                Sistema de gestão de fiança locatícia
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Use nosso sistema para gerenciar todas as suas análises de locatários e documentos
                relacionados à fiança locatícia.
              </p>
              
              <div className="space-y-2">
                <h3 className="font-medium">Principais recursos:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Envio de análises de locatários</li>
                  <li>Acompanhamento do status de cada análise</li>
                  <li>Upload de documentos complementares</li>
                  <li>Histórico completo de fiança locatícia</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Links rápidos:</h3>
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href="/imobiliaria/analises/nova">Nova Análise</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/imobiliaria/analises">Ver Todas Análises</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/imobiliaria/documentos">Gerenciar Documentos</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}