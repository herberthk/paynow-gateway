"use server";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { createSession, getUserSession } from "../session";
import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";

export const updatePassword = async ({
  currentPassword,
  newPassword,
}: {
  currentPassword: string;
  newPassword: string;
}) => {
  try {
    const authenticated = await getUserSession();
    if (!authenticated) {
      return redirect("/login");
    }

    const user = await prisma.user.findUnique({
      where: {
        id: authenticated.id,
      },
      select: {
        id: true,
        password: true,
      },
    });
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
      user?.password!,
    );
    if (!isPasswordValid) {
      return {
        type: "error",
        message: "Wrong current password",
      };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: {
        id: user?.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    return {
      type: "success",
      message: "Password reset successfully",
    };
  } catch (e) {
    console.log(e);
    return {
      type: "error",
      message: "Something went wrong",
    };
  }
};

export const updateUserInfo = async ({
  name,
  email,
  tel,
  address,
}: {
  name: string;
  email: string;
  tel: string;
  address: string;
}) => {
  console.log(name, email, tel, address);
  try {
    const authenticated = await getUserSession();
    if (!authenticated) {
      return redirect("/login");
    }

    const user = await prisma.user.findUnique({
      where: {
        id: authenticated.id,
      },
      select: {
        id: true,
      },
    });
    const updatedUser = await prisma.user.update({
      where: {
        id: user?.id,
      },
      data: {
        name,
        // email, Email update will be done later
        tel,
        address,
      },
      select: {
        name: true,
        tel: true,
        address: true,
      },
    });

    await createSession({
      ...authenticated,
      name: updatedUser.name!,
      address: updatedUser.address!,
      tel: updatedUser.tel!,
    });
    // console.log("updatedUser", updatedUser);
    revalidatePath("/dashboard/user/settings");
    return {
      type: "success",
      message: "User information updated successfully",
    };
  } catch (e) {
    console.log(e);
    return {
      type: "error",
      message: "Something went wrong",
    };
  }
};
