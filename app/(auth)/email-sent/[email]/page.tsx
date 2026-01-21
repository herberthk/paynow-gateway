import Sent from "./Sent";

const SentPage = async ({ params }: { params: { email: string } }) => {
  const { email } = await params;
  // Decode base64 on server
  let decodedEmail = "";
  if (email) {
    try {
      decodedEmail = Buffer.from(email, "base64").toString("utf-8");
    } catch (error) {
      console.error("Failed to decode email:", error);
    }
  }
  // console.log("email", decodedEmail);
  return <Sent email={decodedEmail} />;
};

export default SentPage;
