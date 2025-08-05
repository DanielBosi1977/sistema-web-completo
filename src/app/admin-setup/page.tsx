'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle, Info, RefreshCw, LockKeyhole } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

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
        <span className="text-xs text-red-500">{error}</span>
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
      // Step 1: Check database
      updateStage('checkDb', 'loading');
      const { data: dbTest, error: dbError } = await supabase
        .from('profiles')
        .select('count(*)', { count: 'exact', head: true });

      if (dbError) {
        updateStage('checkDb', 'error', dbError.message);
        throw new Error(`Database check failed: ${dbError.message}`);
      }
      updateStage('checkDb', 'success');

      // Step 2: Create admin user
      updateStage('createUser', 'loading');
      const email = 'adm@s8garante.com.br';
      
      // Verificar se o usuário já existe
      const { data: existingUsers, error: findUserError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', email)
        .eq('tipo_usuario', 'admin');
      
      if (findUserError) {
        updateStage('createUser', 'error', findUserError.message);
        throw new Error(`Error checking existing user: ${findUserError.message}`);
      }

      let userId = '';
      
      if (existingUsers && existingUsers.length > 0) {
        // Usuário existe, atualizar senha
        userId = existingUsers[0].id;
        console.log("Usuário admin encontrado, atualizando senha");
        
        const { error: updatePasswordError } = await supabase.auth.admin.updateUserById(
          userId,
          { password: adminPassword }
        );
        
        if (updatePasswordError) {
          updateStage('createUser', 'error', `Erro ao atualizar senha: ${updatePasswordError.message}`);
          throw new Error(`Password update failed: ${updatePasswordError.message}`);
        }
      } else {
        // Criar novo usuário
        console.log("Criando novo usuário admin");
        const { data: userData, error: userError } = await supabase.auth.signUp({
          email,
          password: adminPassword
        });
        
        if (userError || !userData.user) {
          updateStage('createUser', 'error', userError?.message || 'Failed to create user');
          throw new Error(`User creation failed: ${userError?.message}`);
        }
        
        userId = userData.user.id;
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex flex-col items-center mb-4">
            <Image
              src="/s8-logo.png"
              alt="S8 Garante"
              width={180}
              height={80}
              priority
              className="mb-4"
            />
          </div>
          <CardTitle className="text-center">Configuração de Administrador</CardTitle>
          <CardDescription className="text-center">
            Configure diretamente o acesso administrativo ao sistema S8 Garante
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-blue-50 p-4 text-blue-800">
            <div className="flex">
              <Info className="h-5 w-5 mr-2 flex-shrink-0" />
              <div>
                <p className="font-medium">Processo de configuração direta</p>
                <p className="text-sm mt-1">
                  Esta página cria/restaura o usuário administrador padrão com acesso completo ao sistema.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="adminPassword">Senha do Administrador</Label>
              <div className="text-xs text-gray-500">Não altere, a menos que seja necessário</div>
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

          {loginStatus.success && (
            <div className="mt-6 rounded-md bg-green-50 p-4 text-green-800">
              <div className="flex">
                <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-medium">Configuração concluída com sucesso!</p>
                  <p className="text-sm mt-1">
                    Você pode agora fazer login como administrador com as seguintes credenciais:
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
          <Button 
            onClick={handleSetupAdmin} 
            className="w-full" 
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
                Configurar Administrador
              </>
            )}
          </Button>
          
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