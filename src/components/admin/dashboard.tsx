'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Users, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Calendar,
  Shield
} from 'lucide-react';
import { ANALYSIS_STATUS } from '@/lib/constants';

// Mock data - será substituído por dados reais do Supabase
const mockAnalises = [
  {
    id: 1,
    locatario_nome: 'João Silva',
    imobiliaria_nome: 'Imobiliária Central',
    plano: 'ouro',
    status: ANALYSIS_STATUS.AGUARDANDO,
    data_envio: '2024-01-15T10:30:00Z',
    data_decisao: null,
  },
  {
    id: 2,
    locatario_nome: 'Maria Santos',
    imobiliaria_nome: 'Prime Imóveis',
    plano: 'prata',
    status: ANALYSIS_STATUS.APROVADO,
    data_envio: '2024-01-14T14:20:00Z',
    data_decisao: '2024-01-15T09:15:00Z',
  },
  {
    id: 3,
    locatario_nome: 'Pedro Costa',
    imobiliaria_nome: 'Imobiliária Central',
    plano: 'bronze',
    status: ANALYSIS_STATUS.REJEITADO,
    data_envio: '2024-01-13T16:45:00Z',
    data_decisao: '2024-01-14T11:30:00Z',
  },
];

const mockImobiliarias = [
  {
    id: 1,
    nome_empresa: 'Imobiliária Central',
    cnpj: '12.345.678/0001-90',
    email: 'contato@central.com',
    nome_responsavel: 'Carlos Silva',
    senha_alterada: true,
    data_alteracao_senha: '2024-01-10T14:30:00Z',
    total_analises: 15,
  },
  {
    id: 2,
    nome_empresa: 'Prime Imóveis',
    cnpj: '98.765.432/0001-10',
    email: 'admin@prime.com',
    nome_responsavel: 'Ana Costa',
    senha_alterada: false,
    data_alteracao_senha: null,
    total_analises: 8,
  },
];

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case ANALYSIS_STATUS.AGUARDANDO:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Aguardando</Badge>;
      case ANALYSIS_STATUS.APROVADO:
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Aprovado</Badge>;
      case ANALYSIS_STATUS.REJEITADO:
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejeitado</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getPlanoBadge = (plano: string) => {
    const colors = {
      bronze: 'bg-amber-600',
      prata: 'bg-gray-500',
      ouro: 'bg-yellow-500',
    };
    
    return (
      <Badge className={`${colors[plano as keyof typeof colors]} text-white`}>
        {plano.toUpperCase()}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleAprovar = (analiseId: number) => {
    console.log('Aprovar análise:', analiseId);
    // TODO: Implementar aprovação
  };

  const handleRejeitar = (analiseId: number) => {
    console.log('Rejeitar análise:', analiseId);
    // TODO: Implementar rejeição
  };

  const stats = {
    total_analises: mockAnalises.length,
    aguardando: mockAnalises.filter(a => a.status === ANALYSIS_STATUS.AGUARDANDO).length,
    aprovados: mockAnalises.filter(a => a.status === ANALYSIS_STATUS.APROVADO).length,
    rejeitados: mockAnalises.filter(a => a.status === ANALYSIS_STATUS.REJEITADO).length,
    total_imobiliarias: mockImobiliarias.length,
    imobiliarias_ativas: mockImobiliarias.filter(i => i.senha_alterada).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Painel Administrativo</h1>
          <p className="text-muted-foreground">
            Gestão completa do sistema S8 Garante
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-600">Administrador</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Análises
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_analises}</div>
            <p className="text-xs text-muted-foreground">
              +5 desde ontem
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Aguardando Análise
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.aguardando}</div>
            <p className="text-xs text-muted-foreground">
              Requer atenção
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Imobiliárias
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_imobiliarias}</div>
            <p className="text-xs text-muted-foreground">
              {stats.imobiliarias_ativas} ativas
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Aprovação
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((stats.aprovados / (stats.aprovados + stats.rejeitados)) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Últimos 30 dias
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="analises">Análises ({stats.aguardando})</TabsTrigger>
          <TabsTrigger value="imobiliarias">Imobiliárias</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Análises Pendentes</CardTitle>
                <CardDescription>
                  Análises aguardando sua decisão
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAnalises
                    .filter(a => a.status === ANALYSIS_STATUS.AGUARDANDO)
                    .slice(0, 3)
                    .map((analise) => (
                      <div key={analise.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{analise.locatario_nome}</p>
                          <p className="text-sm text-muted-foreground">
                            {analise.imobiliaria_nome}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getPlanoBadge(analise.plano)}
                          <Button size="sm" onClick={() => handleAprovar(analise.id)}>
                            Analisar
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Imobiliárias Recentes</CardTitle>
                <CardDescription>
                  Últimas imobiliárias cadastradas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockImobiliarias.slice(0, 3).map((imobiliaria) => (
                    <div key={imobiliaria.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{imobiliaria.nome_empresa}</p>
                        <p className="text-sm text-muted-foreground">
                          {imobiliaria.nome_responsavel}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={imobiliaria.senha_alterada ? "default" : "secondary"}>
                          {imobiliaria.senha_alterada ? "Ativa" : "Pendente"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analises" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análises Aguardando Decisão</CardTitle>
              <CardDescription>
                Clique em "Aprovar" ou "Rejeitar" para tomar uma decisão
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAnalises
                  .filter(a => a.status === ANALYSIS_STATUS.AGUARDANDO)
                  .map((analise) => (
                    <div key={analise.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium">{analise.locatario_nome}</p>
                          <p className="text-sm text-muted-foreground">
                            {analise.imobiliaria_nome}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Enviado em {formatDate(analise.data_envio)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getPlanoBadge(analise.plano)}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleAprovar(analise.id)}
                          className="text-green-600 border-green-600 hover:bg-green-50"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Aprovar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleRejeitar(analise.id)}
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Rejeitar
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="imobiliarias" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Imobiliárias</CardTitle>
              <CardDescription>
                Visualize e gerencie todas as imobiliárias cadastradas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockImobiliarias.map((imobiliaria) => (
                  <div key={imobiliaria.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium">{imobiliaria.nome_empresa}</p>
                        <p className="text-sm text-muted-foreground">
                          {imobiliaria.nome_responsavel} • {imobiliaria.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          CNPJ: {imobiliaria.cnpj} • {imobiliaria.total_analises} análises
                        </p>
                        {imobiliaria.data_alteracao_senha && (
                          <p className="text-xs text-muted-foreground">
                            Senha alterada em: {formatDate(imobiliaria.data_alteracao_senha)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={imobiliaria.senha_alterada ? "default" : "secondary"}>
                        {imobiliaria.senha_alterada ? "Ativa" : "Pendente"}
                      </Badge>
                      <Button size="sm" variant="outline">
                        Editar
                      </Button>
                      <Button size="sm" variant="outline">
                        Redefinir Senha
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historico" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Análises</CardTitle>
              <CardDescription>
                Todas as análises processadas pelo sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAnalises.map((analise) => (
                  <div key={analise.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium">{analise.locatario_nome}</p>
                        <p className="text-sm text-muted-foreground">
                          {analise.imobiliaria_nome}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Enviado: {formatDate(analise.data_envio)}
                          {analise.data_decisao && (
                            <> • Decidido: {formatDate(analise.data_decisao)}</>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getPlanoBadge(analise.plano)}
                      {getStatusBadge(analise.status)}
                      <Button size="sm" variant="outline">
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}