import { buildPasswordResetUrl } from "@/lib/password-reset";

type SendPasswordResetEmailInput = {
  email: string;
  rawToken: string;
};

function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_FROM?.trim(),
  );
}

export async function sendPasswordResetEmail({
  email,
  rawToken,
}: SendPasswordResetEmailInput): Promise<void> {
  const resetUrl = buildPasswordResetUrl(rawToken);
  const subject = "Reset your C.U.B. Code password";
  const text = [
    "You asked to reset your C.U.B. Code parent password.",
    "",
    `Open this link within 1 hour to choose a new password:`,
    resetUrl,
    "",
    "If you did not request this, you can ignore this email.",
  ].join("\n");

  if (isSmtpConfigured()) {
    const nodemailer = await import("nodemailer");
    const port = Number(process.env.SMTP_PORT ?? "587");
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            }
          : undefined,
    });

    await transport.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject,
      text,
    });
    return;
  }

  if (process.env.NODE_ENV === "development") {
    console.log("[cub-password-reset] SMTP not configured — reset link:");
    console.log(resetUrl);
    return;
  }

  throw new Error(
    "Password reset email is not configured. Set SMTP_HOST and SMTP_FROM.",
  );
}
