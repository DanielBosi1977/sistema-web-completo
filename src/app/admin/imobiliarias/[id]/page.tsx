'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  AlertCircle,
  ArrowLeft, 
  Building, 
  Loader2, 
  Mail, 
  MapPin, 
  Phone,
  RotateCcw,
  Save,
  User
} from 'lucide-react';
import { formatDate, formatPhone, formatCNPJ } from '@/lib/utils';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';

export default function ImobiliariaDetalhesPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [imobiliaria, setImobiliaria] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [ufs, setUfs] = useState<{sigla: string, nome: string}[]>([]);
  const [cidades, setCidades] = useState<string[]>([]);
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
  const [novaSenha, setNovaSenha] = useState('');
  const [analises, setAnalises] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    aguardando: 0,
    aprovadas: 0,
    rejeitadas: 0
  });
  
  const [formData, setFormData] = useState({
    nome_empresa: '',
    cnpj: '',
    email: '',
    telefone: '',
    nome_responsavel: '',
    cep: '',
    estado: '',
    cidade: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
  });

  useEffect(() => {
    if (user) {
      carregarDados();
      carregarUFs();
    }
  }, [user, params.id]);
  
  useEffect(() => {
    if (formData.estado) {
      carregarCidades(formData.estado);
    }
  }, [formData.estado]);

  const carregarDados = async () => {
    setIsLoading(true);
    try {
      // Buscar dados da imobiliária
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
      setFormData({
        nome_empresa: data.nome_empresa || '',
        cnpj: data.cnpj || '',
        email: data.email || '',
        telefone: data.telefone || '',
        nome_responsavel: data.nome_responsavel || '',
        cep: data.cep || '',
        estado: data.estado || '',
        cidade: data.cidade || '',
        rua: data.rua || '',
        numero: data.numero || '',
        complemento: data.complemento || '',
        bairro: data.bairro || '',
      });
      
      // Buscar análises da imobiliária
      const { data: analisesData, error: analisesError } = await supabase
        .from('analises')
        .select('*')
        .eq('imobiliaria_id', params.id)
        .order('data_envio', { ascending: false });
      
      if (analisesError) throw analisesError;
      
      setAnalises(analisesData || []);
      
      // Calcular estatísticas
      const total = analisesData?.length || 0;
      const aguardando = analisesData?.filter(a => a.status === 'Aguardando').length || 0;
      const aprovadas = analisesData?.filter(a => a.status === 'Aprovado').length || 0;
      const rejeitadas = analisesData?.filter(a => a.status === 'Rejeitado').length || 0;
      
      setStats({
        total,
        aguardando,
        aprovadas,
        rejeitadas
      });
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados da imobiliária');
    } finally {
      setIsLoading(false);
    }
  };
  
  const carregarUFs = async () => {
    try {
      const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome');
      const data = await response.json();
      setUfs(data);
    } catch (error) {
      console.error('Erro ao buscar estados:', error);
    }
  };
  
  const carregarCidades = async (uf: string) => {
    if (!uf) return;
    
    try {
      const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`);
      const data = await response.json();
      setCidades(data.map((city: any) => city.nome));
    } catch (error) {
      console.error('Erro ao buscar cidades:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleCepBlur = async () => {
    const cep = formData.cep.replace(/\D/g, '');
    
    if (cep.length !== 8) return;
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          rua: data.logradouro,
          bairro: data.bairro,
          cidade: data.localidade,
          estado: data.uf,
        }));
        
        carregarCidades(data.uf);
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    }
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    
    try {
      // Validar campos obrigatórios
      if (!formData.nome_empresa || !formData.cnpj || !formData.email || !formData.telefone || !formData.nome_responsavel) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }
      
      // Atualizar dados da imobiliária
      const { error } = await supabase
        .from('profiles')
        .update({
          nome_empresa: formData.nome_empresa,
          cnpj: formData.cnpj,
          telefone: formData.telefone,
          nome_responsavel: formData.nome_responsavel,
          cep: formData.cep,
          estado: formData.estado,
          cidade: formData.cidade,
          rua: formData.rua,
          numero: formData.numero,
          complemento: formData.complemento,
          bairro: formData.bairro,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id);
      
      if (error) throw error;
      
      // Recarregar dados
      await carregarDados();
      
      toast.success('Dados da imobiliária atualizados com sucesso');
    } catch (error) {
      console.error('Erro ao salvar alterações:', error);
      toast.error('Erro ao salvar alterações');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetPassword = async () => {
    setShowResetPasswordDialog(true);
    
    try {
      // Gerar nova senha aleatória
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';
      let password = '';
      for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      setNovaSenha(password);
      
      // Em um sistema real, isso também enviaria um e-mail para o usuário
    } catch (error) {
      console.error('Erro ao gerar nova senha:', error);
      toast.error('Erro ao redefinir senha');
    }
  };

  const confirmarResetSenha = async () => {
    try {
      // Em um sistema real, isso atualizaria a senha no Auth e enviaria um e-mail
      // Por enquanto, apenas simulamos o processo
      
      // Atualizar status de senha
      const { error } = await supabase
        .from('profiles')
        .update({
          senha_alterada: false,
          data_alteracao_senha: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id);
      
      if (error) throw error;
      
      toast.success('Senha redefinida com sucesso');
      setShowResetPasswordDialog(false);
      
      // Recarregar dados
      await carregarDados();
    } catch (error) {
      console.error('Erro ao confirmar reset de senha:', error);
      toast.error('Erro ao redefinir senha');
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
              Imobiliária não encontrada.
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
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {imobiliaria.nome_empresa || 'Imobiliária'}
            </h2>
            <p className="text-muted-foreground">
              Gerenciar dados da imobiliária
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push('/admin/imobiliarias')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Informações</CardTitle>
              <CardDescription>
                Detalhes da imobiliária
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Building className="h-10 w-10 text-muted-foreground" />
                <div>
                  <p className="font-medium">{imobiliaria.nome_empresa || 'Não informado'}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCNPJ(imobiliaria.cnpj) || 'CNPJ não informado'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-3 pt-2">
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{imobiliaria.nome_responsavel || 'Responsável não informado'}</p>
                </div>
                <div className="flex items-center">
                  <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{imobiliaria.email}</p>
                </div>
                <div className="flex items-center">
                  <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{formatPhone(imobiliaria.telefone) || 'Telefone não informado'}</p>
                </div>
                {imobiliaria.cidade && imobiliaria.estado && (
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{imobiliaria.cidade} - {imobiliaria.estado}</p>
                  </div>
                )}
              </div>
              
              <div className="pt-2">
                <p className="text-sm font-medium">Status da Conta</p>
                <p className="text-sm mt-1">
                  {imobiliaria.senha_alterada 
                    ? 'Ativa (senha alterada)' 
                    : 'Pendente (senha não alterada)'}
                </p>
                {imobiliaria.data_alteracao_senha && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Última alteração: {formatDate(imobiliaria.data_alteracao_senha)}
                  </p>
                )}
              </div>
              
              <div className="pt-2">
                <p className="text-sm font-medium">Criado em</p>
                <p className="text-sm">{formatDate(imobiliaria.created_at)}</p>
              </div>
              
              <div className="pt-2">
                <Button 
                  variant="outline" 
                  className="w-full mt-2"
                  onClick={handleResetPassword}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Redefinir Senha
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="md:col-span-3 space-y-6">
            <Tabs defaultValue="dados">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="dados">Dados da Imobiliária</TabsTrigger>
                <TabsTrigger value="analises">Análises ({stats.total})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="dados" className="space-y-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Dados Básicos</CardTitle>
                    <CardDescription>
                      Informações básicas da imobiliária
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome_empresa">Nome da Imobiliária *</Label>
                      <Input
                        id="nome_empresa"
                        name="nome_empresa"
                        value={formData.nome_empresa}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cnpj">CNPJ *</Label>
                      <Input
                        id="cnpj"
                        name="cnpj"
                        value={formData.cnpj}
                        onChange={handleInputChange}
                        placeholder="00.000.000/0000-00"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        O e-mail não pode ser alterado pois é usado para autenticação
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="telefone">Telefone *</Label>
                      <Input
                        id="telefone"
                        name="telefone"
                        value={formData.telefone}
                        onChange={handleInputChange}
                        placeholder="(00) 00000-0000"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="nome_responsavel">Nome do Responsável *</Label>
                      <Input
                        id="nome_responsavel"
                        name="nome_responsavel"
                        value={formData.nome_responsavel}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Endereço</CardTitle>
                    <CardDescription>
                      Endereço da imobiliária
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cep">CEP</Label>
                      <Input
                        id="cep"
                        name="cep"
                        value={formData.cep}
                        onChange={handleInputChange}
                        onBlur={handleCepBlur}
                        placeholder="00000-000"
                      />
                    </div>
                    
                    <div className="grid gap-4 grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="estado">Estado (UF)</Label>
                        <Select
                          value={formData.estado}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, estado: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {ufs.map((uf) => (
                              <SelectItem key={uf.sigla} value={uf.sigla}>
                                {uf.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="cidade">Cidade</Label>
                        <Select
                          value={formData.cidade}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, cidade: value }))}
                          disabled={!formData.estado || cidades.length === 0}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {cidades.map((cidade) => (
                              <SelectItem key={cidade} value={cidade}>
                                {cidade}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="rua">Rua/Avenida</Label>
                      <Input
                        id="rua"
                        name="rua"
                        value={formData.rua}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="grid gap-4 grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="numero">Número</Label>
                        <Input
                          id="numero"
                          name="numero"
                          value={formData.numero}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="complemento">Complemento</Label>
                        <Input
                          id="complemento"
                          name="complemento"
                          value={formData.complemento}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bairro">Bairro</Label>
                      <Input
                        id="bairro"
                        name="bairro"
                        value={formData.bairro}
                        onChange={handleInputChange}
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={handleSaveChanges} 
                      className="ml-auto"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Salvar Alterações
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="analises" className="space-y-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Estatísticas</CardTitle>
                    <CardDescription>
                      Resumo das análises desta imobiliária
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-muted rounded-md p-3">
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="text-2xl font-bold">{stats.total}</p>
                      </div>
                      <div className="bg-yellow-50 rounded-md p-3">
                        <p className="text-sm text-yellow-800">Aguardando</p>
                        <p className="text-2xl font-bold text-yellow-800">{stats.aguardando}</p>
                      </div>
                      <div className="bg-green-50 rounded-md p-3">
                        <p className="text-sm text-green-800">Aprovadas</p>
                        <p className="text-2xl font-bold text-green-800">{stats.aprovadas}</p>
                      </div>
                      <div className="bg-red-50 rounded-md p-3">
                        <p className="text-sm text-red-800">Rejeitadas</p>
                        <p className="text-2xl font-bold text-red-800">{stats.rejeitadas}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Análises Recentes</CardTitle>
                    <CardDescription>
                      Últimas análises enviadas por esta imobiliária
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analises.length > 0 ? (
                      <div className="space-y-4">
                        {analises.slice(0, 5).map((analise) => (
                          <div key={analise.id} className="flex items-center justify-between border-b pb-4">
                            <div>
                              <p className="font-medium">{analise.nome_locatario}</p>
                              <p className="text-sm text-muted-foreground">
                                Plano: {analise.plano} • {formatDate(analise.data_envio)}
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
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/admin/analises/${analise.id}`}>
                                Ver detalhes
                              </Link>
                            </Button>
                          </div>
                        ))}
                        
                        {analises.length > 5 && (
                          <div className="text-center pt-2">
                            <Button asChild variant="outline">
                              <Link href="/admin/analises">
                                Ver todas as análises
                              </Link>
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-center py-8 text-muted-foreground">
                        Esta imobiliária ainda não enviou nenhuma análise.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      {/* Dialog de redefinição de senha */}
      <Dialog open={showResetPasswordDialog} onOpenChange={setShowResetPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redefinir Senha</DialogTitle>
            <DialogDescription>
              Uma nova senha será gerada para esta imobiliária. O usuário precisará alterá-la no próximo login.
            </DialogDescription>
          </DialogHeader>
          {novaSenha && (
            <div className="p-4 bg-gray-100 rounded-md text-center">
              <p className="font-medium">Nova senha provisória:</p>
              <p className="text-xl font-bold mt-2">{novaSenha}</p>
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            Em um ambiente real, um e-mail seria enviado ao usuário com a nova senha. Para fins de demonstração, a senha é exibida aqui.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetPasswordDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmarResetSenha}>
              Confirmar Redefinição
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}