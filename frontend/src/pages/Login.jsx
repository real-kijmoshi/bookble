import { useState } from "react";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import fetchBooks from "../utils/fetchBooks";

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

      const books = await fetchBooks(data.user.collection);
      data.user.collection = books;

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
    <div className="flex justify-center items-center min-h-screen dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="border-b border-gray-200 dark:border-gray-600 pb-4">
          <CardTitle className="text-2xl font-bold text-center">
            Login
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Username or Email"
                value={loginIdentifier}
                onChange={handleIdentifierChange}
                icon={loginIdentifier.includes("@") ? Mail : User}
                error={formErrors.identifier}
                className={
                  formErrors.identifier
                    ? "border-amber-500 focus:border-amber-500"
                    : ""
                }
              />
            </div>

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFormErrors((prev) => ({
                    ...prev,
                    password: validatePassword(e.target.value),
                  }));
                }}
                icon={Lock}
                error={formErrors.password}
                rightIcon={showPassword ? EyeOff : Eye}
                onRightIconClick={() => setShowPassword(!showPassword)}
                className={
                  formErrors.password
                    ? "border-amber-500 focus:border-amber-500"
                    : ""
                }
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              variant="primary"
              disabled={
                loading || !!formErrors.identifier || !!formErrors.password
              }
            >
              {loading ? "Logging in..." : "Login"}
            </Button>

            <div className="text-center mt-4">
              <button
                type="button"
                className="text-sm text-blue-500 hover:underline focus:outline-none"
                onClick={() => alert("Password reset coming soon!")}
              >
                Forgot Password?
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
