import sgMail from "@sendgrid/mail"

let configured = false

function getClient() {
  if (!configured) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY ?? "SG.placeholder")
    configured = true
  }
  return sgMail
}

export const email = {
  send: (...args: Parameters<typeof sgMail.send>) => getClient().send(...args),
}

export const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL ?? "noreply@CraftConnect.com"
