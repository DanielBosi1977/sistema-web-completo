'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Users,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { ANALYSIS_STATUS } from '@/lib/constants';

// Mock data - será substituído por dados reais do Supabase
const mockAnalises = [
  {
    id: 1,
    locatario_nome: 'João Silva',
    plano: 'ouro',
    status: ANALYSIS_STATUS.AGUARDANDO,
    data_envio: '2024-01-15T10:30:00Z',
    data_decisao: null,
  },
  {
    id: 2,
    locatario_nome: 'Maria Santos',
    plano: 'prata',
    status: ANALYSIS_STATUS.APROVADO,
    data_envio: '2024-01-14T14:20:00Z',
    data_decisao: '2024-01-15T09:15:00Z',
  },
  {
    id: 3,
    locatario_nome: 'Pedro Costa',
    plano: 'bronze',
    status: ANALYSIS_STATUS.REJEITADO,
    data_envio: '2024-01-13T16:45:00Z',
    data_decisao: '2024-01-14T11:30:00Z',
  },
];

export function ImobiliariaDashboard() {
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

  const stats = {
    total: mockAnalises.length,
    aguardando: mockAnalises.filter(a => a.status === ANALYSIS_STATUS.AGUARDANDO).length,
    aprovados: mockAnalises.filter(a => a.status === ANALYSIS_STATUS.APROVADO).length,
    rejeitados: mockAnalises.filter(a => a.status === ANALYSIS_STATUS.REJEITADO).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Gerencie suas análises de locatários
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Análise
        </Button>
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
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              +2 desde o último mês
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Aguardando
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.aguardando}</div>
            <p className="text-xs text-muted-foreground">
              Pendentes de análise
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Aprovados
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.aprovados}</div>
            <p className="text-xs text-muted-foreground">
              Taxa de aprovação: {((stats.aprovados / stats.total) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Rejeitados
            </CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejeitados}</div>
            <p className="text-xs text-muted-foreground">
              Taxa de rejeição: {((stats.rejeitados / stats.total) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="aguardando">Aguardando ({stats.aguardando})</TabsTrigger>
          <TabsTrigger value="aprovados">Aprovados ({stats.aprovados})</TabsTrigger>
          <TabsTrigger value="rejeitados">Rejeitados ({stats.rejeitados})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análises Recentes</CardTitle>
              <CardDescription>
                Últimas análises enviadas para avaliação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAnalises.slice(0, 5).map((analise) => (
                  <div key={analise.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium">{analise.locatario_nome}</p>
                        <p className="text-sm text-muted-foreground">
                          Enviado em {formatDate(analise.data_envio)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getPlanoBadge(analise.plano)}
                      {getStatusBadge(analise.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aguardando" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análises Aguardando</CardTitle>
              <CardDescription>
                Análises pendentes de avaliação pela S8 Garante
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
                            Enviado em {formatDate(analise.data_envio)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getPlanoBadge(analise.plano)}
                        {getStatusBadge(analise.status)}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aprovados" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análises Aprovadas</CardTitle>
              <CardDescription>
                Locatários aprovados - você pode anexar documentos complementares
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAnalises
                  .filter(a => a.status === ANALYSIS_STATUS.APROVADO)
                  .map((analise) => (
                    <div key={analise.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium">{analise.locatario_nome}</p>
                          <p className="text-sm text-muted-foreground">
                            Aprovado em {analise.data_decisao ? formatDate(analise.data_decisao) : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getPlanoBadge(analise.plano)}
                        {getStatusBadge(analise.status)}
                        <Button size="sm" variant="outline">
                          Editar Locatário
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejeitados" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análises Rejeitadas</CardTitle>
              <CardDescription>
                Locatários que não foram aprovados na análise
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAnalises
                  .filter(a => a.status === ANALYSIS_STATUS.REJEITADO)
                  .map((analise) => (
                    <div key={analise.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium">{analise.locatario_nome}</p>
                          <p className="text-sm text-muted-foreground">
                            Rejeitado em {analise.data_decisao ? formatDate(analise.data_decisao) : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getPlanoBadge(analise.plano)}
                        {getStatusBadge(analise.status)}
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