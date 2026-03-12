import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Ship, Mail, Lock } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";

export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, loginAsDemo, error, clearError } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      addNotification("success", "Logged in successfully!");
      navigate("/dashboard");
    } catch (error) {
      addNotification(
        "error",
        error instanceof Error
          ? error.message
          : "Failed to login. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      await loginAsDemo();
      addNotification(
        "success",
        "Demo mode activated! Explore with sample data.",
      );
      navigate("/dashboard");
    } catch (error) {
      addNotification("error", "Demo login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="card max-w-md w-full"
      >
        <div className="text-center mb-8">
          <div className="gradient-primary p-3 rounded-xl inline-block mb-4">
            <Ship className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-light">Sign in to Ship Risk AI</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm flex justify-between items-center"
          >
            <span>{error}</span>
            <button
              onClick={clearError}
              className="text-red-300 hover:text-red-200"
            >
              ✕
            </button>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-light mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-light" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-10"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-light mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-light" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 text-light rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Continue as Demo User
          </button>
          <p className="text-xs text-light text-center">
            Test with demo account (no Firebase credentials needed)
          </p>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-light">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-accent hover:underline font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
