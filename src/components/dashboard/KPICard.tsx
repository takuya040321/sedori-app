"use client";

import { useState, useEffect, ReactNode } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

interface KPICardProps {
  title: string;
  value: number | string;
  icon: ReactNode; // JSXとして渡す
  trend?: {
    value: number;
    isPositive: boolean;
  };
  gradient: string;
  delay?: number;
}

export function KPICard({ title, value, icon, trend, gradient, delay = 0 }: KPICardProps) {
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
      whileHover={{ y: -5, scale: 1.02 }}
      className="group"
    >
      <Card className="glass-card hover-lift glow-effect border-white/20 overflow-hidden relative">
        <div
          className={`absolute inset-0 ${gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}
        />

        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-400">{title}</p>
              <motion.div
                animate={isAnimating ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.3 }}
                className="text-3xl font-bold text-white"
              >
                {typeof value === "number" ? displayValue.toLocaleString() : value}
              </motion.div>
              {trend && (
                <div
                  className={`flex items-center text-sm ${
                    trend.isPositive ? "text-green-400" : "text-red-400"
                  }`}
                >
                  <span>
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
              className={`p-3 rounded-xl ${gradient} shadow-lg`}
            >
              {/* JSXとして渡されたiconをそのまま表示 */}
              {icon}
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
