# テスト仕様書 - ShopScraper

## 1. テスト戦略

### 1.1 テストレベル
- **単体テスト (Unit Test)**: 個別関数・コンポーネントのテスト
- **統合テスト (Integration Test)**: API・データアクセス層のテスト
- **E2Eテスト (End-to-End Test)**: ユーザーシナリオのテスト
- **パフォーマンステスト**: 負荷・性能のテスト

### 1.2 テストツール
- **単体テスト**: Jest + React Testing Library
- **E2Eテスト**: Playwright
- **API テスト**: Supertest
- **カバレッジ**: Istanbul

### 1.3 テスト環境
- **開発環境**: ローカル開発環境
- **CI/CD環境**: GitHub Actions
- **ステージング環境**: 本番類似環境

## 2. 単体テスト仕様

### 2.1 ユーティリティ関数テスト

#### 2.1.1 利益計算関数テスト
```typescript
// src/lib/calc.test.ts
describe('利益計算関数', () => {
  describe('calcProfit', () => {
    test('正常な利益計算', () => {
      const result = calcProfit(2000, 15, 300, 1000);
      expect(result).toBe(400); // 2000 - (2000 * 0.15) - 300 - 1000
    });

    test('損失の場合', () => {
      const result = calcProfit(1000, 15, 300, 1000);
      expect(result).toBe(-450);
    });

    test('ゼロ価格の場合', () => {
      const result = calcProfit(0, 15, 300, 1000);
      expect(result).toBe(-1300);
    });
  });

  describe('calcProfitMargin', () => {
    test('正常な利益率計算', () => {
      const result = calcProfitMargin(2000, 15, 300, 1000);
      expect(result).toBeCloseTo(23.53, 2);
    });

    test('損失率の場合', () => {
      const result = calcProfitMargin(1000, 15, 300, 1000);
      expect(result).toBeLessThan(0);
    });
  });

  describe('calcROI', () => {
    test('正常なROI計算', () => {
      const result = calcROI(2000, 15, 300, 1000);
      expect(result).toBeCloseTo(40, 1);
    });

    test('コストがゼロの場合', () => {
      const result = calcROI(2000, 15, 300, 0);
      expect(result).toBe(0);
    });
  });
});
```

#### 2.1.2 データ変換関数テスト
```typescript
// src/lib/utils.test.ts
describe('ユーティリティ関数', () => {
  describe('splitJan', () => {
    test('カンマ区切りJANコード', () => {
      const result = splitJan('1234567890123,9876543210987');
      expect(result).toEqual(['1234567890123', '9876543210987']);
    });

    test('改行区切りJANコード', () => {
      const result = splitJan('1234567890123\n9876543210987');
      expect(result).toEqual(['1234567890123', '9876543210987']);
    });

    test('空文字の場合', () => {
      const result = splitJan('');
      expect(result).toEqual([]);
    });

    test('nullの場合', () => {
      const result = splitJan(null);
      expect(result).toEqual([]);
    });
  });

  describe('normalizeFee', () => {
    test('パーセント表記の正規化', () => {
      expect(normalizeFee('15%', true)).toBe(15);
      expect(normalizeFee(0.15, true)).toBe(15);
      expect(normalizeFee(15, true)).toBe(15);
    });

    test('金額の正規化', () => {
      expect(normalizeFee('350', false)).toBe(350);
      expect(normalizeFee(350, false)).toBe(350);
    });

    test('無効な値の場合', () => {
      expect(normalizeFee('', true)).toBeNull();
      expect(normalizeFee('-', true)).toBeNull();
      expect(normalizeFee('NaN', true)).toBeNull();
    });
  });
});
```

### 2.2 データアクセス層テスト

#### 2.2.1 データローダーテスト
```typescript
// src/lib/data-loader.test.ts
describe('データローダー', () => {
  beforeEach(() => {
    // テスト用ディレクトリ・ファイル作成
    jest.clearAllMocks();
  });

  describe('loadShopData', () => {
    test('正常なデータ読み込み', async () => {
      const mockData = {
        lastUpdated: '2024-01-15T10:30:00.000Z',
        products: [
          {
            name: 'テスト商品',
            imageUrl: 'https://example.com/image.jpg',
            price: 1000,
            updatedAt: '2024-01-15T10:30:00.000Z'
          }
        ]
      };

      jest.spyOn(fs, 'readFile').mockResolvedValue(JSON.stringify(mockData));

      const result = await loadShopData('official', 'test-shop');
      expect(result).toEqual(mockData);
    });

    test('ファイルが存在しない場合', async () => {
      jest.spyOn(fs, 'readFile').mockRejectedValue(new Error('ENOENT'));

      const result = await loadShopData('official', 'nonexistent');
      expect(result.products).toEqual([]);
      expect(result.lastUpdated).toBeDefined();
    });
  });

  describe('saveShopData', () => {
    test('正常なデータ保存', async () => {
      const mockData = {
        lastUpdated: '2024-01-15T10:30:00.000Z',
        products: []
      };

      jest.spyOn(fs, 'mkdir').mockResolvedValue(undefined);
      jest.spyOn(fs, 'writeFile').mockResolvedValue(undefined);

      await expect(saveShopData('official', 'test-shop', mockData)).resolves.not.toThrow();
    });
  });
});
```

### 2.3 コンポーネントテスト

#### 2.3.1 KPIカードテスト
```typescript
// src/components/dashboard/KPICard.test.tsx
describe('KPICard', () => {
  test('数値のカウントアップアニメーション', async () => {
    render(
      <KPICard
        title="総商品数"
        value={100}
        icon={<Package />}
        gradient="gradient-primary"
      />
    );

    expect(screen.getByText('総商品数')).toBeInTheDocument();
    
    // アニメーション完了を待つ
    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  test('文字列値の表示', () => {
    render(
      <KPICard
        title="最終更新"
        value="2024/01/15"
        icon={<Clock />}
        gradient="gradient-accent"
      />
    );

    expect(screen.getByText('2024/01/15')).toBeInTheDocument();
  });

  test('トレンド情報の表示', () => {
    render(
      <KPICard
        title="総商品数"
        value={100}
        icon={<Package />}
        trend={{ value: 12, isPositive: true }}
        gradient="gradient-primary"
      />
    );

    expect(screen.getByText('+12%')).toBeInTheDocument();
    expect(screen.getByText('前月比')).toBeInTheDocument();
  });
});
```

#### 2.3.2 商品テーブルテスト
```typescript
// src/components/product-list/ProductTable.test.tsx
describe('ProductTable', () => {
  const mockProducts = [
    {
      name: 'テスト商品1',
      imageUrl: 'https://example.com/image1.jpg',
      price: 1000,
      salePrice: 800,
      updatedAt: '2024-01-15T10:30:00.000Z'
    }
  ];

  test('商品一覧の表示', () => {
    render(
      <ProductTable
        category="official"
        shopName="test-shop"
        initialProducts={mockProducts}
      />
    );

    expect(screen.getByText('テスト商品1')).toBeInTheDocument();
    expect(screen.getByText('1,000円')).toBeInTheDocument();
    expect(screen.getByText('800円')).toBeInTheDocument();
  });

  test('ASIN入力フィールド', async () => {
    render(
      <ProductTable
        category="official"
        shopName="test-shop"
        initialProducts={mockProducts}
      />
    );

    const asinInput = screen.getByPlaceholderText('ASIN');
    
    await user.type(asinInput, 'B08XYZ1234');
    expect(asinInput).toHaveValue('B08XYZ1234');

    // 無効な文字の入力テスト
    await user.clear(asinInput);
    await user.type(asinInput, 'invalid-asin!');
    expect(asinInput).toHaveValue('INVALIDASIN'); // 特殊文字除去
  });

  test('非表示チェックボックス', async () => {
    render(
      <ProductTable
        category="official"
        shopName="test-shop"
        initialProducts={mockProducts}
      />
    );

    const hiddenCheckbox = screen.getByRole('checkbox');
    
    await user.click(hiddenCheckbox);
    expect(hiddenCheckbox).toBeChecked();
  });
});
```

## 3. 統合テスト仕様

### 3.1 API統合テスト

#### 3.1.1 商品API統合テスト
```typescript
// src/app/api/products/[category]/[shopName]/route.test.ts
describe('商品API統合テスト', () => {
  beforeEach(async () => {
    // テストデータ準備
    await setupTestData();
  });

  afterEach(async () => {
    // テストデータクリーンアップ
    await cleanupTestData();
  });

  test('GET /api/products/official/dhc', async () => {
    const response = await request(app)
      .get('/api/products/official/dhc')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.products).toBeDefined();
    expect(Array.isArray(response.body.data.products)).toBe(true);
  });

  test('POST /api/products/official/dhc/upload-asin', async () => {
    const response = await request(app)
      .post('/api/products/official/dhc/upload-asin')
      .send({
        index: 0,
        asin: 'B08XYZ1234'
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('ASINを保存しました');
  });

  test('存在しないショップへのアクセス', async () => {
    const response = await request(app)
      .get('/api/products/official/nonexistent')
      .expect(500);

    expect(response.body.success).toBe(false);
  });
});
```

#### 3.1.2 スクレイピングAPI統合テスト
```typescript
// src/app/api/scraping/[category]/[shopName]/route.test.ts
describe('スクレイピングAPI統合テスト', () => {
  test('POST /api/scraping/official/dhc', async () => {
    // モックスクレイパーを使用
    jest.mock('@/lib/scrapers/official/dhc', () => ({
      scrapeDHC: jest.fn().mockResolvedValue({
        lastUpdated: new Date().toISOString(),
        products: [
          {
            name: 'テスト商品',
            imageUrl: 'https://example.com/image.jpg',
            price: 1000,
            updatedAt: new Date().toISOString()
          }
        ]
      })
    }));

    const response = await request(app)
      .post('/api/scraping/official/dhc')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.updatedCount).toBeGreaterThan(0);
  });

  test('未対応ショップのスクレイピング', async () => {
    const response = await request(app)
      .post('/api/scraping/official/unsupported')
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('未対応のショップです');
  });
});
```

### 3.2 データアクセス統合テスト

#### 3.2.1 ファイルシステム統合テスト
```typescript
// src/lib/data-loader.integration.test.ts
describe('データアクセス統合テスト', () => {
  const testDataDir = path.join(__dirname, 'test-data');

  beforeAll(async () => {
    await fs.mkdir(testDataDir, { recursive: true });
  });

  afterAll(async () => {
    await fs.rmdir(testDataDir, { recursive: true });
  });

  test('商品データの保存と読み込み', async () => {
    const testData = {
      lastUpdated: '2024-01-15T10:30:00.000Z',
      products: [
        {
          name: 'テスト商品',
          imageUrl: 'https://example.com/image.jpg',
          price: 1000,
          updatedAt: '2024-01-15T10:30:00.000Z'
        }
      ]
    };

    // 保存
    await saveShopData('test', 'shop', testData);

    // 読み込み
    const loadedData = await loadShopData('test', 'shop');
    expect(loadedData).toEqual(testData);
  });

  test('全商品データの取得', async () => {
    // 複数ショップのテストデータ作成
    await saveShopData('test', 'shop1', { lastUpdated: '2024-01-15T10:30:00.000Z', products: [mockProduct1] });
    await saveShopData('test', 'shop2', { lastUpdated: '2024-01-15T10:30:00.000Z', products: [mockProduct2] });

    const allProducts = await getAllProducts();
    expect(allProducts).toHaveLength(2);
  });
});
```

## 4. E2Eテスト仕様

### 4.1 ユーザーシナリオテスト

#### 4.1.1 商品一覧表示シナリオ
```typescript
// tests/e2e/product-list.spec.ts
test('商品一覧表示シナリオ', async ({ page }) => {
  // ダッシュボードにアクセス
  await page.goto('/dashboard');
  await expect(page.locator('h1')).toContainText('ShopScraper');

  // DHCショップページに移動
  await page.click('text=DHC');
  await expect(page).toHaveURL('/shop/official/dhc');

  // 商品一覧が表示されることを確認
  await expect(page.locator('table')).toBeVisible();
  await expect(page.locator('tbody tr')).toHaveCount.greaterThan(0);

  // 商品画像が表示されることを確認
  const firstImage = page.locator('tbody tr:first-child img');
  await expect(firstImage).toBeVisible();

  // 価格が表示されることを確認
  const priceCell = page.locator('tbody tr:first-child td:nth-child(3)');
  await expect(priceCell).toContainText('円');
});
```

#### 4.1.2 スクレイピング実行シナリオ
```typescript
// tests/e2e/scraping.spec.ts
test('スクレイピング実行シナリオ', async ({ page }) => {
  // DHCショップページにアクセス
  await page.goto('/shop/official/dhc');

  // スクレイピングボタンをクリック
  await page.click('button:has-text("スクレイピング")');

  // ローディング状態の確認
  await expect(page.locator('button:has-text("スクレイピング中")')).toBeVisible();

  // 完了メッセージの確認（タイムアウト: 5分）
  await expect(page.locator('text=商品情報を更新しました')).toBeVisible({ timeout: 300000 });

  // 成功時のconfetti効果確認
  await expect(page.locator('canvas')).toBeVisible();

  // 商品一覧が更新されることを確認
  await page.reload();
  await expect(page.locator('tbody tr')).toHaveCount.greaterThan(0);
});
```

#### 4.1.3 ASIN登録シナリオ
```typescript
// tests/e2e/asin-upload.spec.ts
test('ASIN一括登録シナリオ', async ({ page }) => {
  // ASIN登録ページにアクセス
  await page.goto('/asin-upload');

  // ブランド選択
  await page.selectOption('select', 'dhc');

  // ファイルアップロード
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles('tests/fixtures/asin-data.xlsx');

  // プレビューが表示されることを確認
  await expect(page.locator('table')).toBeVisible();
  await expect(page.locator('tbody tr')).toHaveCount.greaterThan(0);

  // アップロードボタンクリック
  await page.click('button:has-text("アップロード")');

  // 成功メッセージの確認
  await expect(page.locator('text=データを保存しました')).toBeVisible();
});
```

#### 4.1.4 ASIN情報取得シナリオ
```typescript
// tests/e2e/asin-info.spec.ts
test('ASIN情報取得シナリオ', async ({ page }) => {
  // 商品一覧ページにアクセス
  await page.goto('/shop/official/dhc');

  // 最初の商品のASIN入力フィールドに入力
  const asinInput = page.locator('tbody tr:first-child input[placeholder="ASIN"]');
  await asinInput.fill('B08XYZ1234');

  // フォーカスアウト
  await page.click('body');

  // ASIN情報が取得されることを確認
  await expect(page.locator('tbody tr:first-child td:nth-child(4)')).not.toContainText('-');
  await expect(page.locator('tbody tr:first-child td:nth-child(6)')).not.toContainText('-');
  await expect(page.locator('tbody tr:first-child td:nth-child(7)')).not.toContainText('-');

  // 利益計算結果が表示されることを確認
  await expect(page.locator('tbody tr:first-child td:nth-child(10)')).not.toContainText('-');
  await expect(page.locator('tbody tr:first-child td:nth-child(11)')).toContainText('%');
  await expect(page.locator('tbody tr:first-child td:nth-child(12)')).toContainText('%');
});
```

### 4.2 エラーハンドリングテスト

#### 4.2.1 ネットワークエラーテスト
```typescript
// tests/e2e/error-handling.spec.ts
test('ネットワークエラーハンドリング', async ({ page }) => {
  // ネットワークを無効化
  await page.context().setOffline(true);

  await page.goto('/shop/official/dhc');

  // スクレイピングボタンクリック
  await page.click('button:has-text("スクレイピング")');

  // エラーメッセージの確認
  await expect(page.locator('text=エラーが発生しました')).toBeVisible();

  // ネットワークを復旧
  await page.context().setOffline(false);
});
```

#### 4.2.2 バリデーションエラーテスト
```typescript
test('ASIN入力バリデーション', async ({ page }) => {
  await page.goto('/shop/official/dhc');

  const asinInput = page.locator('tbody tr:first-child input[placeholder="ASIN"]');

  // 無効なASIN入力
  await asinInput.fill('invalid');
  await page.click('body');

  // エラー状態の確認（ASIN情報が取得されない）
  await expect(page.locator('tbody tr:first-child td:nth-child(4)')).toContainText('-');

  // 正しいASIN入力
  await asinInput.fill('B08XYZ1234');
  await page.click('body');

  // 正常な情報取得の確認
  await expect(page.locator('tbody tr:first-child td:nth-child(4)')).not.toContainText('-');
});
```

## 5. パフォーマンステスト仕様

### 5.1 負荷テスト

#### 5.1.1 API負荷テスト
```typescript
// tests/performance/api-load.test.ts
describe('API負荷テスト', () => {
  test('商品一覧API負荷テスト', async () => {
    const concurrentRequests = 10;
    const requests = Array(concurrentRequests).fill(null).map(() =>
      request(app).get('/api/products/official/dhc')
    );

    const responses = await Promise.all(requests);
    
    responses.forEach(response => {
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    // レスポンス時間の確認（3秒以内）
    responses.forEach(response => {
      expect(response.duration).toBeLessThan(3000);
    });
  });
});
```

#### 5.1.2 スクレイピング負荷テスト
```typescript
test('スクレイピング同時実行制限', async () => {
  const requests = [
    request(app).post('/api/scraping/official/dhc'),
    request(app).post('/api/scraping/official/dhc')
  ];

  const responses = await Promise.allSettled(requests);
  
  // 1つは成功、1つは制限エラー
  const successCount = responses.filter(r => 
    r.status === 'fulfilled' && r.value.status === 200
  ).length;
  
  expect(successCount).toBe(1);
});
```

### 5.2 メモリ使用量テスト

#### 5.2.1 大量データ処理テスト
```typescript
// tests/performance/memory.test.ts
test('大量商品データ処理', async () => {
  const initialMemory = process.memoryUsage();
  
  // 10,000件の商品データを生成
  const largeProductList = Array(10000).fill(null).map((_, i) => ({
    name: `商品${i}`,
    imageUrl: `https://example.com/image${i}.jpg`,
    price: 1000 + i,
    updatedAt: new Date().toISOString()
  }));

  const shopData = {
    lastUpdated: new Date().toISOString(),
    products: largeProductList
  };

  // データ保存・読み込み
  await saveShopData('test', 'large-shop', shopData);
  const loadedData = await loadShopData('test', 'large-shop');

  const finalMemory = process.memoryUsage();
  const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

  // メモリ使用量が100MB以下であることを確認
  expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
  expect(loadedData.products).toHaveLength(10000);
});
```

## 6. テスト実行・CI/CD

### 6.1 テスト実行コマンド
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:integration": "jest --testPathPattern=integration",
    "test:performance": "jest --testPathPattern=performance"
  }
}
```

### 6.2 CI/CD設定
```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  unit-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3

  integration-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:integration

  e2e-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install
      - run: npm run build
      - run: npm run test:e2e
```

### 6.3 カバレッジ目標
- **単体テスト**: 80%以上
- **統合テスト**: 70%以上
- **E2Eテスト**: 主要ユーザーシナリオ100%

### 6.4 テストデータ管理
```typescript
// tests/fixtures/test-data.ts
export const mockProducts = [
  {
    name: 'テスト商品1',
    imageUrl: 'https://example.com/image1.jpg',
    price: 1000,
    salePrice: 800,
    updatedAt: '2024-01-15T10:30:00.000Z'
  }
];

export const mockAsinInfo = [
  {
    asin: 'B08XYZ1234',
    url: 'https://amazon.co.jp/dp/B08XYZ1234',
    productName: 'テスト商品1',
    brand: 'test-brand',
    price: 1200,
    soldUnit: 100,
    sellingFee: 15,
    fbaFee: 300,
    jan: ['1234567890123'],
    note: 'テスト用'
  }
];
```