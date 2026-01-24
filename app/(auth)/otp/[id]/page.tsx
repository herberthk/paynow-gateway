import { redirect } from "next/navigation";
import Otp from "./Otp";

const Page = async ({ params }: { params: { id: string } }) => {
  const { id } = await params;
  if (!id) {
    redirect("/");
  }
  // Decode base64 on server
  let decodedId = "";

  try {
    decodedId = Buffer.from(id, "base64url").toString("utf8");
  } catch (error) {
    console.error("Failed to decode id:", error);
  }

  console.log("decodedId", decodedId);
  return <Otp />;
};

export default Page;
