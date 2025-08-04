'use client';

import { useState } from 'react';
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
import { resetPassword } from '@/lib/auth';
import { toast } from 'sonner';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailEnviado, setEmailEnviado] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        toast.error('Erro ao enviar e-mail: ' + error.message);
        return;
      }
      
      toast.success('E-mail de redefinição enviado');
      setEmailEnviado(true);
      
    } catch (error) {
      toast.error('Erro ao enviar e-mail de redefinição');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Esqueci minha senha</CardTitle>
          <CardDescription>
            {emailEnviado 
              ? 'Verifique seu e-mail para redefinir sua senha' 
              : 'Informe seu e-mail para receber as instruções de redefinição'}
          </CardDescription>
        </CardHeader>
        
        {emailEnviado ? (
          <CardContent className="space-y-4">
            <div className="rounded-md bg-green-50 p-4">
              <p className="text-green-800">
                Enviamos um e-mail para <strong>{email}</strong> com instruções para redefinir sua senha.
              </p>
            </div>
            <p className="text-sm text-gray-500">
              Se você não receber o e-mail em alguns minutos, verifique sua pasta de spam ou tente novamente.
            </p>
          </CardContent>
        ) : (
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
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar instruções'
                )}
              </Button>
              <div className="text-center text-sm">
                <Link
                  href="/login"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Voltar para o login
                </Link>
              </div>
            </CardFooter>
          </form>
        )}
        
        {emailEnviado && (
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/login">Voltar para o login</Link>
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}