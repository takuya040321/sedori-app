// .eslintrc.js
// このファイルはESLintの設定ファイルです。

module.exports = {
    // この設定ファイルをプロジェクトのルートとみなします
    root: true,
  
    // コードが動作する環境を指定します
    env: {
      browser: true, // ブラウザ（window, documentなど）が使える
      es2021: true, // ECMAScript 2021の構文が使える
    },
  
    // 既存のルールセットを継承します。Next.js公式推奨ルールを追加
    extends: [
      "eslint:recommended",
      "next", // Next.js用
      // "next/core-web-vitals", // Core Web Vitalsを重視する場合はこちら
    ],
  
    // JavaScriptの構文解析に関するオプション
    parserOptions: {
      ecmaVersion: 12, // ECMAScriptのバージョン（2021年）
      sourceType: "module", // import/export構文を利用する場合は"module"
    },
  
    // プロジェクト独自のルール設定
    rules: {
      // インデントはスペース2つ
      indent: "off", // ← ESLintのインデントルールを無効化
  
      // 文字列はダブルクォートで統一
      quotes: ["error", "double"],
  
      // 文末に必ずセミコロンを付ける
      semi: ["error", "always"],
  
      // 不要なセミコロンは禁止（警告）
      "no-extra-semi": "warn",
    },
    overrides: [
      {
        files: ["*.ts", "*.tsx"],
        rules: {
          "no-undef": "off", // ← TypeScriptファイルでno-undefを無効化
        },
      },
    ],
  };  