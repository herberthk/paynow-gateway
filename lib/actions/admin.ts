"use server";
import prisma from "@/lib/prisma";
export const getAdmins = async () => {
  try {
    const response = await prisma.user.findMany({
      where: {
        privilege: "super_admin",
      },
    });
    return response;
  } catch (error) {
    console.error("Error fetching admins:", error);
    return [];
  }
};

export const getAdminById = async (id: number) => {
  try {
    const response = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    return response;
  } catch (error) {
    console.error("Error fetching admin by ID:", error);
    return null;
  }
};

export const assignAdmin = async (id: number) => {
  try {
    const response = await prisma.user.update({
      where: {
        id,
      },
      data: {
        privilege: "super_admin",
      },
    });
    return response;
  } catch (error) {
    console.error("Error assigning admin:", error);
    return null;
  }
};
