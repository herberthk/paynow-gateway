"use server";

import prisma from "@/lib/prisma";

export const getUserData = async (email: string) => {
  const user = await prisma.users.findUnique({
    where: {
      email: email,
    },
    select: {
      id: true,
      name: true,
      email: true,
      privilege: true,
      created_at: true,
    },
  });
  return user;
};

// export const createUser = async (email: string, password: string) => {
//   const user = await prisma.users.create({
//     data: { email, password },
//   });
//   return user;
// };
