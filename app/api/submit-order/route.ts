import { type NextRequest, NextResponse } from "next/server"
import { GoogleSpreadsheet } from "google-spreadsheet"
import { JWT } from "google-auth-library"

interface FormData {
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

export async function POST(request: NextRequest) {
  try {
    const formData: FormData = await request.json()

    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, serviceAccountAuth)
    await doc.loadInfo()

    let sheet = doc.sheetsByIndex[0]
    if (!sheet) {
      sheet = await doc.addSheet({ title: "Commandes PLENISOFTS" })
    }

    const rows = await sheet.getRows()
    if (rows.length === 0) {
      await sheet.setHeaderRow([
        "Date",
        "Nom",
        "Téléphone",
        "Email",
        "Devise",
        "Pack Principal",
        "Packs Accompagnement",
        "Commentaires",
        "Prix Total",
        "Statut",
      ])
    }

    const accompanimentPacksText =
      Object.entries(formData.accompanimentPacks)
        .filter(([_, quantity]) => quantity > 0)
        .map(([packId, quantity]) => `${packId}: ${quantity}`)
        .join(", ") || "Aucun"

    await sheet.addRow({
      Date: new Date().toLocaleString("fr-FR"),
      Nom: formData.name,
      Téléphone: `${formData.countryCode} ${formData.phone}`,
      Email: formData.email,
      Devise: formData.currency,
      "Pack Principal": formData.selectedPack,
      "Packs Accompagnement": accompanimentPacksText,
      Commentaires: formData.comments || "Aucun commentaire",
      "Prix Total": `${formData.totalPrice} ${formData.currency}`,
      Statut: "En attente",
    })

    return NextResponse.json({
      success: true,
      message: "Commande enregistrée avec succès dans Google Sheets!",
    })
  } catch (error) {
    console.error("Erreur lors de l'enregistrement:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Erreur lors de l'enregistrement de la commande",
      },
      { status: 500 },
    )
  }
}
