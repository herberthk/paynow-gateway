import { describe, expect, it } from "vitest";
import { render } from "@react-email/render";
import SupportEmail from "@/components/global/SupportEmail";

describe("SupportEmail", () => {
  it("links the failure retry button to the absolute support page URL", async () => {
    const supportUrl = "https://connect.example/dashboard/user/wallet/support";
    const html = await render(
      <SupportEmail
        userName="Alice"
        recipientName="Bob"
        amount={5_000}
        reference="TX_SUPPORT_1"
        supportUrl={supportUrl}
        type="SENDER_FAILURE"
      />,
    );

    expect(html).toContain(supportUrl);
    expect(html).toContain("Try Support Again");
    expect(html).not.toContain('href="#"');
  });
});
