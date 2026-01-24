"use server";
import { render } from "@react-email/render";
import nodemailer from "nodemailer";
import prisma from "@/lib/prisma";
import { generateOTP, hashOTP } from "@/utils";
import OTPEmail from "@/components/OtpEmail";

// type Props = {
//   otp: string;
//   email: string;
//   name: string;
//   expiry: number;
// };
const SMTP_HOST = process.env.SMTP_HOST!;
const SMTP_PORT = process.env.SMTP_PORT!;
const SMTP_USER = process.env.SMTP_USER!;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD!;
const transporter = nodemailer.createTransport({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: true,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

type Props = {
  id: number;
  email: string;
  name: string;
  type?: "verify" | "reset";
};

export const sendOtp = async ({ id, email, name, type = "verify" }: Props) => {
  const otp = generateOTP();
  const otpHash = await hashOTP(otp);
  // 15 minutes expiry
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  try {
    await prisma.otp.upsert({
      where: { userId: id },
      update: {
        otpHash,
        expiresAt,
        attempts: 0,
      },
      create: {
        userId: id,
        otpHash,
        expiresAt,
      },
    });
    // await sendEmail({ otp: OTP, email, name, expiry: 10 });
    // Render React component to HTML
    const emailHtml = await render(
      OTPEmail({ otp, userName: name, expiryMinutes: 15, type }),
    );
    const mailOptions = {
      from: '"Paynow Gateway" <info@netbritz.com>',
      to: email,
      subject: "Paynow Gateway",
      html: emailHtml,
    };
    // const verify = await transporter.verify();
    // console.log("verify", verify);

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.accepted);
    return true;
  } catch (error) {
    console.log("error", error);
    return false;
  }
};

// export const sendEmail = async ({ otp, email, name, expiry }: Props) => {};
