"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, Music, User, CreditCard, ChevronLeft, ChevronRight, Check, Piano, Mic } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

interface FormData {
  name: string
  phone: string
  countryCode: string
  email: string
  currency: "EUR" | "FCFA"
  selectedPack: string
  accompanimentPacks: { [key: string]: number }
  comments: string
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
    description: "Tous les chants harmonisés/orchestrés, groupe 1 à 10 personnes",
    priceEUR: 100,
    priceFCFA: 50000,
  },
  {
    id: "ekklesia2",
    name: "Pack Ekklesia 2",
    description: "Tous les chants harmonisés/orchestrés, groupe 11 à 50 personnes",
    priceEUR: 200,
    priceFCFA: 100000,
  },
  {
    id: "ekklesia3",
    name: "Pack Ekklesia 3",
    description: "Tous les chants harmonisés/orchestrés, groupe 51 à 100 personnes",
    priceEUR: 300,
    priceFCFA: 150000,
  },
  {
    id: "ekklesia4",
    name: "Pack Ekklesia 4",
    description: "Tous les chants harmonisés/orchestrés, groupe >100 personnes",
    priceEUR: 300,
    priceFCFA: 200000,
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
  { id: 2, title: "Packs principaux", icon: Music },
  { id: 3, title: "Accompagnement", icon: Piano },
  { id: 4, title: "Commentaires", icon: Mic },
  { id: 5, title: "Récapitulatif", icon: CreditCard },
]

export function MultiStepOrderForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    countryCode: "+33",
    email: "",
    currency: "EUR",
    selectedPack: "",
    accompanimentPacks: {},
    comments: "",
  })

  const calculateTotal = () => {
    let total = 0

    // Add selected pack price
    if (formData.selectedPack) {
      const pack = PACKS.find((p) => p.id === formData.selectedPack)
      if (pack) {
        total += formData.currency === "EUR" ? pack.priceEUR : pack.priceFCFA
      }
    }

    // Add accompaniment packs
    Object.entries(formData.accompanimentPacks).forEach(([packId, quantity]) => {
      const pack = ACCOMPANIMENT_PACKS.find((p) => p.id === packId)
      if (pack && quantity > 0) {
        const price = formData.currency === "EUR" ? pack.priceEUR : pack.priceFCFA
        total += price * quantity
      }
    })

    return total
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

  const handleSubmit = () => {
    console.log("[v0] Form submitted:", formData)
    console.log("[v0] Total price:", calculateTotal(), formData.currency)
    alert("Commande soumise avec succès!")
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
                  <Select
                    value={formData.countryCode}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, countryCode: value }))}
                  >
                    <SelectTrigger className="w-full sm:w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="+33">🇫🇷 +33</SelectItem>
                      <SelectItem value="+237">🇨🇲 +237</SelectItem>
                      <SelectItem value="+1">🇺🇸 +1</SelectItem>
                      <SelectItem value="+44">🇬🇧 +44</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    placeholder="123456789"
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
                  <div className="flex items-center space-x-2 p-3 rounded-lg border border-accent/20 hover:bg-accent/10 transition-colors">
                    <RadioGroupItem value="EUR" id="eur" />
                    <Label htmlFor="eur" className="text-responsive cursor-pointer">
                      🇪🇺 EUR (Europe)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border border-secondary/20 hover:bg-secondary/10 transition-colors">
                    <RadioGroupItem value="FCFA" id="fcfa" />
                    <Label htmlFor="fcfa" className="text-responsive cursor-pointer">
                      🌍 FCFA (Afrique)
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
              <Alert className="mb-6 border-accent/30 bg-accent/5">
                <AlertCircle className="h-4 w-4 text-accent" />
                <AlertDescription className="text-xs sm:text-sm">
                  <strong>NOTE IMPORTANTE</strong>
                  <br />
                  Vous avez la possibilité une fois abonné(e) de demander une harmonisation ou proposer votre propre
                  harmonisation (10.000 FCFA ou 20 EUR si retenue).
                </AlertDescription>
              </Alert>

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

      case 5:
        return (
          <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 heading-responsive">
                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Récapitulatif de votre commande
              </CardTitle>
            </CardHeader>
            <CardContent className="spacing-responsive">
              {/* Personal Info Summary */}
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
                    <strong>Téléphone:</strong> {formData.countryCode} {formData.phone}
                  </p>
                  <p>
                    <strong>Email:</strong> {formData.email}
                  </p>
                  <p>
                    <strong>Devise:</strong> {formData.currency}
                  </p>
                </div>
              </div>

              {/* Selected Pack */}
              {formData.selectedPack && (
                <div className="bg-muted/50 p-3 sm:p-4 rounded-lg border border-primary/20">
                  <h3 className="font-semibold mb-2 flex items-center gap-2 text-responsive">
                    <Music className="h-4 w-4 text-primary" />
                    Pack principal sélectionné
                  </h3>
                  {(() => {
                    const pack = PACKS.find((p) => p.id === formData.selectedPack)
                    return pack ? (
                      <div className="text-xs sm:text-sm">
                        <p>
                          <strong>{pack.name}</strong>
                        </p>
                        <p className="text-muted-foreground text-pretty">{pack.description}</p>
                        <p className="text-primary font-semibold">
                          {pack.priceEUR === 0
                            ? "Gratuit"
                            : `${formData.currency === "EUR" ? pack.priceEUR + " EUR" : pack.priceFCFA.toLocaleString() + " FCFA"}${pack.monthly ? " / mois" : ""}`}
                        </p>
                      </div>
                    ) : null
                  })()}
                </div>
              )}

              {/* Accompaniment Packs */}
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
                  </div>
                </div>
              )}

              {/* Comments */}
              {formData.comments && (
                <div className="bg-muted/50 p-3 sm:p-4 rounded-lg border border-accent/20">
                  <h3 className="font-semibold mb-2 flex items-center gap-2 text-responsive">
                    <Mic className="h-4 w-4 text-accent" />
                    Commentaires
                  </h3>
                  <p className="text-xs sm:text-sm text-pretty">{formData.comments}</p>
                </div>
              )}

              {/* Total Price */}
              <div className="border-2 border-primary rounded-lg p-4 sm:p-6 text-center musical-gradient text-white shadow-lg">
                <h3 className="text-base sm:text-lg font-semibold mb-2">Prix total de la commande</h3>
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold">
                  {calculateTotal().toLocaleString()} {formData.currency}
                </p>
                {formData.selectedPack === "david" && (
                  <p className="text-xs sm:text-sm opacity-90 mt-2">* Pack David facturé mensuellement</p>
                )}
              </div>

              <Button onClick={handleSubmit} size="lg" className="w-full text-responsive py-3 sm:py-4">
                <Check className="h-4 w-4 mr-2" />
                Confirmer la commande
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
      {/* Progress Steps */}
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

      {/* Step Content */}
      <div className="min-h-[400px] sm:min-h-[500px]">{renderStepContent()}</div>

      {/* Navigation Buttons */}
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
