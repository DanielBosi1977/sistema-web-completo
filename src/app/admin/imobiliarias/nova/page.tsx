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
import { criarImobiliaria } from '@/lib/auth';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function NovaImobiliariaPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [ufs, setUfs] = useState<{sigla: string, nome: string}[]>([]);
  const [cidades, setCidades] = useState<string[]>([]);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [senhaProvisoria, setSenhaProvisoria] = useState('');
  
  const [formData, setFormData] = useState({
    nome_empresa: '',
    cnpj: '',
    email: '',
    telefone: '',
    nome_responsavel: '',
    cep: '',
    estado: '',
    cidade: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
  });

  // Buscar lista de estados ao carregar o componente
  useState(() => {
    fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
      .then(response => response.json())
      .then(data => setUfs(data))
      .catch(error => console.error('Erro ao buscar estados:', error));
  });

  // Buscar cidades quando o estado for selecionado
  const handleEstadoChange = (uf: string) => {
    setFormData({ ...formData, estado: uf, cidade: '' });
    
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`)
      .then(response => response.json())
      .then(data => setCidades(data.map((city: any) => city.nome)))
      .catch(error => console.error('Erro ao buscar cidades:', error));
  };

  // Buscar endereço pelo CEP
  const handleCepBlur = () => {
    const cep = formData.cep.replace(/\D/g, '');
    
    if (cep.length !== 8) return;
    
    setIsLoading(true);
    
    fetch(`https://viacep.com.br/ws/${cep}/json/`)
      .then(response => response.json())
      .then(data => {
        if (!data.erro) {
          setFormData({
            ...formData,
            rua: data.logradouro,
            bairro: data.bairro,
            cidade: data.localidade,
            estado: data.uf,
          });
          
          // Buscar cidades do estado retornado
          fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${data.uf}/municipios?orderBy=nome`)
            .then(response => response.json())
            .then(cityData => setCidades(cityData.map((city: any) => city.nome)))
            .catch(error => console.error('Erro ao buscar cidades:', error));
        }
      })
      .catch(error => {
        console.error('Erro ao buscar CEP:', error);
        toast.error('Erro ao buscar CEP. Verifique se o CEP é válido.');
      })
      .finally(() => setIsLoading(false));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNextStep = () => {
    // Validar campos do passo 1
    if (formStep === 1) {
      if (!formData.nome_empresa || !formData.cnpj || !formData.email || !formData.telefone || !formData.nome_responsavel) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }
      
      // Validação básica de e-mail
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error('E-mail inválido');
        return;
      }
      
      // Validação básica de CNPJ (apenas se tem 14 dígitos)
      const cnpjSemFormatacao = formData.cnpj.replace(/\D/g, '');
      if (cnpjSemFormatacao.length !== 14) {
        toast.error('CNPJ inválido');
        return;
      }
    }
    
    setFormStep(2);
  };

  const handlePreviousStep = () => {
    setFormStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validar campos do passo 2
      if (!formData.cep || !formData.estado || !formData.cidade || !formData.rua || !formData.numero || !formData.bairro) {
        toast.error('Preencha todos os campos obrigatórios do endereço');
        setIsLoading(false);
        return;
      }
      
      // Criar imobiliária
      const { data, error, profileError, senha } = await criarImobiliaria(formData);
      
      if (error || profileError) {
        toast.error(`Erro ao cadastrar imobiliária: ${error?.message || profileError?.message || 'Erro desconhecido'}`);
        return;
      }
      
      // Mostrar senha provisória
      setSenhaProvisoria(senha || '');
      setShowSuccessDialog(true);
      
    } catch (error) {
      console.error('Erro ao cadastrar imobiliária:', error);
      toast.error('Erro ao cadastrar imobiliária');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSuccessDialog = () => {
    setShowSuccessDialog(false);
    router.push('/admin/imobiliarias');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Nova Imobiliária</h2>
            <p className="text-muted-foreground">
              Cadastre uma nova imobiliária no sistema
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push('/admin/imobiliarias')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>
              {formStep === 1 
                ? 'Dados da Imobiliária' 
                : 'Endereço da Imobiliária'}
            </CardTitle>
            <CardDescription>
              {formStep === 1 
                ? 'Preencha os dados básicos da imobiliária' 
                : 'Informe o endereço completo da imobiliária'}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {formStep === 1 ? (
                // Etapa 1: Dados da imobiliária
                <>
                  <div className="space-y-2">
                    <Label htmlFor="nome_empresa">Nome da Imobiliária *</Label>
                    <Input
                      id="nome_empresa"
                      name="nome_empresa"
                      value={formData.nome_empresa}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ *</Label>
                    <Input
                      id="cnpj"
                      name="cnpj"
                      value={formData.cnpj}
                      onChange={handleInputChange}
                      placeholder="00.000.000/0000-00"
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
                  
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone *</Label>
                    <Input
                      id="telefone"
                      name="telefone"
                      value={formData.telefone}
                      onChange={handleInputChange}
                      placeholder="(00) 00000-0000"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="nome_responsavel">Nome do Responsável *</Label>
                    <Input
                      id="nome_responsavel"
                      name="nome_responsavel"
                      value={formData.nome_responsavel}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </>
              ) : (
                // Etapa 2: Endereço
                <>
                  <div className="space-y-2">
                    <Label htmlFor="cep">CEP *</Label>
                    <Input
                      id="cep"
                      name="cep"
                      value={formData.cep}
                      onChange={handleInputChange}
                      onBlur={handleCepBlur}
                      placeholder="00000-000"
                      required
                    />
                  </div>
                  
                  <div className="grid gap-4 grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="estado">Estado (UF) *</Label>
                      <Select
                        value={formData.estado}
                        onValueChange={handleEstadoChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {ufs.map((uf) => (
                            <SelectItem key={uf.sigla} value={uf.sigla}>
                              {uf.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cidade">Cidade *</Label>
                      <Select
                        value={formData.cidade}
                        onValueChange={(value) => setFormData({ ...formData, cidade: value })}
                        disabled={!formData.estado}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {cidades.map((cidade) => (
                            <SelectItem key={cidade} value={cidade}>
                              {cidade}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="rua">Rua/Avenida *</Label>
                    <Input
                      id="rua"
                      name="rua"
                      value={formData.rua}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="grid gap-4 grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="numero">Número *</Label>
                      <Input
                        id="numero"
                        name="numero"
                        value={formData.numero}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="complemento">Complemento</Label>
                      <Input
                        id="complemento"
                        name="complemento"
                        value={formData.complemento}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bairro">Bairro *</Label>
                    <Input
                      id="bairro"
                      name="bairro"
                      value={formData.bairro}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              {formStep === 1 ? (
                <div className="w-full">
                  <Button 
                    type="button" 
                    className="w-full" 
                    onClick={handleNextStep} 
                    disabled={isLoading}
                  >
                    Próximo
                  </Button>
                </div>
              ) : (
                <div className="flex w-full space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handlePreviousStep}
                    disabled={isLoading}
                  >
                    Voltar
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Cadastrando...
                      </>
                    ) : (
                      'Cadastrar Imobiliária'
                    )}
                  </Button>
                </div>
              )}
            </CardFooter>
          </form>
        </Card>
      </div>
      
      {/* Dialog de sucesso com senha provisória */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Imobiliária cadastrada com sucesso!</DialogTitle>
            <DialogDescription>
              A imobiliária foi cadastrada na plataforma S8 Garante. 
              Anote a senha provisória para enviar ao responsável.
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