export type RecaptchaResult = {
  success: boolean;
  score: number;
  error?: string;
};

export async function verifyRecaptcha(
  token: string,
  minScore = 0.5
): Promise<RecaptchaResult> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey || secretKey === "REPLACE_WITH_YOUR_SECRET_KEY") {
    console.error("RECAPTCHA_SECRET_KEY is not configured");
    return { success: false, score: 0, error: "reCAPTCHA not configured" };
  }

  if (!token) {
    return { success: false, score: 0, error: "No reCAPTCHA token provided" };
  }

  try {
    const response = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token)}`,
      }
    );

    const data = await response.json();
    const score = typeof data.score === "number" ? data.score : 0;

    if (data.success !== true || score < minScore) {
      return {
        success: false,
        score,
        error: data["error-codes"]?.join(", ") || "Verification failed",
      };
    }

    return { success: true, score };
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return { success: false, score: 0, error: "Verification request failed" };
  }
}
