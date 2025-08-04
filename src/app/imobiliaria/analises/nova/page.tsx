'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';
import { Loader2, Upload } from 'lucide-react';
import { PLANOS, TIPOS_DOCUMENTO } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';

export default function NovaAnalisePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analiseId, setAnaliseId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    nome_locatario: '',
    cpf_locatario: '',
    email_locatario: '',
    telefone_locatario: '',
    renda_comprovada: '',
    plano: '',
    observacoes: '',
  });

  const [documentos, setDocumentos] = useState<File[]>([]);
  const [tipoDocumento, setTipoDocumento] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCurrencyInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    
    if (value === '') {
      setFormData((prev) => ({ ...prev, renda_comprovada: '' }));
      return;
    }
    
    const numero = parseInt(value, 10) / 100;
    setFormData((prev) => ({ ...prev, renda_comprovada: numero.toString() }));
  };

  const handleDocumentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Converter FileList para array
      const newFiles = Array.from(e.target.files);
      setDocumentos((prev) => [...prev, ...newFiles]);
    }
  };

  const handleRemoveDocument = (index: number) => {
    setDocumentos((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!formData.nome_locatario) {
      toast.error('O nome do locatário é obrigatório');
      return false;
    }
    
    if (!formData.cpf_locatario) {
      toast.error('O CPF do locatário é obrigatório');
      return false;
    }
    
    if (!formData.plano) {
      toast.error('Selecione um plano');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Formatar renda
      const rendaFormatada = formData.renda_comprovada 
        ? parseFloat(formData.renda_comprovada) 
        : null;
      
      // Criar análise
      const { data, error } = await supabase
        .from('analises')
        .insert({
          imobiliaria_id: user.id,
          nome_locatario: formData.nome_locatario,
          cpf_locatario: formData.cpf_locatario,
          email_locatario: formData.email_locatario,
          telefone_locatario: formData.telefone_locatario,
          renda_comprovada: rendaFormatada,
          plano: formData.plano,
          status: 'Aguardando',
          data_envio: new Date().toISOString(),
        })
        .select('id')
        .single();
      
      if (error) throw error;
      
      setAnaliseId(data.id);
      toast.success('Análise criada com sucesso');
      
      // Se tiver documentos, fazer upload
      if (documentos.length > 0) {
        await uploadDocumentos(data.id);
      } else {
        router.push('/imobiliaria/analises');
      }
      
    } catch (error) {
      console.error('Erro ao criar análise:', error);
      toast.error('Erro ao criar análise');
    } finally {
      setIsLoading(false);
    }
  };

  const uploadDocumentos = async (analiseId: string) => {
    setIsUploading(true);
    let uploadedCount = 0;
    
    try {
      for (const documento of documentos) {
        // Gerar nome único para o arquivo
        const timestamp = new Date().getTime();
        const extension = documento.name.split('.').pop();
        const fileName = `${analiseId}/${timestamp}-${documento.name}`;
        
        // Upload para o storage
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('documentos')
          .upload(fileName, documento, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (uploadError) throw uploadError;
        
        // Criar registro na tabela de documentos
        const { error: docError } = await supabase
          .from('documentos')
          .insert({
            analise_id: analiseId,
            nome: documento.name,
            tipo: tipoDocumento || 'Outro',
            caminho: uploadData.path,
            tamanho: documento.size,
            uploaded_by: user!.id
          });
        
        if (docError) throw docError;
        
        uploadedCount++;
        setUploadProgress(Math.round((uploadedCount / documentos.length) * 100));
      }
      
      toast.success('Documentos enviados com sucesso');
      router.push('/imobiliaria/analises');
      
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao enviar documentos');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Nova Análise de Locatário</h2>
          <p className="text-muted-foreground">
            Preencha os dados do locatário para solicitar uma análise de fiança
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Dados do Locatário</CardTitle>
                <CardDescription>
                  Informações pessoais do locatário para análise
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome_locatario">Nome Completo *</Label>
                  <Input
                    id="nome_locatario"
                    name="nome_locatario"
                    value={formData.nome_locatario}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cpf_locatario">CPF *</Label>
                  <Input
                    id="cpf_locatario"
                    name="cpf_locatario"
                    value={formData.cpf_locatario}
                    onChange={handleInputChange}
                    placeholder="000.000.000-00"
                    required
                  />
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email_locatario">E-mail</Label>
                    <Input
                      id="email_locatario"
                      name="email_locatario"
                      type="email"
                      value={formData.email_locatario}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="telefone_locatario">Telefone</Label>
                    <Input
                      id="telefone_locatario"
                      name="telefone_locatario"
                      value={formData.telefone_locatario}
                      onChange={handleInputChange}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="renda_comprovada">Renda Comprovada (R$)</Label>
                  <Input
                    id="renda_comprovada"
                    name="renda_comprovada"
                    value={formData.renda_comprovada ? formatCurrency(parseFloat(formData.renda_comprovada)) : ''}
                    onChange={handleCurrencyInput}
                    placeholder="R$ 0,00"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="plano">Plano Desejado *</Label>
                  <Select
                    value={formData.plano}
                    onValueChange={(value) => handleSelectChange('plano', value)}
                    required
                  >
                    <SelectTrigger id="plano">
                      <SelectValue placeholder="Selecione um plano" />
                    </SelectTrigger>
                    <SelectContent>
                      {PLANOS.map((plano) => (
                        <SelectItem key={plano} value={plano}>
                          {plano}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    name="observacoes"
                    value={formData.observacoes}
                    onChange={handleInputChange}
                    placeholder="Informações adicionais relevantes para a análise"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Documentos</CardTitle>
                <CardDescription>
                  Envie os documentos necessários para análise
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                    <div className="flex items-center gap-2">
                      <Input
                        id="documento"
                        type="file"
                        onChange={handleDocumentSelect}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
                
                {documentos.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Documentos selecionados:</h4>
                    <ul className="space-y-2">
                      {documentos.map((doc, index) => (
                        <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span className="text-sm truncate">{doc.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveDocument(index)}
                          >
                            Remover
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/imobiliaria/analises')}
                disabled={isLoading || isUploading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading || isUploading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando análise...
                  </>
                ) : isUploading ? (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Enviando documentos ({uploadProgress}%)
                  </>
                ) : (
                  'Enviar Análise'
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}