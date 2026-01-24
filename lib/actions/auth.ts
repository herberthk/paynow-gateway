"use server";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";
import { verifyOTP } from "@/utils";
import { sendOtp } from "../email";
import { redirect } from "next/navigation";

export const login = async (email: string, password: string) => {
  let encodedId = "";
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        privilege: true,
        password: true,
        created_at: true,
      },
    });
    if (!user) {
      return "Wrong email or password";
      // throw Error("User not found");
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
    const isPasswordValid = await bcrypt.compare(password, user?.password!);
    if (!isPasswordValid) {
      return "Wrong email or password";
      // throw Error("Invalid password");
    }
    // console.log("user", user);
    const sent = await sendOtp({
      id: user.id,
      email: user.email!,
      name: user.name!,
    });
    if (!sent) {
      return "Failed to send otp";
    }
    //encode id to base64 on server
    // const encodedId = Buffer.from(user.id.toString()).toString("base64");
    encodedId = Buffer.from(user.id.toString()).toString("base64url");
    console.log("encodedId", encodedId);
    // return "Verified successfully";
  } catch (error) {
    console.log("error", error);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error; // let Next.js handle it
    }
    throw error;
    // return "Failed to get user data";
    // throw Error("Failed to get user data", { cause: error });
  }
  if (encodedId) {
    redirect(`/otp/${encodedId}`);
  }
};

export const verifyOtp = async ({ id, otp }: { id: number; otp: string }) => {
  try {
    const otpData = await prisma.otp.findUnique({
      where: {
        userId: id,
      },
    });
    if (!otpData) {
      return "Otp not found";
    }
    const isOtpValid = verifyOTP(otp, otpData.otpHash);
    if (!isOtpValid) {
      if (otpData?.attempts >= 3) {
        await prisma.user.delete({
          where: {
            id: id,
          },
        });
      }
      await prisma.otp.update({
        where: {
          userId: id,
        },
        data: {
          attempts: otpData?.attempts + 1,
        },
      });
      return "Invalid otp";
    }
    return "Otp verified successfully";
  } catch (error) {
    console.log("error", error);
    return "Failed to verify otp";
  }
};
