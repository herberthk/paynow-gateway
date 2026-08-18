"use server";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";
import { hashOTP, verifyOTP } from "@/utils";
import { sendOtp } from "./email";
import { redirect } from "next/navigation";
import { createSession } from "@/lib";
type VerifyProps = {
  id: number;
  otp: string;
  action?: "verify" | "reset";
};
const passwordResetSecret = process.env.PASSWORD_RESSET_SECRET;
export const login = async (email: string) => {
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
      return "No account associated with this email";
      // throw Error("User not found");
    }
    // const isPasswordValid = await bcrypt.compare(password, user?.password!);
    // if (!isPasswordValid) {
    //   return "Wrong email or password";
    //   // throw Error("Invalid password");
    // }
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
  // try {
  if (!passwordResetSecret) {
    // return "Password reset secret not found";
    console.log("Password reset secret not found");
    return;
  }
  // console.log("passwordResetSecret", passwordResetSecret);
  const otpData = await prisma.otp.findFirst({
    where: {
      userId: id,
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!otpData) {
    return "Invalid otp";
  }

  const validOtp = await verifyOTP(otp, otpData.otpHash);
  if (!validOtp) {
    await prisma.otp.update({
      where: {
        userId: id,
      },
      data: {
        attempts: otpData?.attempts + 1,
        // attempts: { increment: 1 },
      },
    });
   
    return "Invalid otp";
  }
  if (otpData?.attempts >= 3) {
    await prisma.otp.delete({
      where: {
        userId: id,
      },
    });
    return "Invalid otp";
  }
  await prisma.otp.delete({
    where: {
      userId: id,
    },
  });
  if (action === "verify") {
    console.log("Otp verified successfully");
    await loginNow(id);
    return "Otp verified successfully";
  }
  if (action === "reset") {
    const secretHash = await hashOTP(passwordResetSecret);
    const encodedData = Buffer.from(`${id}-${secretHash}`).toString(
      "base64url",
    );
    gotoReset(`/reset/${encodedData}`);
    return "Otp verified successfully";
  }
  // } catch (error) {
  // console.log("error", error);
  // return "Failed to verify otp";
  // }
};

const gotoReset = (path: string) => redirect(path);

const loginNow = async (id: number) => {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      privilege: true,
      status: true,
      // wallet: true,
      created_at: true,
      tel: true,
      address: true,
    },
  });
  if (!user) {
    return "User not found";
  }
  await createSession({
    name: user.name!,
    email: user.email!,
    privilege: user.privilege!,
    status: user?.status!,
    id: user.id,
    created_at: user.created_at?.toDateString()!,
    address: user?.address!,
    tel: user?.tel!,
  });
  const path =
    user.privilege === "super_admin" ? "/dashboard/admin" : "/dashboard/user";
  redirect(path);
};

export const initPasswordReset = async (email: string) => {
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

export const resetPassword = async (id: number, password: string) => {
  let path = "";
  try {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        privilege: true,
        status: true,
        // wallet: true,
        created_at: true,
        tel: true,
        address: true,
      },
    });
    if (!user) {
      return "User not found";
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: {
        id,
      },
      data: {
        password: hashedPassword,
      },
    });
    // console.log("user", user);
    console.log("reset password successfully");
    // Create session and login the user
    await createSession({
      name: user.name!,
      email: user.email!,
      privilege: user.privilege!,
      status: user?.status!,
      id: user.id,
      created_at: user.created_at?.toDateString()!,
      address: user?.address!,
      tel: user?.tel!,
      // wallet: {
      //   ...user.wallet,
      //   id: user.wallet?.id!,
      //   balance: Number(user.wallet?.balance),
      //   createdAt: user.wallet?.createdAt.toDateString()!,
      //   updatedAt: user.wallet?.updatedAt.toDateString()!,
      // },
    });
    path =
      user.privilege === "super_admin" ? "/dashboard/admin" : "/dashboard/user";
  } catch (error) {
    console.log("error", error);
  }
  redirect(path);
};
