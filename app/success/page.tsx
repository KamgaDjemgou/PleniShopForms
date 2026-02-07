"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Store, RotateCcw, ShoppingCart, Home } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const shopName = searchParams.get("shopName")
  const packageName = searchParams.get("packageName")
  const setupOption = searchParams.get("setupOption")

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <Image
              src="/images/plenisofts-logo.png"
              alt="PleniShop Logo"
              width={60}
              height={60}
              priority
            />
          </div>
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl md:text-3xl font-bold text-green-700 mb-2">Inscription PleniShop Enregistrée !</CardTitle>
          <p className="text-muted-foreground text-lg">Votre boutique a été enregistrée avec succès.</p>
        </CardHeader>

        <CardContent className="space-y-6 text-center">
          {/* Shop Details */}
          <div className="space-y-4">
            {shopName && (
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-lg border border-primary/20">
                <h3 className="text-lg font-semibold mb-2 flex items-center justify-center gap-2">
                  <Store className="h-5 w-5 text-primary" />
                  Boutique
                </h3>
                <p className="text-2xl font-bold text-primary">
                  {shopName}
                </p>
              </div>
            )}

            {packageName && (
              <div className="bg-gradient-to-r from-secondary/10 to-secondary/5 p-6 rounded-lg border border-secondary/20">
                <h3 className="text-lg font-semibold mb-2 flex items-center justify-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-secondary" />
                  Pack Sélectionné
                </h3>
                <p className="text-2xl font-bold text-secondary">
                  {packageName}
                </p>
              </div>
            )}

            {setupOption && (
              <div className="bg-gradient-to-r from-accent/10 to-accent/5 p-6 rounded-lg border border-accent/20">
                <h3 className="text-lg font-semibold mb-2 text-accent">
                  Configuration des Produits
                </h3>
                <p className="text-lg font-semibold text-accent">
                  {setupOption}
                </p>
              </div>
            )}
          </div>

          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-4">Que se passe-t-il maintenant ?</h3>
            <div className="text-sm text-green-700 space-y-3 text-left">
              <p>✅ Votre inscription à PleniShop a été enregistrée dans notre système.</p>
              <p>✅ Vous recevrez un email de confirmation avec vos identifiants d'accès à votre tableau de bord.</p>
              <p>✅ Notre équipe PLENISOFTS vous contactera pour les détails de mise en place de votre boutique.</p>
              {setupOption?.includes("Assistance") && (
                <p>✅ Nous procéderons à l'importation et au paramétrage de vos produits selon le fichier Excel fourni.</p>
              )}
              <p>✅ Votre boutique sera accessible en ligne dans les délais convenus.</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-muted/50 p-4 rounded-lg border">
            <p className="text-sm text-muted-foreground">
              <strong>Questions ?</strong> Notre équipe est là pour vous aider.
              <br />
              Nous vous contacterons via WhatsApp ou email dans les plus brefs délais.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button asChild className="flex-1" size="lg">
              <Link href="/inscription" className="flex items-center justify-center gap-2">
                <RotateCcw className="h-4 w-4" />
                Nouvelle boutique
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1 bg-transparent" size="lg">
              <Link href="/" className="flex items-center justify-center gap-2">
                <Home className="h-4 w-4" />
                Retour à la page d'accueil
              </Link>
            </Button>
          </div>

          {/* Thank You Message */}
          <div className="pt-4 border-t">
            <p className="text-lg font-medium text-primary mb-2">Merci d'avoir choisi PleniShop ! 🚀</p>
            <p className="text-sm text-muted-foreground">
              L'équipe PLENISOFTS est ravie de vous accompagner dans la création et le développement de votre boutique en ligne.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
