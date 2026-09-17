
class VerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PawaPayError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
/**
 * Thrown when client-side validation of request parameters fails before
 * the request is even sent, saving a round-trip.
 */
class VerificationValidationError extends VerificationError {
  public readonly field?: string;

  constructor(message: string, field?: string) {
    super(message);
    this.name = "VerificationValidationError";
    this.field = field;
    Object.setPrototypeOf(this, VerificationValidationError.prototype);
  }
}

/** Uganda international dialling prefix + 9 digits */
const MSISDN_RE = /^256\d{9}$/;

/** Result of a phone number verification request. */
export interface MsisdnData {
  /** Verified phone number in international format. */
  msisdn: string;
  FirstName: string;
  Surname: string;
}

export interface MsisdnVerificationResponse {
  response: string;
  data: MsisdnData;
  message?: string;
}

/**
 * Phone number (MSISDN) verification.
 *
 * Always verify a recipient's phone number before disbursing funds to them.
 * This confirms the number is registered on a supported network and returns
 * the account holder's name so you can display a confirmation step to the user.
 */

export class VerifyMsisdn {
  private readonly authHeader: string;
  private readonly API_BASE_URL: string;
  private readonly API_USER: string;
  private readonly API_KEY: string;
  constructor() {
    const API_USER = process.env.SSENTEZO_API_USER;
    const API_KEY = process.env.SSENTEZO_API_KEY;
    if (!API_USER || !API_KEY) {
      throw new Error("SSENTEZO_API_USER and SSENTEZO_API_KEY must be defined");
    }
    const API_BASE_URL = "https://devwallet.ssentezo.com/api"
    this.API_BASE_URL = API_BASE_URL;
    this.API_USER = API_USER;
    this.API_KEY = API_KEY;
    this.authHeader = `Basic ${this.base64Encode(`${this.API_USER}:${this.API_KEY}`)}`;
  }

  /**
   * Verify the name associated with a Ugandan mobile money number.
   *
   * @param msisdn  Phone number in international format (e.g. "256709920188").
   *
   * @example
   * const info = await msisdn.verify("256709920188");
   * console.log(`${info.FirstName} ${info.Surname}`); // "John Doe"
   *
   * @throws {VerificationValidationError} if the MSISDN format is invalid.
   * @throws {VerificationError}           if the number cannot be verified.
   */
  private async makeFetchRequest(msisdn: string): Promise<MsisdnVerificationResponse> {
    return await fetch(`${this.API_BASE_URL}/msisdn-verification`, {
      method: "POST",
      headers: {
        Authorization: this.authHeader,
        "Content-Type": "application/json",
        Connection: "keep-alive",
      },
      body: JSON.stringify({
        msisdn,
      }),
    }).then((res) => res.json());
  }

  /**
   * Encode a string to base64.
   * Uses Node.js Buffer when available (Next.js server / Edge Runtime + Node.js),
   * falls back to the Web Crypto-based `btoa` for pure Edge environments.
   */
  private base64Encode(value: string): string {
    if (typeof Buffer !== "undefined") {
      return Buffer.from(value, "utf8").toString("base64");
    }
    // Pure Edge Runtime (no Buffer) — btoa is available globally
    return btoa(unescape(encodeURIComponent(value)));
  }

  /**
   * Validate a phone number in Ugandan international format.
   * Must start with 256 followed by exactly 9 digits (e.g. 256709920188).
   */
  private validateMsisdn(msisdn: unknown): void {
    if (typeof msisdn !== "string" || !MSISDN_RE.test(msisdn)) {
      throw new VerificationValidationError(
        `Invalid MSISDN "${msisdn}". ` +
          "Must be in international format starting with 256 followed by 9 digits " +
          "(e.g. 256709920188)."
      );
    }
  }

  async verify(msisdn: string): Promise<MsisdnVerificationResponse> {
    this.validateMsisdn(msisdn);
    return this.makeFetchRequest(msisdn);
  }
}

const verifyNumber = new VerifyMsisdn();
export default verifyNumber