export interface Estado {
  id: number;
  sigla: string;
  nome: string;
}

export interface Cidade {
  id: number;
  nome: string;
}

export async function getEstados(): Promise<Estado[]> {
  try {
    const response = await fetch(
      'https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome'
    );
    
    if (!response.ok) {
      throw new Error('Erro ao buscar estados');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar estados:', error);
    throw error;
  }
}

export async function getCidadesByEstado(estadoId: number): Promise<Cidade[]> {
  try {
    const response = await fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoId}/municipios?orderBy=nome`
    );
    
    if (!response.ok) {
      throw new Error('Erro ao buscar cidades');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar cidades:', error);
    throw error;
  }
}

export async function getAddressByCep(cep: string) {
  try {
    const cleanCep = cep.replace(/\D/g, '');
    
    if (cleanCep.length !== 8) {
      throw new Error('CEP deve ter 8 dígitos');
    }
    
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    
    if (!response.ok) {
      throw new Error('Erro ao buscar CEP');
    }
    
    const data = await response.json();
    
    if (data.erro) {
      throw new Error('CEP não encontrado');
    }
    
    return {
      cep: data.cep,
      logradouro: data.logradouro,
      bairro: data.bairro,
      localidade: data.localidade,
      uf: data.uf,
    };
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    throw error;
  }
}