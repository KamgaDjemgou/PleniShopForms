"use server"

import nodemailer from "nodemailer"

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
  selectedPackage: "free" | "starter" | "pro" | "enterprise"
  packagePrice: number
  packageName: string
  comments: string
  submittedAt: string
}

const PACKAGES_INFO = {
  free: {
    name: "Free",
    icon: "🎁",
    features: ["5 produits", "10 commandes par mois", "Support par email"],
  },
  starter: {
    name: "Starter",
    icon: "🚀",
    features: [
      "50 produits",
      "100 commandes par mois",
      "Domaine personnalisé",
      "Support prioritaire",
      "Statistiques avancées",
      "Export des données",
    ],
  },
  pro: {
    name: "Pro",
    icon: "⭐",
    features: [
      "500 produits",
      "1000 commandes par mois",
      "Domaine personnalisé",
      "Support prioritaire 24/7",
      "Statistiques avancées",
      "Export des données",
      "Multi-devises",
      "Multi-langues",
      "Intégrations avancées",
    ],
  },
  enterprise: {
    name: "Enterprise",
    icon: "👑",
    features: [
      "Produits illimités",
      "Commandes illimitées",
      "Domaine personnalisé",
      "Support dédié",
      "Toutes les fonctionnalités Pro",
      "API personnalisé",
      "Formation dédiée",
      "Gestion multi-boutiques",
    ],
  },
}

export async function sendOrderConfirmationEmail(orderData: FormSubmissionData) {
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

    const packageInfo = PACKAGES_INFO[orderData.selectedPackage as keyof typeof PACKAGES_INFO]

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Inscription PleniShop Confirmée</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1a5a3d, #2d8a6f); color: white; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px; }
          .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .section { background: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #1a5a3d; }
          .package-highlight { background: linear-gradient(135deg, #4a90e2, #357abd); color: white; padding: 20px; text-align: center; border-radius: 8px; margin: 15px 0; }
          .setup-info { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .features-list { list-style: none; padding: 0; }
          .features-list li { padding: 5px 0; padding-left: 20px; position: relative; }
          .features-list li:before { content: "✓"; position: absolute; left: 0; color: #1a5a3d; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
          .contact-info { background: #e8f4f8; padding: 15px; border-radius: 8px; margin: 10px 0; }
          a { color: #1a5a3d; text-decoration: none; }
          a:hover { text-decoration: underline; }
          .warning { color: #d9534f; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">PleniShop</div>
          <h1>✅ Inscription Confirmée!</h1>
          <p>Votre boutique en ligne a été enregistrée avec succès</p>
        </div>

        <div class="section">
          <h3>👤 Informations du Gérant</h3>
          <p><strong>Nom:</strong> ${orderData.managerName}</p>
          <p><strong>Email:</strong> ${orderData.managerEmail}</p>
          <p><strong>Téléphone:</strong> ${orderData.managerPhone || "Non fourni"}</p>
        </div>

        <div class="section">
          <h3>🏪 Informations de la Boutique</h3>
          <p><strong>Nom:</strong> ${orderData.shopName}</p>
          <p><strong>Email:</strong> ${orderData.shopEmail}</p>
          <p><strong>Téléphone:</strong> ${orderData.shopPhone || "Non fourni"}</p>
          <p><strong>Localisation:</strong> ${orderData.city}, ${orderData.country}</p>
          <p><strong>Devise:</strong> ${orderData.currency}</p>
        </div>

        <div class="section">
          <h3>📦 Configuration des Produits</h3>
          <p><strong>Option sélectionnée:</strong> ${orderData.productSetupOption === "self" ? "Paramétrage personnel" : "Assistance PLENISOFTS"}</p>
          ${
            orderData.productSetupOption === "assistance"
              ? `
          <div class="setup-info">
            <p>Notre équipe PLENISOFTS va examiner votre dossier et mettre en place votre boutique selon vos spécifications.</p>
            <p><strong>Prochaines étapes:</strong></p>
            <ul>
              <li>Dézippez le modèle téléchargé</li>
              <li>Remplissez le fichier Excel et les images selon les consignes</li>
              <li>Rezippez le dossier</li>
              <li>Envoyez-le à : <strong>support@plenisofts.org</strong></li>
            </ul>
          </div>
          `
              : ""
          }
        </div>

        <div class="section">
          <h3>${packageInfo.icon} Pack Sélectionné</h3>
          <p><strong>Pack:</strong> ${packageInfo.name}</p>
          ${packageInfo.name !== "Free" ? `<p><strong>Prix:</strong> ${orderData.packagePrice} ${orderData.currency}</p>` : `<p><strong>Prix:</strong> Gratuit</p>`}
          
          <h4>Inclus dans le pack ${packageInfo.name}:</h4>
          <ul class="features-list">
            ${packageInfo.features.map((feature) => `<li>${feature}</li>`).join("")}
          </ul>
        </div>

        ${
          orderData.comments
            ? `
        <div class="section">
          <h3>💬 Vos Commentaires</h3>
          <p>${orderData.comments}</p>
        </div>
        `
            : ""
        }

        <div class="setup-info">
          <h3>⚠️ Prochaines Étapes</h3>
          <ol>
            <li>Vous recevrez un email d'accès à votre tableau de bord PleniShop</li>
            <li>Configurez votre boutique avec vos informations</li>
            ${
              orderData.productSetupOption === "assistance"
                ? `<li>Envoyez votre dossier à support@plenisofts.org</li>
              <li>Notre équipe mettra en place votre boutique</li>`
                : `<li>Ajoutez vos produits via le tableau de bord</li>`
            }
            <li>Lancez votre boutique en ligne!</li>
          </ol>
        </div>

        <div class="contact-info">
          <h3>📧 Support</h3>
          <p>Pour toute question, contacter-nous :</p>
          <p><strong>Email:</strong> <a href="mailto:support@plenisofts.org">support@plenisofts.org</a></p>
          <p><strong>Site:</strong> <a href="https://plenisofts.org">plenisofts.org</a></p>
        </div>

        <div class="footer">
          <p>Merci de votre confiance! 🎉</p>
          <p><strong>Équipe PleniShop</strong></p>
          <p>Créons votre boutique en ligne de rêve ensemble!</p>
        </div>
      </body>
      </html>
    `

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: orderData.shopEmail,
      cc: orderData.managerEmail,
      subject: `Confirmation d'inscription PleniShop - ${orderData.shopName}`,
      html: htmlContent,
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
