import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaUserMd,
  FaCheckCircle,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Doctor",
    department: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
    setSuccess("");
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Password validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    // Department validation for Doctor
    if (formData.role === "Doctor" && !formData.department) {
      setError("Please select a department.");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        "http://127.0.0.1:8000/api/register",
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          department:
            formData.role === "Doctor"
              ? formData.department
              : null,
        }
      );

      setSuccess(
        "Account created successfully! Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (error) {
      console.error("Signup error:", error);

      const detail = error.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(
          detail.map((item) => item.msg).join(", ")
        );
      } else {
        setError(
          detail || "Signup failed. Please try again."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 via-cyan-50 to-white flex items-center justify-center px-4">

      <div className="bg-white w-full max-w-[420px] rounded-2xl shadow-2xl p-8">

        {/* =========================
            Header
        ========================= */}

        <div className="flex flex-col items-center mb-6">

          <div className="bg-blue-600 text-white p-4 rounded-full">
            <FaUserMd size={35} />
          </div>

          <h2 className="text-3xl font-bold mt-4 text-slate-800">
            Create Account
          </h2>

          <p className="text-gray-500 mt-2 text-center">
            Join HealthForecast AI
          </p>

        </div>

        {/* =========================
            Form
        ========================= */}

        <form
          onSubmit={handleSignup}
          className="space-y-4"
        >

          {/* Name */}

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Email */}

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Password */}

          <div className="relative">

            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg p-3 pr-11 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(!showPassword)
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600"
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
            >
              {showPassword ? (
                <FaEyeSlash />
              ) : (
                <FaEye />
              )}
            </button>

          </div>

          {/* Confirm Password */}

          <div className="relative">

            <input
              type={
                showConfirmPassword
                  ? "text"
                  : "password"
              }
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg p-3 pr-11 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(
                  !showConfirmPassword
                )
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600"
              aria-label={
                showConfirmPassword
                  ? "Hide confirm password"
                  : "Show confirm password"
              }
            >
              {showConfirmPassword ? (
                <FaEyeSlash />
              ) : (
                <FaEye />
              )}
            </button>

          </div>

          {/* Role */}

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >

            <option value="Doctor">
              Doctor
            </option>

            <option value="Hospital Administrator">
              Hospital Administrator
            </option>

            <option value="Healthcare Researcher">
              Healthcare Researcher
            </option>

          </select>

          {/* Department */}

          {formData.role === "Doctor" && (
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >

              <option value="">
                Select Department
              </option>

              <option value="Cardiology">
                Cardiology
              </option>

              <option value="Neurology">
                Neurology
              </option>

              <option value="General Medicine">
                General Medicine
              </option>

              <option value="Orthopedics">
                Orthopedics
              </option>

              <option value="Pediatrics">
                Pediatrics
              </option>

              <option value="Oncology">
                Oncology
              </option>

            </select>
          )}

          {/* Error Message */}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          {/* Success Message */}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm flex items-center justify-center gap-2 text-center">

              <FaCheckCircle />

              <span>
                {success}
              </span>

            </div>
          )}

          {/* Button */}

          <button
            type="submit"
            disabled={loading || !!success}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-3 rounded-lg font-semibold transition"
          >
            {loading
              ? "Creating Account..."
              : success
              ? "Account Created ✓"
              : "Create Account"}
          </button>

        </form>

        {/* Login */}

        <p className="text-center text-gray-500 mt-6">

          Already have an account?{" "}

          <Link
            to="/login"
            className="text-blue-600 font-semibold hover:underline"
          >
            Login
          </Link>

        </p>

      </div>

    </div>
  );
}

export default Signup;