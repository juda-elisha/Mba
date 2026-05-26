/**
 * PayChangu mobile money integration for Malawi
 * Supports Airtel Money (provider: airtel) and TNM Mpamba (provider: tnm)
 */

const PAYCHANGU_BASE_URL = "https://api.paychangu.com";
const secretKey = process.env["PAYCHANGU_SECRET_KEY"];

export interface MobileMoneyPayoutParams {
  amount: number; // MWK amount (e.g. 500 = MWK 500)
  phoneNumber: string;
  provider: "airtel" | "tnm";
  txRef: string; // unique reference for this transaction
  narration: string;
}

export interface PaychanguPayoutResponse {
  success: boolean;
  reference?: string;
  message: string;
  data?: unknown;
}

export async function sendMobileMoney(
  params: MobileMoneyPayoutParams,
): Promise<PaychanguPayoutResponse> {
  if (!secretKey) {
    return {
      success: false,
      message: "PAYCHANGU_SECRET_KEY not configured",
    };
  }

  const networkCode = params.provider === "airtel" ? "AIRTEL" : "TNM";

  try {
    const response = await fetch(`${PAYCHANGU_BASE_URL}/disbursement`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secretKey}`,
        Accept: "application/json",
      },
      body: JSON.stringify({
        amount: params.amount,
        currency: "MWK",
        mobile: params.phoneNumber.replace(/^\+/, ""), // strip leading +
        network: networkCode,
        tx_ref: params.txRef,
        narration: params.narration,
      }),
    });

    const data = (await response.json()) as {
      status?: string;
      message?: string;
      data?: { reference?: string };
    };

    if (response.ok && data.status === "success") {
      return {
        success: true,
        reference: data.data?.reference,
        message: data.message ?? "Payment initiated",
        data,
      };
    }

    return {
      success: false,
      message: data.message ?? `PayChangu error: HTTP ${response.status}`,
      data,
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Network error",
    };
  }
}
