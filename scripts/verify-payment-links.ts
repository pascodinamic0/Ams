import assert from "node:assert/strict";
import {
  appendPayLinkIfMissing,
  buildPaymentLinkUrl,
  invoicePublicRef,
  isValidPaymentToken,
  paymentLinkPath,
} from "../lib/payments/payment-links";

const token = "a".repeat(32);
assert.equal(isValidPaymentToken(token), true);
assert.equal(isValidPaymentToken("short"), false);
assert.equal(isValidPaymentToken(""), false);
assert.equal(isValidPaymentToken("xyz-not-hex"), false);
assert.equal(paymentLinkPath(token), `/pay/${token}`);
assert.equal(
  buildPaymentLinkUrl("https://www.shuleos.app/", token),
  `https://www.shuleos.app/pay/${token}`
);
assert.equal(
  appendPayLinkIfMissing("Pay soon.", "https://example.com/pay/abc"),
  "Pay soon.\n\nhttps://example.com/pay/abc"
);
assert.equal(
  appendPayLinkIfMissing("Pay https://example.com/pay/abc now", "https://example.com/pay/abc"),
  "Pay https://example.com/pay/abc now"
);
assert.equal(
  invoicePublicRef("aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"),
  "AAAAAAAA"
);

console.log("verify-payment-links: ok");
