import { redirect } from "next/navigation";
import ResetPage from "./Reset";
import { verifyOTP } from "@/utils";
const passwordResetSecret = process.env.PASSWORD_RESSET_SECRET;
const Page = async ({ params }: { params: { data: string } }) => {
  const { data } = await params;

  if (!data) {
    return redirect("/");
  }
  // Decode base64 on server
  let decodedData = "";

  try {
    decodedData = Buffer.from(data, "base64url").toString("utf-8");
  } catch (error) {
    console.error("Failed to decode data:", error);
  }
  const [id, secretHash] = decodedData.split("-");
  // console.log("data", decodedData);
  const validSecret = await verifyOTP(passwordResetSecret!, secretHash);
  // console.log("isSecretValid", validSecret);
  if (!validSecret) {
    return redirect("/");
  }
  console.log({ id, secretHash });
  return <ResetPage id={Number(id)} />;
};

export default Page;
