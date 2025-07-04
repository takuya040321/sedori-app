// src/components/layout/PageContainer.tsx
"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  fullWidth?: boolean; // 画面いっぱい表示のオプション追加
}

export function PageContainer({ children, className = "", fullWidth = false }: PageContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`p-8 space-y-8 ${fullWidth ? 'w-full' : 'max-w-7xl mx-auto'} ${className}`}
    >
      {children}
    </motion.div>
  );
}