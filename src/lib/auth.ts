import { supabase } from '@/lib/supabase';
import { ADMIN_EMAIL } from './constants';

export async function signIn(email: string, password: string) {
  try {
    console.log('Tentando login com:', { email });
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Erro de autenticação:', error);
    } else {
      console.log('Login bem-sucedido:', { userId: data.user?.id });
    }
    
    return { data, error };
  } catch (e) {
    console.error('Exceção durante signIn:', e);
    throw e;
  }
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function resetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/redefinir-senha`,
  });
  
  return { data, error };
}

export async function updatePassword(password: string) {
  const { data, error } = await supabase.auth.updateUser({
    password,
  });
  
  // Atualizar o campo senha_alterada e data_alteracao_senha
  if (!error) {
    const user = supabase.auth.getUser();
    const userId = (await user).data.user?.id;
    
    if (userId) {
      await supabase
        .from('profiles')
        .update({
          senha_alterada: true,
          data_alteracao_senha: new Date().toISOString(),
        })
        .eq('id', userId);
    }
  }
  
  return { data, error };
}

export async function getUserProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { profile: null };
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  
  return { profile, error };
}

export async function isAdmin() {
  const { profile } = await getUserProfile();
  return profile?.tipo_usuario === 'admin';
}

export async function isImobiliaria() {
  const { profile } = await getUserProfile();
  return profile?.tipo_usuario === 'imobiliaria';
}

export function getEmailRedefinicaoSenha() {
  // Gerar uma senha aleatória segura
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  const html = `
    <h2>Bem-vindo ao S8 Garante!</h2>
    <p>Seu cadastro foi realizado com sucesso.</p>
    <p>Sua senha provisória é: <strong>${password}</strong></p>
    <p>Por favor, faça login e altere sua senha no primeiro acesso.</p>
    <p>Atenciosamente,<br>Equipe S8 Garante</p>
  `;
  
  return { password, html };
}

export async function criarImobiliaria(dadosImobiliaria: any) {
  // Gerar senha provisória e texto do email
  const { password, html } = getEmailRedefinicaoSenha();
  
  // Cadastrar usuário
  const { data, error } = await signUp(
    dadosImobiliaria.email,
    password
  );
  
  if (error) return { error };
  
  // Atualizar perfil com dados da imobiliária
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      nome_empresa: dadosImobiliaria.nome_empresa,
      cnpj: dadosImobiliaria.cnpj,
      nome_responsavel: dadosImobiliaria.nome_responsavel,
      telefone: dadosImobiliaria.telefone,
      cep: dadosImobiliaria.cep,
      estado: dadosImobiliaria.estado,
      cidade: dadosImobiliaria.cidade,
      rua: dadosImobiliaria.rua,
      numero: dadosImobiliaria.numero,
      complemento: dadosImobiliaria.complemento,
      bairro: dadosImobiliaria.bairro,
      tipo_usuario: 'imobiliaria',
      senha_alterada: false
    })
    .eq('id', data.user?.id);
  
  // Enviar email com senha provisória
  // Nota: Em um ambiente real, isso seria feito com um serviço de email
  // No contexto atual, simulamos o envio e mostramos na UI
  
  return { data, profileError, senha: password, email: html };
}