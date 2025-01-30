import { useState } from "react";

const API_URL = import.meta.env.VITE_API_BASE;

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const validateUsername = (value) => {
    if (!value) return "Username is required";
    if (value.length < 3) return "Username must be at least 3 characters";
    if (!/^[a-zA-Z0-9_]+$/.test(value))
      return "Username can only contain letters, numbers, and underscores";
    return "";
  };

  const validateEmail = (value) => {
    if (!value) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? "" : "Invalid email format";
  };

  const validatePassword = (value) => {
    if (!value) return "Password is required";
    if (value.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(value))
      return "Password must contain at least one uppercase letter";
    if (!/[a-z]/.test(value))
      return "Password must contain at least one lowercase letter";
    if (!/[0-9]/.test(value))
      return "Password must contain at least one number";
    return "";
  };

  const validateConfirmPassword = (value) => {
    if (!value) return "Please confirm your password";
    if (value !== formData.password) return "Passwords do not match";
    return "";
  };

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));

    const validators = {
      username: validateUsername,
      email: validateEmail,
      password: validatePassword,
      confirmPassword: validateConfirmPassword,
    };

    setFormErrors((prev) => ({
      ...prev,
      [field]: validators[field](value),
      ...(field === "password" && {
        confirmPassword:
          value !== formData.confirmPassword ? "Passwords do not match" : "",
      }),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = {
      username: validateUsername(formData.username),
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(formData.confirmPassword),
    };

    setFormErrors(errors);

    if (Object.values(errors).some((error) => error)) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("profile", JSON.stringify(data.user));
      window.location.href = "/";
    } catch (error) {
      console.error(error);
      alert(error.message || "An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6">
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">
          Create Account
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Username
            </label>
            <input
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange("username")}
              className={`w-full p-2 border rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.username && "border-red-500 focus:ring-red-500"
              }`}
            />
            {formErrors.username && (
              <p className="text-sm text-red-500 mt-1">{formErrors.username}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange("email")}
              className={`w-full p-2 border rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.email && "border-red-500 focus:ring-red-500"
              }`}
            />
            {formErrors.email && (
              <p className="text-sm text-red-500 mt-1">{formErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={handleChange("password")}
                className={`w-full p-2 border rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.password && "border-red-500 focus:ring-red-500"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {formErrors.password && (
              <p className="text-sm text-red-500 mt-1">{formErrors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange("confirmPassword")}
                className={`w-full p-2 border rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.confirmPassword &&
                  "border-red-500 focus:ring-red-500"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
            {formErrors.confirmPassword && (
              <p className="text-sm text-red-500 mt-1">
                {formErrors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={
              loading || Object.values(formErrors).some((error) => error)
            }
          >
            {loading ? "Creating Account..." : "Register"}
          </button>

          <div className="text-center mt-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <button
                type="button"
                className="text-blue-500 hover:underline focus:outline-none"
                onClick={() => (window.location.href = "/login")}
              >
                Login here
              </button>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
