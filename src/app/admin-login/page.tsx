'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { Loader2, Shield, AlertTriangle, Info, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

export default function AdminLoginPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('adm@s8garante.com.br');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginStep, setLoginStep] = useState<'checking' | 'ready' | 'failed'>('checking');
  const [userExists, setUserExists] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    // Verificar se o usuário admin existe no sistema
    const checkAdminExists = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', 'adm@s8garante.com.br')
          .eq('tipo_usuario', 'admin')
          .single();
        
        if (error) {
          console.error("Erro ao verificar admin:", error);
          setLoginStep('failed');
          return;
        }
        
        if (data) {
          setUserExists(true);
          setLoginStep('ready');
        } else {
          setUserExists(false);
          setLoginStep('failed');
        }
      } catch (e) {
        console.error("Exceção ao verificar admin:", e);
        setLoginStep('failed');
      }
    };
    
    checkAdminExists();
  }, []);

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
        setError('Credenciais inválidas. Verifique seu e-mail e senha.');
        return;
      }

      if (data.user) {
        // Verificar se o usuário é admin
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('tipo_usuario')
          .eq('id', data.user.id)
          .single();
        
        if (profileError || !profile) {
          setError('Erro ao verificar permissões do usuário');
          return;
        }
        
        if (profile.tipo_usuario !== 'admin') {
          setError('Este login é exclusivo para administradores.');
          // Fazer logout para evitar que usuários não admin fiquem logados
          await supabase.auth.signOut();
          return;
        }
        
        toast.success('Login administrativo realizado com sucesso');
        router.push('/admin');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setError('Ocorreu um erro durante o login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col items-center">
        <Image
          src="/s8-logo.png"
          alt="S8 Garante"
          width={250}
          height={100}
          priority
          className="mb-4"
        />
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
        
        {loginStep === 'checking' && (
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p>Verificando configuração...</p>
          </CardContent>
        )}
        
        {loginStep === 'failed' && (
          <CardContent className="py-6">
            <div className="rounded-md bg-yellow-50 p-4 mb-6">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">Configuração necessária</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      O usuário administrador não está configurado ou não foi encontrado. 
                      É necessário configurar o acesso administrativo antes de continuar.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <Button asChild className="w-full">
              <Link href="/admin-setup">
                Configurar Administrador
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        )}
        
        {loginStep === 'ready' && (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-6">
              {error && (
                <div className="rounded-md bg-destructive/15 p-3">
                  <div className="flex items-center">
                    <AlertTriangle className="mr-2 h-4 w-4 text-destructive" />
                    <p className="text-sm font-medium text-destructive">{error}</p>
                  </div>
                </div>
              )}
              
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
                  Problemas com login?
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
        )}
      </Card>
    </div>
  );
}