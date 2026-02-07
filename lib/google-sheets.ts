"use server"

import { google } from "googleapis"

interface FormSubmissionData {
  managerName: string
  managerEmail: string
  managerPhone: string
  shopName: string
  shopEmail: string
  shopPhone: string
  city: string
  country: string
  currency: "EUR" | "FCFA"
  productSetupOption: "self" | "assistance"
  excelFileName?: string
  selectedPackage: "free" | "starter" | "pro" | "enterprise"
  packagePrice: number
  packageName: string
  comments: string
  submittedAt: string
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
      range: "PleniShop!A1:N1",
    })

    const hasHeaders = existingData.data.values && existingData.data.values.length > 0

    if (!hasHeaders) {
      const headers = [
        "Date/Heure",
        "Nom du Gérant",
        "Email Gérant",
        "Téléphone Gérant",
        "Nom de la Boutique",
        "Email Boutique",
        "Téléphone Boutique",
        "Ville",
        "Pays",
        "Devise",
        "Configuration Produits",
        "Fichier Excel",
        "Pack Sélectionné",
        "Prix (en devise)",
        "Commentaires",
      ]

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "PleniShop!A:O",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [headers],
        },
      })
    }

    const rowData = [
      new Date().toLocaleString("fr-FR"),
      data.managerName,
      data.managerEmail,
      data.managerPhone || "-",
      data.shopName,
      data.shopEmail,
      data.shopPhone || "-",
      data.city,
      data.country,
      data.currency,
      data.productSetupOption === "self" ? "Paramétrage personnel" : "Assistance PLENISOFTS",
      data.excelFileName || "-",
      data.packageName,
      `${data.packagePrice} ${data.currency}`,
      data.comments || "-",
    ]

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "PleniShop!A:O",
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
