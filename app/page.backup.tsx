import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <div className="container mx-auto mobile-optimized py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
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

          {/* Plans Section */}
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">Nos Packs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-2 border-muted-foreground/30 hover:border-primary transition-colors">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2">🎁 Free</h3>
                  <p className="text-muted-foreground mb-4">Gratuit - Parfait pour commencer</p>
                  <ul className="text-sm text-left space-y-2">
                    <li>✓ Jusqu'à 50 produits</li>
                    <li>✓ Thème standard</li>
                    <li>✓ Support par email</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-muted-foreground/30 hover:border-secondary transition-colors">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2">🚀 Starter</h3>
                  <p className="text-muted-foreground mb-4">À partir de 29 EUR/mois</p>
                  <ul className="text-sm text-left space-y-2">
                    <li>✓ Jusqu'à 500 produits</li>
                    <li>✓ Thèmes personnalisés</li>
                    <li>✓ Support prioritaire</li>
                    <li>✓ Analyses de base</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-muted-foreground/30 hover:border-accent transition-colors">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2">⭐ Pro</h3>
                  <p className="text-muted-foreground mb-4">À partir de 79 EUR/mois</p>
                  <ul className="text-sm text-left space-y-2">
                    <li>✓ Produits illimités</li>
                    <li>✓ Personnalisation avancée</li>
                    <li>✓ Support 24/7</li>
                    <li>✓ Analyses avancées</li>
                    <li>✓ Intégrations API</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-muted-foreground/30 hover:border-primary transition-colors">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2">👑 Enterprise</h3>
                  <p className="text-muted-foreground mb-4">À partir de 299 EUR/mois</p>
                  <ul className="text-sm text-left space-y-2">
                    <li>✓ Tout du Pro</li>
                    <li>✓ Support dédié</li>
                    <li>✓ Formation personnalisée</li>
                    <li>✓ Intégrations illimitées</li>
                    <li>✓ SLA garanti</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
                target="_blank"
                rel="noopener noreferrer"
                className="transition-transform hover:scale-105"
              >
                <div className="flex items-center gap-3 bg-gradient-to-r from-green-700 to-green-800 text-white px-6 py-3 rounded-lg hover:from-green-800 hover:to-green-900 transition-all duration-300 shadow-lg">
                  <Image
                    src="/images/playstore-icon.png"
                    alt="Google Play"
                    width={32}
                    height={32}
                    className="w-8 h-8"
                  />
                  <div className="text-left">
                    <div className="text-xs">Disponible sur</div>
                    <div className="text-lg font-semibold">Google Play</div>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Musical Notes Decoration */}
          <div className="flex items-center justify-center gap-8 text-accent/30 text-3xl mt-8">
            <span>♪</span>
            <span>♫</span>
            <span>♪</span>
            <span>♫</span>
            <span>♪</span>
          </div>
        </div>
      </div>
    </main>
  )
}
