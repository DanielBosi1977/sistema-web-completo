'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Logo } from '@/components/ui/logo';
import { updatePassword } from '@/lib/auth';
import { useAuth } from '@/components/auth/auth-provider';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const alterarSenhaSchema = z.object({
  novaSenha: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
    .regex(/[^A-Za-z0-9]/, 'Senha deve conter pelo menos um caractere especial'),
  confirmarSenha: z.string(),
}).refine((data) => data.novaSenha === data.confirmarSenha, {
  message: "Senhas não coincidem",
  path: ["confirmarSenha"],
});

type AlterarSenhaFormData = z.infer<typeof alterarSenhaSchema>;

export function AlterarSenhaForm() {
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { user, refreshUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<AlterarSenhaFormData>({
    resolver: zodResolver(alterarSenhaSchema),
  });

  const novaSenha = watch('novaSenha');

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getStrengthColor = (strength: number) => {
    if (strength < 2) return 'bg-red-500';
    if (strength < 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = (strength: number) => {
    if (strength < 2) return 'Fraca';
    if (strength < 4) return 'Média';
    return 'Forte';
  };

  const onSubmit = async (data: AlterarSenhaFormData) => {
    setLoading(true);
    setError('');

    try {
      await updatePassword(data.novaSenha);
      await refreshUser();
      
      toast.success('Senha alterada com sucesso!');
      router.push('/imobiliaria');
    } catch (err: any) {
      setError('Erro ao alterar senha. Tente novamente.');
      console.error('Erro ao alterar senha:', err);
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = novaSenha ? getPasswordStrength(novaSenha) : 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          <CardTitle>Alterar Senha</CardTitle>
          <CardDescription>
            Por segurança, você deve alterar sua senha no primeiro acesso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="novaSenha">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="novaSenha"
                  type={showNovaSenha ? 'text' : 'password'}
                  placeholder="Digite sua nova senha"
                  {...register('novaSenha')}
                  className={errors.novaSenha ? 'border-red-500' : ''}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNovaSenha(!showNovaSenha)}
                >
                  {showNovaSenha ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {novaSenha && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${getStrengthColor(passwordStrength)}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">
                      {getStrengthText(passwordStrength)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>A senha deve conter:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li className={novaSenha.length >= 8 ? 'text-green-600' : ''}>
                        Pelo menos 8 caracteres
                      </li>
                      <li className={/[A-Z]/.test(novaSenha) ? 'text-green-600' : ''}>
                        Uma letra maiúscula
                      </li>
                      <li className={/[a-z]/.test(novaSenha) ? 'text-green-600' : ''}>
                        Uma letra minúscula
                      </li>
                      <li className={/[0-9]/.test(novaSenha) ? 'text-green-600' : ''}>
                        Um número
                      </li>
                      <li className={/[^A-Za-z0-9]/.test(novaSenha) ? 'text-green-600' : ''}>
                        Um caractere especial
                      </li>
                    </ul>
                  </div>
                </div>
              )}
              
              {errors.novaSenha && (
                <p className="text-sm text-red-500">{errors.novaSenha.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmarSenha">Confirmar Nova Senha</Label>
              <div className="relative">
                <Input
                  id="confirmarSenha"
                  type={showConfirmarSenha ? 'text' : 'password'}
                  placeholder="Confirme sua nova senha"
                  {...register('confirmarSenha')}
                  className={errors.confirmarSenha ? 'border-red-500' : ''}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}
                >
                  {showConfirmarSenha ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.confirmarSenha && (
                <p className="text-sm text-red-500">{errors.confirmarSenha.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Alterar Senha
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}