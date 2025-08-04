'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDate, formatPhone, formatCNPJ } from '@/lib/utils';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

export default function PerfilPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [ufs, setUfs] = useState<{sigla: string, nome: string}[]>([]);
  const [cidades, setCidades] = useState<string[]>([]);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  
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
    if (user && profile) {
      setFormData({
        nome_empresa: profile.nome_empresa || '',
        cnpj: profile.cnpj || '',
        email: profile.email || '',
        telefone: profile.telefone || '',
        nome_responsavel: profile.nome_responsavel || '',
        cep: profile.cep || '',
        estado: profile.estado || '',
        cidade: profile.cidade || '',
        rua: profile.rua || '',
        numero: profile.numero || '',
        complemento: profile.complemento || '',
        bairro: profile.bairro || '',
      });
      
      carregarUFs();
      
      if (profile.estado) {
        carregarCidades(profile.estado);
      }
    }
  }, [user, profile]);
  
  useEffect(() => {
    if (formData.estado && formData.estado !== profile?.estado) {
      carregarCidades(formData.estado);
    }
  }, [formData.estado, profile]);

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
      if (!formData.nome_empresa || !formData.cnpj || !formData.telefone || !formData.nome_responsavel) {
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
        .eq('id', user!.id);
      
      if (error) throw error;
      
      // Atualizar dados no context
      await refreshProfile();
      
      toast.success('Perfil atualizado com sucesso');
    } catch (error) {
      console.error('Erro ao salvar alterações:', error);
      toast.error('Erro ao salvar alterações');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setIsLoading(true);
    
    try {
      // Validações
      if (!senhaAtual || !novaSenha || !confirmarSenha) {
        toast.error('Todos os campos são obrigatórios');
        return;
      }
      
      if (novaSenha !== confirmarSenha) {
        toast.error('As novas senhas não coincidem');
        return;
      }
      
      if (novaSenha.length < 8) {
        toast.error('A nova senha deve ter pelo menos 8 caracteres');
        return;
      }
      
      // Verificar senha atual
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user!.email!,
        password: senhaAtual,
      });
      
      if (signInError) {
        toast.error('Senha atual incorreta');
        return;
      }
      
      // Atualizar senha
      const { error } = await supabase.auth.updateUser({
        password: novaSenha,
      });
      
      if (error) throw error;
      
      // Atualizar flag no perfil
      await supabase
        .from('profiles')
        .update({
          senha_alterada: true,
          data_alteracao_senha: new Date().toISOString(),
        })
        .eq('id', user!.id);
      
      // Limpar campos
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
      
      toast.success('Senha alterada com sucesso');
      
      // Atualizar perfil no context
      await refreshProfile();
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      toast.error('Erro ao alterar senha');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Meu Perfil</h2>
          <p className="text-muted-foreground">
            Gerencie suas informações e preferências
          </p>
        </div>
        
        <Tabs defaultValue="dados">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dados">Dados da Imobiliária</TabsTrigger>
            <TabsTrigger value="senha">Alterar Senha</TabsTrigger>
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
          
          <TabsContent value="senha" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Alterar Senha</CardTitle>
                <CardDescription>
                  Atualize sua senha de acesso ao sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="senhaAtual">Senha Atual</Label>
                  <Input
                    id="senhaAtual"
                    type="password"
                    value={senhaAtual}
                    onChange={(e) => setSenhaAtual(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="novaSenha">Nova Senha</Label>
                  <Input
                    id="novaSenha"
                    type="password"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    A senha deve ter pelo menos 8 caracteres
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmarSenha">Confirmar Nova Senha</Label>
                  <Input
                    id="confirmarSenha"
                    type="password"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleChangePassword} 
                  className="ml-auto"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Alterando senha...
                    </>
                  ) : (
                    'Alterar Senha'
                  )}
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Senhas</CardTitle>
                <CardDescription>
                  Informações sobre alterações de senha
                </CardDescription>
              </CardHeader>
              <CardContent>
                {profile?.senha_alterada ? (
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">Última alteração de senha:</span> {formatDate(profile.data_alteracao_senha)}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-yellow-600">
                    Você ainda não alterou sua senha inicial. Por segurança, recomendamos alterar sua senha.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}