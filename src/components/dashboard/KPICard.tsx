"use client";

import { useState, useEffect, ReactNode } from "react";
import { motion } from "framer-motion";

interface KPICardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  gradient: string;
  delay?: number;
  suppressHydrationWarning?: boolean;
}

export function KPICard({ title, value, icon, trend, gradient, delay = 0, suppressHydrationWarning = false }: KPICardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (typeof value === "number") {
      setIsAnimating(true);
      const duration = 1500;
      const steps = 60;
      const increment = value / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          setIsAnimating(false);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="group"
    >
      <div className="minimal-card p-6 hover-lift">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <motion.div
              animate={isAnimating ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.3 }}
              className="text-3xl font-bold text-gray-900"
              suppressHydrationWarning={suppressHydrationWarning}
            >
              {typeof value === "number" ? displayValue.toLocaleString() : value}
            </motion.div>
            {trend && (
              <div
                className={`flex items-center text-sm ${
                  trend.isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                <span className="font-medium">
                  {trend.isPositive ? "+" : ""}
                  {trend.value}%
                </span>
                <span className="text-gray-500 ml-1">前月比</span>
              </div>
            )}
          </div>

          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
            className={`p-4 rounded-2xl ${gradient} shadow-lg`}
          >
            <div className="text-white">{icon}</div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}