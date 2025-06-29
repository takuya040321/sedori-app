// src/components/product-list/ProxyStatusIndicator.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wifi, WifiOff, Globe, Shield, AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProxyStatus {
  enabled: boolean;
  server: string | null;
  hasAuth: boolean;
}

interface ConnectionTest {
  success: boolean;
  ip?: string;
  error?: string;
  proxyUsed: boolean;
}

interface ProxyStatusData {
  proxy: ProxyStatus;
  connectionTest: ConnectionTest;
  timestamp: string;
}

export function ProxyStatusIndicator() {
  const [status, setStatus] = useState<ProxyStatusData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/proxy-status");
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error("Failed to fetch proxy status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  if (!status) {
    return (
      <div className="minimal-card p-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-gray-300 rounded-full animate-pulse" />
          <span className="text-sm text-gray-500">接続状態を確認中...</span>
        </div>
      </div>
    );
  }

  const { proxy, connectionTest } = status;
  const isConnected = connectionTest.success;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="minimal-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* プロキシ状態 */}
            <div className="flex items-center gap-2">
              {proxy.enabled ? (
                <Shield className="w-5 h-5 text-blue-600" />
              ) : (
                <Globe className="w-5 h-5 text-gray-400" />
              )}
              <span className="text-sm font-medium text-gray-700">
                {proxy.enabled ? "プロキシ有効" : "直接接続"}
              </span>
            </div>

            {/* 接続状態 */}
            <div className="flex items-center gap-2">
              {isConnected ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span
                className={`text-sm font-medium ${
                  isConnected ? "text-green-600" : "text-red-600"
                }`}
              >
                {isConnected ? "接続OK" : "接続エラー"}
              </span>
            </div>

            {/* IP表示 */}
            {connectionTest.ip && (
              <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                IP: {connectionTest.ip}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchStatus}
              disabled={isLoading}
              className="hover:bg-gray-100"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="hover:bg-gray-100"
            >
              詳細
            </Button>
          </div>
        </div>

        {/* 詳細情報 */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-100 space-y-3"
          >
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">プロキシサーバー:</span>
                <div className="text-gray-900 font-medium">
                  {proxy.server || "使用していません"}
                </div>
              </div>
              <div>
                <span className="text-gray-500">認証:</span>
                <div className="text-gray-900 font-medium">
                  {proxy.enabled ? (proxy.hasAuth ? "有効" : "無効") : "N/A"}
                </div>
              </div>
              <div>
                <span className="text-gray-500">最終確認:</span>
                <div className="text-gray-900 font-medium">
                  {new Date(status.timestamp).toLocaleTimeString("ja-JP")}
                </div>
              </div>
              <div>
                <span className="text-gray-500">エラー:</span>
                <div className="text-red-600 font-medium">
                  {connectionTest.error || "なし"}
                </div>
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
              <div className="text-sm text-blue-700">
                💡 プロキシ設定を変更するには、.env ファイルの USE_PROXY を編集してください
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}