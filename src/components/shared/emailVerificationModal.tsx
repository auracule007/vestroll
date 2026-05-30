"use client";
import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";
import ModalDdntGetEmail from "./modal-didn't-get-email";

interface EmailVerificationProps {
  email: string;
  onVerify: (otp: string) => Promise<boolean>;
  onResend: () => Promise<void>;
  resendCooldown?: number;
  otpLength?: number;
  className?: string;
  onGoBack: () => void;
}

const maskEmail = (email: string) =>
  email.replace(/(.{2})(.*)(@.*)/, "$1***$3");

const formatTime = (s: number) =>
  `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

const EmailVerification: React.FC<EmailVerificationProps> = ({
  email,
  onVerify,
  onResend,
  resendCooldown = 60,
  otpLength = 6,
  className = "",
  onGoBack,
}) => {
  const [otp, setOtp] = useState<string[]>(Array(otpLength).fill(""));
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(resendCooldown);
  const [showDidntGetModal, setShowDidntGetModal] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  
  useEffect(() => {
    if (countdown === 0) {
      const timer = setTimeout(() => {
        setShowDidntGetModal(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    if (countdown === 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleInput = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...otp];
    next[i] = v;
    setOtp(next);
    setError("");
    if (v && i < otpLength - 1) inputRefs.current[i + 1]?.focus();
  };

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otp[i] && i > 0) {
        const next = [...otp];
        next[i - 1] = "";
        setOtp(next);
        inputRefs.current[i - 1]?.focus();
      } else if (otp[i]) {
        const next = [...otp];
        next[i] = "";
        setOtp(next);
      }
    }
    if (e.key === "ArrowLeft" && i > 0) inputRefs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < otpLength - 1)
      inputRefs.current[i + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const data = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, otpLength);
    if (!data) return;
    setOtp(Array.from({ length: otpLength }, (_, i) => data[i] || ""));
    const next = data.length < otpLength ? data.length : otpLength - 1;
    inputRefs.current[next]?.focus();
  };

  const verify = async () => {
    if (otp.some((d) => !d)) {
      setError(`Please enter a ${otpLength}-digit code`);
      return;
    }
    setVerifying(true);
    setError("");
    try {
      const valid = await onVerify(otp.join(""));
      if (!valid) {
        setError("Invalid code. Try again.");
      }
    } catch {
      setError("Verification failed. Try again.");
    } finally {
      setVerifying(false);
    }
  };

  const resend = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    setError("");
    try {
      await onResend();
      setCountdown(resendCooldown);
      inputRefs.current[0]?.focus();
      setShowDidntGetModal(false);
    } catch {
      setError("Failed to resend code.");
    } finally {
      setResending(false);
    }
  };

  const handleDidntGetCode = () => {
    setShowDidntGetModal(true);
  };

  const canResend = countdown === 0 && !resending;
  const canVerify = otp.every(Boolean) && !verifying;

  return (
    <>
      <div className={``}>
        <div className="mb-12">
          <h2 className="text-gray-900 text-3xl md:text-[2.5rem] font-bold mb-2 tracking-[-2%]">
            Verify your email address
          </h2>
          <p className="text-gray-600 text-[16px] w-[440px]">
            Please enter the verification code sent to <br /> your email address{" "}
            <span className="font-medium">{maskEmail(email)}</span>
          </p>
        </div>

        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            OTP
          </label>
          <div className="flex justify-between gap-2">
            {otp.map((digit, i) => (
              <div key={i} className="relative">
                <input
                  ref={(el) => {
                    inputRefs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  value={digit}
                  onChange={(e) => handleInput(i, e.target.value)}
                  onKeyDown={(e) => handleKey(i, e)}
                  onPaste={handlePaste}
                  className={`w-13 md:w-16 outline-0 bg-gray-50 border border-gray-200 h-14 md:h-[72px] text-center text-gray-900 ${digit ? "text-[1px]" : "text-2xl"} font-medium  rounded-lg  transition-colors flex items-center ${
                    error ? " border-red-500" : ""
                  }`}
                  maxLength={1}
                  autoComplete="off"
                  autoFocus={i === 0}
                />
                {digit && (
                  <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Image
                      src="/asterik.png"
                      alt="asterik"
                      width={16}
                      height={16}
                    />
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* {error && (
          <div className="mb-4 text-sm text-center text-red-600">{error}</div>
        )} */}

        <div className="mb-6 text-center">
          {countdown > 0 ? (
            <span className="text-gray-600">
              Resend code{" "}
              <span className="text-[#5E2A8C]">{formatTime(countdown)}</span>
            </span>
          ) : (
            <button
              onClick={resend}
              disabled={!canResend}
              className="text-sm text-[#5E2A8C] hover:text-[#4E2275] font-medium disabled:opacity-50"
            >
              {resending ? "Sending..." : "Resend code"}
            </button>
          )}
        </div>

        <button
          onClick={verify}
          disabled={!canVerify}
          className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all ${
            canVerify
              ? "bg-[#5E2A8C] hover:bg-[#4E2275] shadow-sm hover:shadow-md"
              : "bg-[#5E2A8C] cursor-not-allowed opacity-50"
          }`}
        >
          {verifying ? "Verifying..." : "Verify"}
        </button>

        <div className="mt-6 text-center">
          <button
            onClick={resend}
            disabled={!canResend}
            className="text-sm text-[#5E2A8C] hover:text-[#4E2275] font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Didn&apos;t get the code?
          </button>
        </div>
      </div>

      {/* Didn't Get Get Email Modal */}
      <ModalDdntGetEmail
        open={showDidntGetModal}
        onClose={() => setShowDidntGetModal(false)}
      />
    </>
  );
};

export default EmailVerification;
