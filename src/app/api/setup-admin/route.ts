import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST() {
  try {
    // Obter as variáveis de ambiente diretamente
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    // Criar cliente Supabase com a chave de serviço para operações administrativas
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verificar credenciais existentes
    const email = 'adm@s8garante.com.br';
    const password = 'S8garante2023@';

    // Buscar usuário existente
    const { data: existingUsers, error: searchError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .eq('tipo_usuario', 'admin');

    // Se já existir, tentar redefinir a senha
    if (existingUsers && existingUsers.length > 0) {
      const userId = existingUsers[0].id;
      
      // Atualizar senha do usuário existente
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        userId,
        { password: password }
      );

      if (updateError) {
        // Se não conseguir atualizar, tente criar um novo
        await supabase.auth.admin.deleteUser(userId);
      } else {
        return NextResponse.json({
          success: true,
          message: 'Administrador existente atualizado com sucesso',
          details: 'A senha foi redefinida para o valor padrão'
        });
      }
    }

    // Criar um novo usuário admin
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'admin' }
    });

    if (userError) {
      throw userError;
    }

    if (!userData.user) {
      throw new Error('Falha ao criar usuário administrador');
    }

    // Verificar se o perfil já existe
    const { data: profileData, error: profileQueryError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userData.user.id)
      .single();

    if (profileQueryError && profileQueryError.code !== 'PGRST116') {
      // Se houver um erro diferente de "não encontrado"
      throw profileQueryError;
    }

    // Inserir ou atualizar o perfil de administrador
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userData.user.id,
        email: email,
        tipo_usuario: 'admin',
        nome_responsavel: 'Administrador S8',
        nome_empresa: 'S8 Garante',
        senha_alterada: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      throw profileError;
    }

    // Também vamos testar o login para garantir
    const { error: testLoginError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (testLoginError) {
      return NextResponse.json({
        success: true,
        message: 'Administrador criado, mas o teste de login falhou',
        details: testLoginError.message,
        credentials: { email, password }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Administrador criado com sucesso e login testado',
      credentials: { email, password }
    });
  } catch (error: any) {
    console.error('Erro na configuração do administrador:', error);
    
    return NextResponse.json({
      success: false,
      message: `Erro ao criar administrador: ${error.message}`,
      error: error
    }, { status: 500 });
  }
}