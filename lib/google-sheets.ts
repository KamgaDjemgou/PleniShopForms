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
      range: "Commandes!A1:P1",
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
        "Commentaires",
        "Prix Total",
      ]

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "Commandes!A:P",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [headers],
        },
      })
    }

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
      `${data.countryCode} ${data.phone}`,
      data.email,
      data.currency,
      data.selectedPack,
      ...accompanimentColumns,
      data.comments || "Aucun commentaire",
      `${data.totalPrice} ${data.currency}`,
    ]

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Commandes!A:P",
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
