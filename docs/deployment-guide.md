# デプロイメントガイド - ShopScraper

## 1. デプロイメント概要

### 1.1 対応プラットフォーム
- **Vercel** (推奨): Next.jsアプリケーションの最適化されたホスティング
- **Netlify**: 静的サイトホスティング
- **Docker**: コンテナベースデプロイメント
- **VPS/クラウドサーバー**: 自前サーバーでの運用

### 1.2 システム要件
- **Node.js**: 18.0.0以上
- **メモリ**: 最小512MB、推奨1GB以上
- **ストレージ**: 最小1GB、推奨5GB以上
- **ネットワーク**: HTTPS対応、プロキシアクセス可能

## 2. Vercelデプロイメント

### 2.1 事前準備
```bash
# Vercel CLIインストール
npm i -g vercel

# プロジェクトルートで初期化
vercel login
vercel init
```

### 2.2 環境変数設定
```bash
# Vercelダッシュボードまたはコマンドラインで設定
vercel env add PROXY_SERVER
vercel env add PROXY_USER  
vercel env add PROXY_PASS
vercel env add NODE_ENV production
```

### 2.3 vercel.json設定
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 300
    }
  },
  "env": {
    "NODE_ENV": "production"
  },
  "regions": ["nrt1"]
}
```

### 2.4 デプロイ実行
```bash
# 本番デプロイ
vercel --prod

# プレビューデプロイ
vercel
```

## 3. Dockerデプロイメント

### 3.1 Dockerfile
```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# 依存関係インストール
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only=production

# ビルド
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# 実行
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# データディレクトリ作成
RUN mkdir -p /app/src/data && chown nextjs:nodejs /app/src/data

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 3.2 docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PROXY_SERVER=${PROXY_SERVER}
      - PROXY_USER=${PROXY_USER}
      - PROXY_PASS=${PROXY_PASS}
    volumes:
      - ./data:/app/src/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
```

### 3.3 nginx.conf
```nginx
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3000;
    }

    server {
        listen 80;
        server_name your-domain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name your-domain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        location / {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            proxy_read_timeout 300s;
            proxy_connect_timeout 75s;
        }
    }
}
```

## 4. VPS/クラウドサーバーデプロイメント

### 4.1 サーバー準備
```bash
# Ubuntu 22.04 LTS想定
sudo apt update && sudo apt upgrade -y

# Node.js 18インストール
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2インストール（プロセス管理）
sudo npm install -g pm2

# Nginxインストール
sudo apt install nginx -y

# SSL証明書（Let's Encrypt）
sudo apt install certbot python3-certbot-nginx -y
```

### 4.2 アプリケーション配置
```bash
# アプリケーションディレクトリ作成
sudo mkdir -p /var/www/shopscaper
sudo chown $USER:$USER /var/www/shopscaper

# リポジトリクローン
cd /var/www/shopscaper
git clone https://github.com/your-username/shopscaper.git .

# 依存関係インストール
npm ci --only=production

# ビルド
npm run build

# データディレクトリ作成
mkdir -p src/data
chmod 755 src/data
```

### 4.3 PM2設定
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'shopscaper',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/shopscaper',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      PROXY_SERVER: process.env.PROXY_SERVER,
      PROXY_USER: process.env.PROXY_USER,
      PROXY_PASS: process.env.PROXY_PASS
    },
    error_file: '/var/log/shopscaper/error.log',
    out_file: '/var/log/shopscaper/out.log',
    log_file: '/var/log/shopscaper/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
```

### 4.4 PM2起動
```bash
# ログディレクトリ作成
sudo mkdir -p /var/log/shopscaper
sudo chown $USER:$USER /var/log/shopscaper

# PM2でアプリケーション起動
pm2 start ecosystem.config.js

# 自動起動設定
pm2 startup
pm2 save
```

### 4.5 Nginx設定
```nginx
# /etc/nginx/sites-available/shopscaper
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # 静的ファイルの直接配信
    location /_next/static/ {
        alias /var/www/shopscaper/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# サイト有効化
sudo ln -s /etc/nginx/sites-available/shopscaper /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# SSL証明書取得
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## 5. 環境変数管理

### 5.1 必須環境変数
```bash
# .env.production
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# プロキシ設定
PROXY_SERVER=http://150.61.8.70:10080
PROXY_USER=your-proxy-user
PROXY_PASS=your-proxy-password

# アプリケーション設定
PORT=3000
HOSTNAME=0.0.0.0
```

### 5.2 セキュリティ設定
```bash
# 機密情報は環境変数で管理
export PROXY_USER="your-proxy-user"
export PROXY_PASS="your-proxy-password"

# または.env.localファイル（Gitに含めない）
echo "PROXY_USER=your-proxy-user" >> .env.local
echo "PROXY_PASS=your-proxy-password" >> .env.local
```

## 6. データベース・ストレージ

### 6.1 データディレクトリ設定
```bash
# 本番環境でのデータディレクトリ
mkdir -p /var/lib/shopscaper/data
sudo chown www-data:www-data /var/lib/shopscaper/data
sudo chmod 755 /var/lib/shopscaper/data

# シンボリックリンク作成
ln -s /var/lib/shopscaper/data /var/www/shopscaper/src/data
```

### 6.2 バックアップ設定
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/shopscaper"
DATA_DIR="/var/lib/shopscaper/data"

mkdir -p $BACKUP_DIR

# データバックアップ
tar -czf $BACKUP_DIR/data_$DATE.tar.gz -C $DATA_DIR .

# 古いバックアップ削除（30日以上）
find $BACKUP_DIR -name "data_*.tar.gz" -mtime +30 -delete

echo "Backup completed: data_$DATE.tar.gz"
```

```bash
# crontabに追加（毎日午前2時実行）
0 2 * * * /var/www/shopscaper/backup.sh
```

## 7. 監視・ログ

### 7.1 ログ設定
```javascript
// next.config.js
const nextConfig = {
  // 本番環境でのログ設定
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  
  // エラー報告
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};
```

### 7.2 ヘルスチェック
```typescript
// src/app/api/health/route.ts
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    // データディレクトリの存在確認
    const dataDir = path.join(process.cwd(), 'src/data');
    await fs.access(dataDir);

    // 基本的なシステム情報
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0'
    };

    return NextResponse.json(health);
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
```

### 7.3 監視スクリプト
```bash
#!/bin/bash
# monitor.sh
HEALTH_URL="http://localhost:3000/api/health"
LOG_FILE="/var/log/shopscaper/monitor.log"

response=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $response -eq 200 ]; then
    echo "$(date): Health check passed" >> $LOG_FILE
else
    echo "$(date): Health check failed (HTTP $response)" >> $LOG_FILE
    # アラート送信（メール、Slack等）
    # send_alert "ShopScraper health check failed"
    
    # PM2再起動
    pm2 restart shopscaper
fi
```

## 8. SSL/TLS設定

### 8.1 Let's Encrypt証明書
```bash
# 証明書取得
sudo certbot --nginx -d your-domain.com

# 自動更新設定
sudo crontab -e
# 以下を追加
0 12 * * * /usr/bin/certbot renew --quiet
```

### 8.2 セキュリティヘッダー
```nginx
# Nginxセキュリティヘッダー
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

## 9. パフォーマンス最適化

### 9.1 Next.js最適化
```javascript
// next.config.js
const nextConfig = {
  // 画像最適化
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // 圧縮
  compress: true,
  
  // 静的最適化
  trailingSlash: false,
  
  // バンドル分析
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks.chunks = 'all';
    }
    return config;
  },
};
```

### 9.2 キャッシュ設定
```nginx
# Nginx キャッシュ設定
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location ~* \.(html|json)$ {
    expires 1h;
    add_header Cache-Control "public, must-revalidate";
}
```

## 10. トラブルシューティング

### 10.1 よくある問題

#### メモリ不足
```bash
# Node.jsメモリ制限増加
node --max-old-space-size=2048 server.js

# PM2設定
max_memory_restart: '2G'
```

#### ファイル権限エラー
```bash
# データディレクトリ権限修正
sudo chown -R www-data:www-data /var/lib/shopscaper/data
sudo chmod -R 755 /var/lib/shopscaper/data
```

#### プロキシ接続エラー
```bash
# プロキシ設定確認
curl -x http://user:pass@proxy:port http://example.com

# 環境変数確認
echo $PROXY_SERVER
echo $PROXY_USER
```

### 10.2 ログ確認
```bash
# PM2ログ
pm2 logs shopscaper

# Nginxログ
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# システムログ
sudo journalctl -u nginx -f
```

### 10.3 復旧手順
```bash
# 1. サービス停止
pm2 stop shopscaper
sudo systemctl stop nginx

# 2. バックアップから復元
tar -xzf /var/backups/shopscaper/data_YYYYMMDD_HHMMSS.tar.gz -C /var/lib/shopscaper/data/

# 3. サービス再起動
sudo systemctl start nginx
pm2 start shopscaper

# 4. ヘルスチェック
curl http://localhost:3000/api/health
```