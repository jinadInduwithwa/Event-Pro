import hero from "/Images/Home/hero.webp";
import logo from "/Images/NavBar/logo.webp";
import { useState } from "react";
import CustomButton from "@/components/UI/Button";
import { IoEyeOutline } from "react-icons/io5";
import { IoEyeOffOutline } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import customFetch from "../utils/customFetch";
import axios from "axios";

function SignIn() {
  const navigate = useNavigate();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const validateForm = () => {
    let isValid = true;
    const errors = {
      email: "",
      password: "",
    };

    // Email validation
    if (!email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Password validation
    if (!password.trim()) {
      errors.password = "Password is required";
      isValid = false;
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    setEmailError(errors.email);
    setPasswordError(errors.password);
    return isValid;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailError(""); // Clear error on change
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setPasswordError(""); // Clear error on change
  };

  const handleFormSubmit = async () => {
    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await customFetch.post("/auth/login", {
        email,
        password,
      });

      if (response.data) {
        toast.success("Login successful!");

        // Delay navigation to show toast
        setTimeout(() => {
          // Navigate based on user role
          switch (response.data.user.role) {
            case "admin":
              navigate("/");
              break;
            case "organizer":
              navigate("/organizer-dashboard");
              break;
            case "user":
              navigate("/");
              break;
            default:
              navigate("/"); // Default fallback
          }
        }, 1500);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.msg || "Login failed";
        toast.error(errorMessage);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-[1920px] mx-auto w-full flex lg:flex-row flex-col">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="lg:w-1/2 lg:block hidden">
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

        {/* Sign In Section */}
        <div className="flex flex-col w-full lg:mt-10">
          <h2 className="font-PlusSans text-[24px] font-bold text-[#000] leading-[32px] lg:text-[36px] ">
            Sign In
          </h2>
          <span className="mt-5 lg:leading-8 lg:text-base text-black font-PlusSans text-sm leading-6 font-medium">
            If you have an account, sign in with your email address.
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

          {/* Password Text box and underline */}
          <div className="mt-[36px] relative">
            <input
              type={passwordVisible ? "text" : "password"}
              value={password}
              onChange={handlePasswordChange}
              placeholder="Enter your Password"
              className={`w-full text-[14px] font-PlusSans placeholder:text-[#646464] text-black leading-[24px] font-normal focus:outline-none ${
                passwordError ? "text-red-500" : ""
              }`}
            />
            <div
              className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer"
              onClick={togglePasswordVisibility}
            >
              {passwordVisible ? (
                <IoEyeOutline
                  size={20}
                  color={passwordError ? "#ef4444" : "#646464"}
                />
              ) : (
                <IoEyeOffOutline
                  size={20}
                  color={passwordError ? "#ef4444" : "#646464"}
                />
              )}
            </div>
          </div>

          <div
            className={`h-[1px] w-full ${
              passwordError ? "bg-red-500" : "bg-[#000]"
            } mt-[4px]`}
          ></div>
          {passwordError && (
            <p className="text-red-500 text-xs mt-1">{passwordError}</p>
          )}
          <div className="w-full flex justify-end items-end mt-2">
            <Link
              to="/forgot-password"
              className="text-[14px] text-event-navy font-PlusSans hover:text-[#000] hover:underline cursor-pointer"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Sign In Button */}
          <div className="font-Mainfront mt-[24px] lg:mt-[32px] w-full">
            <CustomButton
              title={isLoading ? "Signing In..." : "Sign In"}
              onClick={handleFormSubmit}
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
          <div className="font-Mainfront text-xs leading-6 text-[#646464] w-full mt-3">
            This site is protected by recaptcha and the Google Privacy Policy
            and Terms of Service apply.
          </div>
          <h1 className="flex items-center justify-center mt-[12px] font-PlusSans text-[#646464] text-sm leading-6 ">
            If you haven't an account?{" "}
            <span
              className="text-event-navy font-semibold hover:text-[#000] ml-2.5 hover:underline cursor-pointer"
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </span>
          </h1>
        </div>
        <div className="flex justify-center items-center text-xs text-black leading-6 mt-auto font-PlusSans lg:py-7 py-3">
          2025 © All rights reserved
        </div>
      </div>
    </div>
  );
}

export default SignIn;
