"use server"

import { google } from "googleapis"

interface FormSubmissionData {
  name: string
  phone: string
  countryCode: string
  email: string
  currency: "EUR" | "FCFA"
  selectedPack: string
  accompanimentPacks: { [key: string]: number }
  comments: string
  paymentFrequency: "monthly" | "quarterly" | "biannual" | "annual"
  paymentMethod: "bank" | "mobile" | "paypal"
  totalPrice: number
}

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
      range: "Commandes!A1:S1",
    })

    const hasHeaders = existingData.data.values && existingData.data.values.length > 0

    if (!hasHeaders) {
      const headers = [
        "Date/Heure",
        "Nom",
        "Téléphone",
        "Email",
        "Devise",
        "Pack Choisi",
        "Pack Asaph",
        "Pack Ethan 1",
        "Pack Ethan 2",
        "Pack Ethan 3",
        "Pack Heman 1",
        "Pack Heman 2",
        "Pack Heman 3",
        "Pack Heman 4",
        "Fréquence Paiement",
        "Moyen Paiement",
        "Total Pack Principal",
        "Total Accompagnement",
        "Commentaires",
      ]

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "Commandes!A:S",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [headers],
        },
      })
    }

    const calculatePackTotals = () => {
      let mainPackTotal = 0
      let accompanimentTotal = 0

      // Calculate main pack total with frequency
      const PACKS = [
        { id: "free", priceEUR: 0, priceFCFA: 0 },
        { id: "david", priceEUR: 20, priceFCFA: 10000 },
        { id: "ekklesia1", priceEUR: 100, priceFCFA: 50000 },
        { id: "ekklesia2", priceEUR: 200, priceFCFA: 100000 },
        { id: "ekklesia3", priceEUR: 300, priceFCFA: 150000 },
        { id: "ekklesia4", priceEUR: 300, priceFCFA: 200000 },
      ]

      const pack = PACKS.find((p) => p.id === data.selectedPack)
      if (pack && pack.priceEUR > 0) {
        const basePrice = data.currency === "EUR" ? pack.priceEUR : pack.priceFCFA
        const frequencyMultiplier = getFrequencyMultiplier(data.paymentFrequency)
        mainPackTotal = basePrice * frequencyMultiplier
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

      return { mainPackTotal, accompanimentTotal }
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

    const getPaymentFrequencyLabel = (frequency: string) => {
      switch (frequency) {
        case "monthly":
          return "/mois"
        case "quarterly":
          return "/trimestre"
        case "biannual":
          return "/semestre"
        case "annual":
          return "/an"
        default:
          return "/mois"
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

    const totals = calculatePackTotals()

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
      data.selectedPack,
      ...accompanimentColumns,
      getFrequencyLabel(data.paymentFrequency),
      getPaymentMethodLabel(data.paymentMethod),
      totals.mainPackTotal > 0 ? `${totals.mainPackTotal} ${data.currency} ${getPaymentFrequencyLabel(data.paymentFrequency)}` : "0",
      totals.accompanimentTotal > 0 ? `${totals.accompanimentTotal} ${data.currency}` : "0",
      data.comments || "Aucun commentaire",
    ]

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Commandes!A:S",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [rowData],
      },
    })

    if (response.status === 200) {
      return {
        success: true,
        message: "Commande enregistrée avec succès dans Google Sheets!",
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
