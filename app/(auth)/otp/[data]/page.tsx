import { redirect } from "next/navigation";
import Otp from "./Otp";

const Page = async ({ params }: { params: { data: string } }) => {
  const { data } = await params;
  if (!data) {
    redirect("/");
  }
  // Decode base64 on server
  let decodedId = "";

  try {
    decodedId = Buffer.from(data, "base64url").toString("utf8");
  } catch (error) {
    console.error("Failed to decode id:", error);
  }
  const [id, email, name, action] = decodedId.split("-");

  // console.log("otp data", { id, email, name, action });
  return (
    <Otp
      id={id}
      email={email}
      name={name}
      action={action as "verify" | "reset"}
    />
  );
};

export default Page;
