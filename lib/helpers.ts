"use server";

export const decodeBase64Email = async (encodedEmail: string) => {
  try {
    const decodedEmail = await Buffer.from(encodedEmail, "base64").toString(
      "utf-8",
    );
    return { success: true, email: decodedEmail };
  } catch (error) {
    console.log("Failed to decode email:", error);
    return { success: false, error: "Invalid email encoding" };
  }
};

export const decodeBase64Url = async (encodedId: string): Promise<number> => {
  const decoded = Buffer.from(encodedId, "base64url").toString("utf8");
  return Number(decoded);
};
