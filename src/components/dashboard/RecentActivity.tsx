"use client";

import { motion } from "framer-motion";
import { CheckCircle, AlertCircle, Clock, TrendingUp } from "lucide-react";

const activities = [
  {
    id: "1",
    type: "scraping" as const,
    shop: "VT Cosmetics",
    message: "商品情報を更新しました (10件)",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    status: "success" as const,
  },
  {
    id: "2",
    type: "price_change" as const,
    shop: "DHC",
    message: "価格変動を検出しました (3件)",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    status: "warning" as const,
  },
  {
    id: "3",
    type: "new_product" as const,
    shop: "VT Cosmetics",
    message: "新商品を追加しました (2件)",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    status: "success" as const,
  },
  {
    id: "4",
    type: "scraping" as const,
    shop: "DHC",
    message: "スクレイピングエラーが発生しました",
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    status: "error" as const,
  },
];

const getActivityIcon = (type: string) => {
  switch (type) {
    case "scraping":
      return <Clock className="w-4 h-4" />;
    case "price_change":
      return <TrendingUp className="w-4 h-4" />;
    case "new_product":
      return <CheckCircle className="w-4 h-4" />;
    default:
      return <AlertCircle className="w-4 h-4" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "success":
      return <span className="status-success">成功</span>;
    case "warning":
      return <span className="status-warning">警告</span>;
    case "error":
      return <span className="status-error">エラー</span>;
    default:
      return <span className="status-success">不明</span>;
  }
};

export function RecentActivity() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
    >
      <div className="minimal-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">最新アクティビティ</h3>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div
                className={`p-2 rounded-xl ${
                  activity.status === "success"
                    ? "bg-green-100 text-green-600"
                    : activity.status === "warning"
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-red-100 text-red-600"
                }`}
              >
                {getActivityIcon(activity.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">{activity.shop}</span>
                  {getStatusBadge(activity.status)}
                </div>
                <p className="text-sm text-gray-600 truncate">{activity.message}</p>
                <p className="text-xs text-gray-400 mt-1" suppressHydrationWarning>
                  {new Date(activity.timestamp).toLocaleString("ja-JP")}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}