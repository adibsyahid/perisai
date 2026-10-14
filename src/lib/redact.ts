// Runs on the phone BEFORE anything is sent to the server or to Gemini.
// We remove IC and card numbers. Phone and bank account numbers stay,
// because they are the evidence that identifies a scammer.

export const REDACTED = "[DIPADAM]";

// Malaysian IC: YYMMDD-PB-####. With dashes it is unmistakable, so always redact.
const IC_WITH_DASHES = /\b\d{6}-\d{2}-\d{4}\b/g;

// Without dashes it is 12 digits, the same length as many bank account numbers.
// Only redact when the first 6 digits are a real date AND the next 2 are a real
// place-of-birth code, so account numbers are usually left alone.
const TWELVE_DIGITS = /\b\d{12}\b/g;

function looksLikeIc(digits: string) {
  const month = Number(digits.slice(2, 4));
  const day = Number(digits.slice(4, 6));
  const pb = Number(digits.slice(6, 8));
  const validDate = month >= 1 && month <= 12 && day >= 1 && day <= 31;
  const validPb = (pb >= 1 && pb <= 59) || (pb >= 60 && pb <= 99 && pb !== 69 && pb !== 70 && pb !== 73);
  return validDate && validPb;
}

// Card numbers: 13-19 digits, maybe in groups. The Luhn checksum separates
// real card numbers from bank account numbers of a similar length.
const CARD_LIKE = /\b(?:\d[ -]?){12,18}\d\b/g;

function passesLuhn(digits: string) {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let n = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
  }
  return sum % 10 === 0;
}

export function redact(text: string): string {
  return text
    .replace(IC_WITH_DASHES, REDACTED)
    .replace(CARD_LIKE, (match) => {
      const digits = match.replace(/\D/g, "");
      return digits.length >= 13 && digits.length <= 19 && passesLuhn(digits) ? REDACTED : match;
    })
    .replace(TWELVE_DIGITS, (match) => (looksLikeIc(match) ? REDACTED : match));
}

// Tidy pasted text: unify line breaks, drop invisible characters scammers use
// to dodge filters, and trim very long pastes.
export function normalise(text: string, maxLength = 4000): string {
  return text
    .replace(/\r\n?/g, "\n")
    .replace(/[​-‍﻿]/g, "")
    .trim()
    .slice(0, maxLength);
}
