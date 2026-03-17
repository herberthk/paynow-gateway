"use server";
import { render } from "@react-email/render";
import nodemailer from "nodemailer";
import prisma from "@/lib/prisma";
import { generateOTP, hashOTP } from "@/utils";
import OTPEmail from "@/components/global/OtpEmail";
import TransactionEmail from "@/components/global/TransactionEmail";

const SMTP_HOST = process.env.SMTP_HOST!;
const SMTP_PORT = process.env.SMTP_PORT!;
const SMTP_USER = process.env.SMTP_USER!;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD!;
const transporter = nodemailer.createTransport({
  // @ts-ignore
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
  const otp = await generateOTP();
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
      from: '"Paynow Gateway" <support@connectappbiz.com>',
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
    console.log("Can not send email", error);
    return false;
  }
};

type TransferEmailProps = {
  email: string;
  userName: string;
  amount: number;
  senderName: string;
  reference: string;
};

export const sendTransferEmail = async ({
  email,
  userName,
  amount,
  senderName,
  reference,
}: TransferEmailProps) => {
  try {
    const emailHtml = await render(
      TransactionEmail({
        userName,
        amount,
        senderName,
        reference,
        type: "RECEIPT",
      }),
    );
    const mailOptions = {
      from: '"Paynow Gateway" <support@connectappbiz.com>',
      to: email,
      subject: "Transfer Successful - Paynow Gateway",
      html: emailHtml,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending transfer email:", error);
    return false;
  }
};

type AdminTransferEmailProps = {
  email: string;
  adminName: string;
  amount: number;
  senderName: string;
  recipientName: string;
  reference: string;
  fee: number;
};

export const sendAdminTransferEmail = async ({
  email,
  adminName,
  amount,
  senderName,
  recipientName,
  reference,
  fee,
}: AdminTransferEmailProps) => {
  try {
    const emailHtml = await render(
      TransactionEmail({
        userName: adminName,
        amount,
        senderName,
        recipientName,
        reference,
        fee,
        type: "ADMIN_NOTICE",
      }),
    );
    const mailOptions = {
      from: '"Paynow Gateway" <support@connectappbiz.com>',
      to: email,
      subject: "New Transaction Fee - Paynow Gateway",
      html: emailHtml,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending admin transfer email:", error);
    return false;
  }
};

type SenderTransferEmailProps = {
  email: string;
  userName: string;
  amount: number;
  recipientName: string;
  reference: string;
  fee: number;
};

export const sendSenderTransferEmail = async ({
  email,
  userName,
  amount,
  recipientName,
  reference,
  fee,
}: SenderTransferEmailProps) => {
  try {
    const emailHtml = await render(
      TransactionEmail({
        userName,
        amount,
        recipientName,
        reference,
        fee,
        type: "SENDER_RECEIPT",
      }),
    );
    const mailOptions = {
      from: '"Paynow Gateway" <support@connectappbiz.com>',
      to: email,
      subject: "Transfer Receipt - Paynow Gateway",
      html: emailHtml,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending sender transfer email:", error);
    return false;
  }
};

// export const sendEmail = async ({ otp, email, name, expiry }: Props) => {};
