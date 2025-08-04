'use client';

import { useState, useEffect } from 'react';
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
import { updatePassword } from '@/lib/auth';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

export default function AlterarSenhaPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user, profile, refreshProfile, isAdmin } = useAuth();

  useEffect(() => {
    // Se o usuário não estiver logado, redirecionar para login
    if (!user) {
      router.push('/login');
      return;
    }
    
    // Se o usuário já alterou a senha, redirecionar para dashboard
    if (profile?.senha_alterada) {
      if (isAdmin) {
        router.push('/admin');
      } else {
        router.push('/imobiliaria');
      }
    }
  }, [user, profile, router, isAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar se as senhas coincidem
    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }
    
    // Validar força da senha
    if (password.length < 8) {
      toast.error('A senha deve ter pelo menos 8 caracteres');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data, error } = await updatePassword(password);
      
      if (error) {
        toast.error('Erro ao alterar senha: ' + error.message);
        return;
      }
      
      toast.success('Senha alterada com sucesso');
      
      // Atualizar perfil para refletir a mudança de senha
      await refreshProfile();
      
      // Redirecionar para o dashboard apropriado
      if (isAdmin) {
        router.push('/admin');
      } else {
        router.push('/imobiliaria');
      }
      
    } catch (error) {
      toast.error('Erro ao alterar senha');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Alterar Senha</CardTitle>
          <CardDescription>
            Você precisa alterar sua senha no primeiro acesso
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nova Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500">
                A senha deve ter pelo menos 8 caracteres
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Alterando senha...
                </>
              ) : (
                'Alterar Senha'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}