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
  Loader2, 
  UploadCloud, 
  XCircle
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TIPOS_DOCUMENTO } from '@/lib/constants';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

export default function AnaliseDetalhesPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [analise, setAnalise] = useState<any>(null);
  const [documentos, setDocumentos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [tipoDocumento, setTipoDocumento] = useState('');
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(null);

  useEffect(() => {
    if (user) {
      carregarDados();
    }
  }, [user, params.id]);

  const carregarDados = async () => {
    setIsLoading(true);
    try {
      // Buscar detalhes da análise
      const { data, error } = await supabase
        .from('analises')
        .select('*')
        .eq('id', params.id)
        .eq('imobiliaria_id', user?.id)
        .single();
      
      if (error) throw error;
      if (!data) {
        toast.error('Análise não encontrada');
        router.push('/imobiliaria/analises');
        return;
      }
      
      setAnalise(data);
      
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setArquivoSelecionado(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!arquivoSelecionado || !tipoDocumento) {
      toast.error('Selecione um arquivo e um tipo de documento');
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Gerar nome único para o arquivo
      const timestamp = new Date().getTime();
      const extension = arquivoSelecionado.name.split('.').pop();
      const fileName = `${params.id}/${timestamp}-${arquivoSelecionado.name}`;
      
      // Upload para o storage
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('documentos')
        .upload(fileName, arquivoSelecionado, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) throw uploadError;
      
      // Criar registro na tabela de documentos
      const { data, error } = await supabase
        .from('documentos')
        .insert({
          analise_id: params.id,
          nome: arquivoSelecionado.name,
          tipo: tipoDocumento,
          caminho: uploadData.path,
          tamanho: arquivoSelecionado.size,
          uploaded_by: user!.id
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Atualizar a lista de documentos
      setDocumentos([data, ...documentos]);
      
      // Limpar campos
      setArquivoSelecionado(null);
      setTipoDocumento('');
      
      // Resetar input de arquivo
      const fileInput = document.getElementById('documento') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      toast.success('Documento enviado com sucesso');
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao enviar documento');
    } finally {
      setIsUploading(false);
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
            onClick={() => router.push('/imobiliaria/analises')}
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
            onClick={() => router.push('/imobiliaria/analises')}
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
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Documentos</CardTitle>
              <CardDescription>
                Gerencie os documentos relacionados a esta análise
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {analise.status === 'Aprovado' && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="tipoDocumento">Tipo de Documento</Label>
                      <Select
                        value={tipoDocumento}
                        onValueChange={setTipoDocumento}
                      >
                        <SelectTrigger id="tipoDocumento">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {TIPOS_DOCUMENTO.map((tipo) => (
                            <SelectItem key={tipo} value={tipo}>
                              {tipo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="documento">Arquivo</Label>
                      <Input
                        id="documento"
                        type="file"
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleUpload}
                    disabled={isUploading || !arquivoSelecionado || !tipoDocumento}
                    className="w-full"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <UploadCloud className="mr-2 h-4 w-4" />
                        Enviar Documento
                      </>
                    )}
                  </Button>
                </div>
              )}
              
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
        
        {analise.status === 'Aprovado' && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Análise Aprovada</AlertTitle>
            <AlertDescription>
              Esta análise foi aprovada. Você pode enviar documentos adicionais para complementar o processo.
            </AlertDescription>
          </Alert>
        )}
        
        {analise.status === 'Rejeitado' && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Análise Rejeitada</AlertTitle>
            <AlertDescription>
              Esta análise foi rejeitada. Entre em contato com a S8 Garante para mais informações.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </DashboardLayout>
  );
}