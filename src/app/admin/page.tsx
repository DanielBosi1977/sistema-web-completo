'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth-context';
import { Loader2, FileText, Building, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [resumoAnalises, setResumoAnalises] = useState({
    total: 0,
    aguardando: 0,
    aprovados: 0,
    rejeitados: 0,
  });
  const [resumoImobiliarias, setResumoImobiliarias] = useState({
    total: 0,
    ativas: 0,
  });
  const [analises, setAnalises] = useState<any[]>([]);
  const [imobiliarias, setImobiliarias] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      carregarDados();
    }
  }, [user]);

  const carregarDados = async () => {
    setIsLoading(true);
    try {
      // Buscar análises
      const { data: analisesData, error: analisesError } = await supabase
        .from('analises')
        .select('*')
        .order('data_envio', { ascending: false })
        .limit(5);
      
      if (analisesError) throw analisesError;
      
      setAnalises(analisesData || []);
      
      // Buscar imobiliárias
      const { data: imobiliariasData, error: imobiliariasError } = await supabase
        .from('profiles')
        .select('*')
        .eq('tipo_usuario', 'imobiliaria')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (imobiliariasError) throw imobiliariasError;
      
      setImobiliarias(imobiliariasData || []);
      
      // Calcular resumos
      const totalAnalises = analisesData?.length || 0;
      const aguardando = analisesData?.filter((a: any) => a.status === 'Aguardando').length || 0;
      const aprovados = analisesData?.filter((a: any) => a.status === 'Aprovado').length || 0;
      const rejeitados = analisesData?.filter((a: any) => a.status === 'Rejeitado').length || 0;
      
      setResumoAnalises({ 
        total: totalAnalises, 
        aguardando, 
        aprovados, 
        rejeitados 
      });
      
      const totalImobiliarias = imobiliariasData?.length || 0;
      const ativas = imobiliariasData?.filter((i: any) => i.senha_alterada).length || 0;
      
      setResumoImobiliarias({
        total: totalImobiliarias,
        ativas,
      });
      
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
        <h1 className="text-2xl font-bold tracking-tight">Dashboard Administrativo</h1>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Análises
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resumoAnalises.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Análises Pendentes
              </CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resumoAnalises.aguardando}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Imobiliárias
              </CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resumoImobiliarias.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Imobiliárias Ativas
              </CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resumoImobiliarias.ativas}</div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Análises Recentes</CardTitle>
                <CardDescription>
                  Últimas análises recebidas no sistema
                </CardDescription>
              </div>
              <Button asChild size="sm">
                <Link href="/admin/analises">Ver todas</Link>
              </Button>
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
                        <Link href={`/admin/analises/${analise.id}`}>
                          Ver detalhes
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-4 text-center text-muted-foreground">
                  Nenhuma análise encontrada no sistema.
                </p>
              )}
            </CardContent>
          </Card>
          
          <Card className="col-span-1">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Imobiliárias Recentes</CardTitle>
                <CardDescription>
                  Últimas imobiliárias cadastradas
                </CardDescription>
              </div>
              <Button asChild size="sm">
                <Link href="/admin/imobiliarias">Ver todas</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : imobiliarias.length > 0 ? (
                <div className="space-y-4">
                  {imobiliarias.map((imobiliaria: any) => (
                    <div key={imobiliaria.id} className="flex items-center justify-between border-b pb-4">
                      <div>
                        <p className="font-medium">{imobiliaria.nome_empresa || 'Sem nome'}</p>
                        <p className="text-sm text-muted-foreground">
                          {imobiliaria.email}
                        </p>
                        <div className="mt-1">
                          {imobiliaria.senha_alterada ? (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Ativa
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                              <Clock className="mr-1 h-3 w-3" />
                              Pendente
                            </span>
                          )}
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
                <p className="py-4 text-center text-muted-foreground">
                  Nenhuma imobiliária cadastrada no sistema.
                </p>
              )}
              
              <div className="mt-4 flex justify-center">
                <Button asChild>
                  <Link href="/admin/imobiliarias/nova">
                    <Building className="mr-2 h-4 w-4" />
                    Nova Imobiliária
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}