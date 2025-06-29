// src/app/asin-upload/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import { AsinInfo, AsinInfoHeaderKey } from "@/types/product";
import { splitJan, normalizeFee } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, CheckCircle, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const HEADER_MAP: Record<string, AsinInfoHeaderKey> = {
  "URL: Amazon": "url",
  ブランド: "brand",
  商品名: "productName",
  ASIN: "asin",
  先月の購入: "soldUnit",
  "Buy Box 🚚: 現在価格": "price",
  "紹介料％": "sellingFeeRaw",
  "FBA Pick&Pack 料金": "fbaFeeRaw",
  "商品コード: EAN": "janRaw",
};

export default function AsinUploadPage() {
  const [brands, setBrands] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<string>("");
  const [parseError, setParseError] = useState<string>("");
  const [asinList, setAsinList] = useState<AsinInfo[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetch("/api/brands")
      .then((res) => res.json())
      .then(setBrands)
      .catch(() => setBrands([]));
  }, []);

  // ドラッグ&ドロップイベントハンドラー
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFile = droppedFiles.find(file => 
      file.name.endsWith(".csv") || 
      file.name.endsWith(".xlsx") || 
      file.name.endsWith(".xls")
    );

    if (validFile) {
      handleFileSelection(validFile);
    } else {
      setParseError("CSVまたはExcelファイルのみ対応しています。");
    }
  };

  // ファイル選択処理
  const handleFileSelection = (selectedFile: File) => {
    setParseError("");
    setAsinList([]);
    setUploadResult("");
    
    if (!selectedFile.name.endsWith(".csv") && !selectedFile.name.endsWith(".xlsx") && !selectedFile.name.endsWith(".xls")) {
      setParseError("CSVまたはExcelファイルのみ対応しています。");
      setFile(null);
      return;
    }
    
    setFile(selectedFile);
    parseFile(selectedFile);
  };

  // ファイル選択時
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  // ファイルパース
  const parseFile = (f: File) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const wb = XLSX.read(data, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json: any[] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        if (!json.length) throw new Error("ファイルが空です。");

        // 1行目はヘッダー
        const headers: string[] = json[0];
        const rows = json.slice(1);

        // ヘッダーの妥当性チェック
        const requiredHeaders = [
          "URL: Amazon",
          "ブランド",
          "商品名",
          "ASIN",
          "先月の購入",
          "Buy Box 🚚: 現在価格",
          "紹介料％",
          "FBA Pick&Pack 料金",
          "商品コード: EAN",
        ];
        for (const h of requiredHeaders) {
          if (!headers.includes(h)) {
            setParseError(`ヘッダー「${h}」が見つかりません。`);
            setFile(null);
            return;
          }
        }

        // データ変換
        const asinList: AsinInfo[] = rows
          .filter((row) => row.length > 0 && row.some((cell) => cell !== undefined && cell !== ""))
          .map((row, _) => {
            const obj: any = {};
            headers.forEach((h, i) => {
              const key = HEADER_MAP[h];
              if (key) obj[key] = row[i];
            });
            return {
              asin: String(obj.asin ?? ""),
              url: String(obj.url ?? ""),
              productName: String(obj.productName ?? ""),
              brand: String(obj.brand ?? selectedBrand),
              price: Number(obj.price ?? 0),
              soldUnit: Number(obj.soldUnit ?? 0),
              sellingFee: normalizeFee(obj.sellingFeeRaw, true),
              fbaFee: normalizeFee(obj.fbaFeeRaw, false),
              jan: splitJan(obj.janRaw),
              note: "",
            };
          });
        setAsinList(asinList);
      } catch (e: any) {
        setParseError("ファイルの解析に失敗しました: " + e.message);
        setFile(null);
      }
    };
    reader.readAsBinaryString(f);
  };

  // ボタンでinput[type=file]を開く
  const handleFileSelectClick = () => {
    fileInputRef.current?.click();
  };

  // ファイルを削除
  const handleRemoveFile = () => {
    setFile(null);
    setAsinList([]);
    setParseError("");
    setUploadResult("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // アップロード
  const handleUpload = async () => {
    if (!selectedBrand || !file || !asinList.length) return;

    setIsUploading(true);
    try {
      const res = await fetch("/api/asin-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: selectedBrand,
          asinList,
        }),
      });

      if (res.ok) {
        setUploadResult("データを保存しました！");
        // 成功時にファイルをクリア
        setTimeout(() => {
          handleRemoveFile();
        }, 2000);
      } else {
        setUploadResult("保存に失敗しました");
      }
    } catch (error) {
      setUploadResult("保存に失敗しました");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* ヘッダー */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gradient mb-2">ASIN一括登録</h1>
          <p className="text-gray-400">Excel/CSVファイルから商品情報を一括登録できます</p>
        </div>

        {/* ブランド選択 */}
        <Card className="glass-card border-white/20">
          <CardHeader>
            <CardTitle className="text-lg">ブランド選択</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
            >
              <option value="">ブランドを選択してください</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand.toUpperCase()}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        {/* ファイルアップロード */}
        <Card className="glass-card border-white/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Upload className="w-5 h-5" />
              ファイルアップロード
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* ドラッグ&ドロップエリア */}
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                isDragOver
                  ? "border-blue-400 bg-blue-50/50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <AnimatePresence>
                {file ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <FileText className="w-8 h-8 text-blue-500" />
                      <div className="text-left">
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveFile}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    {asinList.length > 0 && (
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">{asinList.length}件のデータを読み込みました</span>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-lg font-medium text-gray-700 mb-2">
                        ファイルをドラッグ&ドロップ
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        または下のボタンからファイルを選択
                      </p>
                      <Button
                        onClick={handleFileSelectClick}
                        className="gradient-primary"
                      >
                        ファイルを選択
                      </Button>
                    </div>
                    <p className="text-xs text-gray-400">
                      対応形式: .xlsx, .xls, .csv
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <input
              type="file"
              accept=".xlsx,.csv,.xls"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />

            {/* エラー表示 */}
            <AnimatePresence>
              {parseError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2"
                >
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="text-red-700 font-medium">{parseError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* アップロード結果 */}
            <AnimatePresence>
              {uploadResult && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`mt-4 p-4 rounded-lg flex items-center gap-2 ${
                    uploadResult.includes("成功") || uploadResult.includes("保存しました")
                      ? "bg-green-50 border border-green-200"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  {uploadResult.includes("成功") || uploadResult.includes("保存しました") ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span
                    className={
                      uploadResult.includes("成功") || uploadResult.includes("保存しました")
                        ? "text-green-700 font-medium"
                        : "text-red-700 font-medium"
                    }
                  >
                    {uploadResult}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* アップロードボタン */}
        <div className="flex justify-center">
          <Button
            onClick={handleUpload}
            disabled={!selectedBrand || !file || !asinList.length || isUploading}
            className="gradient-primary px-8 py-3 text-lg"
            size="lg"
          >
            {isUploading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
              />
            ) : (
              <Upload className="w-5 h-5 mr-2" />
            )}
            {isUploading ? "アップロード中..." : "アップロード"}
          </Button>
        </div>

        {/* プレビューテーブル */}
        <AnimatePresence>
          {asinList.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="glass-card border-white/20">
                <CardHeader>
                  <CardTitle className="text-lg">
                    プレビュー（{asinList.length}件）
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="px-3 py-2 text-left font-medium text-gray-700">ASIN</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">商品名</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">ブランド</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">価格</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">購入数</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">紹介料</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">FBA料金</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">JAN</th>
                        </tr>
                      </thead>
                      <tbody>
                        {asinList.slice(0, 10).map((item, i) => (
                          <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-3 py-2 font-mono text-blue-600">{item.asin}</td>
                            <td className="px-3 py-2 max-w-[200px] truncate" title={item.productName}>
                              {item.productName}
                            </td>
                            <td className="px-3 py-2">{item.brand}</td>
                            <td className="px-3 py-2 text-right">{item.price.toLocaleString()}円</td>
                            <td className="px-3 py-2 text-right">
                              {item.soldUnit && item.soldUnit !== 0 ? item.soldUnit.toLocaleString() : "-"}
                            </td>
                            <td className="px-3 py-2 text-right">
                              {item.sellingFee === null ? "-" : `${item.sellingFee}%`}
                            </td>
                            <td className="px-3 py-2 text-right">
                              {item.fbaFee === null ? "-" : `${item.fbaFee.toLocaleString()}円`}
                            </td>
                            <td className="px-3 py-2 text-xs">
                              {item.jan.length > 0 ? item.jan.join(", ") : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {asinList.length > 10 && (
                      <div className="mt-4 text-center text-sm text-gray-500">
                        他 {asinList.length - 10} 件のデータがあります
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}