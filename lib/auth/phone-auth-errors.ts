type PhoneAuthErrorKey =
  | "phoneOtpSendFailed"
  | "phoneOtpInvalid"
  | "phoneOtpExpired"
  | "phoneRateLimited"
  | "phoneAccountNotFound"
  | "phoneDeliveryFailed";

const ERROR_PATTERNS: Array<{ pattern: RegExp; key: PhoneAuthErrorKey }> = [
  { pattern: /signups not allowed|user not found|no user/i, key: "phoneAccountNotFound" },
  { pattern: /rate limit|too many requests|429/i, key: "phoneRateLimited" },
  { pattern: /expired|otp_expired/i, key: "phoneOtpExpired" },
  { pattern: /invalid.*otp|token.*invalid|verification.*failed|60202/i, key: "phoneOtpInvalid" },
  { pattern: /63018|63008|undeliver|delivery|whatsapp/i, key: "phoneDeliveryFailed" },
];

export function mapPhoneAuthError(message: string): PhoneAuthErrorKey {
  for (const { pattern, key } of ERROR_PATTERNS) {
    if (pattern.test(message)) return key;
  }
  return "phoneOtpSendFailed";
}
