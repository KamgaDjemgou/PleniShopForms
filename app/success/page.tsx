"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Music, RotateCcw, Piano } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const orderTotal = searchParams.get("total")
  const currency = searchParams.get("currency")
  const mainPackTotal = searchParams.get("mainPackTotal")
  const accompanimentTotal = searchParams.get("accompanimentTotal")
  const frequency = searchParams.get("frequency")

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl md:text-3xl font-bold text-green-700 mb-2">Commande Confirmée !</CardTitle>
          <p className="text-muted-foreground text-lg">Votre commande a été enregistrée avec succès</p>
        </CardHeader>

        <CardContent className="space-y-6 text-center">
          {orderTotal && currency && (
            <div className="space-y-4">
              {mainPackTotal && Number.parseInt(mainPackTotal) > 0 && (
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-lg border border-primary/20">
                  <h3 className="text-lg font-semibold mb-2 flex items-center justify-center gap-2">
                    <Music className="h-5 w-5 text-primary" />
                    Pack Principal {frequency && `(${frequency})`}
                  </h3>
                  <p className="text-3xl font-bold text-primary">
                    {Number.parseInt(mainPackTotal).toLocaleString()} {currency}
                  </p>
                </div>
              )}

              {accompanimentTotal && Number.parseInt(accompanimentTotal) > 0 && (
                <div className="bg-gradient-to-r from-secondary/10 to-secondary/5 p-6 rounded-lg border border-secondary/20">
                  <h3 className="text-lg font-semibold mb-2 flex items-center justify-center gap-2">
                    <Piano className="h-5 w-5 text-secondary" />
                    Packs d'Accompagnement
                  </h3>
                  <p className="text-3xl font-bold text-secondary">
                    {Number.parseInt(accompanimentTotal).toLocaleString()} {currency}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-3">Que se passe-t-il maintenant ?</h3>
            <div className="text-sm text-green-700 space-y-2 text-left">
              <p>✅ Votre commande a été enregistrée dans notre système</p>
              <p>✅ Notre équipe PLENISOFTS vous contactera pour finaliser votre abonnement</p>
              <p>✅ Vous aurez accès à vos packs selon les modalités choisies</p>
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
              <Link href="/order" className="flex items-center justify-center gap-2">
                <RotateCcw className="h-4 w-4" />
                Nouvelle Commande
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1 bg-transparent" size="lg">
              <Link href="/" className="flex items-center justify-center gap-2">
                Retour à l'accueil
              </Link>
            </Button>
          </div>

          {/* Thank You Message */}
          <div className="pt-4 border-t">
            <p className="text-lg font-medium text-primary mb-2">Merci de votre confiance ! 🎵</p>
            <p className="text-sm text-muted-foreground">
              L'équipe PLENISOFTS est ravie de vous accompagner dans votre parcours musical.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
