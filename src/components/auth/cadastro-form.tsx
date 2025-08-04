'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Logo } from '@/components/ui/logo';
import { signUp } from '@/lib/auth';
import { USER_ROLES } from '@/lib/constants';
import { getEstados, getCidadesByEstado, getAddressByCep, Estado, Cidade } from '@/lib/ibge-api';
import { Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const cadastroSchema = z.object({
  nome_empresa: z.string().min(2, 'Nome da empresa é obrigatório'),
  cnpj: z.string().min(14, 'CNPJ deve ter 14 dígitos').max(18, 'CNPJ inválido'),
  email: z.string().email('E-mail inválido'),
  telefone: z.string().min(10, 'Telefone é obrigatório'),
  nome_responsavel: z.string().min(2, 'Nome do responsável é obrigatório'),
  cep: z.string().min(8, 'CEP é obrigatório'),
  estado: z.string().min(1, 'Estado é obrigatório'),
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  rua: z.string().min(2, 'Rua é obrigatória'),
  numero: z.string().min(1, 'Número é obrigatório'),
  complemento: z.string().optional(),
  bairro: z.string().min(2, 'Bairro é obrigatório'),
});

type CadastroFormData = z.infer<typeof cadastroSchema>;

export function CadastroForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [estados, setEstados] = useState<Estado[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [loadingCidades, setLoadingCidades] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CadastroFormData>({
    resolver: zodResolver(cadastroSchema),
  });

  const watchedEstado = watch('estado');
  const watchedCep = watch('cep');

  // Carregar estados
  useEffect(() => {
    const loadEstados = async () => {
      try {
        const estadosData = await getEstados();
        setEstados(estadosData);
      } catch (error) {
        toast.error('Erro ao carregar estados');
      }
    };

    loadEstados();
  }, []);

  // Carregar cidades quando estado muda
  useEffect(() => {
    if (watchedEstado) {
      const loadCidades = async () => {
        setLoadingCidades(true);
        try {
          const estadoId = parseInt(watchedEstado);
          const cidadesData = await getCidadesByEstado(estadoId);
          setCidades(cidadesData);
          setValue('cidade', ''); // Limpar cidade selecionada
        } catch (error) {
          toast.error('Erro ao carregar cidades');
        } finally {
          setLoadingCidades(false);
        }
      };

      loadCidades();
    }
  }, [watchedEstado, setValue]);

  // Buscar endereço por CEP
  useEffect(() => {
    if (watchedCep && watchedCep.replace(/\D/g, '').length === 8) {
      const searchCep = async () => {
        setLoadingCep(true);
        try {
          const address = await getAddressByCep(watchedCep);
          setValue('rua', address.logradouro);
          setValue('bairro', address.bairro);
          
          // Encontrar e selecionar o estado
          const estado = estados.find(e => e.sigla === address.uf);
          if (estado) {
            setValue('estado', estado.id.toString());
          }
        } catch (error) {
          toast.error('CEP não encontrado');
        } finally {
          setLoadingCep(false);
        }
      };

      searchCep();
    }
  }, [watchedCep, setValue, estados]);

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const formatTelefone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const onSubmit = async (data: CadastroFormData) => {
    setLoading(true);
    setError('');

    try {
      const senhaProvisoria = generatePassword();
      
      const endereco = {
        cep: data.cep,
        estado: data.estado,
        cidade: data.cidade,
        rua: data.rua,
        numero: data.numero,
        complemento: data.complemento || '',
        bairro: data.bairro,
      };

      await signUp({
        email: data.email,
        password: senhaProvisoria,
        role: USER_ROLES.IMOBILIARIA,
        profile: {
          nome_empresa: data.nome_empresa,
          cnpj: data.cnpj.replace(/\D/g, ''),
          telefone: data.telefone.replace(/\D/g, ''),
          nome_responsavel: data.nome_responsavel,
          endereco,
          senha_alterada: false,
        },
      });

      // TODO: Enviar e-mail com senha provisória
      console.log('Senha provisória:', senhaProvisoria);
      
      toast.success('Cadastro realizado com sucesso! Verifique seu e-mail para a senha provisória.');
      router.push('/login');
      
    } catch (err: any) {
      setError('Erro ao realizar cadastro. Tente novamente.');
      console.error('Erro no cadastro:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Logo size="lg" />
            </div>
            <CardTitle>Cadastro de Imobiliária</CardTitle>
            <CardDescription>
              Preencha os dados para criar sua conta no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Dados da Empresa */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Dados da Empresa</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome_empresa">Nome da Empresa *</Label>
                    <Input
                      id="nome_empresa"
                      placeholder="Nome da imobiliária"
                      {...register('nome_empresa')}
                      className={errors.nome_empresa ? 'border-red-500' : ''}
                    />
                    {errors.nome_empresa && (
                      <p className="text-sm text-red-500">{errors.nome_empresa.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ *</Label>
                    <Input
                      id="cnpj"
                      placeholder="00.000.000/0000-00"
                      {...register('cnpj')}
                      onChange={(e) => {
                        const formatted = formatCNPJ(e.target.value);
                        setValue('cnpj', formatted);
                      }}
                      className={errors.cnpj ? 'border-red-500' : ''}
                    />
                    {errors.cnpj && (
                      <p className="text-sm text-red-500">{errors.cnpj.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="contato@imobiliaria.com"
                      {...register('email')}
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone *</Label>
                    <Input
                      id="telefone"
                      placeholder="(11) 99999-9999"
                      {...register('telefone')}
                      onChange={(e) => {
                        const formatted = formatTelefone(e.target.value);
                        setValue('telefone', formatted);
                      }}
                      className={errors.telefone ? 'border-red-500' : ''}
                    />
                    {errors.telefone && (
                      <p className="text-sm text-red-500">{errors.telefone.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nome_responsavel">Nome do Responsável *</Label>
                  <Input
                    id="nome_responsavel"
                    placeholder="Nome completo do responsável"
                    {...register('nome_responsavel')}
                    className={errors.nome_responsavel ? 'border-red-500' : ''}
                  />
                  {errors.nome_responsavel && (
                    <p className="text-sm text-red-500">{errors.nome_responsavel.message}</p>
                  )}
                </div>
              </div>

              {/* Endereço */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Endereço</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cep">CEP *</Label>
                    <div className="relative">
                      <Input
                        id="cep"
                        placeholder="00000-000"
                        {...register('cep')}
                        onChange={(e) => {
                          const formatted = formatCEP(e.target.value);
                          setValue('cep', formatted);
                        }}
                        className={errors.cep ? 'border-red-500' : ''}
                      />
                      {loadingCep && (
                        <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin" />
                      )}
                    </div>
                    {errors.cep && (
                      <p className="text-sm text-red-500">{errors.cep.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado *</Label>
                    <Select
                      value={watchedEstado}
                      onValueChange={(value) => setValue('estado', value)}
                    >
                      <SelectTrigger className={errors.estado ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Selecione o estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {estados.map((estado) => (
                          <SelectItem key={estado.id} value={estado.id.toString()}>
                            {estado.nome} ({estado.sigla})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.estado && (
                      <p className="text-sm text-red-500">{errors.estado.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade *</Label>
                    <Select
                      value={watch('cidade')}
                      onValueChange={(value) => setValue('cidade', value)}
                      disabled={!watchedEstado || loadingCidades}
                    >
                      <SelectTrigger className={errors.cidade ? 'border-red-500' : ''}>
                        <SelectValue placeholder={loadingCidades ? "Carregando..." : "Selecione a cidade"} />
                      </SelectTrigger>
                      <SelectContent>
                        {cidades.map((cidade) => (
                          <SelectItem key={cidade.id} value={cidade.nome}>
                            {cidade.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.cidade && (
                      <p className="text-sm text-red-500">{errors.cidade.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rua">Rua *</Label>
                  <Input
                    id="rua"
                    placeholder="Nome da rua"
                    {...register('rua')}
                    className={errors.rua ? 'border-red-500' : ''}
                  />
                  {errors.rua && (
                    <p className="text-sm text-red-500">{errors.rua.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numero">Número *</Label>
                    <Input
                      id="numero"
                      placeholder="123"
                      {...register('numero')}
                      className={errors.numero ? 'border-red-500' : ''}
                    />
                    {errors.numero && (
                      <p className="text-sm text-red-500">{errors.numero.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="complemento">Complemento</Label>
                    <Input
                      id="complemento"
                      placeholder="Sala 101"
                      {...register('complemento')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bairro">Bairro *</Label>
                    <Input
                      id="bairro"
                      placeholder="Nome do bairro"
                      {...register('bairro')}
                      className={errors.bairro ? 'border-red-500' : ''}
                    />
                    {errors.bairro && (
                      <p className="text-sm text-red-500">{errors.bairro.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/login')}
                  className="flex-1"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Cadastrar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}