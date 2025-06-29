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

  const getButtonClass = () => {
    switch (state) {
      case "success":
        return "bg-green-600 hover:bg-green-700 text-white";
      case "error":
        return "bg-red-600 hover:bg-red-700 text-white";
      case "loading":
        return "bg-blue-600 text-white cursor-not-allowed";
      default:
        return "minimal-button";
    }
  };

  return (
    <div className="space-y-3">
      <motion.div
        whileHover={{ scale: state === "idle" ? 1.02 : 1 }}
        whileTap={{ scale: state === "idle" ? 0.98 : 1 }}
      >
        <Button
          onClick={handleScrape}
          disabled={state === "loading"}
          className={`${getButtonClass()} transition-all duration-300 shadow-md hover:shadow-lg`}
          size="lg"
        >
          <span className="flex items-center gap-2">{getButtonContent()}</span>
        </Button>
      </motion.div>

      {/* ステータスメッセージ */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`text-sm text-center font-medium ${
              state === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}