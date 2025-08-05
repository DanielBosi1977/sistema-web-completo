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
import { Loader2, Shield, AlertTriangle, Info } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { LogoText } from '@/components/logo-text';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('adm@s8garante.com.br');
  const [password, setPassword] = useState('S8garante2023@');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Login simples com Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });
      
      if (error) {
        console.log("Erro de login:", error);
        if (error.message.includes('Email not confirmed')) {
          setError('É necessário configurar o administrador primeiro. Clique em "Configurar Administrador".');
        } else if (error.message.includes('Invalid login credentials')) {
          setError('Credenciais inválidas. Verifique seu e-mail e senha ou configure o administrador.');
        } else {
          setError(error.message || 'Erro ao fazer login');
        }
        return;
      }

      if (data.user) {
        // Verificar se o usuário é admin (forma simplificada)
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('tipo_usuario')
            .eq('id', data.user.id)
            .single();
          
          if (profileError) {
            console.log("Erro ao buscar perfil:", profileError);
            setError('Erro ao verificar tipo de usuário. Configure o administrador primeiro.');
            await supabase.auth.signOut();
            return;
          }
          
          if (profile?.tipo_usuario !== 'admin') {
            setError('Este login é exclusivo para administradores.');
            await supabase.auth.signOut();
            return;
          }
        } catch (profileCheckError) {
          console.error("Exceção ao verificar perfil:", profileCheckError);
          setError('Erro ao verificar permissões. Configure o administrador primeiro.');
          await supabase.auth.signOut();
          return;
        }
        
        toast.success('Login administrativo realizado com sucesso');
        router.push('/admin');
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
      setError('Ocorreu um erro durante o login. Tente usar a página de configuração.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col items-center">
        <LogoText width={250} height={100} className="mb-4" />
        <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900">
          Painel Administrativo
        </h2>
      </div>
      
      <Card className="w-full max-w-md border-2 border-primary">
        <CardHeader className="space-y-1 bg-primary text-white">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">
              Acesso Administrativo
            </CardTitle>
            <Shield className="h-8 w-8" />
          </div>
          <CardDescription className="text-white/80">
            Acesso restrito a administradores do sistema
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-6">
            {error && (
              <div className="rounded-md bg-yellow-50 p-3">
                <div className="flex items-center">
                  <AlertTriangle className="mr-2 h-4 w-4 text-yellow-600" />
                  <p className="text-sm font-medium text-yellow-600">{error}</p>
                </div>
              </div>
            )}
            
            <div className="rounded-md bg-blue-50 p-3">
              <div className="flex">
                <Info className="mr-2 h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600">
                    Se estiver tendo problemas para acessar, use a página de{" "}
                    <Link href="/admin-setup" className="font-medium underline">
                      Configuração de Administrador
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">E-mail de Administrador</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Padrão: S8garante2023@ (caso não tenha sido alterada)
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Autenticando...
                </>
              ) : (
                'Acessar Painel Administrativo'
              )}
            </Button>
            
            <div className="flex justify-between w-full">
              <Link
                href="/admin-setup"
                className="text-sm text-primary underline-offset-4 hover:underline"
              >
                Configurar Administrador
              </Link>
              
              <Link
                href="/login"
                className="text-sm text-primary underline-offset-4 hover:underline"
              >
                Ir para login de imobiliárias
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}