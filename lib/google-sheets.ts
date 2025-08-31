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
  totalPrice: number
}

export async function saveToGoogleSheets(data: FormSubmissionData): Promise<{ success: boolean; message: string }> {
  try {
    // Configuration des credentials Google
    const credentials = {
      client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n"),
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
      range: "Commandes!A1:J1",
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
        "Packs d'Accompagnement",
        "Commentaires",
        "Prix Total (Numérique)",
        "Prix Total (Formaté)",
      ]

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "Commandes!A:J",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [headers],
        },
      })
    }

    const accompanimentDetails = Object.entries(data.accompanimentPacks)
      .filter(([_, quantity]) => quantity > 0)
      .map(([packId, quantity]) => `${packId}: ${quantity}`)
      .join(", ")

    const rowData = [
      new Date().toISOString(),
      data.name,
      `${data.countryCode} ${data.phone}`,
      data.email,
      data.currency,
      data.selectedPack,
      accompanimentDetails || "Aucun",
      data.comments || "Aucun commentaire",
      data.totalPrice,
      `${data.totalPrice} ${data.currency}`,
    ]

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Commandes!A:J",
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
