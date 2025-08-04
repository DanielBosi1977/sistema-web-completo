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
import { formatDate } from '@/lib/utils';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

export default function PerfilAdminPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  
  const [formData, setFormData] = useState({
    nome_responsavel: '',
    email: '',
  });

  useEffect(() => {
    if (user && profile) {
      setFormData({
        nome_responsavel: profile.nome_responsavel || '',
        email: profile.email || '',
      });
    }
  }, [user, profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    
    try {
      // Validar campos obrigatórios
      if (!formData.nome_responsavel) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }
      
      // Atualizar dados do administrador
      const { error } = await supabase
        .from('profiles')
        .update({
          nome_responsavel: formData.nome_responsavel,
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
            <TabsTrigger value="dados">Dados Pessoais</TabsTrigger>
            <TabsTrigger value="senha">Alterar Senha</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dados" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Dados Básicos</CardTitle>
                <CardDescription>
                  Informações do seu perfil de administrador
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome_responsavel">Nome *</Label>
                  <Input
                    id="nome_responsavel"
                    name="nome_responsavel"
                    value={formData.nome_responsavel}
                    onChange={handleInputChange}
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
                
                <div className="pt-2">
                  <p className="text-sm font-medium">Tipo de Usuário</p>
                  <p className="text-sm mt-1">Administrador</p>
                </div>
                
                <div className="pt-2">
                  <p className="text-sm font-medium">Criado em</p>
                  <p className="text-sm">{formatDate(profile?.created_at || '')}</p>
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