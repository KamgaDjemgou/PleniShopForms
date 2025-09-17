"use server"

import nodemailer from "nodemailer"

interface OrderData {
  name: string
  phone: string
  email: string
  currency: "EUR" | "FCFA"
  selectedPack: string
  accompanimentPacks: { [key: string]: number }
  comments: string
  paymentFrequency: "monthly" | "quarterly" | "biannual" | "annual"
  paymentMethod: "bank" | "mobile" | "paypal"
  totalPrice: number
  mainPackTotal: number
  accompanimentTotal: number
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
    description: "Tous les chants harmonisés/orchestrés, groupe de 1 à 10 personnes",
    priceEUR: 100,
    priceFCFA: 50000,
    monthly: true,
  },
  {
    id: "ekklesia2",
    name: "Pack Ekklesia 2",
    description: "Tous les chants harmonisés/orchestrés, groupe de 11 à 50 personnes",
    priceEUR: 200,
    priceFCFA: 100000,
    monthly: true,
  },
  {
    id: "ekklesia3",
    name: "Pack Ekklesia 3",
    description: "Tous les chants harmonisés/orchestrés, groupe de 51 à 100 personnes",
    priceEUR: 300,
    priceFCFA: 150000,
    monthly: true,
  },
  {
    id: "ekklesia4",
    name: "Pack Ekklesia 4",
    description: "Tous les chants harmonisés/orchestrés, groupe de plus de 100 personnes",
    priceEUR: 300,
    priceFCFA: 200000,
    monthly: true,
  },
]

const ACCOMPANIMENT_PACKS = [
  {
    id: "asaph",
    name: "Pack Asaph",
    description: "Écriture de chant chrétien",
    priceEUR: 10,
    priceFCFA: 5000,
  },
  {
    id: "ethan1",
    name: "Pack Ethan 1",
    description: "Instrumentation Piano/Guitare",
    priceEUR: 20,
    priceFCFA: 10000,
  },
  {
    id: "ethan2",
    name: "Pack Ethan 2",
    description: "Instrumentation Piano/Bass/Rythmique",
    priceEUR: 100,
    priceFCFA: 50000,
  },
  {
    id: "ethan3",
    name: "Pack Ethan 3",
    description: "Instrumentation enrichie",
    priceEUR: 300,
    priceFCFA: 150000,
  },
  {
    id: "heman1",
    name: "Pack Heman 1",
    description: "Conduite de Louange",
    priceEUR: 20,
    priceFCFA: 10000,
  },
  {
    id: "heman2",
    name: "Pack Heman 2",
    description: "Production SON (studio)",
    priceEUR: 400,
    priceFCFA: 200000,
  },
  {
    id: "heman3",
    name: "Pack Heman 3",
    description: "Production VIDEO (clip)",
    priceEUR: 1000,
    priceFCFA: 500000,
  },
  {
    id: "heman4",
    name: "Pack Heman 4",
    description: "Déploiement sur les réseaux sociaux",
    priceEUR: 20,
    priceFCFA: 50000,
  },
]

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
      return "Virement / Transfert"
    case "mobile":
      return "Mobile Money"
    case "paypal":
      return "PayPal"
    default:
      return method
  }
}

export async function sendOrderConfirmationEmail(orderData: OrderData) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number.parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    const selectedPack = PACKS.find((p) => p.id === orderData.selectedPack)
    const selectedAccompanimentPacks = Object.entries(orderData.accompanimentPacks)
      .filter(([_, quantity]) => quantity > 0)
      .map(([packId, quantity]) => {
        const pack = ACCOMPANIMENT_PACKS.find((p) => p.id === packId)
        return { pack, quantity }
      })
      .filter(({ pack }) => pack)

    const paymentDetails = {
      bank: {
        title: "🏦 Par Virement / Versement / Transfert (RIA, MoneyGram, WU)",
        details: `
          <strong>IBAN:</strong> MA64 013 780 0117320100800123 48<br>
          <strong>RIB:</strong> 013 780 0117320100800123 48<br>
          <strong>Code SWIFT:</strong> BMCIMAMC<br>
          <strong>Titulaire:</strong> DOGBRE SOKORA JEAN-CHRISTOPHE<br>
          <strong>Adresse:</strong> Casablanca, Maroc
        `,
      },
      mobile: {
        title: "📱 Par Mobile Money",
        details: `
          <strong>🇨🇮 Côte d'Ivoire (Orange / Wave):</strong> +2250703833108<br>
          <strong>🇧🇫 Burkina Faso (Orange):</strong> +22654725339<br>
          <strong>🇸🇳 Sénégal (Orange / Wave):</strong> +221775091447<br>
          <strong>🇬🇦 Gabon (Airtel):</strong> +24160271771
        `,
      },
      paypal: {
        title: "💳 Par PayPal",
        details: `<strong>Lien:</strong> <a href="https://paypal.me/chadahmusic" target="_blank">paypal.me/chadahmusic</a>`,
      },
    }

    const currentPaymentDetails = paymentDetails[orderData.paymentMethod as keyof typeof paymentDetails]

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Confirmation de commande - PleniHarmony</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #8B5A3C, #A0522D); color: white; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px; }
          .section { background: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #8B5A3C; }
          .pack-main { background: linear-gradient(135deg, #8B5A3C, #A0522D); color: white; padding: 20px; text-align: center; border-radius: 8px; margin: 15px 0; }
          .pack-accompaniment { background: linear-gradient(135deg, #228B22, #32CD32); color: white; padding: 20px; text-align: center; border-radius: 8px; margin: 15px 0; }
          .important-note { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
          .payment-details { background: #e8f4f8; padding: 15px; border-radius: 8px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎵 Confirmation de commande</h1>
          <p>Merci pour votre commande PleniHarmony!</p>
        </div>

        <div class="section">
          <h3>👤 Informations personnelles</h3>
          <p><strong>Nom:</strong> ${orderData.name}</p>
          <p><strong>Téléphone:</strong> ${orderData.phone}</p>
          <p><strong>Devise:</strong> ${orderData.currency}</p>
        </div>

        ${
          selectedPack
            ? `
        <div class="section">
          <h3>🎵 Pack principal sélectionné</h3>
          <p><strong>${selectedPack.name}</strong></p>
          <p>${selectedPack.description}</p>
          ${
            selectedPack.priceEUR > 0
              ? `
            <p><strong>Fréquence:</strong> ${getFrequencyLabel(orderData.paymentFrequency)}</p>
            <div class="pack-main">
              <h3>Pack Principal</h3>
              <p>${getFrequencyLabel(orderData.paymentFrequency)}</p>
              <h2>${orderData.mainPackTotal.toLocaleString()} ${orderData.currency}</h2>
            </div>
          `
              : `<p style="color: #228B22; font-weight: bold;">✨ Gratuit</p>`
          }
        </div>
        `
            : ""
        }

        ${
          selectedAccompanimentPacks.length > 0
            ? `
        <div class="section">
          <h3>🎹 Packs d'accompagnement</h3>
          ${selectedAccompanimentPacks
            .map(({ pack, quantity }) => {
              if (!pack) return ""
              const price = orderData.currency === "EUR" ? pack.priceEUR : pack.priceFCFA
              return `
                <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 5px;">
                  <p><strong>${pack.name}</strong> x${quantity}</p>
                  <p style="color: #666; font-size: 14px;">${pack.description}</p>
                  <p style="color: #228B22; font-weight: bold;">${(price * quantity).toLocaleString()} ${orderData.currency}</p>
                </div>
              `
            })
            .join("")}
          <div class="pack-accompaniment">
            <h3>Packs d'Accompagnement</h3>
            <h2>${orderData.accompanimentTotal.toLocaleString()} ${orderData.currency}</h2>
          </div>
        </div>
        `
            : ""
        }

        <div class="section">
          <h3>💳 Informations de paiement</h3>
          ${
            orderData.mainPackTotal > 0
              ? `<p><strong>Fréquence:</strong> ${getFrequencyLabel(orderData.paymentFrequency)}</p>`
              : ""
          }
          <p><strong>Moyen de paiement:</strong> ${getPaymentMethodLabel(orderData.paymentMethod)}</p>
          
          <div class="payment-details">
            <h4>${currentPaymentDetails.title}</h4>
            <div>${currentPaymentDetails.details}</div>
          </div>
        </div>

        ${
          orderData.comments
            ? `
        <div class="section">
          <h3>💬 Vos commentaires</h3>
          <p>${orderData.comments}</p>
        </div>
        `
            : ""
        }

        <div class="important-note">
          <h3>⚠️ NOTE IMPORTANTE</h3>
          <p>Vous avez la possibilité une fois abonné(e) de :</p>
          <ul>
            <li>soit demander une harmonisation (voix) ou une instrumentation (instrument piano ou guitare ou bass ou batterie) d'un chant donné à l'équipe PLENIHARMONY (${
              orderData.currency === "FCFA" ? "10.000 FCFA" : "20 EUR"
            } si votre proposition est retenue).</li>
            <li>soit proposer à PLENIHARMONY votre propre harmonisation ou instrumentation pour enrichir la base de chants (dans ce cas, PLENIHARMONY vous paiera ${
              orderData.currency === "FCFA" ? "10.000 FCFA" : "20 EUR"
            } si votre proposition est retenue).</li>
          </ul>
        </div>

        <div class="footer">
          <p>Merci de votre confiance !</p>
          <p><strong>Équipe PleniHarmony</strong></p>
          <p>Pour toute question, n'hésitez pas à nous contacter.</p>
        </div>
      </body>
      </html>
    `
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: orderData.email,
      cc: process.env.PLENISOFTS_EMAIL,
      subject: `Confirmation de commande - PleniHarmony - ${orderData.name}`,
      html: htmlContent
    }

    await transporter.sendMail(mailOptions)

    return {
      success: true,
      message: "Email de confirmation envoyé avec succès",
    }
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error)
    return {
      success: false,
      message: "Erreur lors de l'envoi de l'email de confirmation",
    }
  }
}
