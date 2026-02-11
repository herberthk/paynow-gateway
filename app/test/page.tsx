// import prisma from "@/lib/prisma";

const Page = async () => {
  //   //   const user = await prisma.user.findUniqueOrThrow({
  //   //     where: {
  //   //       id: 6,
  //   //     },
  //   //     select: {
  //   //       id: true,
  //   //       name: true,
  //   //       email: true,
  //   //       privilege: true,
  //   //       status: true,
  //   //       wallet: true,
  //   //       created_at: true,
  //   //       tel: true,
  //   //       address: true,
  //   //     },
  //   //   });
  //   const updatedUser = await prisma.user.update({
  //     where: {
  //       id: 6,
  //     },
  //     data: {
  //       name: "Herbert kavuma",
  //       // email: "[EMAIL_ADDRESS]",
  //       tel: "256772123456",
  //       address: "123 Main St",
  //     },
  //     select: {
  //       id: true,
  //       name: true,
  //       email: true,
  //       privilege: true,
  //       status: true,
  //       wallet: true,
  //       created_at: true,
  //       tel: true,
  //       address: true,
  //     },
  //   });
  return (
    <div>
      <h1>Test</h1>
      {/* <pre>{JSON.stringify(updatedUser, null, 2)}</pre> */}
    </div>
  );
};

export default Page;
