import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Ship,
  Bell,
  User,
  LogOut,
  Moon,
  Sun,
  ArrowRight,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { useShipmentContext } from "../../contexts/ShipmentContext";
import { useTheme } from "../../contexts/ThemeContext";

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { alerts } = useShipmentContext();
  const { isDark, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const [showNotifs, setShowNotifs] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const criticalCount = alerts.filter((a) => a.risk_tier === "CRITICAL").length;
  const highCount = alerts.filter((a) => a.risk_tier === "HIGH").length;
  const topAlerts = alerts
    .filter((a) => a.risk_tier === "CRITICAL" || a.risk_tier === "HIGH")
    .slice(0, 8);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    if (showNotifs) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showNotifs]);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="glass border-b border-white/10 sticky top-0 z-50"
    >
      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center space-x-1 sm:space-x-3 min-w-0 flex-shrink-0"
          >
            <div className="gradient-primary p-2 rounded-lg flex-shrink-0">
              <Ship
                className="w-6 h-6 sm:w-8 sm:h-8"
                style={{ color: "#fff" }}
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-2xl font-bold text-white text-shadow leading-tight">
                Ship Risk AI
              </h1>
              <p className="text-xs text-light">Intelligent Risk Management</p>
            </div>
          </Link>

          <div className="flex items-center space-x-2 sm:space-x-6">
            {/* Notification Bell */}
            <div className="relative" ref={panelRef}>
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-1 hover:bg-white/5 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-light hover:text-accent transition-colors" />
                {criticalCount + highCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-risk-critical text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-bold"
                    style={{ color: "#fff", fontSize: "0.6rem" }}
                  >
                    {criticalCount + highCount > 99
                      ? "99+"
                      : criticalCount + highCount}
                  </motion.span>
                )}
              </button>

              {/* Notification Dropdown */}
              <AnimatePresence>
                {showNotifs && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 top-10 w-80 sm:w-96 max-h-[480px] overflow-y-auto z-50 shadow-2xl rounded-xl p-6 border border-white/10"
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      backdropFilter: "none",
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-white">
                        Notifications
                      </h3>
                      <button onClick={() => setShowNotifs(false)}>
                        <X className="w-5 h-5 text-light hover:text-accent" />
                      </button>
                    </div>

                    <div className="flex items-center space-x-3 mb-4 text-sm">
                      <span
                        className="bg-risk-critical px-2 py-0.5 rounded text-xs font-bold"
                        style={{ color: "#fff" }}
                      >
                        {criticalCount} Critical
                      </span>
                      <span
                        className="bg-risk-high px-2 py-0.5 rounded text-xs font-bold"
                        style={{ color: "#fff" }}
                      >
                        {highCount} High
                      </span>
                    </div>

                    {topAlerts.length === 0 ? (
                      <p className="text-sm text-light py-4 text-center">
                        No critical alerts
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {topAlerts.map((alert) => (
                          <button
                            key={alert.shipment_id}
                            onClick={() => {
                              setShowNotifs(false);
                              navigate(`/shipments/${alert.shipment_id}`);
                            }}
                            className="w-full text-left glass-light p-3 rounded-lg hover:border-accent transition-all group"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-white text-sm">
                                {alert.shipment_id}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-bold ${
                                  alert.risk_tier === "CRITICAL"
                                    ? "bg-risk-critical"
                                    : "bg-risk-high"
                                }`}
                                style={{ color: "#fff" }}
                              >
                                {alert.risk_tier}
                              </span>
                            </div>
                            <p className="text-xs text-light">
                              {alert.origin} → {alert.destination}
                            </p>
                            <p className="text-xs text-accent mt-1 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <span>View details</span>
                              <ArrowRight className="w-3 h-3" />
                            </p>
                          </button>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setShowNotifs(false);
                        navigate("/alerts");
                      }}
                      className="mt-4 w-full text-center text-sm text-accent hover:underline py-2"
                    >
                      View all alerts →
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme Toggle */}
            <motion.button
              onClick={toggleDarkMode}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg hover:glass-light transition-colors"
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-light" />
              )}
            </motion.button>

            {/* User / Auth */}
            {user ? (
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="hidden sm:flex items-center space-x-2">
                  <User className="w-5 h-5 text-light" />
                  <span className="text-sm text-light">{user.email}</span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 text-light hover:text-accent transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="hidden sm:inline text-sm">Logout</span>
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-primary">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};
