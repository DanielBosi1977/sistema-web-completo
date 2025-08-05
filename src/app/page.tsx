import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { MadeWithLasy } from "@/components/made-with-lasy";
import { 
  Building, 
  Shield, 
  FileText, 
  CheckCircle, 
  Lock, 
  TrendingUp
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-primary py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Image
                src="/s8-logo.png"
                alt="S8 Garante"
                width={150}
                height={50}
                priority
              />
            </div>
            <div className="flex gap-2">
              <Button asChild variant="secondary">
                <Link href="/login">Entrar</Link>
              </Button>
              <Button asChild variant="outline" className="bg-white">
                <Link href="/admin-login">Área Admin</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="bg-gradient-to-b from-primary to-primary/50 py-20 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="mb-6 text-4xl font-bold">Sistema de Fiança Locatícia</h2>
            <p className="mx-auto mb-10 max-w-2xl text-lg">
              A plataforma completa para gerenciamento de fiança locatícia, conectando imobiliárias e garantindo segurança para proprietários e locatários.
            </p>
            <Button asChild size="lg" variant="secondary" className="text-white bg-black hover:bg-black/80">
              <Link href="/login">Acessar o Sistema</Link>
            </Button>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <h3 className="mb-10 text-center text-3xl font-bold">Nossos Serviços</h3>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="rounded-lg bg-white p-6 shadow-md border border-primary/20">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h4 className="mb-3 text-xl font-semibold text-primary">Análise de Locatários</h4>
                <p>Avaliação completa e segura de locatários para garantir a melhor experiência para proprietários.</p>
              </div>
              <div className="rounded-lg bg-white p-6 shadow-md border border-primary/20">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h4 className="mb-3 text-xl font-semibold text-primary">Fiança Garantida</h4>
                <p>Oferecemos diferentes planos de fiança locatícia para atender a todas as necessidades do mercado.</p>
              </div>
              <div className="rounded-lg bg-white p-6 shadow-md border border-primary/20">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Building className="h-6 w-6 text-primary" />
                </div>
                <h4 className="mb-3 text-xl font-semibold text-primary">Portal para Imobiliárias</h4>
                <p>Plataforma exclusiva para que imobiliárias possam gerenciar seus processos de fiança de forma simples e eficiente.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <h3 className="mb-10 text-center text-3xl font-bold">Por que escolher a S8 Garante?</h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h4 className="mb-2 text-lg font-semibold">Aprovação Rápida</h4>
                <p className="text-sm text-gray-600">Processo ágil de análise para aprovações em tempo recorde.</p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white">
                  <Lock className="h-8 w-8" />
                </div>
                <h4 className="mb-2 text-lg font-semibold">Segurança Total</h4>
                <p className="text-sm text-gray-600">Dados protegidos e processos seguros para todos os envolvidos.</p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white">
                  <Building className="h-8 w-8" />
                </div>
                <h4 className="mb-2 text-lg font-semibold">Parceria com Imobiliárias</h4>
                <p className="text-sm text-gray-600">Soluções especiais para nossos parceiros imobiliários.</p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white">
                  <TrendingUp className="h-8 w-8" />
                </div>
                <h4 className="mb-2 text-lg font-semibold">Análise Completa</h4>
                <p className="text-sm text-gray-600">Critérios rigorosos para garantir a melhor experiência.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-4 text-center">
            <h3 className="mb-6 text-3xl font-bold">Comece a usar hoje mesmo</h3>
            <p className="mx-auto mb-8 max-w-2xl text-lg">
              Junte-se às imobiliárias que já confiam na S8 Garante para suas soluções de fiança locatícia.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/login">
                  Acessar o Sistema
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/cadastro-imobiliaria">
                  Cadastrar Imobiliária
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-secondary text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div className="flex justify-start mb-4">
                <Image
                  src="/s8-logo.png"
                  alt="S8 Garante"
                  width={120}
                  height={40}
                  className="invert"
                />
              </div>
              <p className="text-sm">Soluções completas em fiança locatícia para o mercado imobiliário.</p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Links Úteis</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/login" className="hover:underline">
                    Área do Cliente
                  </Link>
                </li>
                <li>
                  <Link href="/admin-login" className="hover:underline">
                    Área Administrativa
                  </Link>
                </li>
                <li>
                  <Link href="/cadastro-imobiliaria" className="hover:underline">
                    Cadastro de Imobiliárias
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Contato</h4>
              <ul className="space-y-2 text-sm">
                <li>contato@s8garante.com.br</li>
                <li>(00) 0000-0000</li>
                <li>São Paulo - SP</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-white/20 text-center text-sm">
            <p>© {new Date().getFullYear()} S8 Garante. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
      
      <MadeWithLasy />
    </div>
  );
}