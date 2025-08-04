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
  CheckCircle, 
  Clock, 
  Download, 
  FileText,
  Loader2, 
  UploadCloud, 
  XCircle
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

export default function AnaliseDetalhesPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [analise, setAnalise] = useState<any>(null);
  const [imobiliaria, setImobiliaria] = useState<any>(null);
  const [documentos, setDocumentos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showDecisaoDialog, setShowDecisaoDialog] = useState(false);
  const [decisao, setDecisao] = useState<'Aprovado' | 'Rejeitado' | null>(null);
  const [observacoes, setObservacoes] = useState('');

  useEffect(() => {
    if (user) {
      carregarDados();
    }
  }, [user, params.id]);

  const carregarDados = async () => {
    setIsLoading(true);
    try {
      // Buscar detalhes da análise
      let query = supabase
        .from('analises')
        .select('*')
        .eq('id', params.id);
      
      // Se não for admin, filtrar por imobiliária
      if (!isAdmin) {
        query = query.eq('imobiliaria_id', user?.id);
      }
      
      const { data, error } = await query.single();
      
      if (error) throw error;
      if (!data) {
        toast.error('Análise não encontrada');
        if (isAdmin) {
          router.push('/admin/analises');
        } else {
          router.push('/imobiliaria/analises');
        }
        return;
      }
      
      setAnalise(data);
      
      // Buscar dados da imobiliária (só para admin)
      if (isAdmin) {
        const { data: imobiliariaData, error: imobiliariaError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.imobiliaria_id)
          .single();
        
        if (!imobiliariaError) {
          setImobiliaria(imobiliariaData);
        }
      }
      
      // Buscar documentos relacionados
      const { data: docs, error: docsError } = await supabase
        .from('documentos')
        .select('*')
        .eq('analise_id', params.id)
        .order('data_upload', { ascending: false });
      
      if (docsError) throw docsError;
      
      setDocumentos(docs || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados da análise');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (documento: any) => {
    try {
      const { data, error } = await supabase
        .storage
        .from('documentos')
        .download(documento.caminho);
      
      if (error) throw error;
      
      // Criar URL para download
      const url = URL.createObjectURL(data);
      
      // Criar link e simular clique
      const a = document.createElement('a');
      a.href = url;
      a.download = documento.nome;
      document.body.appendChild(a);
      a.click();
      
      // Limpar
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao baixar documento:', error);
      toast.error('Erro ao baixar documento');
    }
  };

  const handleDecisaoClick = (tipoDecisao: 'Aprovado' | 'Rejeitado') => {
    setDecisao(tipoDecisao);
    setShowDecisaoDialog(true);
  };

  const confirmarDecisao = async () => {
    if (!decisao) return;
    
    setIsSaving(true);
    
    try {
      // Atualizar status da análise
      const { error } = await supabase
        .from('analises')
        .update({
          status: decisao,
          data_decisao: new Date().toISOString(),
          admin_decisao: user!.id,
          observacoes: observacoes || null
        })
        .eq('id', params.id);
      
      if (error) throw error;
      
      toast.success(`Análise ${decisao === 'Aprovado' ? 'aprovada' : 'rejeitada'} com sucesso`);
      setShowDecisaoDialog(false);
      
      // Recarregar dados
      await carregarDados();
    } catch (error) {
      console.error('Erro ao salvar decisão:', error);
      toast.error('Erro ao salvar decisão');
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Aguardando':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'Aprovado':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'Rejeitado':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Aguardando':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'Aprovado':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'Rejeitado':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
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

  if (!analise) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <Button
            variant="outline"
            onClick={() => router.push(isAdmin ? '/admin/analises' : '/imobiliaria/analises')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Análises
          </Button>
          
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>
              Análise não encontrada ou você não tem permissão para visualizá-la.
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <Button
            variant="outline"
            onClick={() => router.push(isAdmin ? '/admin/analises' : '/imobiliaria/analises')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Análises
          </Button>
          
          <div className={`flex items-center gap-2 rounded-md border px-3 py-1.5 ${getStatusClass(analise.status)}`}>
            {getStatusIcon(analise.status)}
            <span className="font-medium">Status: {analise.status}</span>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Dados do Locatário</CardTitle>
              <CardDescription>
                Informações pessoais e detalhes da solicitação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Nome Completo</p>
                <p className="font-medium">{analise.nome_locatario}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">CPF</p>
                <p>{analise.cpf_locatario}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">E-mail</p>
                  <p>{analise.email_locatario || 'Não informado'}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Telefone</p>
                  <p>{analise.telefone_locatario || 'Não informado'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Renda Comprovada</p>
                  <p>{analise.renda_comprovada ? formatCurrency(analise.renda_comprovada) : 'Não informada'}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Plano</p>
                  <p className="font-medium">{analise.plano}</p>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Data de Envio</p>
                <p>{formatDate(analise.data_envio)}</p>
              </div>
              
              {analise.data_decisao && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Data da Decisão</p>
                  <p>{formatDate(analise.data_decisao)}</p>
                </div>
              )}
              
              {isAdmin && imobiliaria && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium mb-2">Dados da Imobiliária</p>
                  <p className="font-medium">{imobiliaria.nome_empresa || 'Nome não informado'}</p>
                  <p className="text-sm">{imobiliaria.email}</p>
                  <p className="text-sm">{imobiliaria.telefone || 'Telefone não informado'}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                  >
                    <a href={`/admin/imobiliarias/${imobiliaria.id}`}>
                      Ver perfil da imobiliária
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Documentos</CardTitle>
              <CardDescription>
                Documentos relacionados a esta análise
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Documentos enviados:</h4>
                {documentos.length > 0 ? (
                  <div className="space-y-2">
                    {documentos.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between border rounded-md p-3">
                        <div>
                          <p className="font-medium text-sm">{doc.nome}</p>
                          <p className="text-xs text-muted-foreground">
                            {doc.tipo} • {formatDate(doc.data_upload)}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(doc)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm py-2">
                    Nenhum documento enviado.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {isAdmin && analise.status === 'Aguardando' && (
          <Card>
            <CardHeader>
              <CardTitle>Decisão</CardTitle>
              <CardDescription>
                Aprovar ou rejeitar esta análise de fiança
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  Após analisar os documentos e informações do locatário, você pode aprovar ou
                  rejeitar esta solicitação de fiança locatícia.
                </p>
                
                <div className="flex space-x-4">
                  <Button
                    onClick={() => handleDecisaoClick('Aprovado')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Aprovar
                  </Button>
                  
                  <Button
                    onClick={() => handleDecisaoClick('Rejeitado')}
                    variant="destructive"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Rejeitar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {analise.status === 'Aprovado' && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Análise Aprovada</AlertTitle>
            <AlertDescription>
              Esta análise foi aprovada em {formatDate(analise.data_decisao)}.
              {analise.observacoes && (
                <p className="mt-2 italic">{analise.observacoes}</p>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        {analise.status === 'Rejeitado' && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Análise Rejeitada</AlertTitle>
            <AlertDescription>
              Esta análise foi rejeitada em {formatDate(analise.data_decisao)}.
              {analise.observacoes && (
                <p className="mt-2 italic">{analise.observacoes}</p>
              )}
            </AlertDescription>
          </Alert>
        )}
      </div>
      
      {/* Dialog de confirmação de decisão */}
      <Dialog open={showDecisaoDialog} onOpenChange={setShowDecisaoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {decisao === 'Aprovado' ? 'Aprovar Análise' : 'Rejeitar Análise'}
            </DialogTitle>
            <DialogDescription>
              {decisao === 'Aprovado'
                ? 'Confirme a aprovação desta análise de fiança locatícia.'
                : 'Confirme a rejeição desta análise de fiança locatícia.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <p className="text-sm font-medium">Observações (opcional)</p>
              <Textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Adicione observações ou motivos para esta decisão..."
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDecisaoDialog(false)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmarDecisao}
              disabled={isSaving}
              className={decisao === 'Aprovado' ? 'bg-green-600 hover:bg-green-700' : ''}
              variant={decisao === 'Rejeitado' ? 'destructive' : 'default'}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  {decisao === 'Aprovado' ? (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  ) : (
                    <XCircle className="mr-2 h-4 w-4" />
                  )}
                  Confirmar {decisao === 'Aprovado' ? 'Aprovação' : 'Rejeição'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}