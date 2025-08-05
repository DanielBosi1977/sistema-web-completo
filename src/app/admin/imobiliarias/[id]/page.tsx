'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  AlertCircle,
  ArrowLeft, 
  Building,
  CheckCircle, 
  Clock, 
  FileText,
  Loader2, 
  Mail,
  Phone,
  MapPin,
  XCircle
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function ImobiliariaDetalhesPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [imobiliaria, setImobiliaria] = useState<any>(null);
  const [analises, setAnalises] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      carregarDados();
    }
  }, [user, params.id]);

  const carregarDados = async () => {
    setIsLoading(true);
    try {
      // Buscar detalhes da imobiliária
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', params.id)
        .eq('tipo_usuario', 'imobiliaria')
        .single();
      
      if (error) throw error;
      if (!data) {
        toast.error('Imobiliária não encontrada');
        router.push('/admin/imobiliarias');
        return;
      }
      
      setImobiliaria(data);
      
      // Buscar análises da imobiliária
      const { data: analisesData, error: analisesError } = await supabase
        .from('analises')
        .select('*')
        .eq('imobiliaria_id', params.id)
        .order('data_envio', { ascending: false })
        .limit(10);
      
      if (analisesError) throw analisesError;
      
      setAnalises(analisesData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados da imobiliária');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!imobiliaria) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/imobiliarias')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Imobiliárias
          </Button>
          
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>
              Imobiliária não encontrada ou você não tem permissão para visualizá-la.
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/imobiliarias')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Imobiliárias
          </Button>
          
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
              imobiliaria.senha_alterada 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {imobiliaria.senha_alterada ? (
                <>
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Ativa
                </>
              ) : (
                <>
                  <Clock className="mr-1 h-3 w-3" />
                  Pendente
                </>
              )}
            </span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      {imobiliaria.nome_empresa || 'Nome não informado'}
                    </CardTitle>
                    <CardDescription>
                      Detalhes da imobiliária
                    </CardDescription>
                  </div>
                  <Building className="h-6 w-6 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="informacoes">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="informacoes">Informações</TabsTrigger>
                    <TabsTrigger value="endereco">Endereço</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="informacoes" className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Responsável</p>
                        <p className="font-medium">{imobiliaria.nome_responsavel || 'Não informado'}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">CNPJ</p>
                        <p>{imobiliaria.cnpj || 'Não informado'}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">E-mail</p>
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-1 text-muted-foreground" />
                          <p>{imobiliaria.email}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Telefone</p>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-1 text-muted-foreground" />
                          <p>{imobiliaria.telefone || 'Não informado'}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Data de Cadastro</p>
                        <p>{formatDate(imobiliaria.created_at)}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Última Atualização</p>
                        <p>{formatDate(imobiliaria.updated_at)}</p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="endereco" className="space-y-4 pt-4">
                    {imobiliaria.rua || imobiliaria.cidade || imobiliaria.estado ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">Endereço</p>
                          <div className="flex items-start">
                            <MapPin className="h-4 w-4 mr-1 mt-0.5 text-muted-foreground" />
                            <p>
                              {[
                                imobiliaria.rua && `${imobiliaria.rua}, ${imobiliaria.numero || 'S/N'}`,
                                imobiliaria.complemento,
                                imobiliaria.bairro,
                              ].filter(Boolean).join(', ')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">Cidade/Estado</p>
                          <p>
                            {[
                              imobiliaria.cidade,
                              imobiliaria.estado,
                            ].filter(Boolean).join(' - ')}
                          </p>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">CEP</p>
                          <p>{imobiliaria.cep || 'Não informado'}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="py-6 text-center">
                        <p className="text-muted-foreground">Endereço não informado</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Status da Conta</CardTitle>
              <CardDescription>
                Informações sobre a conta do usuário
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Status da Conta</p>
                <div className={`p-3 rounded-md ${
                  imobiliaria.senha_alterada 
                    ? 'bg-green-50 text-green-800' 
                    : 'bg-yellow-50 text-yellow-800'
                }`}>
                  <div className="flex items-center">
                    {imobiliaria.senha_alterada ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        <span>Conta ativa</span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-4 w-4 mr-2" />
                        <span>Aguardando primeiro acesso</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs mt-1">
                    {imobiliaria.senha_alterada 
                      ? `Último acesso em ${formatDate(imobiliaria.data_alteracao_senha)}` 
                      : 'O usuário ainda não alterou a senha inicial.'}
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-2">Ações</p>
                <Button size="sm" className="w-full" variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar e-mail
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Análises da Imobiliária</CardTitle>
            <CardDescription>
              Últimas análises enviadas por esta imobiliária
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analises.length > 0 ? (
              <div className="space-y-4">
                {analises.map((analise) => (
                  <div key={analise.id} className="flex items-center justify-between border-b pb-4">
                    <div>
                      <p className="font-medium">{analise.nome_locatario}</p>
                      <p className="text-sm text-muted-foreground">
                        Plano: {analise.plano}
                      </p>
                      <div className="mt-1">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          analise.status === 'Aprovado' 
                            ? 'bg-green-100 text-green-800'
                            : analise.status === 'Rejeitado'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {analise.status}
                        </span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <a href={`/admin/analises/${analise.id}`}>
                        Ver detalhes
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">
                  Nenhuma análise encontrada para esta imobiliária.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}