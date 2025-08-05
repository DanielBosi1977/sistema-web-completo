'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle, Info, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { LogoText } from '@/components/logo-text';

export default function SetupAdminPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    message?: string;
    details?: string;
    credentials?: {
      email: string;
      password: string;
    };
    error?: any;
  }>({});

  const [directLoginAttempt, setDirectLoginAttempt] = useState(false);
  const [loginCredentials, setLoginCredentials] = useState({
    email: 'adm@s8garante.com.br',
    password: 'S8garante2023@'
  });

  const handleSetupAdmin = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/setup-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      
      setResult(data);
      
      if (data.success) {
        toast.success('Configuração do administrador concluída com sucesso');
      } else {
        toast.error('Erro na configuração do administrador');
      }
    } catch (error) {
      console.error('Erro ao configurar administrador:', error);
      setResult({
        success: false,
        message: 'Erro ao configurar administrador',
        error: error
      });
      toast.error('Erro ao fazer a requisição de configuração');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectLogin = async () => {
    setDirectLoginAttempt(true);
    
    try {
      // Redirecionar para o login administrativo
      window.location.href = '/admin-login';
    } catch (error) {
      console.error('Erro ao preparar login direto:', error);
      toast.error('Erro ao preparar redirecionamento');
      setDirectLoginAttempt(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex flex-col items-center mb-4">
            <LogoText width={180} height={80} className="mb-4" />
          </div>
          <CardTitle>Configuração do Administrador</CardTitle>
          <CardDescription>
            Configure o acesso administrativo ao sistema S8 Garante
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-blue-50 p-4 text-blue-800">
            <div className="flex">
              <Info className="h-5 w-5 mr-2 flex-shrink-0" />
              <div>
                <p className="font-medium">Informações importantes</p>
                <p className="text-sm mt-1">
                  Esta página cria/restaura o usuário administrador padrão do sistema.
                  Use este processo apenas em ambientes seguros.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-500">
              Será configurado um usuário administrador com as seguintes credenciais:
            </p>
            <div className="rounded-md bg-gray-100 p-3">
              <p><strong>Email:</strong> adm@s8garante.com.br</p>
              <p><strong>Senha:</strong> S8garante2023@</p>
            </div>
          </div>

          {result.message && (
            <div className={`rounded-md p-4 ${
              result.success 
                ? 'bg-green-50 text-green-800' 
                : 'bg-red-50 text-red-800'
            }`}>
              <div className="flex">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                )}
                <div>
                  <p className="font-medium">{result.message}</p>
                  {result.details && (
                    <p className="text-sm mt-1">{result.details}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {result.success && (
            <div className="border rounded-md p-4 mt-4">
              <h3 className="font-medium text-sm mb-2">Tente fazer login com as credenciais:</h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    value={loginCredentials.email}
                    onChange={(e) => setLoginCredentials(prev => ({...prev, email: e.target.value}))}
                    readOnly 
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="password">Senha</Label>
                  <Input 
                    id="password" 
                    type="text" 
                    value={loginCredentials.password}
                    onChange={(e) => setLoginCredentials(prev => ({...prev, password: e.target.value}))}
                    readOnly 
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          {!result.success && (
            <Button 
              onClick={handleSetupAdmin} 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Configurando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Configurar Administrador
                </>
              )}
            </Button>
          )}
          
          {result.success && (
            <Button 
              onClick={handleDirectLogin} 
              variant="default" 
              className="w-full"
              disabled={directLoginAttempt}
            >
              {directLoginAttempt ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redirecionando...
                </>
              ) : (
                'Ir para Login Administrativo'
              )}
            </Button>
          )}
          
          <Button 
            asChild 
            variant={result.success ? "outline" : "outline"}
            className="w-full"
          >
            <Link href="/login">Ir para Página de Login</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}