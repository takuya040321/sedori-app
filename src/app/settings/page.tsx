// src/app/settings/page.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useTableDisplaySettings } from "@/hooks/useTableDisplaySettings";
import { ProxyStatusIndicator } from "@/components/product-list/ProxyStatusIndicator";

export default function SettingsPage() {
  const {
    settings,
    updateSetting,
    resetSettings,
    saveSettings,
    hasUnsavedChanges,
  } = useTableDisplaySettings();

  const handleSave = () => {
    saveSettings();
    alert("設定を保存しました");
  };

  const handleReset = () => {
    if (confirm("設定をリセットしますか？")) {
      resetSettings();
    }
  };

  const updatePriceRange = (type: 'min' | 'max', value: string) => {
    const numValue = value === '' ? null : parseInt(value, 10);
    updateSetting('priceRange', {
      ...settings.priceRange,
      [type]: numValue,
    });
  };

  return (
    <div className="min-h-screen">
      <PageContainer>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* ヘッダー */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="w-4 h-4" />
                  ダッシュボードに戻る
                </Button>
              </Link>
            </div>
            <h1 className="text-4xl font-bold text-gradient">設定</h1>
            <p className="text-lg text-gray-600">テーブル表示設定を管理できます</p>
          </div>

          {/* プロキシ接続確認 */}
          <ProxyStatusIndicator />

          {/* テーブル表示設定 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                テーブル表示設定
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 検索設定 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  デフォルト検索文字列
                </label>
                <Input
                  placeholder="商品名で検索..."
                  value={settings.search}
                  onChange={(e) => updateSetting('search', e.target.value)}
                  className="max-w-md"
                />
              </div>

              {/* 基本フィルター */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">基本フィルター</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.showHiddenOnly}
                      onChange={(e) => updateSetting('showHiddenOnly', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm">非表示商品のみを表示</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.excludeHidden}
                      onChange={(e) => updateSetting('excludeHidden', e.target.checked)}
                      className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                    />
                    <span className="text-sm">非表示商品を除く</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.showProfitableOnly}
                      onChange={(e) => updateSetting('showProfitableOnly', e.target.checked)}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm">利益商品のみ表示</span>
                  </label>
                </div>
              </div>

              {/* 危険物フィルター */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">危険物フィルター</h4>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.showDangerousGoods}
                      onChange={(e) => updateSetting('showDangerousGoods', e.target.checked)}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <span className="text-sm">危険物のみ表示</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.excludeDangerousGoods}
                      onChange={(e) => updateSetting('excludeDangerousGoods', e.target.checked)}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <span className="text-sm">危険物を除く</span>
                  </label>
                </div>
              </div>

              {/* パートナーキャリアフィルター */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">パートナーキャリアフィルター</h4>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.showPartnerCarrierUnavailable}
                      onChange={(e) => updateSetting('showPartnerCarrierUnavailable', e.target.checked)}
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <span className="text-sm">パートナーキャリア不可のみ</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.excludePartnerCarrierUnavailable}
                      onChange={(e) => updateSetting('excludePartnerCarrierUnavailable', e.target.checked)}
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <span className="text-sm">パートナーキャリア不可を除く</span>
                  </label>
                </div>
              </div>

              {/* ストアフィルター */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">ストアフィルター</h4>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.excludeOfficialStore}
                      onChange={(e) => updateSetting('excludeOfficialStore', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm">公式を除く</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.excludeAmazonStore}
                      onChange={(e) => updateSetting('excludeAmazonStore', e.target.checked)}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm">Amazonを除く</span>
                  </label>
                </div>
              </div>

              {/* 価格範囲フィルター */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">価格範囲フィルター</h4>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="最小価格"
                      value={settings.priceRange.min || ''}
                      onChange={(e) => updatePriceRange('min', e.target.value)}
                      className="w-32"
                    />
                    <span className="text-gray-500">〜</span>
                    <Input
                      type="number"
                      placeholder="最大価格"
                      value={settings.priceRange.max || ''}
                      onChange={(e) => updatePriceRange('max', e.target.value)}
                      className="w-32"
                    />
                    <span className="text-sm text-gray-500">円</span>
                  </div>
                </div>
              </div>

              {/* ASIN有無フィルター */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">ASIN有無フィルター</h4>
                <div className="flex gap-2">
                  <Button
                    variant={settings.hasAsin === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateSetting('hasAsin', null)}
                  >
                    全て
                  </Button>
                  <Button
                    variant={settings.hasAsin === true ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateSetting('hasAsin', true)}
                  >
                    ASINあり
                  </Button>
                  <Button
                    variant={settings.hasAsin === false ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateSetting('hasAsin', false)}
                  >
                    ASINなし
                  </Button>
                </div>
              </div>

              {/* 保存・リセットボタン */}
              <div className="flex justify-between pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  リセット
                </Button>

                <Button
                  onClick={handleSave}
                  disabled={!hasUnsavedChanges}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  設定を保存
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 説明 */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                💡 設定について
              </h4>
              <div className="text-sm text-blue-800 space-y-2">
                <p>
                  • <strong>テーブル表示設定</strong>: ここで設定したフィルターは、商品一覧ページを開いた時に自動的に適用されます
                </p>
                <p>
                  • <strong>設定の保存</strong>: 設定を変更した後は「設定を保存」ボタンをクリックして保存してください
                </p>
                <p>
                  • <strong>リセット</strong>: 全ての設定を初期状態に戻すことができます
                </p>
                <p>
                  • <strong>即座反映</strong>: 保存した設定は、次回商品一覧ページを開いた時から適用されます
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </PageContainer>
    </div>
  );
}