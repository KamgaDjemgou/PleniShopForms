"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertCircle,
  Music,
  User,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Check,
  Piano,
  Mic,
  Wallet,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { saveToGoogleSheets } from "@/lib/google-sheets"
import { sendOrderConfirmationEmail } from "@/lib/email"
import { useRouter } from "next/navigation"

interface FormData {
  name: string
  phone: string
  email: string
  currency: "EUR" | "FCFA"
  selectedPack: string
  accompanimentPacks: { [key: string]: number }
  comments: string
  paymentFrequency: "monthly" | "quarterly" | "biannual" | "annual"
  paymentMethod: "bank" | "mobile" | "paypal"
}

const PACKS = [
  { id: "free", name: "Pack Free", description: "50 chants harmonisés (Gratuit)", priceEUR: 0, priceFCFA: 0 },
  {
    id: "david",
    name: "Pack David",
    description: "100 chants harmonisés/orchestrés, réservé à une seule personne",
    priceEUR: 20,
    priceFCFA: 10000,
    monthly: true,
  },
  {
    id: "ekklesia1",
    name: "Pack Ekklesia 1",
    description: "Tous les chants harmonisés/orchestrés, groupe de 1 à 10 personnes",
    priceEUR: 100,
    priceFCFA: 50000,
    monthly: true,
  },
  {
    id: "ekklesia2",
    name: "Pack Ekklesia 2",
    description: "Tous les chants harmonisés/orchestrés, groupe de 11 à 50 personnes",
    priceEUR: 200,
    priceFCFA: 100000,
    monthly: true,
  },
  {
    id: "ekklesia3",
    name: "Pack Ekklesia 3",
    description: "Tous les chants harmonisés/orchestrés, groupe de 51 à 100 personnes",
    priceEUR: 300,
    priceFCFA: 150000,
    monthly: true,
  },
  {
    id: "ekklesia4",
    name: "Pack Ekklesia 4",
    description: "Tous les chants harmonisés/orchestrés, groupe de plus de 100 personnes",
    priceEUR: 300,
    priceFCFA: 200000,
    monthly: true,
  },
]

const ACCOMPANIMENT_PACKS = [
  {
    id: "asaph",
    name: "Pack Asaph",
    description: "Écriture de chant chrétien",
    priceEUR: 10,
    priceFCFA: 5000,
    icon: "✍️",
  },
  {
    id: "ethan1",
    name: "Pack Ethan 1",
    description: "Instrumentation Piano/Guitare",
    priceEUR: 20,
    priceFCFA: 10000,
    icon: "🎹",
  },
  {
    id: "ethan2",
    name: "Pack Ethan 2",
    description: "Instrumentation Piano/Bass/Rythmique",
    priceEUR: 100,
    priceFCFA: 50000,
    icon: "🎸",
  },
  {
    id: "ethan3",
    name: "Pack Ethan 3",
    description: "Instrumentation enrichie",
    priceEUR: 300,
    priceFCFA: 150000,
    icon: "🎺",
  },
  {
    id: "heman1",
    name: "Pack Heman 1",
    description: "Conduite de Louange",
    priceEUR: 20,
    priceFCFA: 10000,
    icon: "🎤",
  },
  {
    id: "heman2",
    name: "Pack Heman 2",
    description: "Production SON (studio)",
    priceEUR: 400,
    priceFCFA: 200000,
    icon: "🎧",
  },
  {
    id: "heman3",
    name: "Pack Heman 3",
    description: "Production VIDEO (clip)",
    priceEUR: 1000,
    priceFCFA: 500000,
    icon: "🎬",
  },
  {
    id: "heman4",
    name: "Pack Heman 4",
    description: "Déploiement sur les réseaux sociaux",
    priceEUR: 20,
    priceFCFA: 50000,
    icon: "📱",
  },
]

const STEPS = [
  { id: 1, title: "Informations", icon: User },
  { id: 2, title: "Pack principal", icon: Music },
  { id: 3, title: "Pack(s) d'accompagnement", icon: Piano },
  { id: 4, title: "Paiement", icon: Wallet },
  { id: 5, title: "Commentaires", icon: Mic },
  { id: 6, title: "Récapitulatif", icon: CreditCard },
]

export function MultiStepOrderForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    email: "",
    currency: "EUR",
    selectedPack: "",
    accompanimentPacks: {},
    comments: "",
    paymentFrequency: "monthly",
    paymentMethod: "bank",
  })

  const calculateTotal = () => {
    let mainPackTotal = 0
    let accompanimentTotal = 0

    if (formData.selectedPack) {
      const pack = PACKS.find((p) => p.id === formData.selectedPack)
      if (pack && pack.priceEUR > 0) {
        const basePrice = formData.currency === "EUR" ? pack.priceEUR : pack.priceFCFA
        const frequencyMultiplier = getFrequencyMultiplier(formData.paymentFrequency)
        mainPackTotal = basePrice * frequencyMultiplier
      }
    }

    Object.entries(formData.accompanimentPacks).forEach(([packId, quantity]) => {
      const pack = ACCOMPANIMENT_PACKS.find((p) => p.id === packId)
      if (pack && quantity > 0) {
        const price = formData.currency === "EUR" ? pack.priceEUR : pack.priceFCFA
        accompanimentTotal += price * quantity
      }
    })

    return { mainPackTotal, accompanimentTotal, total: mainPackTotal + accompanimentTotal }
  }

  const getFrequencyMultiplier = (frequency: string) => {
    switch (frequency) {
      case "monthly":
        return 1
      case "quarterly":
        return 3
      case "biannual":
        return 6
      case "annual":
        return 12
      default:
        return 1
    }
  }

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case "monthly":
        return "Mensuelle"
      case "quarterly":
        return "Trimestrielle"
      case "biannual":
        return "Semestrielle"
      case "annual":
        return "Annuelle"
      default:
        return "Mensuelle"
    }
  }

  const updateAccompanimentQuantity = (packId: string, quantity: number) => {
    setFormData((prev) => ({
      ...prev,
      accompanimentPacks: {
        ...prev.accompanimentPacks,
        [packId]: Math.max(0, quantity),
      },
    }))
  }

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return formData.name && formData.phone && formData.email
      case 2:
        return formData.selectedPack
      case 3:
      case 4:
      case 5:
        return true
      default:
        return false
    }
  }

  const nextStep = () => {
    if (currentStep < STEPS.length && canProceedToNext()) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitMessage(null)

    try {
      const totals = calculateTotal()
      const submissionData = {
        ...formData,
        totalPrice: totals.total,
        mainPackTotal: totals.mainPackTotal,
        accompanimentTotal: totals.accompanimentTotal,
        paymentFrequency: formData.paymentFrequency,
        paymentMethod: formData.paymentMethod,
      }

      console.log("[v0] Submitting directly to Google Sheets:", submissionData)

      const result = await saveToGoogleSheets(submissionData)

      if (result.success) {
        try {
          console.log("[v0] Sending confirmation email directly")
          const emailResult = await sendOrderConfirmationEmail(submissionData)

          if (!emailResult.success) {
            console.warn("[v0] Email sending failed:", emailResult.message)
            // Continue with success flow even if email fails
          } else {
            console.log("[v0] Confirmation email sent successfully")
          }
        } catch (emailError) {
          console.warn("[v0] Email sending error:", emailError)
          // Continue with success flow even if email fails
        }

        const params = new URLSearchParams({
          total: totals.total.toString(),
          currency: formData.currency,
          mainPackTotal: totals.mainPackTotal.toString(),
          accompanimentTotal: totals.accompanimentTotal.toString(),
          frequency: getFrequencyLabel(formData.paymentFrequency),
        })
        router.push(`/success?${params.toString()}`)
        console.log("[v0] Form submitted successfully, redirecting to success page")
      } else {
        setSubmitMessage({ type: "error", text: result.message })
        console.log("[v0] Form submission failed:", result.message)
      }
    } catch (error) {
      console.error("[v0] Submission error:", error)
      setSubmitMessage({
        type: "error",
        text: "Erreur de connexion. Veuillez réessayer.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 heading-responsive">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                Informations Personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="spacing-responsive">
              <div>
                <Label htmlFor="name" className="text-responsive">
                  Nom complet *
                </Label>
                <Input
                  id="name"
                  required
                  placeholder="Votre nom complet ou nom de groupe"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="mt-2 text-responsive"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-responsive">
                  Numéro de téléphone (WhatsApp de préférence) *
                </Label>
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <Input
                    id="phone"
                    type="tel"
                    required
                    placeholder="ex: +212699999999"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    className="flex-1 text-responsive"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-responsive">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="mt-2 text-responsive"
                />
              </div>

              <div>
                <Label className="text-responsive">Zone (Devise choisie) *</Label>
                <RadioGroup
                  value={formData.currency}
                  onValueChange={(value: "EUR" | "FCFA") => setFormData((prev) => ({ ...prev, currency: value }))}
                  className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-2"
                >
                  <div className="flex items-center space-x-2 p-3 rounded-lg border border-accent/20 hover:bg-accent/10 transition-colors border-l-4 border-l-accent/50">
                    <RadioGroupItem value="EUR" id="eur" />
                    <Label htmlFor="eur" className="text-responsive cursor-pointer">
                      🇪🇺 EUR
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border border-secondary/20 hover:bg-secondary/10 transition-colors border-l-4 border-l-secondary/50">
                    <RadioGroupItem value="FCFA" id="fcfa" />
                    <Label htmlFor="fcfa" className="text-responsive cursor-pointer">
                      🌍 FCFA
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        )

      case 2:
        return (
          <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 heading-responsive">
                <Music className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Sélection du Pack Principal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={formData.selectedPack}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, selectedPack: value }))}
                className="space-y-3"
              >
                {PACKS.map((pack) => (
                  <div
                    key={pack.id}
                    className="flex items-start space-x-3 p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors border-l-4 border-l-accent/50"
                  >
                    <RadioGroupItem value={pack.id} id={pack.id} className="mt-1" />
                    <div className="flex-1 min-w-0">
                      <Label
                        htmlFor={pack.id}
                        className="font-medium cursor-pointer flex items-center gap-2 text-responsive"
                      >
                        🎵 {pack.name}
                      </Label>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1 text-pretty">{pack.description}</p>
                      <p className="text-xs sm:text-sm font-semibold text-primary mt-1">
                        {pack.priceEUR === 0
                          ? "✨ Gratuit"
                          : `${formData.currency === "EUR" ? pack.priceEUR + " EUR" : pack.priceFCFA.toLocaleString() + " FCFA"}${pack.monthly ? " / mois" : ""}`}
                      </p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        )

      case 3:
        return (
          <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 heading-responsive">
                <Piano className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
                Packs d'Accompagnement (Optionnel)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ACCOMPANIMENT_PACKS.map((pack) => (
                  <div
                    key={pack.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors border-l-4 border-l-secondary/50 gap-3 sm:gap-0"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id={pack.id}
                          checked={(formData.accompanimentPacks[pack.id] || 0) > 0}
                          onCheckedChange={(checked) => {
                            updateAccompanimentQuantity(pack.id, checked ? 1 : 0)
                          }}
                          className="mt-1"
                        />
                        <div className="min-w-0">
                          <Label
                            htmlFor={pack.id}
                            className="font-medium cursor-pointer flex items-center gap-2 text-responsive"
                          >
                            <span className="text-base sm:text-lg">{pack.icon}</span>
                            {pack.name}
                          </Label>
                          <p className="text-xs sm:text-sm text-muted-foreground text-pretty">{pack.description}</p>
                          <p className="text-xs sm:text-sm font-semibold text-secondary">
                            {formData.currency === "EUR"
                              ? pack.priceEUR + " EUR"
                              : pack.priceFCFA.toLocaleString() + " FCFA"}{" "}
                            par chant
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center sm:justify-end space-x-2 ml-8 sm:ml-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateAccompanimentQuantity(pack.id, (formData.accompanimentPacks[pack.id] || 0) - 1)
                        }
                        disabled={(formData.accompanimentPacks[pack.id] || 0) <= 0}
                        className="h-8 w-8 p-0"
                      >
                        -
                      </Button>
                      <span className="w-8 text-center font-medium text-responsive">
                        {formData.accompanimentPacks[pack.id] || 0}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateAccompanimentQuantity(pack.id, (formData.accompanimentPacks[pack.id] || 0) + 1)
                        }
                        className="h-8 w-8 p-0"
                      >
                        +
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )

      case 4:
        return (
          <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 heading-responsive">
                <Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                Options de Paiement
              </CardTitle>
            </CardHeader>
            <CardContent className="spacing-responsive">
              {formData.selectedPack && PACKS.find((p) => p.id === formData.selectedPack)?.priceEUR > 0 && (
                <div>
                  <Label className="text-responsive font-semibold">
                    Fréquence de paiement (Pack principal uniquement)
                  </Label>
                  <RadioGroup
                    value={formData.paymentFrequency}
                    onValueChange={(value: "monthly" | "quarterly" | "biannual" | "annual") =>
                      setFormData((prev) => ({ ...prev, paymentFrequency: value }))
                    }
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3"
                  >
                    <div className="flex items-center space-x-2 p-3 rounded-lg border border-accent/20 hover:bg-accent/10 transition-colors">
                      <RadioGroupItem value="monthly" id="monthly" />
                      <Label htmlFor="monthly" className="text-responsive cursor-pointer">
                        Mensuelle
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 rounded-lg border border-accent/20 hover:bg-accent/10 transition-colors">
                      <RadioGroupItem value="quarterly" id="quarterly" />
                      <Label htmlFor="quarterly" className="text-responsive cursor-pointer">
                        Trimestrielle
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 rounded-lg border border-accent/20 hover:bg-accent/10 transition-colors">
                      <RadioGroupItem value="biannual" id="biannual" />
                      <Label htmlFor="biannual" className="text-responsive cursor-pointer">
                        Semestrielle
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 rounded-lg border border-accent/20 hover:bg-accent/10 transition-colors">
                      <RadioGroupItem value="annual" id="annual" />
                      <Label htmlFor="annual" className="text-responsive cursor-pointer">
                        Annuelle
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              <div>
                <Label className="text-responsive font-semibold">Moyen de paiement</Label>
                <RadioGroup
                  value={formData.paymentMethod}
                  onValueChange={(value: "bank" | "mobile" | "paypal") =>
                    setFormData((prev) => ({ ...prev, paymentMethod: value }))
                  }
                  className="space-y-4 mt-3"
                >
                  <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-2 mb-3">
                      <RadioGroupItem value="bank" id="bank" />
                      <Label htmlFor="bank" className="text-responsive cursor-pointer font-medium">
                        🏦 Par Virement / Versement / Transfert (RIA, MoneyGram, WU)
                      </Label>
                    </div>
                    {formData.paymentMethod === "bank" && (
                      <div className="ml-6 space-y-2 text-xs sm:text-sm bg-muted/30 p-3 rounded">
                        <p>
                          <strong>IBAN:</strong> MA64 013 780 0117320100800123 48
                        </p>
                        <p>
                          <strong>RIB:</strong> 013 780 0117320100800123 48
                        </p>
                        <p>
                          <strong>Code SWIFT:</strong> BMCIMAMC
                        </p>
                        <p>
                          <strong>Titulaire:</strong> DOGBRE SOKORA JEAN-CHRISTOPHE
                        </p>
                        <p>
                          <strong>Adresse:</strong> Casablanca, Maroc
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-2 mb-3">
                      <RadioGroupItem value="mobile" id="mobile" />
                      <Label htmlFor="mobile" className="text-responsive cursor-pointer font-medium">
                        📱 Par Mobile Money
                      </Label>
                    </div>
                    {formData.paymentMethod === "mobile" && (
                      <div className="ml-6 space-y-2 text-xs sm:text-sm bg-muted/30 p-3 rounded">
                        <p>
                          <strong>🇨🇮 Côte d'Ivoire (Orange / Wave):</strong> +2250703833108
                        </p>
                        <p>
                          <strong>🇧🇫 Burkina Faso (Orange):</strong> +22654725339
                        </p>
                        <p>
                          <strong>🇸🇳 Sénégal (Orange / Wave):</strong> +221775091447
                        </p>
                        <p>
                          <strong>🇬🇦 Gabon (Airtel):</strong> +24160271771
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-2 mb-3">
                      <RadioGroupItem value="paypal" id="paypal" />
                      <Label htmlFor="paypal" className="text-responsive cursor-pointer font-medium">
                        💳 Par PayPal
                      </Label>
                    </div>
                    {formData.paymentMethod === "paypal" && (
                      <div className="ml-6 text-xs sm:text-sm bg-muted/30 p-3 rounded">
                        <p>
                          <strong>Lien:</strong>{" "}
                          <a
                            href="https://paypal.me/chadahmusic"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            paypal.me/chadahmusic
                          </a>
                        </p>
                      </div>
                    )}
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        )

      case 5:
        return (
          <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 heading-responsive">
                <Mic className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                Commentaires et Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="comments" className="text-responsive">
                  Vos commentaires et suggestions (optionnel)
                </Label>
                <Textarea
                  id="comments"
                  placeholder="Partagez vos besoins spécifiques, suggestions ou questions..."
                  value={formData.comments}
                  onChange={(e) => setFormData((prev) => ({ ...prev, comments: e.target.value }))}
                  className="mt-2 text-responsive min-h-[120px] sm:min-h-[150px]"
                  rows={6}
                />
              </div>
            </CardContent>
          </Card>
        )

      case 6:
        const totals = calculateTotal()
        return (
          <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 heading-responsive">
                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Récapitulatif de votre commande
              </CardTitle>
            </CardHeader>
            <CardContent className="spacing-responsive">
              <div className="bg-muted/50 p-3 sm:p-4 rounded-lg border border-accent/20">
                <h3 className="font-semibold mb-2 flex items-center gap-2 text-responsive">
                  <User className="h-4 w-4 text-accent" />
                  Informations personnelles
                </h3>
                <div className="text-xs sm:text-sm space-y-1">
                  <p>
                    <strong>Nom:</strong> {formData.name}
                  </p>
                  <p>
                    <strong>Téléphone:</strong> {formData.phone}
                  </p>
                  <p>
                    <strong>Email:</strong> {formData.email}
                  </p>
                  <p>
                    <strong>Devise:</strong> {formData.currency}
                  </p>
                </div>
              </div>

              {formData.selectedPack && (
                <div className="bg-muted/50 p-3 sm:p-4 rounded-lg border border-primary/20">
                  <h3 className="font-semibold mb-2 flex items-center gap-2 text-responsive">
                    <Music className="h-4 w-4 text-primary" />
                    Pack principal sélectionné
                  </h3>
                  {(() => {
                    const pack = PACKS.find((p) => p.id === formData.selectedPack)
                    return pack ? (
                      <div className="text-xs sm:text-sm space-y-2">
                        <p>
                          <strong>{pack.name}</strong>
                        </p>
                        <p className="text-muted-foreground text-pretty">{pack.description}</p>
                        {pack.priceEUR > 0 && (
                          <>
                            <p>
                              <strong>Fréquence:</strong> {getFrequencyLabel(formData.paymentFrequency)}
                            </p>
                            <p className="text-primary font-semibold">
                              Total: {totals.mainPackTotal.toLocaleString()} {formData.currency}
                            </p>
                          </>
                        )}
                        {pack.priceEUR === 0 && <p className="text-primary font-semibold">Gratuit</p>}
                      </div>
                    ) : null
                  })()}
                </div>
              )}

              {Object.entries(formData.accompanimentPacks).some(([_, qty]) => qty > 0) && (
                <div className="bg-muted/50 p-3 sm:p-4 rounded-lg border border-secondary/20">
                  <h3 className="font-semibold mb-2 flex items-center gap-2 text-responsive">
                    <Piano className="h-4 w-4 text-secondary" />
                    Packs d'accompagnement
                  </h3>
                  <div className="space-y-2 text-xs sm:text-sm">
                    {Object.entries(formData.accompanimentPacks).map(([packId, quantity]) => {
                      if (quantity <= 0) return null
                      const pack = ACCOMPANIMENT_PACKS.find((p) => p.id === packId)
                      if (!pack) return null
                      const price = formData.currency === "EUR" ? pack.priceEUR : pack.priceFCFA
                      return (
                        <div
                          key={packId}
                          className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0"
                        >
                          <div className="min-w-0">
                            <p>
                              <strong>{pack.name}</strong> x{quantity}
                            </p>
                            <p className="text-muted-foreground text-xs text-pretty">{pack.description}</p>
                          </div>
                          <p className="text-secondary font-semibold">
                            {(price * quantity).toLocaleString()} {formData.currency}
                          </p>
                        </div>
                      )
                    })}
                    <div className="border-t pt-2 mt-2">
                      <p className="text-secondary font-semibold text-right">
                        Total accompagnement: {totals.accompanimentTotal.toLocaleString()} {formData.currency}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-muted/50 p-3 sm:p-4 rounded-lg border border-accent/20">
                <h3 className="font-semibold mb-2 flex items-center gap-2 text-responsive">
                  <Wallet className="h-4 w-4 text-accent" />
                  Informations de paiement
                </h3>
                <div className="text-xs sm:text-sm space-y-1">
                  {formData.selectedPack && PACKS.find((p) => p.id === formData.selectedPack)?.priceEUR > 0 && (
                    <p>
                      <strong>Fréquence:</strong> {getFrequencyLabel(formData.paymentFrequency)}
                    </p>
                  )}
                  <p>
                    <strong>Moyen de paiement:</strong>{" "}
                    {formData.paymentMethod === "bank"
                      ? "Virement / Transfert"
                      : formData.paymentMethod === "mobile"
                        ? "Mobile Money"
                        : "PayPal"}
                  </p>
                </div>
              </div>

              {formData.comments && (
                <div className="bg-muted/50 p-3 sm:p-4 rounded-lg border border-accent/20">
                  <h3 className="font-semibold mb-2 flex items-center gap-2 text-responsive">
                    <Mic className="h-4 w-4 text-accent" />
                    Commentaires
                  </h3>
                  <p className="text-xs sm:text-sm text-pretty">{formData.comments}</p>
                </div>
              )}

              <Alert className="border-accent/30 bg-accent/5 mt-4">
                <AlertCircle className="h-4 w-4 text-accent" />
                <AlertDescription className="text-xs sm:text-sm">
                  <strong>NOTE IMPORTANTE</strong>
                  <br />
                  Vous avez la possibilité une fois abonné(e) de :
                  <br />• soit demander une harmonisation (voix) ou une instrumentation (instrument piano ou guitare ou
                  bass ou batterie) d'un chant donné à PLENIHARMONY ({formData.currency === "FCFA" ? "10.000 FCFA" : "20 EUR"} si votre proposition est retenue).
                  <br />• soit proposer à PLENIHARMONY votre propre harmonisation ou instrumentation pour enrichir la base
                  de chants (dans ce cas, PLENIHARMONY vous paiera{" "}
                  {formData.currency === "FCFA" ? "10.000 FCFA" : "20 EUR"} si votre proposition est retenue).
                </AlertDescription>
              </Alert>

              <div className="space-y-4 mt-4">
                {totals.mainPackTotal > 0 && (
                  <div className="border-2 border-primary rounded-lg p-4 sm:p-6 text-center musical-gradient text-white shadow-lg">
                    <h3 className="text-base sm:text-lg font-semibold mb-2">Pack Principal</h3>
                    <p className="text-sm opacity-90">{getFrequencyLabel(formData.paymentFrequency)}</p>
                    <p className="text-2xl sm:text-3xl md:text-4xl font-bold mt-2">
                      {totals.mainPackTotal.toLocaleString()} {formData.currency}
                    </p>
                  </div>
                )}

                {totals.accompanimentTotal > 0 && (
                  <div className="border-2 border-secondary rounded-lg p-4 sm:p-6 text-center bg-gradient-to-br from-secondary/20 to-secondary/10 shadow-lg">
                    <h3 className="text-base sm:text-lg font-semibold mb-2 text-secondary">Packs d'Accompagnement</h3>
                    <p className="text-2xl sm:text-3xl md:text-4xl font-bold mt-2 text-secondary">
                      {totals.accompanimentTotal.toLocaleString()} {formData.currency}
                    </p>
                  </div>
                )}
              </div>

              <Button
                onClick={handleSubmit}
                size="lg"
                className="w-full text-responsive py-3 sm:py-4 mt-4 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enregistrement en cours...
                  </>
                ) : (
                  "Confirmer la commande"
                )}
              </Button>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="spacing-responsive">
      <div className="bg-card/70 backdrop-blur-sm rounded-lg p-3 sm:p-6 shadow-lg border border-accent/20">
        <div className="flex items-center justify-between mb-4 overflow-x-auto pb-2">
          {STEPS.map((step, index) => {
            const Icon = step.icon
            const isActive = currentStep === step.id
            const isCompleted = currentStep > step.id

            return (
              <div key={step.id} className="flex items-center flex-shrink-0">
                <div
                  className={`step-indicator flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-all duration-300 ${
                    isCompleted
                      ? "bg-accent border-accent text-white shadow-lg"
                      : isActive
                        ? "border-primary text-primary bg-primary/10 shadow-md"
                        : "border-muted-foreground/30 text-muted-foreground"
                  } ${isActive ? "active" : ""}`}
                >
                  {isCompleted ? (
                    <Check className="h-3 w-3 sm:h-5 sm:w-5" />
                  ) : (
                    <Icon className="h-3 w-3 sm:h-5 sm:w-5" />
                  )}
                </div>
                <div className="ml-2 sm:ml-3 hidden sm:block">
                  <p
                    className={`text-xs sm:text-sm font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}
                  >
                    Étape {step.id}
                  </p>
                  <p className={`text-xs ${isActive ? "text-primary" : "text-muted-foreground"}`}>{step.title}</p>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`hidden sm:block w-8 sm:w-12 h-0.5 ml-2 sm:ml-4 transition-colors duration-300 ${
                      isCompleted ? "bg-accent" : "bg-muted-foreground/30"
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>
        <Progress value={(currentStep / STEPS.length) * 100} className="h-2 bg-muted" />
      </div>

      <div className="min-h-[400px] sm:min-h-[500px]">{renderStepContent()}</div>

      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="flex items-center justify-center gap-2 bg-transparent order-2 sm:order-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Précédent
        </Button>

        {currentStep < STEPS.length ? (
          <Button
            onClick={nextStep}
            disabled={!canProceedToNext()}
            className="flex items-center justify-center gap-2 order-1 sm:order-2"
          >
            Suivant
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
    </div>
  )
}
