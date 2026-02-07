import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <div className="container mx-auto mobile-optimized py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-8">
              <Image
                src="/images/plenisofts-logo.png"
                alt="PleniShop Logo"
                width={200}
                height={200}
                priority
                className="w-32 h-32 sm:w-48 sm:h-48 md:w-56 md:h-56"
              />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary mb-4 text-balance">PLENISHOP</h1>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-8 text-pretty max-w-3xl mx-auto italic">
              Créez et gérez votre boutique en ligne en quelques étapes simples
            </p>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-12">
              <Card className="bg-accent/10 border-accent/20 hover:bg-accent/20 transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <span className="text-4xl mb-4 block">🏪</span>
                  <h3 className="font-semibold text-accent mb-2">BOUTIQUE</h3>
                  <p className="text-sm text-muted-foreground">Créez votre propre boutique en ligne facilement</p>
                </CardContent>
              </Card>
              <Card className="bg-primary/10 border-primary/20 hover:bg-primary/20 transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <span className="text-4xl mb-4 block">📦</span>
                  <h3 className="font-semibold text-primary mb-2">PRODUITS</h3>
                  <p className="text-sm text-muted-foreground">Gérez vos produits et votre catalogue facilement</p>
                </CardContent>
              </Card>
              <Card className="bg-secondary/10 border-secondary/20 hover:bg-secondary/20 transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <span className="text-4xl mb-4 block">💳</span>
                  <h3 className="font-semibold text-secondary mb-2">PAIEMENTS</h3>
                  <p className="text-sm text-muted-foreground">Acceptez les paiements de vos clients en sécurité</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Call to Action - Inscription */}
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20 mb-12">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-6">
                Créez votre boutique PleniShop dès maintenant :
              </h2>
              <Link href="/inscription">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-4 text-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300">
                  Créer ma boutique
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
