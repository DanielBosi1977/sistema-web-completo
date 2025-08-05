# Guia de Deploy: Conectando GitHub e Vercel

Este guia explica como configurar corretamente a integração entre GitHub e Vercel para realizar deploys automáticos do seu projeto.

## Passos para Conectar GitHub e Vercel

### 1. Criar conta na Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique em "Sign Up" e crie uma conta ou faça login
3. Recomendamos fazer login com sua conta GitHub para facilitar a integração

### 2. Importar Projeto do GitHub

1. No dashboard da Vercel, clique em "Add New..." > "Project"
2. Na seção "Import Git Repository", escolha "GitHub"
3. Caso solicitado, autorize a Vercel a acessar seus repositórios GitHub
4. Selecione o repositório que contém este projeto

### 3. Configurar o Projeto

1. Após selecionar o repositório, a Vercel detectará automaticamente que é um projeto Next.js
2. Deixe as configurações padrão, mas certifique-se de que:
   - Framework Preset: Next.js
   - Build Command: `next build` (padrão)
   - Output Directory: `.next` (padrão)
   - Install Command: `npm install` (ou `yarn install` ou `pnpm install` dependendo do seu gerenciador)

### 4. Configurar Variáveis de Ambiente

1. Na seção "Environment Variables", adicione as seguintes variáveis:
   - `NEXT_PUBLIC_SUPABASE_URL`: URL do seu projeto Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Chave anônima do seu projeto Supabase

2. Se estiver usando outras variáveis em seu projeto, adicione-as também

### 5. Deploy

1. Clique em "Deploy"
2. Aguarde o processo de build e deploy completar
3. Após a conclusão, você receberá um URL onde seu projeto está hospedado

### 6. Verificar Integração

1. Após o deploy inicial, qualquer novo commit na branch principal (main/master) deverá acionar um novo deploy automaticamente
2. Você pode verificar isso no dashboard da Vercel, na aba "Deployments"

## Solução de Problemas

### Erro de Integração GitHub-Vercel

Se você estiver vendo o erro "Erro de configuração GitHub-Vercel. Conecte as contas corretamente", siga estes passos:

1. Acesse as [configurações de aplicativos GitHub](https://github.com/settings/applications)
2. Verifique se Vercel está autorizada e tem acesso ao repositório
3. Se não estiver, encontre "Vercel" na lista e clique em "Configure"
4. Certifique-se de que a Vercel tenha acesso ao repositório específico

Alternativa:
1. No dashboard da Vercel, vá em "Settings" > "Git"
2. Clique em "Connect with GitHub" ou "Reconnect with GitHub"
3. Siga as instruções para reconectar sua conta GitHub

### Outros Problemas Comuns

- **Build falha**: Verifique os logs de build na Vercel para identificar o problema
- **Variáveis de ambiente**: Certifique-se de que todas as variáveis de ambiente necessárias estão configuradas
- **Permissões do repositório**: Verifique se a Vercel tem permissão para acessar o repositório no GitHub

## Recursos Adicionais

- [Documentação oficial da Vercel sobre integração com GitHub](https://vercel.com/docs/git/vercel-for-github)
- [Guia de solução de problemas da Vercel](https://vercel.com/docs/errors)