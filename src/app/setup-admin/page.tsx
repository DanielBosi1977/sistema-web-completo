'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function SetupAdminPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    message?: string;
  }>({});

  const handleSetupAdmin = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/setup-admin');
      const data = await response.json();
      
      setResult({
        success: data.success,
        message: data.message
      });
    } catch (error) {
      setResult({
        success: false,
        message: 'Erro ao configurar administrador'
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Configuração Inicial do S8 Garante</CardTitle>
          <CardDescription>
            Crie o usuário administrador inicial para o sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-500">
              Será criado um usuário administrador com as seguintes credenciais:
            </p>
            <div className="rounded-md bg-gray-100 p-3">
              <p><strong>Email:</strong> adm@s8garante.com.br</p>
              <p><strong>Senha:</strong> S8garante2025@</p>
            </div>
            <p className="text-sm text-gray-500">
              Este processo deve ser executado apenas uma vez na configuração inicial do sistema.
            </p>
          </div>

          {result.message && (
            <div className={`rounded-md p-4 ${
              result.success 
                ? 'bg-green-50 text-green-800' 
                : 'bg-red-50 text-red-800'
            }`}>
              <div className="flex items-center">
                {result.success ? (
                  <CheckCircle className="mr-2 h-5 w-5" />
                ) : (
                  <XCircle className="mr-2 h-5 w-5" />
                )}
                <p>{result.message}</p>
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
                'Criar Administrador'
              )}
            </Button>
          )}
          
          <Button 
            asChild 
            variant={result.success ? "default" : "outline"}
            className="w-full"
          >
            <Link href="/login">Ir para Login</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}