"use server"

import { google } from "googleapis"

interface FormSubmissionData {
  name: string
  phone: string
  email: string
  currency: "EUR" | "FCFA"
  selectedModule: string
  accompanimentPacks: { [key: string]: number }
  comments: string
  paymentFrequency: "monthly" | "quarterly" | "biannual" | "annual"
  paymentMethod: "bank" | "mobile" | "paypal"
  totalPrice: number
  modulesTotal: number
  accompanimentTotal: number
}

// Modules Chadah
const MODULES_CHADAH = [
  { id: "chant", name: "Chant" },
  { id: "piano", name: "Piano" },
  { id: "guitare", name: "Guitare" },
  { id: "percussion", name: "Percussion" },
]

// Prix unique pour tous les modules: 20 EUR ou 10.000 FCFA / mois
const MODULE_PRICE_EUR = 20
const MODULE_PRICE_FCFA = 10000

export async function saveToGoogleSheets(data: FormSubmissionData): Promise<{ success: boolean; message: string }> {
  try {
    // Configuration des credentials Google
    const credentials = {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }
    const spreadsheetId = process.env.GOOGLE_SHEET_ID

    if (!credentials.client_email || !credentials.private_key || !spreadsheetId) {
      throw new Error("Google Sheets credentials not configured")
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    const sheets = google.sheets({ version: "v4", auth })

    const existingData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Inscriptions!A1:S1",
    })

    const hasHeaders = existingData.data.values && existingData.data.values.length > 0

    if (!hasHeaders) {
      const headers = [
        "Date/Heure",
        "Nom",
        "Téléphone",
        "Email",
        "Devise",
        "Module Chadah",
        "Fréquence Paiement",
        "Moyen Paiement",
        "Pack Asaph",
        "Pack Ethan 1",
        "Pack Ethan 2",
        "Pack Ethan 3",
        "Pack Heman 1",
        "Pack Heman 2",
        "Pack Heman 3",
        "Pack Heman 4",
        "Total Module",
        "Total Accompagnement",
        "Commentaires",
      ]

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "Inscriptions!A:S",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [headers],
        },
      })
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

    const calculateTotals = () => {
      let modulesTotal = 0
      let accompanimentTotal = 0

      // Calculate module total with frequency
      if (data.selectedModule) {
        const basePrice = data.currency === "EUR" ? MODULE_PRICE_EUR : MODULE_PRICE_FCFA
        const frequencyMultiplier = getFrequencyMultiplier(data.paymentFrequency)
        modulesTotal = basePrice * frequencyMultiplier
      }

      // Calculate accompaniment total
      const ACCOMPANIMENT_PACKS = [
        { id: "asaph", priceEUR: 10, priceFCFA: 5000 },
        { id: "ethan1", priceEUR: 20, priceFCFA: 10000 },
        { id: "ethan2", priceEUR: 100, priceFCFA: 50000 },
        { id: "ethan3", priceEUR: 300, priceFCFA: 150000 },
        { id: "heman1", priceEUR: 20, priceFCFA: 10000 },
        { id: "heman2", priceEUR: 400, priceFCFA: 200000 },
        { id: "heman3", priceEUR: 1000, priceFCFA: 500000 },
        { id: "heman4", priceEUR: 20, priceFCFA: 50000 },
      ]

      Object.entries(data.accompanimentPacks).forEach(([packId, quantity]) => {
        const pack = ACCOMPANIMENT_PACKS.find((p) => p.id === packId)
        if (pack && quantity > 0) {
          const price = data.currency === "EUR" ? pack.priceEUR : pack.priceFCFA
          accompanimentTotal += price * quantity
        }
      })

      return { modulesTotal, accompanimentTotal }
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

    const getPaymentMethodLabel = (method: string) => {
      switch (method) {
        case "bank":
          return "Virement/Transfert"
        case "mobile":
          return "Mobile Money"
        case "paypal":
          return "PayPal"
        default:
          return method
      }
    }

    const getModuleName = (moduleId: string) => {
      const module = MODULES_CHADAH.find((m) => m.id === moduleId)
      return module ? module.name : moduleId
    }

    const totals = calculateTotals()

    const accompanimentColumns = [
      data.accompanimentPacks["asaph"] || 0,
      data.accompanimentPacks["ethan1"] || 0,
      data.accompanimentPacks["ethan2"] || 0,
      data.accompanimentPacks["ethan3"] || 0,
      data.accompanimentPacks["heman1"] || 0,
      data.accompanimentPacks["heman2"] || 0,
      data.accompanimentPacks["heman3"] || 0,
      data.accompanimentPacks["heman4"] || 0,
    ]

    const rowData = [
      new Date().toISOString(),
      data.name,
      data.phone,
      data.email,
      data.currency,
      getModuleName(data.selectedModule),
      getFrequencyLabel(data.paymentFrequency),
      getPaymentMethodLabel(data.paymentMethod),
      ...accompanimentColumns,
      totals.modulesTotal > 0 ? `${totals.modulesTotal} ${data.currency}` : "0",
      totals.accompanimentTotal > 0 ? `${totals.accompanimentTotal} ${data.currency}` : "0",
      data.comments || "Aucun commentaire",
    ]

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Inscriptions!A:S",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [rowData],
      },
    })

    if (response.status === 200) {
      return {
        success: true,
        message: "Inscription enregistrée avec succès dans Google Sheets!",
      }
    } else {
      throw new Error(`Google Sheets API error: ${response.status}`)
    }
  } catch (error) {
    console.error("Google Sheets save error:", error)
    return {
      success: false,
      message: "Erreur lors de l'enregistrement. Veuillez réessayer.",
    }
  }
}
