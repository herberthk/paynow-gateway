import { redirect } from "next/navigation";
import Sent from "./Sent";

const SentPage = async ({ params }: { params: { email: string } }) => {
  const { email } = await params;

  if (!email) {
    return redirect("/");
  }
  // Decode base64 on server
  let decodedEmail = "";

  try {
    decodedEmail = Buffer.from(email, "base64url").toString("utf-8");
  } catch (error) {
    console.error("Failed to decode email:", error);
  }
  // console.log("email", decodedEmail);
  return <Sent email={decodedEmail} />;
};

export default SentPage;
