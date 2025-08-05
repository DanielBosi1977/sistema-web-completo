'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle, Info, RefreshCw, LockKeyhole } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { LogoText } from '@/components/logo-text';

// Componente de estágio
const Stage = ({ 
  title, 
  status, 
  error, 
  isLoading 
}: { 
  title: string, 
  status: 'pending' | 'success' | 'error' | 'loading', 
  error?: string,
  isLoading?: boolean
}) => {
  return (
    <div className="flex items-center justify-between p-3 border rounded-md mb-2">
      <div className="flex items-center gap-2">
        {status === 'loading' && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
        {status === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
        {status === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
        {status === 'pending' && <div className="h-5 w-5 rounded-full border-2 border-gray-300" />}
        <span className={`font-medium ${status === 'error' ? 'text-red-500' : ''}`}>{title}</span>
      </div>
      {status === 'error' && error && (
        <span className="text-xs text-red-500 max-w-xs truncate">{error}</span>
      )}
    </div>
  );
};

export default function AdminSetupPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [adminPassword, setAdminPassword] = useState('S8garante2023@');
  const [stages, setStages] = useState({
    checkDb: { status: 'pending' as const, error: '' },
    createUser: { status: 'pending' as const, error: '' },
    createProfile: { status: 'pending' as const, error: '' },
    testLogin: { status: 'pending' as const, error: '' }
  });
  const [loginStatus, setLoginStatus] = useState({
    success: false,
    message: '',
    error: ''
  });

  const updateStage = (stage: keyof typeof stages, status: 'pending' | 'success' | 'error' | 'loading', error = '') => {
    setStages(prev => ({
      ...prev,
      [stage]: { status, error }
    }));
  };

  const handleSetupAdmin = async () => {
    setIsProcessing(true);
    setLoginStatus({ success: false, message: '', error: '' });
    
    // Reset stages
    Object.keys(stages).forEach(key => {
      updateStage(key as keyof typeof stages, 'pending');
    });

    try {
      // Step 1: Check database connection (simplified)
      updateStage('checkDb', 'loading');
      
      try {
        // Teste mais simples - apenas verificar se conseguimos fazer uma query básica
        const { error: dbError } = await supabase
          .from('profiles')
          .select('id')
          .limit(1);

        if (dbError) {
          console.log('Erro na verificação do banco:', dbError);
          // Não vamos falhar aqui, apenas avisar
          updateStage('checkDb', 'error', 'Conexão instável, mas continuando...');
        } else {
          updateStage('checkDb', 'success');
        }
      } catch (error: any) {
        console.log('Exceção na verificação do banco:', error);
        updateStage('checkDb', 'error', 'Conexão instável, mas continuando...');
      }

      // Step 2: Create admin user (mais direto)
      updateStage('createUser', 'loading');
      const email = 'adm@s8garante.com.br';
      
      // Tentar criar o usuário diretamente
      console.log("Tentando criar usuário admin...");
      const { data: userData, error: userError } = await supabase.auth.signUp({
        email,
        password: adminPassword
      });
      
      let userId = '';
      
      if (userError) {
        // Se der erro, pode ser porque o usuário já existe
        console.log("Erro ao criar usuário (pode já existir):", userError.message);
        
        // Tentar fazer login para verificar se já existe
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password: adminPassword
        });
        
        if (loginError) {
          updateStage('createUser', 'error', 'Usuário não existe e não foi possível criar');
          throw new Error(`Falha ao criar/verificar usuário: ${loginError.message}`);
        }
        
        if (loginData.user) {
          userId = loginData.user.id;
          console.log("Usuário já existe e login funcionou");
          await supabase.auth.signOut(); // Fazer logout
        }
      } else if (userData.user) {
        userId = userData.user.id;
        console.log("Usuário criado com sucesso");
      } else {
        throw new Error('Falha ao obter ID do usuário');
      }
      
      updateStage('createUser', 'success');
      
      // Step 3: Ensure admin profile exists
      updateStage('createProfile', 'loading');
      
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: email,
          tipo_usuario: 'admin',
          nome_responsavel: 'Administrador S8',
          nome_empresa: 'S8 Garante',
          senha_alterada: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });
      
      if (profileError) {
        updateStage('createProfile', 'error', profileError.message);
        throw new Error(`Profile creation failed: ${profileError.message}`);
      }
      
      updateStage('createProfile', 'success');
      
      // Step 4: Test login
      updateStage('testLogin', 'loading');
      
      // Sign out first (if there's a session)
      await supabase.auth.signOut();
      
      // Attempt login
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password: adminPassword
      });
      
      if (loginError || !loginData.user) {
        updateStage('testLogin', 'error', loginError?.message || 'Login test failed');
        throw new Error(`Login test failed: ${loginError?.message}`);
      }
      
      updateStage('testLogin', 'success');
      
      // Sign out again to let user login manually
      await supabase.auth.signOut();
      
      // Everything succeeded
      setLoginStatus({
        success: true,
        message: 'Administrador configurado com sucesso!',
        error: ''
      });
      
      toast.success('Administrador configurado com sucesso!');
      
    } catch (error: any) {
      console.error('Erro durante setup:', error);
      setLoginStatus({
        success: false,
        message: '',
        error: `Erro: ${error.message}`
      });
      toast.error(`Erro na configuração: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Função para configuração rápida (bypass da verificação do banco)
  const handleQuickSetup = async () => {
    setIsProcessing(true);
    setLoginStatus({ success: false, message: '', error: '' });
    
    try {
      const email = 'adm@s8garante.com.br';
      
      // Tentar login direto primeiro
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password: adminPassword
      });
      
      if (!loginError && loginData.user) {
        // Login funcionou, verificar se é admin
        const { data: profile } = await supabase
          .from('profiles')
          .select('tipo_usuario')
          .eq('id', loginData.user.id)
          .single();
        
        if (profile?.tipo_usuario === 'admin') {
          await supabase.auth.signOut();
          setLoginStatus({
            success: true,
            message: 'Administrador já configurado e funcionando!',
            error: ''
          });
          toast.success('Administrador já está configurado!');
          return;
        }
      }
      
      // Se chegou aqui, precisa criar/configurar
      const { data: userData, error: userError } = await supabase.auth.signUp({
        email,
        password: adminPassword
      });
      
      let userId = loginData?.user?.id || userData?.user?.id;
      
      if (!userId) {
        throw new Error('Não foi possível obter ID do usuário');
      }
      
      // Criar/atualizar perfil
      await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: email,
          tipo_usuario: 'admin',
          nome_responsavel: 'Administrador S8',
          nome_empresa: 'S8 Garante',
          senha_alterada: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      await supabase.auth.signOut();
      
      setLoginStatus({
        success: true,
        message: 'Configuração rápida concluída!',
        error: ''
      });
      
      toast.success('Configuração rápida concluída!');
      
    } catch (error: any) {
      console.error('Erro na configuração rápida:', error);
      setLoginStatus({
        success: false,
        message: '',
        error: `Erro: ${error.message}`
      });
      toast.error(`Erro na configuração: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex flex-col items-center mb-4">
            <LogoText width={180} height={80} className="mb-4" />
          </div>
          <CardTitle className="text-center">Configuração de Administrador</CardTitle>
          <CardDescription className="text-center">
            Configure o acesso administrativo ao sistema S8 Garante
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-blue-50 p-4 text-blue-800">
            <div className="flex">
              <Info className="h-5 w-5 mr-2 flex-shrink-0" />
              <div>
                <p className="font-medium">Configuração do Administrador</p>
                <p className="text-sm mt-1">
                  Esta página cria/restaura o usuário administrador padrão.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="adminPassword">Senha do Administrador</Label>
            </div>
            <div className="flex space-x-2">
              <Input
                id="adminPassword"
                type="text"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="font-mono"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setAdminPassword('S8garante2023@')}
                title="Restaurar senha padrão"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {Object.values(stages).some(stage => stage.status !== 'pending') && (
            <div className="mt-6 space-y-1">
              <h3 className="text-sm font-medium mb-2">Etapas de configuração:</h3>
              <Stage 
                title="1. Verificar conexão com banco de dados" 
                status={stages.checkDb.status} 
                error={stages.checkDb.error}
                isLoading={isProcessing} 
              />
              <Stage 
                title="2. Criar/atualizar usuário administrador" 
                status={stages.createUser.status} 
                error={stages.createUser.error}
                isLoading={isProcessing} 
              />
              <Stage 
                title="3. Configurar perfil administrativo" 
                status={stages.createProfile.status} 
                error={stages.createProfile.error}
                isLoading={isProcessing} 
              />
              <Stage 
                title="4. Testar autenticação" 
                status={stages.testLogin.status} 
                error={stages.testLogin.error}
                isLoading={isProcessing} 
              />
            </div>
          )}

          {loginStatus.success && (
            <div className="mt-6 rounded-md bg-green-50 p-4 text-green-800">
              <div className="flex">
                <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-medium">Configuração concluída com sucesso!</p>
                  <p className="text-sm mt-1">
                    Você pode agora fazer login como administrador:
                  </p>
                  <div className="mt-2 p-3 bg-green-100 rounded-md">
                    <p><strong>Email:</strong> adm@s8garante.com.br</p>
                    <p><strong>Senha:</strong> {adminPassword}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {loginStatus.error && (
            <div className="mt-4 rounded-md bg-red-50 p-4 text-red-800">
              <div className="flex">
                <XCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-medium">Erro na configuração</p>
                  <p className="text-sm mt-1">{loginStatus.error}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <div className="grid grid-cols-2 gap-2 w-full">
            <Button 
              onClick={handleQuickSetup} 
              variant="outline"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Configurando...
                </>
              ) : (
                'Configuração Rápida'
              )}
            </Button>
            
            <Button 
              onClick={handleSetupAdmin} 
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Configurando...
                </>
              ) : (
                <>
                  <LockKeyhole className="mr-2 h-4 w-4" />
                  Configuração Completa
                </>
              )}
            </Button>
          </div>
          
          {loginStatus.success && (
            <Button 
              variant="default" 
              className="w-full"
              asChild
            >
              <Link href="/admin-login">
                Ir para Login Administrativo
              </Link>
            </Button>
          )}
          
          <Button 
            asChild 
            variant="outline"
            className="w-full"
          >
            <Link href="/">Voltar para Página Inicial</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}