import hero from "/Images/Home/hero.webp";
import logo from "/Images/NavBar/logo.webp";
import { useState } from "react";
import CustomButton from "@/components/UI/Button";
import { Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import customFetch from "@/utils/customFetch";
import axios from "axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const validateEmail = () => {
    if (!email.trim()) {
      setEmailError("Email is required");
      return false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailError(""); // Clear error on change
  };

  const handleSubmit = async () => {
    if (!validateEmail()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await customFetch.post("/auth/forgot-password", {
        email,
      });

      if (response.data) {
        toast.success(response.data.msg || "Reset link sent to your email!");
        setEmailSent(true);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.msg || "Failed to send reset email";
        toast.error(errorMessage);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
      console.error("Forgot password error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-[1920px] mx-auto w-full flex lg:flex-row flex-col">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="lg:w-1/2 lg:block hidden h-screen">
        <img
          src={hero}
          alt="Laptop Background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Form Section */}
      <div className="flex flex-col w-full lg:w-[45%] px-[20px] pt-[20px] sm:px-[30px] sm:pt-[30px] md:px-20 lg:pt-[80px] lg:px-[60px] 2xl:pt-[154px] 2xl:px-[165px]">
        <div className="w-full lg:block hidden">
          <Link to="/">
            <img src={logo} alt="logo" className="w-[112px] h-[54px]" />
          </Link>
        </div>

        {/* Forgot Password Section */}
        <div className="flex flex-col w-full lg:mt-10">
          <h2 className="font-PlusSans text-[24px] font-bold text-[#000] leading-[32px] lg:text-[36px]">
            Forgot Password
          </h2>

          {!emailSent ? (
            <>
              <span className="mt-5 lg:leading-8 lg:text-base text-black font-PlusSans text-sm leading-6 font-medium">
                Enter your email address below and we'll send you a link to
                reset your password.
              </span>

              {/* Email Text box and underline */}
              <div className="mt-[32px]">
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="Username@gmail.com"
                  className={`w-full text-[14px] font-PlusSans placeholder:text-[#646464] text-black leading-[24px] font-normal focus:outline-none ${
                    emailError ? "text-red-500" : ""
                  }`}
                />
              </div>
              <div
                className={`h-[1px] w-full ${
                  emailError ? "bg-red-500" : "bg-[#000]"
                } mt-[4px]`}
              ></div>
              {emailError && (
                <p className="text-red-500 text-xs mt-1">{emailError}</p>
              )}

              {/* Submit Button */}
              <div className="font-Mainfront mt-[24px] lg:mt-[32px] w-full">
                <CustomButton
                  title={isLoading ? "Sending..." : "Send Reset Link"}
                  onClick={handleSubmit}
                  disabled={isLoading}
                  icon={
                    isLoading ? (
                      <svg
                        className="animate-spin h-5 w-5 mr-3"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    ) : null
                  }
                  iconPosition="left"
                />
              </div>
            </>
          ) : (
            <div className="mt-5 p-4 bg-green-50 rounded-md border border-green-200">
              <p className="text-green-700 mb-2 font-medium">
                Reset link sent!
              </p>
              <p className="text-sm text-gray-600">
                Please check your email for the password reset link. Be sure to
                check your spam folder if you don't see it in your inbox.
              </p>
            </div>
          )}

          <div className="font-Mainfront text-xs leading-6 text-[#646464] w-full mt-6">
            Remember your password?{" "}
            <Link
              to="/signin"
              className="text-event-navy hover:text-[#000] hover:underline"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
        <div className="flex justify-center items-center text-xs text-black leading-6 mt-auto font-PlusSans lg:py-7 py-3">
          2025 © All rights reserved
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
