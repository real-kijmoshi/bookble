import { useState } from "react";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

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
    if (!/^[a-zA-Z0-9_]+$/.test(value)) return "Username can only contain letters, numbers, and underscores";
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
    if (!/[A-Z]/.test(value)) return "Password must contain at least one uppercase letter";
    if (!/[a-z]/.test(value)) return "Password must contain at least one lowercase letter";
    if (!/[0-9]/.test(value)) return "Password must contain at least one number";
    return "";
  };

  const validateConfirmPassword = (value) => {
    if (!value) return "Please confirm your password";
    if (value !== formData.password) return "Passwords do not match";
    return "";
  };

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    const validators = {
      username: validateUsername,
      email: validateEmail,
      password: validatePassword,
      confirmPassword: validateConfirmPassword,
    };

    setFormErrors(prev => ({
      ...prev,
      [field]: validators[field](value),
      // Update confirm password error when password changes
      ...(field === 'password' && {
        confirmPassword: value !== formData.confirmPassword ? "Passwords do not match" : ""
      })
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const errors = {
      username: validateUsername(formData.username),
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(formData.confirmPassword),
    };

    setFormErrors(errors);

    if (Object.values(errors).some(error => error)) return;

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

      // Optionally auto-login the user
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
    <div className="flex justify-center items-center min-h-screen dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="border-b border-gray-200 dark:border-gray-600 pb-4">
          <CardTitle className="text-2xl font-bold text-center">
            Create Account
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange("username")}
                icon={User}
                error={formErrors.username}
                className={formErrors.username ? "border-amber-500 focus:border-amber-500" : ""}
              />
            </div>

            <div>
              <Input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange("email")}
                icon={Mail}
                error={formErrors.email}
                className={formErrors.email ? "border-amber-500 focus:border-amber-500" : ""}
              />
            </div>

            <div>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={handleChange("password")}
                icon={Lock}
                error={formErrors.password}
                rightIcon={showPassword ? EyeOff : Eye}
                onRightIconClick={() => setShowPassword(!showPassword)}
                className={formErrors.password ? "border-amber-500 focus:border-amber-500" : ""}
              />
            </div>

            <div>
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange("confirmPassword")}
                icon={Lock}
                error={formErrors.confirmPassword}
                rightIcon={showConfirmPassword ? EyeOff : Eye}
                onRightIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={formErrors.confirmPassword ? "border-amber-500 focus:border-amber-500" : ""}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              variant="primary"
              disabled={loading || Object.values(formErrors).some(error => error)}
            >
              {loading ? "Creating Account..." : "Register"}
            </Button>

            <div className="text-center mt-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <button
                  type="button"
                  className="text-blue-500 hover:underline focus:outline-none"
                  onClick={() => window.location.href = "/login"}
                >
                  Login here
                </button>
              </span>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}