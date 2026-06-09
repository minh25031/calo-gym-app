import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
})

export async function sendVerificationEmail(email: string, token: string, name: string) {
  const verifyUrl = `${process.env.AUTH_URL || "http://localhost:3000"}/verify?token=${token}`

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: `[CaloGym] Xác thực tài khoản của ${name}`,
      text: `Chào ${name},\n\nCảm ơn bạn đã đăng ký CaloGym!\nVui lòng click link sau để xác thực tài khoản:\n${verifyUrl}\n\nLink hết hạn sau 24 giờ.\n\n-- CaloGym`,
      html: `<p>Chào ${name},</p><p>Click vào nút bên dưới để xác thực tài khoản CaloGym:</p><p><a href="${verifyUrl}" style="padding:10px 20px;background:#16a34a;color:white;text-decoration:none;border-radius:8px">Xác thực email</a></p><p>Hoặc: ${verifyUrl}</p>`,
    })
    console.log(`Mail sent to ${email}: ${info.messageId}`)
    return { success: true }
  } catch (error: any) {
    console.error("Mail error:", error.message, error.code, error.command)
    return { error: error.message }
  }
}
