require("dotenv").config();

const cors = require("cors");
const twilio = require("twilio");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();

/* =========================
   CORS + BODY PARSER
========================= */
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(bodyParser.json());

/* =========================
   OTP STORE (IN-MEMORY)
========================= */
// phone -> { otp, emiId, expiresAt, used }
const otpStore = {};

/* =========================
   HELPER: NORMALIZE PHONE
========================= */
function normalizePhone(phone) {
  if (!phone.startsWith("+")) {
    return "+91" + phone;
  }
  return phone;
}

/* =========================
   TWILIO CLIENT (OPTIONAL)
========================= */
let client;
try {
  client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
} catch (err) {
  console.warn("⚠️ Twilio not initialized. Running in DEV mode.");
}

/* =========================
   SEND OTP
========================= */
app.post("/send-otp", async (req, res) => {
  try {
    let { phone, emiId } = req.body;

    if (!phone || !emiId) {
      return res.status(400).json({
        success: false,
        message: "Phone and emiId required",
      });
    }

    phone = normalizePhone(phone);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore[phone] = {
      otp,
      emiId,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      used: false,
    };

    console.log("🔐 OTP GENERATED:", phone, otp);

    /* =========================
       SEND SMS (OPTIONAL)
    ========================== */
    if (client && process.env.TWILIO_PHONE_NUMBER) {
      try {
        await client.messages.create({
          body: `Your EMI payment OTP is ${otp}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phone,
        });
        console.log("📩 OTP sent via Twilio");
      } catch (twilioErr) {
        console.error("Twilio Error:", twilioErr.message);
      }
    }

    // 🔥 DEV MODE: return OTP (remove in production)
    res.json({
      success: true,
      otp, // remove later in production
    });
  } catch (err) {
    console.error("SEND OTP ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
});

/* =========================
   VERIFY OTP
========================= */
app.post("/verify-otp", (req, res) => {
  try {
    let { phone, otp, emiId } = req.body;

    if (!phone || !otp || !emiId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    phone = normalizePhone(phone);

    const record = otpStore[phone];

    if (!record) {
      return res.status(400).json({
        success: false,
        message: "No OTP found",
      });
    }

    if (record.used) {
      return res.status(400).json({
        success: false,
        message: "OTP already used",
      });
    }

    if (Date.now() > record.expiresAt) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    if (record.otp !== otp || record.emiId !== emiId) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // ✅ Mark OTP as used
    record.used = true;

    console.log("✅ OTP VERIFIED:", phone);

    return res.json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Verification failed",
    });
  }
});

/* =========================
   SERVER START
========================= */
const PORT = 5001;

app.listen(PORT, () => {
  console.log(`🚀 OTP backend running on port ${PORT}`);
});