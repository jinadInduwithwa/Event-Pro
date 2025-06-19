import hero from "/Images/Home/hero.webp";
import logo from "/Images/NavBar/logo.webp";
import { useState } from "react";
import CustomButton from "@/components/UI/Button";
import { IoEyeOutline } from "react-icons/io5";
import { IoEyeOffOutline } from "react-icons/io5";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import customFetch from "@/utils/customFetch";
import axios from "axios";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (!token) {
      toast.error("Invalid or expired reset link");
      return;
    }

    setIsLoading(true);
    try {
      const response = await customFetch.post("/auth/reset-password", {
        token,
        password: formData.password,
      });

      if (response.data) {
        toast.success("Password has been reset successfully!");
        setTimeout(() => {
          navigate("/signin");
        }, 2000);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.msg || "Failed to reset password";
        toast.error(errorMessage);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
      console.error("Reset password error:", error);
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

        {/* Reset Password Section */}
        <div className="flex flex-col w-full lg:mt-10">
          <h2 className="font-PlusSans text-[24px] font-bold text-[#000] leading-[32px] lg:text-[36px]">
            Reset Password
          </h2>
          <span className="mt-5 lg:leading-8 lg:text-base text-black font-PlusSans text-sm leading-6 font-medium">
            Enter your new password below.
          </span>

          {/* Password Text box and underline */}
          <div className="mt-[36px] relative">
            <input
              type={passwordVisible ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="New Password"
              className={`w-full text-[14px] font-PlusSans placeholder:text-[#646464] text-black leading-[24px] font-normal focus:outline-none ${
                errors.password ? "text-red-500" : ""
              }`}
            />
            <div
              className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer"
              onClick={togglePasswordVisibility}
            >
              {passwordVisible ? (
                <IoEyeOutline
                  size={20}
                  color={errors.password ? "#ef4444" : "#646464"}
                />
              ) : (
                <IoEyeOffOutline
                  size={20}
                  color={errors.password ? "#ef4444" : "#646464"}
                />
              )}
            </div>
          </div>
          <div
            className={`h-[1px] w-full ${
              errors.password ? "bg-red-500" : "bg-[#000]"
            } mt-[4px]`}
          ></div>
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}

          {/* Confirm Password Text box and underline */}
          <div className="mt-[36px] relative">
            <input
              type={confirmPasswordVisible ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm New Password"
              className={`w-full text-[14px] font-PlusSans placeholder:text-[#646464] text-black leading-[24px] font-normal focus:outline-none ${
                errors.confirmPassword ? "text-red-500" : ""
              }`}
            />
            <div
              className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer"
              onClick={toggleConfirmPasswordVisibility}
            >
              {confirmPasswordVisible ? (
                <IoEyeOutline
                  size={20}
                  color={errors.confirmPassword ? "#ef4444" : "#646464"}
                />
              ) : (
                <IoEyeOffOutline
                  size={20}
                  color={errors.confirmPassword ? "#ef4444" : "#646464"}
                />
              )}
            </div>
          </div>
          <div
            className={`h-[1px] w-full ${
              errors.confirmPassword ? "bg-red-500" : "bg-[#000]"
            } mt-[4px]`}
          ></div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">
              {errors.confirmPassword}
            </p>
          )}

          {/* Submit Button */}
          <div className="font-Mainfront mt-[24px] lg:mt-[32px] w-full">
            <CustomButton
              title={isLoading ? "Resetting..." : "Reset Password"}
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

          <div className="font-Mainfront text-xs leading-6 text-[#646464] w-full mt-3">
            Remember your password?{" "}
            <Link
              to="/signin"
              className="text-event-navy hover:text-[#000] hover:underline"
            >
              Sign In
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

export default ResetPassword;
