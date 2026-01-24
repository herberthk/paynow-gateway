"use server";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";
import { verifyOTP } from "@/utils";
import { sendOtp } from "./email";
import { redirect } from "next/navigation";
type VerifyProps = {
  id: number;
  otp: string;
  action?: "verify" | "reset";
};
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
    const action = "verify";
    //encode id to base64 on server
    const toEncode = `${user.id}-${user.email}-${user.name}-${action}`;
    encodedId = Buffer.from(toEncode).toString("base64url");
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

export const VerifyUserOtp = async ({
  id,
  otp,
  action = "verify",
}: VerifyProps) => {
  try {
    const otpData = await prisma.otp.findUnique({
      where: {
        userId: id,
      },
    });

    if (!otpData) {
      return "Invalid otp";
    }
    console.log("otpData", otpData);
    const validOtp = verifyOTP(otp, otpData.otpHash);
    const isExpired = otpData.expiresAt < new Date();
    if (!validOtp) {
      if (otpData?.attempts >= 3 || isExpired) {
        await prisma.otp.delete({
          where: {
            userId: id,
          },
        });
        return "Invalid otp";
      } else {
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
    }
    await prisma.otp.delete({
      where: {
        userId: id,
      },
    });
    if (action === "verify") {
      //TODO: create session and redirect to dashboard
      // redirect("/dashboard");
    }
    if (action === "reset") {
      //TODO: create session and redirect to dashboard
      // redirect("/reset-password");
    }
    //TODO: create session and redirect to dashboard
    return "Otp verified successfully";
  } catch (error) {
    console.log("error", error);
    return "Failed to verify otp";
  }
};

export const resetPassword = async (email: string) => {
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
      },
    });
    if (!user) {
      return "User not found";
    }
    const sent = await sendOtp({
      id: user.id,
      email: user.email!,
      name: user.name!,
      type: "reset",
    });
    const action = "reset";
    const toEncode = `${user.id}-${user.email}-${user.name}-${action}`;
    encodedId = Buffer.from(toEncode).toString("base64url");
    if (!sent) {
      return "Failed to send otp";
    }
    console.log("reset sent successfully");
  } catch (error) {
    console.log("error", error);
  }
  if (encodedId) {
    redirect(`/otp/${encodedId}`);
  }
};
