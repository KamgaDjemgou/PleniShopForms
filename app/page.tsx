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
            <div className="flex items-center justify-center gap-4 mb-6">
              <Image
                src="/images/plenisofts-logo.png"
                alt="PleniSofts Logo"
                width={120}
                height={80}
                className="object-contain w-24 h-auto sm:w-32 md:w-40"
                priority
              />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary mb-4 text-balance">PLENIHARMONY</h1>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-8 text-pretty max-w-3xl mx-auto">
              Plateforme d'apprentissage du chant et d'accompagnement aux instruments
            </p>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-12">
              <Card className="bg-accent/10 border-accent/20 hover:bg-accent/20 transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <span className="text-4xl mb-4 block">🎵</span>
                  <h3 className="font-semibold text-accent mb-2">Harmonisation</h3>
                  <p className="text-sm text-muted-foreground">Apprenez les techniques d'harmonisation</p>
                </CardContent>
              </Card>
              <Card className="bg-primary/10 border-primary/20 hover:bg-primary/20 transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <span className="text-4xl mb-4 block">🎹</span>
                  <h3 className="font-semibold text-primary mb-2">Instruments</h3>
                  <p className="text-sm text-muted-foreground">Maîtrisez l'accompagnement instrumental</p>
                </CardContent>
              </Card>
              <Card className="bg-secondary/10 border-secondary/20 hover:bg-secondary/20 transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <span className="text-4xl mb-4 block">🎤</span>
                  <h3 className="font-semibold text-secondary mb-2">Voix</h3>
                  <p className="text-sm text-muted-foreground">Développez votre technique vocale</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* App Store Links */}
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">Téléchargez l'application</h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link
                href="https://apps.apple.com/fr/app/pleniharmony/id6749804829?l=en-GB"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-transform hover:scale-105"
              >
                <div className="flex items-center gap-3 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors">
                  <Image src="/images/appstore-icon.png" alt="App Store" width={24} height={24} className="w-6 h-6" />
                  <div className="text-left">
                    <div className="text-xs">Télécharger sur</div>
                    <div className="text-lg font-semibold">App Store</div>
                  </div>
                </div>
              </Link>
              <Link
                href="https://play.google.com/store/apps/details?id=com.codeforany.music_player"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-transform hover:scale-105"
              >
                <div className="flex items-center gap-3 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
                  <Image
                    src="/images/playstore-icon.png"
                    alt="Google Play"
                    width={24}
                    height={24}
                    className="w-6 h-6"
                  />
                  <div className="text-left">
                    <div className="text-xs">Disponible sur</div>
                    <div className="text-lg font-semibold">Google Play</div>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Call to Action */}
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4">
                Nous serions ravis de recueillir vos commandes et suggestions pour PleniHarmony chez vous !
              </h2>
              <p className="text-muted-foreground mb-6 text-lg">
                Passez votre commande personnalisée et aidez-nous à améliorer votre expérience musicale
              </p>
              <Link href="/order">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg">
                  Passer une commande
                </Button>
              </Link>
            </CardContent>
          </Card>

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
