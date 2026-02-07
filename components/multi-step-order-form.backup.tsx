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
  Store,
  User,
  Package,
  ChevronLeft,
  ChevronRight,
  Check,
  ShoppingCart,
  FileText,
  Upload,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { saveToGoogleSheets } from "@/lib/google-sheets"
import { sendOrderConfirmationEmail } from "@/lib/email"
import { useRouter } from "next/navigation"

interface FormData {
  // Step 1: Shop Manager Info
  managerName: string
  managerEmail: string
  managerPhone: string
  // Step 1: Shop Info
  shopName: string
  shopEmail: string
  shopPhone: string
  city: string
  country: string
  currency: "EUR" | "FCFA"
  // Step 2: Products
  productSetupOption: "self" | "assistance" | ""
  excelFile?: File
  // Step 3: Package
  selectedPackage: "free" | "starter" | "pro" | "enterprise" | ""
  comments: string
}

const PACKAGES = [
  {
    id: "free",
    name: "Free",
    description: "Gratuit - Parfait pour commencer",
    features: [
      "Jusqu'à 50 produits",
      "Thème standard",
      "Support par email",
    ],
    icon: "🎁",
  },
  {
    id: "starter",
    name: "Starter",
    description: "Pour les petites boutiques",
    priceEUR: 29,
    priceFCFA: 15000,
    features: [
      "Jusqu'à 500 produits",
      "Thèmes personnalisés",
      "Support prioritaire",
      "Analyses de base",
    ],
    icon: "🚀",
  },
  {
    id: "pro",
    name: "Pro",
    description: "Pour les boutiques en croissance",
    priceEUR: 79,
    priceFCFA: 40000,
    features: [
      "Produits illimités",
      "Personnalisation avancée",
      "Support prioritaire 24/7",
      "Analyses avancées",
      "Intégrations API",
    ],
    icon: "⭐",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Pour les grandes boutiques",
    priceEUR: 299,
    priceFCFA: 150000,
    features: [
      "Tout du Pro",
      "Support dédié",
      "Formation personnalisée",
      "Intégrations illimitées",
      "SLA garanti",
    ],
    icon: "👑",
  },
]

const STEPS = [
  { id: 1, title: "Boutique", icon: Store },
  { id: 2, title: "Produits", icon: Package },
  { id: 3, title: "Pack", icon: ShoppingCart },
  { id: 4, title: "Récapitulatif", icon: FileText },
]

export function MultiStepOrderForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [excelFile, setExcelFile] = useState<File | null>(null)
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    managerName: "",
    managerEmail: "",
    managerPhone: "",
    shopName: "",
    shopEmail: "",
    shopPhone: "",
    city: "",
    country: "",
    currency: "EUR",
    productSetupOption: "",
    selectedPackage: "",
    comments: "",
  })

  const calculatePackagePrice = () => {
    if (!formData.selectedPackage) return 0
    const pkg = PACKAGES.find((p) => p.id === formData.selectedPackage)
    if (!pkg || pkg.id === "free") return 0
    return formData.currency === "EUR" ? pkg.priceEUR || 0 : pkg.priceFCFA || 0
  }

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.managerName &&
          formData.managerEmail &&
          formData.managerPhone &&
          formData.shopName &&
          formData.shopEmail &&
          formData.city &&
          formData.country
        )
      case 2:
        return formData.productSetupOption !== ""
      case 3:
        return formData.selectedPackage !== ""
      case 4:
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setExcelFile(file)
      setFormData((prev) => ({ ...prev, excelFile: file }))
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitMessage(null)

    try {
      const packagePrice = calculatePackagePrice()
      const packageName = PACKAGES.find((p) => p.id === formData.selectedPackage)?.name || ""

      const submissionData = {
        ...formData,
        excelFileName: excelFile?.name,
        packagePrice,
        packageName,
        submittedAt: new Date().toISOString(),
      }

      console.log("[v0] Submitting directly to Google Sheets:", submissionData)

      const result = await saveToGoogleSheets(submissionData)

      if (result.success) {
        try {
          console.log("[v0] Sending confirmation email directly")
          const emailResult = await sendOrderConfirmationEmail(submissionData)

          if (!emailResult.success) {
            console.warn("[v0] Email sending failed:", emailResult.message)
          } else {
            console.log("[v0] Confirmation email sent successfully")
          }
        } catch (emailError) {
          console.warn("[v0] Email sending error:", emailError)
        }

        const params = new URLSearchParams({
          shopName: formData.shopName,
          packageName: packageName,
          setupOption: formData.productSetupOption === "self" ? "Paramétrage personnel" : "Assistance PLENISOFTS",
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
                Sélection du Module Chadah
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-3 sm:p-4 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm sm:text-base font-semibold text-primary">
                  {formData.currency === "EUR" ? "20 EUR" : "10.000 FCFA"} / mois pour le module choisi
                </p>
              </div>
              
              <Alert className="mb-6 border-accent/30 bg-accent/5">
                <AlertCircle className="h-4 w-4 text-accent" />
                <AlertDescription className="text-xs sm:text-sm">
                  <strong>Nota:</strong> En fonction du module choisi, vous serez soumis(e) à un test d'évaluation afin de vous inscrire dans la classe correspondant à votre niveau d'apprentissage.
                </AlertDescription>
              </Alert>

              <RadioGroup
                value={formData.selectedModule}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, selectedModule: value }))}
                className="space-y-3"
              >
                {MODULES_CHADAH.map((module) => (
                  <div
                    key={module.id}
                    className={`flex items-start space-x-3 p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer ${
                      formData.selectedModule === module.id
                        ? "border-primary bg-primary/10 border-l-4 border-l-primary"
                        : "border-l-4 border-l-accent/50"
                    }`}
                  >
                    <RadioGroupItem value={module.id} id={module.id} className="mt-1" />
                    <div className="flex-1 min-w-0">
                      <Label
                        htmlFor={module.id}
                        className="font-medium cursor-pointer flex items-center gap-2 text-responsive"
                      >
                        <span className="text-xl sm:text-2xl">{module.icon}</span>
                        {module.name}
                      </Label>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1 text-pretty">{module.description}</p>
                    </div>
                  </div>
                ))}
              </RadioGroup>

              {formData.selectedModule && (
                <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-primary/20">
                  <p className="text-sm font-medium">
                    Module sélectionné : {MODULES_CHADAH.find(m => m.id === formData.selectedModule)?.name}
                  </p>
                </div>
              )}
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
              {formData.selectedModule && (
                <div>
                  <Label className="text-responsive font-semibold">
                    Fréquence de paiement (Module Chadah)
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
                          <strong>🇬🇦 Gabon (Airtel):</strong>+24177309444
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

              {formData.selectedModule && (
                <div className="bg-muted/50 p-3 sm:p-4 rounded-lg border border-primary/20">
                  <h3 className="font-semibold mb-2 flex items-center gap-2 text-responsive">
                    <Music className="h-4 w-4 text-primary" />
                    Module Chadah sélectionné
                  </h3>
                  <div className="text-xs sm:text-sm space-y-2">
                    {(() => {
                      const module = MODULES_CHADAH.find((m) => m.id === formData.selectedModule)
                      return module ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/20 rounded-full text-primary">
                          {module.icon} {module.name}
                        </span>
                      ) : null
                    })()}
                    <p>
                      <strong>Fréquence:</strong> {getFrequencyLabel(formData.paymentFrequency)}
                    </p>
                    <p className="text-primary font-semibold">
                      Total: {totals.modulesTotal.toLocaleString()} {formData.currency}
                    </p>
                  </div>
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
                  {formData.selectedModule && (
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
                  • Rejoignez si ce n'est pas encore fait notre groupe WhatsApp d'information Chadah Academy :<a 
                    href="https://chat.whatsapp.com/EOn3a8doHhg3PgV33tbzst" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium"
                  >Rejoindre le groupe</a>
                  • Vous serez rajouté(e) à un autre groupe WhatsApp de travail pour des séances ponctuelles communes avec le formateur, selon les disponibilités
                  <br />
                  • Votre inscription confirmée (par paiement) vous donnera accès à la plateforme e-learning de Chadah Academy avec les cours relatifs au module de formation choisi
                </AlertDescription>
              </Alert>

              <div className="space-y-4 mt-4">
                {totals.modulesTotal > 0 && (
                  <div className="border-2 border-primary rounded-lg p-4 sm:p-6 text-center musical-gradient text-white shadow-lg">
                    <h3 className="text-base sm:text-lg font-semibold mb-2">Module Chadah</h3>
                    <p className="text-sm opacity-90">{getFrequencyLabel(formData.paymentFrequency)}</p>
                    <p className="text-2xl sm:text-3xl md:text-4xl font-bold mt-2">
                      {totals.modulesTotal.toLocaleString()} {formData.currency}
                    </p>
                  </div>
                )}

                {totals.accompanimentTotal > 0 && (
                  <div className="border-2 border-secondary rounded-lg p-4 sm:p-6 text-center bg-gradient-to-br from-secondary/20 to-secondary/10 shadow-lg">
                    <h3 className="text-base sm:text-lg font-semibold mb-2 text-secondary">Accompagnements</h3>
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
                  "Confirmer mon inscription"
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
