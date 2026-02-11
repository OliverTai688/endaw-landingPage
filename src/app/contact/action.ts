"use server";

import nodemailer from "nodemailer";
import { redis } from "@/lib/ratelimit";

/**
 * Calculates Shannon entropy of a string
 */
function getEntropy(str: string): number {
  const charMap: Record<string, number> = {};
  for (const char of str) {
    charMap[char] = (charMap[char] || 0) + 1;
  }
  let entropy = 0;
  const len = str.length;
  for (const char in charMap) {
    const p = charMap[char] / len;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

const SPAM_KEYWORDS = ["crypto", "viagra", "marketing agency", "seo", "investing"];
const DAILY_QUOTA_LIMIT = 100;

export async function sendContactEmail(formData: FormData) {
  const name = (formData.get("name") as string || "").trim();
  const email = (formData.get("email") as string || "").trim();
  const message = (formData.get("message") as string || "").trim();
  const honeypot = formData.get("fax_number") as string;

  // 1. Honeypot check
  if (honeypot) {
    console.warn("Honeypot triggered");
    // Return success to the bot to avoid it trying other things
    return { success: true };
  }

  // 2. Missing fields check
  if (!name || !email || !message) {
    return { success: false, error: "Missing fields" };
  }

  // 3. Simple semantic validation
  if (name.length < 2) return { success: false, error: "Name too short" };
  if (message.length < 10) return { success: false, error: "Message too short" };

  const lowerMessage = message.toLowerCase();
  if (SPAM_KEYWORDS.some(keyword => lowerMessage.includes(keyword))) {
    return { success: false, error: "Message content not allowed" };
  }

  // 4. Entropy check (detect random strings)
  // Higher entropy in long strings often indicates random data
  if (message.length > 50) {
    const entropy = getEntropy(message);
    if (entropy > 5.5) { // Threshold for "too random"
      console.warn(`High entropy detected: ${entropy}`);
      return { success: false, error: "Invalid message format" };
    }
  }

  // 5. Daily Quota Enforcement
  const today = new Date().toISOString().split("T")[0];
  const quotaKey = `quota:contact:${today}`;
  const currentCount = await redis.incr(quotaKey);

  if (currentCount === 1) {
    await redis.expire(quotaKey, 60 * 60 * 24); // 24h
  }

  if (currentCount > DAILY_QUOTA_LIMIT) {
    console.error("Daily email quota exceeded");
    return { success: false, error: "Service temporarily unavailable. Please try again tomorrow." };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"ENDAW Contact" <${process.env.GMAIL_USER}>`,
      to: process.env.CONTACT_RECEIVER_EMAIL,
      subject: `New Contact Form Message from ${name}`,
      html: `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
        <br/>
        <hr/>
        <small>Security Info: Entropy: ${message.length > 50 ? getEntropy(message).toFixed(2) : "N/A"}</small><br/>
        <small>This message was sent from the ENDAW contact page.</small>
      `,
    });

    return { success: true };
  } catch (error: any) {
    console.log("EMAIL ERROR:", error);
    return { success: false, error: "An unexpected error occurred. Please try again later." };
  }
}
