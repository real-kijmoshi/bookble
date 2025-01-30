import { useState } from "react";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";

const API_URL = import.meta.env.VITE_API_BASE;

export default function Login() {
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({
    identifier: "",
    password: "",
  });

  const validateIdentifier = (value) => {
    if (!value) return "Username or email is required";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidEmail = emailRegex.test(value);
    const isValidUsername = value.length >= 3 && /^[a-zA-Z0-9_]+$/.test(value);

    return isValidEmail || isValidUsername
      ? ""
      : "Invalid username or email format";
  };

  const validatePassword = (value) => {
    if (!value) return "Password is required";
    if (value.length < 4) return "Password must be at least 8 characters";
    return "";
  };

  const handleIdentifierChange = (e) => {
    const value = e.target.value;
    setLoginIdentifier(value);
    setFormErrors((prev) => ({
      ...prev,
      identifier: validateIdentifier(value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const identifierError = validateIdentifier(loginIdentifier);
    const passwordError = validatePassword(password);

    setFormErrors({
      identifier: identifierError,
      password: passwordError,
    });

    if (identifierError || passwordError) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: loginIdentifier,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("profile", JSON.stringify(data.user));

      window.location.reload();
    } catch (error) {
      console.error(error);
      alert(error.message || "An error occurred, please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="border-b border-gray-200 dark:border-gray-600 p-6">
          <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white">
            Login
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="identifier"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Username or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {loginIdentifier.includes("@") ? (
                    <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  ) : (
                    <User className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  )}
                </div>
                <input
                  type="text"
                  id="identifier"
                  placeholder="Username or Email"
                  value={loginIdentifier}
                  onChange={handleIdentifierChange}
                  className={`w-full pl-10 pr-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.identifier
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                />
              </div>
              {formErrors.identifier && (
                <p className="mt-1 text-sm text-red-500">
                  {formErrors.identifier}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFormErrors((prev) => ({
                      ...prev,
                      password: validatePassword(e.target.value),
                    }));
                  }}
                  className={`w-full pl-10 pr-10 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.password
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  )}
                </button>
              </div>
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-500">
                  {formErrors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={
                loading || !!formErrors.identifier || !!formErrors.password
              }
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <div className="text-center mt-4">
              <button
                type="button"
                className="text-sm text-blue-500 hover:underline focus:outline-none"
                onClick={() => alert("Password reset coming soon!")}
              >
                Forgot Password?
              </button>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Don&#39;t have an account?{" "}
                <a
                  href="/register"
                  className="text-blue-500 hover:underline focus:outline-none"
                >
                  Register here
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>

      
      <h2 className="fixed bottom-4 right-4 text-gray-400 dark:text-gray-500 text-sm">
          data stored here is temporary for now and will be removed after the server restarts
      </h2>
    </div>
  );
}
