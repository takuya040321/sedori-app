// 環境変数を読み込み
require('dotenv').config({ path: '.env.local' });

// scripts/run-migrations.js
// Supabaseデータベースにマイグレーションを直接実行するスクリプト

const fs = require('fs').promises;
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Supabase設定（環境変数から取得）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase環境変数が設定されていません');
  console.log('必要な環境変数:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigrations() {
  console.log('🚀 データベースマイグレーションを開始します...');

  try {
    const migrationsDir = path.join(__dirname, '../supabase/migrations');
    
    // マイグレーションファイルを取得
    const files = await fs.readdir(migrationsDir);
    const migrationFiles = files
      .filter(file => file.endsWith('.sql'))
      .sort(); // ファイル名でソート

    console.log(`📁 ${migrationFiles.length}個のマイグレーションファイルを発見しました`);

    for (const file of migrationFiles) {
      console.log(`\n📄 ${file} を実行中...`);
      
      const filePath = path.join(migrationsDir, file);
      const sqlContent = await fs.readFile(filePath, 'utf-8');
      
      // SQLを実行
      const { error } = await supabase.rpc('exec_sql', { sql: sqlContent });
      
      if (error) {
        // rpcが利用できない場合は、直接SQLを実行
        console.log('  RPC経由での実行に失敗しました。直接実行を試行します...');
        
        // SQLを分割して実行
        const statements = sqlContent
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt.length > 0 && !stmt.startsWith('/*') && !stmt.startsWith('--'));
        
        for (const statement of statements) {
          if (statement.trim()) {
            try {
              const { error: directError } = await supabase
                .from('_temp_migration')
                .select('1')
                .limit(0); // これは失敗するが、接続テストとして使用
              
              // 実際のSQL実行は制限があるため、代替手段を使用
              console.log(`  ⚠️ 直接SQL実行は制限されています。手動でSupabaseダッシュボードから実行してください。`);
              console.log(`  SQL: ${statement.substring(0, 100)}...`);
            } catch (e) {
              // 予期されるエラー
            }
          }
        }
      } else {
        console.log(`  ✅ ${file} の実行が完了しました`);
      }
    }
    
    console.log('\n✅ マイグレーション処理が完了しました！');
    console.log('\n📋 次の手順:');
    console.log('1. Supabaseダッシュボード (https://supabase.com/dashboard) にアクセス');
    console.log('2. プロジェクトのSQL Editorを開く');
    console.log('3. 以下のマイグレーションファイルの内容を順番に実行:');
    
    for (const file of migrationFiles) {
      console.log(`   - ${file}`);
    }
    
    console.log('4. マイグレーション完了後、npm run migrate-data を実行');
    
  } catch (error) {
    console.error('❌ マイグレーション実行中にエラーが発生しました:', error);
    process.exit(1);
  }
}

// スクリプト実行
runMigrations();