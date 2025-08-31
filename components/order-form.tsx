"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, Music, User, CreditCard } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FormData {
  name: string
  phone: string
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
  { id: "asaph", name: "Pack Asaph", description: "Écriture de chant chrétien", priceEUR: 10, priceFCFA: 5000 },
  { id: "ethan1", name: "Pack Ethan 1", description: "Instrumentation Piano/Guitare", priceEUR: 20, priceFCFA: 10000 },
  {
    id: "ethan2",
    name: "Pack Ethan 2",
    description: "Instrumentation Piano/Bass/Rythmique",
    priceEUR: 100,
    priceFCFA: 50000,
  },
  { id: "ethan3", name: "Pack Ethan 3", description: "Instrumentation enrichie", priceEUR: 300, priceFCFA: 150000 },
  { id: "heman1", name: "Pack Heman 1", description: "Conduite de Louange", priceEUR: 20, priceFCFA: 10000 },
  { id: "heman2", name: "Pack Heman 2", description: "Production SON (studio)", priceEUR: 400, priceFCFA: 200000 },
  { id: "heman3", name: "Pack Heman 3", description: "Production VIDEO (clip)", priceEUR: 1000, priceFCFA: 500000 },
  {
    id: "heman4",
    name: "Pack Heman 4",
    description: "Déploiement sur les réseaux sociaux",
    priceEUR: 20,
    priceFCFA: 50000,
  },
]

export function OrderForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    email: "",
    currency: "EUR",
    selectedPack: "",
    accompanimentPacks: {},
    comments: "",
  })

  const [showTotal, setShowTotal] = useState(false)

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowTotal(true)
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

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header with Important Note */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Music className="h-6 w-6" />
            Formulaire de commande
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>NOTE IMPORTANTE</strong>
              <br />
              Vous avez la possibilité une fois abonné(e) de :
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>
                  soit demander une harmonisation (voix) ou une instrumentation (instrument piano ou guitare ou bass ou
                  batterie) d'un chant donné à PLENISOFTS (10.000 FCFA ou 20 EUR à payer à PLENISOFTS si votre demande
                  est retenue)
                </li>
                <li>
                  soit proposer à PLENISOFTS votre propre harmonisation ou instrumentation pour enrichir la base de
                  chants (dans ce cas, PLENISOFTS vous paiera 10.000 FCFA ou 20 EUR si votre proposition est retenue).
                </li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Section 1: Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Section 1 : Informations Personnelles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Nom *</Label>
            <Input
              id="name"
              required
              placeholder="Saisissez votre nom complet (si inscription individuelle) ou votre nom de groupe (si inscription de groupe)"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="phone">Numéro de téléphone (WhatsApp de préférence) *</Label>
            <div className="flex gap-2">
              <Select defaultValue="+33">
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="+33">+33</SelectItem>
                  <SelectItem value="+237">+237</SelectItem>
                  <SelectItem value="+1">+1</SelectItem>
                  <SelectItem value="+44">+44</SelectItem>
                </SelectContent>
              </Select>
              <Input
                id="phone"
                type="tel"
                required
                placeholder="123456789"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              required
              placeholder="votre@email.com"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
            />
          </div>

          <div>
            <Label>Zone (Devise choisie) *</Label>
            <RadioGroup
              value={formData.currency}
              onValueChange={(value: "EUR" | "FCFA") => setFormData((prev) => ({ ...prev, currency: value }))}
              className="flex gap-6 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="EUR" id="eur" />
                <Label htmlFor="eur">EUR</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="FCFA" id="fcfa" />
                <Label htmlFor="fcfa">FCFA</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Orders and Comments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Section 2 : Mes commandes et commentaires
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pack Selection */}
          <div>
            <Label className="text-base font-semibold">1. Pack choisi (sélection unique) *</Label>
            <RadioGroup
              value={formData.selectedPack}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, selectedPack: value }))}
              className="mt-3"
            >
              {PACKS.map((pack) => (
                <div key={pack.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value={pack.id} id={pack.id} className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor={pack.id} className="font-medium cursor-pointer">
                      {pack.name}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">{pack.description}</p>
                    <p className="text-sm font-semibold text-primary mt-1">
                      {pack.priceEUR === 0
                        ? "Gratuit"
                        : `${formData.currency === "EUR" ? pack.priceEUR + " EUR" : pack.priceFCFA.toLocaleString() + " FCFA"}${pack.monthly ? " / mois" : ""}`}
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Accompaniment Packs */}
          <div>
            <Label className="text-base font-semibold">
              2. Accompagnement choisi (sélection multiple avec quantité)
            </Label>
            <div className="mt-3 space-y-3">
              {ACCOMPANIMENT_PACKS.map((pack) => (
                <div key={pack.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id={pack.id}
                        checked={(formData.accompanimentPacks[pack.id] || 0) > 0}
                        onCheckedChange={(checked) => {
                          updateAccompanimentQuantity(pack.id, checked ? 1 : 0)
                        }}
                      />
                      <div>
                        <Label htmlFor={pack.id} className="font-medium cursor-pointer">
                          {pack.name}
                        </Label>
                        <p className="text-sm text-muted-foreground">{pack.description}</p>
                        <p className="text-sm font-semibold text-primary">
                          {formData.currency === "EUR"
                            ? pack.priceEUR + " EUR"
                            : pack.priceFCFA.toLocaleString() + " FCFA"}{" "}
                          par chant
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateAccompanimentQuantity(pack.id, (formData.accompanimentPacks[pack.id] || 0) - 1)
                      }
                      disabled={(formData.accompanimentPacks[pack.id] || 0) <= 0}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center">{formData.accompanimentPacks[pack.id] || 0}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateAccompanimentQuantity(pack.id, (formData.accompanimentPacks[pack.id] || 0) + 1)
                      }
                    >
                      +
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div>
            <Label htmlFor="comments" className="text-base font-semibold">
              3. Commentaires et Suggestions
            </Label>
            <Textarea
              id="comments"
              placeholder="Vos commentaires et suggestions..."
              value={formData.comments}
              onChange={(e) => setFormData((prev) => ({ ...prev, comments: e.target.value }))}
              className="mt-2"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-center">
        <Button type="submit" size="lg" className="px-8">
          Calculer le prix total
        </Button>
      </div>

      {/* Total Price Display */}
      {showTotal && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="text-center text-primary">Prix total de la commande</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">
                {calculateTotal().toLocaleString()} {formData.currency}
              </p>
              {formData.selectedPack === "david" && (
                <p className="text-sm text-muted-foreground mt-2">* Pack David facturé mensuellement</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </form>
  )
}
