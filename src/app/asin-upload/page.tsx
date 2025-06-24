// src/app/asin-upload/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import { AsinInfo, AsinInfoHeaderKey } from "@/types/product";
import { splitJan, normalizeFee } from "@/lib/utils";

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
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetch("/api/brands")
      .then((res) => res.json())
      .then(setBrands)
      .catch(() => setBrands([]));
  }, []);

  // ファイル選択時
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParseError("");
    setAsinList([]);
    if (e.target.files?.[0]) {
      const f = e.target.files[0];
      // 拡張子チェック
      if (!f.name.endsWith(".csv") && !f.name.endsWith(".xlsx") && !f.name.endsWith(".xls")) {
        setParseError("CSVまたはExcelファイルのみ対応しています。");
        setFile(null);
        return;
      }
      setFile(f);
      parseFile(f);
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

  // アップロード
  const handleUpload = async () => {
    if (!selectedBrand || !file || !asinList.length) return;

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
    } else {
      setUploadResult("保存に失敗しました");
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">ASIN一括登録</h1>
      {/* ブランド選択 */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">ブランドを選択</label>
        <select
          className="border px-2 py-1 rounded w-full text-black bg-white"
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
        >
          <option value="">選択してください</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </div>

      {/* ファイルアップロード */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">エクセル/CSVファイルを選択</label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
            onClick={handleFileSelectClick}
          >
            ファイルを選択
          </button>
          <span className="text-sm break-all">
            {file ? file.name : "ファイルが選択されていません"}
          </span>
        </div>
        <input
          type="file"
          accept=".xlsx,.csv,.xls"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="mt-2 text-sm text-gray-500">ドラッグ＆ドロップ対応は今後追加</div>
        {parseError && <div className="mt-2 text-red-600 font-medium">{parseError}</div>}
      </div>

      {/* アップロードボタン */}
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={!selectedBrand || !file || !asinList.length}
        onClick={handleUpload}
      >
        アップロード
      </button>

      {/* アップロード結果 */}
      {uploadResult && <div className="mt-4 text-green-700 font-medium">{uploadResult}</div>}

      {/* プレビュー */}
      {asinList.length > 0 && (
        <div className="mt-6">
          <h2 className="font-bold mb-2">プレビュー（{asinList.length}件）</h2>
          <div className="overflow-x-auto text-xs">
            <table className="min-w-full border">
              <thead>
                <tr>
                  <th className="border px-2 py-1">ASIN</th>
                  <th className="border px-2 py-1">商品名</th>
                  <th className="border px-2 py-1">ブランド</th>
                  <th className="border px-2 py-1">価格</th>
                  <th className="border px-2 py-1">購入数</th>
                  <th className="border px-2 py-1">紹介料</th>
                  <th className="border px-2 py-1">FBA料金</th>
                  <th className="border px-2 py-1">URL</th>
                  <th className="border px-2 py-1">JAN</th>
                </tr>
              </thead>
              <tbody>
                {asinList.map((item, i) => (
                  <tr key={i}>
                    <td className="border px-2 py-1">{item.asin}</td>
                    <td className="border px-2 py-1">{item.productName}</td>
                    <td className="border px-2 py-1">{item.brand}</td>
                    <td className="border px-2 py-1">{item.price}</td>
                    <td className="border px-2 py-1">
                      {item.soldUnit && item.soldUnit !== 0 ? item.soldUnit : "null"}
                    </td>
                    <td className="border px-2 py-1">
                      {item.sellingFee === null ? "null" : `${item.sellingFee}%`}
                    </td>
                    <td className="border px-2 py-1">
                      {item.fbaFee === null ? "null" : item.fbaFee}
                    </td>
                    <td className="border px-2 py-1">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        {item.url}
                      </a>
                    </td>
                    <td className="border px-2 py-1">
                      {item.jan.length > 0 ? item.jan.join(", ") : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
