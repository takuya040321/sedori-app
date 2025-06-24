// src\components\product-list\ScrapingButton.tsx

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";

interface ScrapingButtonProps {
  category: string;
  shopName: string;
  onScraped?: () => void;
}

type ScrapingState = "idle" | "loading" | "success" | "error";

export function ScrapingButton({ category, shopName, onScraped }: ScrapingButtonProps) {
  const [state, setState] = useState<ScrapingState>("idle");
  const [message, setMessage] = useState("");

  const handleScrape = async () => {
    setState("loading");

    try {
      const endpoint = `/api/scraping/${category.toLowerCase()}/${shopName.toLowerCase()}`;
      const response = await fetch(endpoint, {
        method: "POST",
      });
      const result = await response.json();

      if (result.success) {
        setState("success");
        setMessage(result.message);

        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });

        if (onScraped) onScraped();

        setTimeout(() => {
          setState("idle");
          setMessage("");
        }, 3000);
      } else {
        setState("error");
        setMessage(result.message);

        setTimeout(() => {
          setState("idle");
          setMessage("");
        }, 5000);
      }
    } catch (error) {
      setState("error");
      setMessage("スクレイピング中にエラーが発生しました");

      setTimeout(() => {
        setState("idle");
        setMessage("");
      }, 5000);
    }
  };

  const getButtonContent = () => {
    switch (state) {
      case "loading":
        return (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            スクレイピング中...
          </>
        );
      case "success":
        return (
          <>
            <CheckCircle className="w-4 h-4" />
            完了
          </>
        );
      case "error":
        return (
          <>
            <AlertCircle className="w-4 h-4" />
            エラー
          </>
        );
      default:
        return (
          <>
            <Download className="w-4 h-4" />
            スクレイピング
          </>
        );
    }
  };

  const getButtonVariant = () => {
    switch (state) {
      case "success":
        return "default";
      case "error":
        return "destructive";
      default:
        return "gradient";
    }
  };

  return (
    <div className="space-y-2">
      <motion.div
        whileHover={{ scale: state === "idle" ? 1.05 : 1 }}
        whileTap={{ scale: state === "idle" ? 0.95 : 1 }}
      >
        <Button
          variant={getButtonVariant() as any}
          size="lg"
          onClick={handleScrape}
          disabled={state === "loading"}
          className={`relative overflow-hidden ${
            state === "success"
              ? "gradient-secondary"
              : state === "error"
                ? "bg-red-500 hover:bg-red-600"
                : "gradient-primary"
          } transition-all duration-300`}
        >
          <span className="relative z-10 flex items-center gap-2">{getButtonContent()}</span>
        </Button>
      </motion.div>

      {/* Status Message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`text-sm text-center ${
              state === "success" ? "text-green-400" : "text-red-400"
            }`}
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
