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
import { Loader2, Shield } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await signIn(email, password);
      
      if (error) {
        toast.error('Erro ao fazer login: ' + error.message);
        return;
      }

      if (data.user) {
        toast.success('Login realizado com sucesso');
        
        // Redirecionamento baseado no tipo de usuário
        // O redirecionamento real será feito no AuthProvider
        if (email === 'adm@s8garante.com.br') {
          router.push('/admin');
        } else {
          router.push('/imobiliaria');
        }
      }
    } catch (error) {
      toast.error('Erro ao fazer login');
      console.error(error);
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
          Sistema de Fiança Locatícia
        </h2>
      </div>
      
      <Card className="w-full max-w-md border-primary/20">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Acessar Sistema</CardTitle>
          <CardDescription>
            Entre com seu e-mail e senha para acessar o sistema
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
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
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
            <div className="flex flex-col space-y-2 text-center text-sm">
              <div>
                Não tem uma conta?{' '}
                <Link
                  href="/cadastro-imobiliaria"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Cadastre sua imobiliária
                </Link>
              </div>
              <div>
                <Link
                  href="/admin-login"
                  className="flex items-center justify-center text-primary underline-offset-4 hover:underline"
                >
                  <Shield className="mr-1 h-4 w-4" />
                  Área de Administradores
                </Link>
              </div>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}