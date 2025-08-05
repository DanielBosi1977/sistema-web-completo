import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

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
                <h4 className="mb-3 text-xl font-semibold text-primary">Análise de Locatários</h4>
                <p>Avaliação completa e segura de locatários para garantir a melhor experiência para proprietários.</p>
              </div>
              <div className="rounded-lg bg-white p-6 shadow-md border border-primary/20">
                <h4 className="mb-3 text-xl font-semibold text-primary">Fiança Garantida</h4>
                <p>Oferecemos diferentes planos de fiança locatícia para atender a todas as necessidades do mercado.</p>
              </div>
              <div className="rounded-lg bg-white p-6 shadow-md border border-primary/20">
                <h4 className="mb-3 text-xl font-semibold text-primary">Portal para Imobiliárias</h4>
                <p>Plataforma exclusiva para que imobiliárias possam gerenciar seus processos de fiança de forma simples e eficiente.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-secondary text-white py-8 text-center">
        <div className="container mx-auto px-4">
          <div className="flex justify-center mb-4">
            <Image
              src="/s8-logo.png"
              alt="S8 Garante"
              width={120}
              height={40}
              className="invert"
            />
          </div>
          <p>© {new Date().getFullYear()} S8 Garante. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}