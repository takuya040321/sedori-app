// src/components/product-list/ProxyStatusIndicator.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wifi, WifiOff, Globe, Shield, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
      <Card className="glass-card border-white/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse" />
            <span className="text-sm text-gray-400">接続状態を確認中...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { proxy, connectionTest } = status;
  const isConnected = connectionTest.success;
  const statusColor = isConnected ? "text-green-400" : "text-red-400";
  const statusIcon = isConnected ? CheckCircle : AlertCircle;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      <Card className="glass-card border-white/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* プロキシ状態アイコン */}
              <div className="flex items-center gap-2">
                {proxy.enabled ? (
                  <Shield className="w-5 h-5 text-blue-400" />
                ) : (
                  <Globe className="w-5 h-5 text-gray-400" />
                )}
                <span className="text-sm font-medium">
                  {proxy.enabled ? "プロキシ有効" : "直接接続"}
                </span>
              </div>

              {/* 接続状態 */}
              <div className="flex items-center gap-2">
                {React.createElement(statusIcon, {
                  className: `w-4 h-4 ${statusColor}`,
                })}
                <span className={`text-sm ${statusColor}`}>
                  {isConnected ? "接続OK" : "接続エラー"}
                </span>
              </div>

              {/* IP表示 */}
              {connectionTest.ip && (
                <div className="text-xs text-gray-400">
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
                className="hover:bg-white/10"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Wifi className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <Wifi className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="hover:bg-white/10"
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
              className="mt-4 pt-4 border-t border-white/10 space-y-2"
            >
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-400">プロキシサーバー:</span>
                  <div className="text-white">
                    {proxy.server || "使用していません"}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">認証:</span>
                  <div className="text-white">
                    {proxy.enabled ? (proxy.hasAuth ? "有効" : "無効") : "N/A"}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">最終確認:</span>
                  <div className="text-white">
                    {new Date(status.timestamp).toLocaleTimeString("ja-JP")}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">エラー:</span>
                  <div className="text-red-400">
                    {connectionTest.error || "なし"}
                  </div>
                </div>
              </div>

              <div className="mt-3 p-2 bg-blue-500/10 rounded border border-blue-500/20">
                <div className="text-xs text-blue-300">
                  💡 プロキシ設定を変更するには、.env ファイルの USE_PROXY を編集してください
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}