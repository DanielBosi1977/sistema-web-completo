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
import { signIn } from '@/lib/auth';
import { toast } from 'sonner';
import Link from 'next/link';
import { Loader2, Shield, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ADMIN_EMAIL } from '@/lib/constants';
import Image from 'next/image';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data, error } = await signIn(email, password);
      
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
                placeholder={ADMIN_EMAIL}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <Link
                  href="/esqueci-senha"
                  className="text-sm text-primary underline-offset-4 hover:underline"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
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
            <div className="text-center text-sm">
              <Link
                href="/login"
                className="text-primary underline-offset-4 hover:underline"
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