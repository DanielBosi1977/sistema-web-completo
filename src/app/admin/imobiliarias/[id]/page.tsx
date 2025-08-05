'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import { ArrowLeft, Building, Loader2 } from 'lucide-react';

export default function ImobiliariaDetalhesPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [imobiliaria, setImobiliaria] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      carregarDados();
    }
  }, [user, params.id]);

  const carregarDados = async () => {
    setIsLoading(true);
    try {
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
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
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
          
          <Card>
            <CardContent className="py-8 text-center">
              <p>Imobiliária não encontrada ou você não tem permissão para visualizá-la.</p>
            </CardContent>
          </Card>
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
        </div>

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
              <Building className="h-6 w-6" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">E-mail</p>
                <p>{imobiliaria.email}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium">Responsável</p>
                <p>{imobiliaria.nome_responsavel || 'Não informado'}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium">CNPJ</p>
                <p>{imobiliaria.cnpj || 'Não informado'}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium">Telefone</p>
                <p>{imobiliaria.telefone || 'Não informado'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}