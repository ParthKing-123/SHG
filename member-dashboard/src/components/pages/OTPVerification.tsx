import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { toast } from "sonner";
import { OTP_BACKEND_URL } from "../../config";

interface OTPVerificationProps {
  phoneNumber: string;
  onVerified: () => void;
}

export default function OTPVerification({
  phoneNumber,
  onVerified,
}: OTPVerificationProps) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔹 Auto-send OTP when component opens
  useEffect(() => {
    sendOtp();
  }, []);

  const sendOtp = async () => {
    try {
      console.log("Sending OTP to:", phoneNumber);

      const res = await fetch(`${OTP_BACKEND_URL}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneNumber }),
      });

      const data = await res.json();
      if (data.success) toast.success("OTP sent successfully");
      else toast.error("OTP send failed");
    } catch (err) {
      console.error(err);
      toast.error("OTP server error");
    }
  };

const verifyOtp = async () => {
  if (otp.length !== 6) {
    toast.error("Enter valid 6-digit OTP");
    return;
  }

  setLoading(true);
  try {
    const res = await fetch(`${OTP_BACKEND_URL}/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: phoneNumber, otp }),
    });

    const data = await res.json();

    if (data.success) {
      toast.success("OTP verified");
      onVerified(); // 🔥 THIS ENABLES PAY EMI
    } else {
      toast.error("Invalid OTP");
    }
  } catch {
    toast.error("Verification failed");
  } finally {
    setLoading(false);
  }
};


  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Verify EMI</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>OTP sent to <b>{phoneNumber}</b></p>

        <Input
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />

        <Button onClick={verifyOtp} disabled={loading} className="w-full">
          Verify OTP
        </Button>
      </CardContent>
    </Card>
  );
}
