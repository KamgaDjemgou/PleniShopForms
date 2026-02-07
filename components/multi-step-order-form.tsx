"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
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
    priceEUR: 0,
    priceFCFA: 0,
    features: [
      "5 produits",
      "10 commandes par mois",
      "Support par email",
    ],
    icon: "🎁",
  },
  {
    id: "starter",
    name: "Starter",
    description: "Pour les petites boutiques",
    priceEUR: 10,
    priceFCFA: 6550,
    features: [
      "50 produits",
      "100 commandes par mois",
      "Domaine personnalisé",
      "Support prioritaire",
      "Statistiques avancées",
      "Export des données",
    ],
    icon: "🚀",
  },
  {
    id: "pro",
    name: "Pro",
    description: "Pour les boutiques en croissance",
    priceEUR: 20,
    priceFCFA: 13100,
    features: [
      "500 produits",
      "1000 commandes par mois",
      "Domaine personnalisé",
      "Support prioritaire 24/7",
      "Statistiques avancées",
      "Export des données",
      "Multi-devises",
      "Multi-langues",
      "Intégrations avancées",
    ],
    icon: "⭐",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Pour les grandes boutiques",
    priceEUR: 50,
    priceFCFA: 32800,
    features: [
      "Produits illimités",
      "Commandes illimitées",
      "Domaine personnalisé",
      "Support dédié",
      "Toutes les fonctionnalités Pro",
      "API personnalisé",
      "Formation dédiée",
      "Gestion multi-boutiques",
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
        managerName: formData.managerName,
        managerEmail: formData.managerEmail,
        managerPhone: formData.managerPhone,
        shopName: formData.shopName,
        shopEmail: formData.shopEmail,
        shopPhone: formData.shopPhone,
        city: formData.city,
        country: formData.country,
        currency: formData.currency,
        productSetupOption: formData.productSetupOption,
        excelFileName: excelFile?.name,
        selectedPackage: formData.selectedPackage,
        packagePrice,
        packageName,
        comments: formData.comments,
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
        setSubmitMessage({ type: "error", text: result.message || "Erreur lors de la soumission" })
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
                <Store className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Informations de votre Boutique
              </CardTitle>
            </CardHeader>
            <CardContent className="spacing-responsive">
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg mb-6 border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">Informations du Gérant</h3>
                
                <div>
                  <Label htmlFor="managerName" className="text-responsive">
                    Nom complet du gérant *
                  </Label>
                  <Input
                    id="managerName"
                    required
                    placeholder="Votre nom complet"
                    value={formData.managerName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, managerName: e.target.value }))}
                    className="mt-2 text-responsive"
                  />
                </div>

                <div>
                  <Label htmlFor="managerEmail" className="text-responsive mt-4 block">
                    Email personnel du gérant *
                  </Label>
                  <Input
                    id="managerEmail"
                    type="email"
                    required
                    placeholder="votre@email.com"
                    value={formData.managerEmail}
                    onChange={(e) => setFormData((prev) => ({ ...prev, managerEmail: e.target.value }))}
                    className="mt-2 text-responsive"
                  />
                </div>

                <div>
                  <Label htmlFor="managerPhone" className="text-responsive mt-4 block">
                    Téléphone du gérant (optionnel)
                  </Label>
                  <Input
                    id="managerPhone"
                    type="tel"
                    placeholder="+212699999999"
                    value={formData.managerPhone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, managerPhone: e.target.value }))}
                    className="mt-2 text-responsive"
                  />
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-3">Informations de la Boutique</h3>
                
                <div>
                  <Label htmlFor="shopName" className="text-responsive">
                    Nom de votre boutique *
                  </Label>
                  <Input
                    id="shopName"
                    required
                    placeholder="Nom de votre boutique"
                    value={formData.shopName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, shopName: e.target.value }))}
                    className="mt-2 text-responsive"
                  />
                </div>

                <div>
                  <Label htmlFor="shopEmail" className="text-responsive mt-4 block">
                    Email de contact de la boutique *
                  </Label>
                  <Input
                    id="shopEmail"
                    type="email"
                    required
                    placeholder="contact@boutique.com"
                    value={formData.shopEmail}
                    onChange={(e) => setFormData((prev) => ({ ...prev, shopEmail: e.target.value }))}
                    className="mt-2 text-responsive"
                  />
                </div>

                <div>
                  <Label htmlFor="shopPhone" className="text-responsive mt-4 block">
                    Téléphone de la boutique (optionnel)
                  </Label>
                  <Input
                    id="shopPhone"
                    type="tel"
                    placeholder="+212699999999"
                    value={formData.shopPhone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, shopPhone: e.target.value }))}
                    className="mt-2 text-responsive"
                  />
                </div>

                <div>
                  <Label htmlFor="city" className="text-responsive mt-4 block">
                    Ville *
                  </Label>
                  <Input
                    id="city"
                    required
                    placeholder="Casablanca"
                    value={formData.city}
                    onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                    className="mt-2 text-responsive"
                  />
                </div>

                <div>
                  <Label htmlFor="country" className="text-responsive mt-4 block">
                    Pays *
                  </Label>
                  <Input
                    id="country"
                    required
                    placeholder="Maroc"
                    value={formData.country}
                    onChange={(e) => setFormData((prev) => ({ ...prev, country: e.target.value }))}
                    className="mt-2 text-responsive"
                  />
                </div>

                <div>
                  <Label className="text-responsive mt-4 block font-semibold">Devise *</Label>
                  <RadioGroup
                    value={formData.currency}
                    onValueChange={(value: "EUR" | "FCFA") => setFormData((prev) => ({ ...prev, currency: value }))}
                    className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-2"
                  >
                    <div className="flex items-center space-x-2 p-3 rounded-lg border border-primary/20 hover:bg-primary/10 transition-colors border-l-4 border-l-primary">
                      <RadioGroupItem value="EUR" id="eur" />
                      <Label htmlFor="eur" className="text-responsive cursor-pointer">
                        🇪🇺 EUR
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 rounded-lg border border-secondary/20 hover:bg-secondary/10 transition-colors border-l-4 border-l-secondary">
                      <RadioGroupItem value="FCFA" id="fcfa" />
                      <Label htmlFor="fcfa" className="text-responsive cursor-pointer">
                        🌍 FCFA
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case 2:
        return (
          <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 heading-responsive">
                <Package className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
                Configuration de vos Produits
              </CardTitle>
            </CardHeader>
            <CardContent className="spacing-responsive">
              <Alert className="mb-6 border-secondary/30 bg-secondary/5">
                <AlertCircle className="h-4 w-4 text-secondary" />
                <AlertDescription className="text-xs sm:text-sm">
                  Choisissez comment vous souhaitez gérer le paramétrage de vos produits et de votre catalogue.
                </AlertDescription>
              </Alert>

              <RadioGroup
                value={formData.productSetupOption}
                onValueChange={(value: "self" | "assistance") => setFormData((prev) => ({ ...prev, productSetupOption: value }))}
                className="space-y-4"
              >
                {/* Option 1: Self Setup */}
                <div
                  className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    formData.productSetupOption === "self"
                      ? "border-secondary bg-secondary/10"
                      : "border-muted-foreground/30 hover:border-secondary/50"
                  }`}
                >
                  <RadioGroupItem value="self" id="self-setup" className="mt-1" />
                  <div className="flex-1">
                    <Label
                      htmlFor="self-setup"
                      className="text-base font-semibold cursor-pointer text-responsive"
                    >
                      📋 Je vais m'occuper moi-même du paramétrage
                    </Label>
                    <p className="text-sm text-muted-foreground mt-2">
                      Vous pouvez gérer directement vos produits, catégories et configurations dans votre tableau de bord PleniShop. Aucune assistance requise à cette étape.
                    </p>
                  </div>
                </div>

                {/* Option 2: Assistance */}
                <div
                  className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    formData.productSetupOption === "assistance"
                      ? "border-secondary bg-secondary/10"
                      : "border-muted-foreground/30 hover:border-secondary/50"
                  }`}
                >
                  <RadioGroupItem value="assistance" id="assistance-setup" className="mt-1" />
                  <div className="flex-1">
                    <Label
                      htmlFor="assistance-setup"
                      className="text-base font-semibold cursor-pointer text-responsive"
                    >
                      🤝 Je souhaite l'assistance de l'équipe PLENISOFTS
                    </Label>
                    <p className="text-sm text-muted-foreground mt-2">
                      Notre équipe vous accompagnera dans le paramétrage de votre boutique et la configuration de vos produits.
                    </p>
                  </div>
                </div>
              </RadioGroup>

              {/* Assistance Option Details */}
              {formData.productSetupOption === "assistance" && (
                <div className="mt-6 space-y-4">
                  {/* Download Model Section */}
                  <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
                    <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-3 flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Modèle de Document à Remplir
                    </h3>
                    
                    <p className="text-sm text-amber-800 dark:text-amber-200 mb-4">
                      Pour faciliter l'assistance de notre équipe, veuillez :
                    </p>
                    
                    <div className="bg-white dark:bg-slate-900 p-4 rounded mb-4 border border-amber-200 dark:border-amber-700">
                      <ol className="text-sm text-amber-900 dark:text-amber-100 space-y-2">
                        <li className="flex gap-2">
                          <span className="font-bold">1.</span>
                          <span>
                            Téléchargez le modèle de document en cliquant sur le lien ci-dessous
                          </span>
                        </li>
                        <li className="flex gap-2">
                          <span className="font-bold">2.</span>
                          <span>
                            Dézippez le fichier
                          </span>
                        </li>
                        <li className="flex gap-2">
                          <span className="font-bold">3.</span>
                          <span>
                            Remplissez le dossier selon les consignes ci-dessous
                          </span>
                        </li>
                        <li className="flex gap-2">
                          <span className="font-bold">4.</span>
                          <span>
                            Rezippez le dossier complété
                          </span>
                        </li>
                        <li className="flex gap-2">
                          <span className="font-bold">5.</span>
                          <span>
                            Envoyez le fichier à : <strong>support@plenisofts.org</strong>
                          </span>
                        </li>
                      </ol>
                    </div>

                    <a
                      href="https://plenisofts.org/shop/templates/model.zip"
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
                    >
                      <Upload className="h-4 w-4" />
                      Télécharger le modèle (ZIP)
                    </a>
                  </div>

                  {/* Instructions Section */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                      📋 Consignes de Remplissage du Dossier
                    </h3>
                    
                    <div className="space-y-3 text-sm text-blue-900 dark:text-blue-100">
                      <div>
                        <p className="font-semibold mb-1">Fichier Excel :</p>
                        <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm ml-2">
                          <li>Remplissez vos produits avec les informations détaillées</li>
                          <li><strong>Identifiant du produit</strong> : Code unique pour chaque produit (ex: PROD-001, lait-gallia-500g, etc.)</li>
                          <li><strong>Identifiant de la catégorie</strong> : Code unique pour chaque catégorie (ex: CAT-001, charcuterie, laiterie, etc.)</li>
                          <li>Tous les autres champs requis : nom, description, prix, stock, etc.</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-semibold mb-1">Dossier Images :</p>
                        <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm ml-2">
                          <li>Créez un dossier nommé <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">images</code></li>
                          <li><strong>Images de produits</strong> : Nommez-les avec l'identifiant du produit (ex: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">lait-gallia-500g.png</code>, <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">PROD-001.jpg</code>)</li>
                          <li><strong>Images de catégories</strong> : Nommez-les avec l'identifiant de la catégorie (ex: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">charcuterie.png</code>, <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">CAT-001.jpg</code>)</li>
                          <li>Formats acceptés : PNG, JPG, JPEG</li>
                        </ul>
                      </div>

                      <div className="pt-2 border-t border-blue-300 dark:border-blue-600">
                        <p className="text-xs text-blue-700 dark:text-blue-300 italic">
                          ℹ️ Notre équipe examinera votre dossier et mettra en place votre boutique avec tous vos produits, catégories et images.
                        </p>
                      </div>
                    </div>
                  </div>
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
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                Sélectionnez votre Pack
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PACKAGES.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.selectedPackage === pkg.id
                        ? "border-accent bg-accent/10 shadow-lg"
                        : "border-muted-foreground/30 hover:border-accent/50"
                    }`}
                    onClick={() => setFormData((prev) => ({ ...prev, selectedPackage: pkg.id as any }))}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-2xl mb-2">{pkg.icon}</p>
                        <h3 className="font-bold text-lg">{pkg.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{pkg.description}</p>
                      </div>
                      {formData.selectedPackage === pkg.id && (
                        <Check className="h-5 w-5 text-accent" />
                      )}
                    </div>

                    {pkg.id !== "free" && (
                      <div className="bg-accent/20 p-2 rounded mb-3 text-center">
                        <p className="font-bold text-accent">
                          {formData.currency === "EUR"
                            ? `${(pkg as any).priceEUR || 0} EUR`
                            : `${((pkg as any).priceFCFA || 0).toLocaleString()} FCFA`}
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      {pkg.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <Check className="h-3 w-3 text-green-600" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {formData.selectedPackage && (
                <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-accent/20">
                  <p className="text-sm font-medium">
                    Pack sélectionné : <strong>{PACKAGES.find(p => p.id === formData.selectedPackage)?.name}</strong>
                  </p>
                  {calculatePackagePrice() > 0 && (
                    <p className="text-sm mt-2">
                      Prix : <strong>{calculatePackagePrice()} {formData.currency}</strong>
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )

      case 4:
        const packagePrice = calculatePackagePrice()
        const packageName = PACKAGES.find((p) => p.id === formData.selectedPackage)?.name || ""
        
        return (
          <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 heading-responsive">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Récapitulatif de votre inscription
              </CardTitle>
            </CardHeader>
            <CardContent className="spacing-responsive">
              {/* Manager Info */}
              <div className="bg-muted/50 p-3 sm:p-4 rounded-lg border border-primary/20">
                <h3 className="font-semibold mb-2 flex items-center gap-2 text-responsive">
                  <User className="h-4 w-4 text-primary" />
                  Gérant de la Boutique
                </h3>
                <div className="text-xs sm:text-sm space-y-1">
                  <p>
                    <strong>Nom:</strong> {formData.managerName}
                  </p>
                  <p>
                    <strong>Email:</strong> {formData.managerEmail}
                  </p>
                  <p>
                    <strong>Téléphone:</strong> {formData.managerPhone || "Non fourni"}
                  </p>
                </div>
              </div>

              {/* Shop Info */}
              <div className="bg-muted/50 p-3 sm:p-4 rounded-lg border border-secondary/20">
                <h3 className="font-semibold mb-2 flex items-center gap-2 text-responsive">
                  <Store className="h-4 w-4 text-secondary" />
                  Informations de la Boutique
                </h3>
                <div className="text-xs sm:text-sm space-y-1">
                  <p>
                    <strong>Nom:</strong> {formData.shopName}
                  </p>
                  <p>
                    <strong>Email:</strong> {formData.shopEmail}
                  </p>
                  <p>
                    <strong>Téléphone:</strong> {formData.shopPhone || "Non fourni"}
                  </p>
                  <p>
                    <strong>Localisation:</strong> {formData.city}, {formData.country}
                  </p>
                  <p>
                    <strong>Devise:</strong> {formData.currency}
                  </p>
                </div>
              </div>

              {/* Products Setup */}
              <div className="bg-muted/50 p-3 sm:p-4 rounded-lg border border-accent/20">
                <h3 className="font-semibold mb-2 flex items-center gap-2 text-responsive">
                  <Package className="h-4 w-4 text-accent" />
                  Configuration des Produits
                </h3>
                <div className="text-xs sm:text-sm space-y-1">
                  <p>
                    <strong>Option:</strong> {formData.productSetupOption === "self" ? "Paramétrage personnel" : "Assistance PLENISOFTS"}
                  </p>
                  {excelFile && (
                    <p>
                      <strong>Fichier Excel:</strong> {excelFile.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Package Selection */}
              <div className="bg-muted/50 p-3 sm:p-4 rounded-lg border border-primary/20">
                <h3 className="font-semibold mb-2 flex items-center gap-2 text-responsive">
                  <ShoppingCart className="h-4 w-4 text-primary" />
                  Pack Sélectionné
                </h3>
                <div className="text-xs sm:text-sm space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{PACKAGES.find(p => p.id === formData.selectedPackage)?.icon}</span>
                    <span className="font-semibold">{packageName}</span>
                  </div>
                  {packagePrice > 0 && (
                    <div className="border-t pt-2 mt-2">
                      <p className="text-primary font-semibold">
                        Prix: {packagePrice} {formData.currency}
                      </p>
                    </div>
                  )}
                  {formData.selectedPackage === "free" && (
                    <p className="text-green-600 font-semibold">Gratuit</p>
                  )}
                </div>
              </div>

              {/* Comments */}
              {formData.comments && (
                <div className="bg-muted/50 p-3 sm:p-4 rounded-lg border border-accent/20">
                  <h3 className="font-semibold mb-2 text-responsive">Commentaires</h3>
                  <p className="text-xs sm:text-sm text-pretty">{formData.comments}</p>
                </div>
              )}

              {/* Additional Comments Section */}
              <div>
                <Label htmlFor="comments" className="text-responsive">
                  Commentaires ou questions (optionnel)
                </Label>
                <Textarea
                  id="comments"
                  placeholder="Ajoutez vos commentaires ou questions..."
                  value={formData.comments}
                  onChange={(e) => setFormData((prev) => ({ ...prev, comments: e.target.value }))}
                  className="mt-2 text-responsive min-h-[100px]"
                  rows={4}
                />
              </div>

              <Alert className="border-accent/30 bg-accent/5 mt-4">
                <AlertCircle className="h-4 w-4 text-accent" />
                <AlertDescription className="text-xs sm:text-sm">
                  <strong>IMPORTANT</strong>
                  <br />
                  • Vérifiez bien toutes les informations avant de confirmer votre inscription
                  <br />
                  • Vous recevrez un email de confirmation avec vos identifiants d'accès
                  <br />
                  • Notre équipe vous contactera pour les détails de mise en place
                </AlertDescription>
              </Alert>

              {submitMessage && (
                <Alert className={`mt-4 ${submitMessage.type === "error" ? "border-red-300 bg-red-50" : "border-green-300 bg-green-50"}`}>
                  <AlertCircle className={`h-4 w-4 ${submitMessage.type === "error" ? "text-red-600" : "text-green-600"}`} />
                  <AlertDescription className="text-xs sm:text-sm">
                    {submitMessage.text}
                  </AlertDescription>
                </Alert>
              )}

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
