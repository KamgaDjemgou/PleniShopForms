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
    const scriptUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL

    if (!scriptUrl) {
      throw new Error("Google Script URL not configured")
    }

    // Prepare data for Google Sheets
    const sheetData = {
      timestamp: new Date().toISOString(),
      name: data.name,
      phone: `${data.countryCode} ${data.phone}`,
      email: data.email,
      currency: data.currency,
      selectedPack: data.selectedPack,
      accompanimentPacks: JSON.stringify(data.accompanimentPacks),
      comments: data.comments,
      totalPrice: data.totalPrice,
    }

    console.log("[v0] Sending data to Google Sheets:", sheetData)

    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sheetData),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    if (result.success) {
      return {
        success: true,
        message: "Commande enregistrée avec succès dans Google Sheets!",
      }
    } else {
      throw new Error(result.message || "Erreur lors de l'enregistrement")
    }
  } catch (error) {
    console.error("[v0] Google Sheets save error:", error)
    return {
      success: false,
      message: "Erreur lors de l'enregistrement. Veuillez réessayer.",
    }
  }
}
