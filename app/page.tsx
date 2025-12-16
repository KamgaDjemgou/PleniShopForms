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
                src="/images/full-chadah-logo.jpg"
                alt="Chadah Academy Logo"
                width={120}
                height={80}
                className="object-contain w-24 h-auto sm:w-32 md:w-40"
                priority
              />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary mb-4 text-balance">CHADAH ACADEMY</h1>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-8 text-pretty max-w-3xl mx-auto italic">
              Une École pour Chantres exercés au chant de l'Éternel et habiles dans leur ministère
            </p>

            {/* Video Presentation */}
            <div className="mb-12">
              <div className="relative w-full max-w-3xl mx-auto aspect-video rounded-xl overflow-hidden shadow-2xl border-2 border-primary/20">
                <iframe
                  src="https://www.youtube.com/embed/94_esRr94pU"
                  title="Présentation Chadah Academy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-12">
              <Card className="bg-accent/10 border-accent/20 hover:bg-accent/20 transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <span className="text-4xl mb-4 block">🎤</span>
                  <h3 className="font-semibold text-accent mb-2">CHANT</h3>
                  <p className="text-sm text-muted-foreground">Apprenez à chanter et à harmoniser les cantiques</p>
                </CardContent>
              </Card>
              <Card className="bg-primary/10 border-primary/20 hover:bg-primary/20 transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <span className="text-4xl mb-4 block">🎹</span>
                  <h3 className="font-semibold text-primary mb-2">INSTRUMENTS</h3>
                  <p className="text-sm text-muted-foreground">Apprenez à jouer au piano, à la guitare, à la percussion et à accompagner les cantiques</p>
                </CardContent>
              </Card>
              <Card className="bg-secondary/10 border-secondary/20 hover:bg-secondary/20 transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <span className="text-4xl mb-4 block">🎵</span>
                  <h3 className="font-semibold text-secondary mb-2">ACCOMPAGNEMENTS</h3>
                  <p className="text-sm text-muted-foreground">Profitez de notre accompagnement dans votre ministère, et/ou de nos services dans votre production/diffusion musicale</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Call to Action - Inscription */}
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20 mb-12">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-6">
                Inscrivez-vous dès maintenant à Chadah Academy en cliquant ici :
              </h2>
              <Link href="/inscription">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-4 text-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300">
                  Je m'inscris
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* App Store Links */}
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">Téléchargez la version gratuite de l'application PLENIHARMONY</h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link
                href="https://apps.apple.com/fr/app/pleniharmony/id6749804829?l=en-GB"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-transform hover:scale-105"
              >
                <div className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg">
                  <Image src="/images/appstore-icon.png" alt="App Store" width={32} height={32} className="w-8 h-8" />
                  <div className="text-left">
                    <div className="text-xs">Disponible sur</div>
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
