import { createClient } from '@/lib/supabase';
import { USER_ROLES } from './constants';

export interface User {
  id: string;
  email: string;
  role: string;
  profile?: {
    nome_empresa?: string;
    cnpj?: string;
    nome_responsavel?: string;
    telefone?: string;
    endereco?: any;
    senha_alterada?: boolean;
    data_alteracao_senha?: string;
  };
}

export async function signIn(email: string, password: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  // Buscar perfil do usuário
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', data.user.id)
    .single();

  return {
    user: data.user,
    profile,
  };
}

export async function signUp(userData: {
  email: string;
  password: string;
  role: string;
  profile: any;
}) {
  const supabase = createClient();
  
  const { data, error } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
  });

  if (error) throw error;

  if (data.user) {
    // Criar perfil do usuário
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: data.user.id,
        role: userData.role,
        ...userData.profile,
      });

    if (profileError) throw profileError;
  }

  return data;
}

export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return {
    ...user,
    profile,
  };
}

export async function updatePassword(newPassword: string) {
  const supabase = createClient();
  
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw error;

  // Atualizar flag de senha alterada
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    await supabase
      .from('user_profiles')
      .update({
        senha_alterada: true,
        data_alteracao_senha: new Date().toISOString(),
      })
      .eq('user_id', user.id);
  }
}