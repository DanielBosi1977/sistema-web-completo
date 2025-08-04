'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function NovoAdminPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [senhaProvisoria, setSenhaProvisoria] = useState('');
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar dados
    if (!formData.nome || !formData.email) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    
    // Validação básica de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('E-mail inválido');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Gerar senha aleatória
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';
      let password = '';
      for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      // Criar usuário no Auth
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: password,
      });
      
      if (error) {
        throw error;
      }
      
      if (!data.user) {
        throw new Error('Erro ao criar usuário');
      }
      
      // Atualizar perfil para administrador
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          tipo_usuario: 'admin',
          nome_responsavel: formData.nome,
          senha_alterada: false,
        })
        .eq('id', data.user.id);
      
      if (profileError) {
        throw profileError;
      }
      
      // Mostrar senha provisória
      setSenhaProvisoria(password);
      setShowSuccessDialog(true);
      
    } catch (error) {
      console.error('Erro ao cadastrar administrador:', error);
      toast.error('Erro ao cadastrar administrador');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSuccessDialog = () => {
    setShowSuccessDialog(false);
    router.push('/admin/usuarios');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Novo Administrador</h2>
            <p className="text-muted-foreground">
              Cadastre um novo usuário administrador no sistema
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push('/admin/usuarios')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Dados do Administrador</CardTitle>
            <CardDescription>
              Preencha os dados do novo usuário administrador
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <p className="text-sm text-muted-foreground mt-4">
                Uma senha provisória será gerada automaticamente. O usuário deverá alterá-la no primeiro acesso.
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="ml-auto"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cadastrando...
                  </>
                ) : (
                  'Cadastrar Administrador'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
      
      {/* Dialog de sucesso com senha provisória */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Administrador cadastrado com sucesso!</DialogTitle>
            <DialogDescription>
              O usuário administrador foi cadastrado na plataforma S8 Garante. 
              Anote a senha provisória para enviar ao usuário.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-gray-100 rounded-md text-center">
            <p className="font-medium">Senha provisória:</p>
            <p className="text-xl font-bold mt-2">{senhaProvisoria}</p>
          </div>
          <p className="text-sm text-gray-500">
            No primeiro acesso, o usuário será solicitado a alterar esta senha.
          </p>
          <DialogFooter>
            <Button onClick={handleCloseSuccessDialog}>
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}