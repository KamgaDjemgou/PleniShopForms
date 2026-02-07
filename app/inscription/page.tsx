import { MultiStepOrderForm } from "@/components/multi-step-order-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function OrderPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <div className="container mx-auto mobile-optimized py-4 sm:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header with back button */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/">
              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                ← Retour à l'accueil
              </Button>
            </Link>
          </div>

          <div className="text-center mb-6 sm:mb-8">
            <div className="flex justify-center mb-4 sm:mb-6">
              <Image
                src="/images/plenisofts-logo.png"
                alt="PleniShop Logo"
                width={80}
                height={80}
                priority
                className="w-16 h-16 sm:w-20 sm:h-20"
              />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-2 text-balance">
              Créez votre Boutique en Ligne
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-4 text-pretty max-w-2xl mx-auto">
              Lancez votre plateforme de commerce électronique en quelques étapes simples. PleniShop vous aide à créer et gérer votre boutique en ligne avec facilité.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 text-primary/70 mb-6 max-w-lg sm:max-w-none mx-auto">
              <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-accent/10 border border-accent/20 hover:bg-accent/20 transition-colors">
                <span className="text-xl sm:text-2xl">🏪</span>
                <span className="text-xs sm:text-sm font-medium text-accent">Boutique</span>
              </div>
              <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors">
                <span className="text-xl sm:text-2xl">📦</span>
                <span className="text-xs sm:text-sm font-medium text-primary">Produits</span>
              </div>
              <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-secondary/10 border border-secondary/20 hover:bg-secondary/20 transition-colors">
                <span className="text-xl sm:text-2xl">💳</span>
                <span className="text-xs sm:text-sm font-medium text-secondary">Paiements</span>
              </div>
            </div>

            <div className="hidden sm:flex items-center justify-center gap-8 text-accent/30 text-2xl mb-4">
              <span>♪</span>
              <span>♫</span>
              <span>♪</span>
              <span>♫</span>
              <span>♪</span>
            </div>
          </div>

          <MultiStepOrderForm />
        </div>
      </div>
    </main>
  )
}
