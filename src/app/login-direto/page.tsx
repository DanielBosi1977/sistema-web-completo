'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Link from 'next/link';
import { Loader2, LogIn, AlertTriangle, KeyRound } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { LogoText } from '@/components/logo-text';

export default function LoginDiretoPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLoginDireto = async () => {
    setError('');
    setIsLoading(true);

    try {
      // Tentar fazer o login como admin usando credenciais fixas
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'adm@s8garante.com.br',
        password: 'S8garante2023@'
      });
      
      if (error) {
        console.log("Erro de login direto:", error);
        setError('Erro ao fazer login como administrador. Tentando criar o usuário...');
        
        // Tentativa de criar usuário
        const { data: userData, error: signUpError } = await supabase.auth.signUp({
          email: 'adm@s8garante.com.br',
          password: 'S8garante2023@'
        });
        
        if (signUpError) {
          throw new Error(`Não foi possível criar o usuário: ${signUpError.message}`);
        }
        
        if (userData.user) {
          // Criar o perfil de admin
          await supabase.from('profiles').upsert({
            id: userData.user.id,
            email: 'adm@s8garante.com.br',
            tipo_usuario: 'admin',
            nome_responsavel: 'Administrador S8',
            nome_empresa: 'S8 Garante',
            senha_alterada: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
          toast.success('Administrador criado com sucesso! Tentando login...');
          
          // Tentar login novamente
          const { error: loginError } = await supabase.auth.signInWithPassword({
            email: 'adm@s8garante.com.br',
            password: 'S8garante2023@'
          });
          
          if (loginError) {
            throw new Error(`Não foi possível fazer login após criar o usuário: ${loginError.message}`);
          }
          
          // Login bem-sucedido!
          toast.success('Login realizado com sucesso!');
          router.push('/admin');
          return;
        }
      }

      if (data.user) {
        // Login bem-sucedido!
        toast.success('Login administrativo realizado com sucesso');
        router.push('/admin');
      }
    } catch (error: any) {
      console.error('Erro no processo de login direto:', error);
      setError(`Erro: ${error.message}`);
      toast.error('Falha no acesso direto');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col items-center">
        <LogoText width={250} height={100} className="mb-4" />
        <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900">
          Acesso Direto ao Painel
        </h2>
      </div>
      
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl font-bold">Acesso Administrativo Direto</CardTitle>
          <CardDescription>
            Esta página tenta criar e acessar o administrador automaticamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-yellow-50 p-3">
              <div className="flex items-center">
                <AlertTriangle className="mr-2 h-4 w-4 text-yellow-600" />
                <p className="text-sm font-medium text-yellow-600">{error}</p>
              </div>
            </div>
          )}
          
          <div className="rounded-md bg-blue-50 p-4">
            <div className="flex">
              <KeyRound className="h-5 w-5 mr-2 flex-shrink-0 text-blue-600" />
              <div>
                <h3 className="text-sm font-medium text-blue-800">Acesso com credenciais padrão</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Este método tenta acessar com as credenciais padrão do administrador:
                  </p>
                  <ul className="list-disc list-inside mt-2">
                    <li><strong>Email:</strong> adm@s8garante.com.br</li>
                    <li><strong>Senha:</strong> S8garante2023@</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button 
            className="w-full" 
            onClick={handleLoginDireto}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Acesso Direto
              </>
            )}
          </Button>
          
          <div className="flex justify-between w-full">
            <Link
              href="/admin-setup"
              className="text-sm text-primary underline-offset-4 hover:underline"
            >
              Configuração Avançada
            </Link>
            
            <Link
              href="/"
              className="text-sm text-primary underline-offset-4 hover:underline"
            >
              Voltar para Início
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}