import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Verificar se o usuário admin já existe
    const { data: existingUsers } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', 'adm@s8garante.com.br')
      .eq('tipo_usuario', 'admin');

    // Se já existir, retorne
    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Administrador já existe no sistema',
      });
    }

    // Criar o usuário admin no sistema de autenticação
    const { data, error } = await supabase.auth.signUp({
      email: 'adm@s8garante.com.br',
      password: 'S8garante2025@',
    });

    if (error) {
      throw error;
    }

    // O trigger do banco de dados deve criar automaticamente o perfil admin
    // Mas vamos verificar e atualizar se necessário
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          tipo_usuario: 'admin',
          nome_responsavel: 'Administrador S8',
          nome_empresa: 'S8 Garante',
          senha_alterada: true
        })
        .eq('id', data.user.id);

      if (profileError) {
        throw profileError;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Administrador criado com sucesso',
      user: data.user
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: `Erro ao criar administrador: ${error.message}`,
    }, { status: 500 });
  }
}