require("dotenv").config();
const cors = require("cors");
const twilio = require("twilio");
const express = require("express");
const bodyParser = require("body-parser");
const otpStore = {}; // phoneNumber -> otp
const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(bodyParser.json());

function normalizePhone(phone) {
  if (!phone.startsWith("+")) {
    return "+91" + phone;
  }
  return phone;
}

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);


// 🔹 Send OTP
app.post("/send-otp", async (req, res) => {
  try {
    let { phone } = req.body;
    phone = normalizePhone(phone);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[phone] = otp;

    console.log("OTP SENT:", phone, otp);

    await client.messages.create({
      body: `Your OTP is ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("SEND OTP ERROR:", err);
    res.status(500).json({ success: false });
  }
});



// 🔹 Verify OTP
app.post("/verify-otp", (req, res) => {
  let { phone, otp } = req.body;
  phone = normalizePhone(phone);

  console.log("VERIFY REQUEST:", phone, otp);
  console.log("STORED OTP:", otpStore[phone]);

  if (otpStore[phone] === otp) {
    delete otpStore[phone];
    return res.json({ success: true });
  }

  return res.status(400).json({
    success: false,
    message: "Invalid OTP",
  });
});




const PORT = 5000;
app.listen(PORT, () =>
  console.log(`OTP backend running on port ${PORT}`)
);
