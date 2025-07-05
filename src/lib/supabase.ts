// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-anon-key-for-development';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// データベース型定義
export interface Database {
  public: {
    Tables: {
      shops: {
        Row: {
          id: string;
          category: string;
          name: string;
          display_name: string;
          last_updated: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category: string;
          name: string;
          display_name: string;
          last_updated?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category?: string;
          name?: string;
          display_name?: string;
          last_updated?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          shop_id: string;
          name: string;
          image_url: string;
          price: number;
          sale_price: number | null;
          hidden: boolean;
          memo: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          shop_id: string;
          name: string;
          image_url?: string;
          price: number;
          sale_price?: number | null;
          hidden?: boolean;
          memo?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          shop_id?: string;
          name?: string;
          image_url?: string;
          price?: number;
          sale_price?: number | null;
          hidden?: boolean;
          memo?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      asin_info: {
        Row: {
          id: string;
          asin: string;
          url: string;
          product_name: string;
          brand: string;
          price: number;
          sold_unit: number;
          selling_fee: number | null;
          fba_fee: number | null;
          jan_codes: string[];
          note: string;
          is_dangerous_goods: boolean;
          is_partner_carrier_unavailable: boolean;
          has_official_store: boolean;
          has_amazon_store: boolean;
          complaint_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          asin: string;
          url: string;
          product_name?: string;
          brand: string;
          price?: number;
          sold_unit?: number;
          selling_fee?: number | null;
          fba_fee?: number | null;
          jan_codes?: string[];
          note?: string;
          is_dangerous_goods?: boolean;
          is_partner_carrier_unavailable?: boolean;
          has_official_store?: boolean;
          has_amazon_store?: boolean;
          complaint_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          asin?: string;
          url?: string;
          product_name?: string;
          brand?: string;
          price?: number;
          sold_unit?: number;
          selling_fee?: number | null;
          fba_fee?: number | null;
          jan_codes?: string[];
          note?: string;
          is_dangerous_goods?: boolean;
          is_partner_carrier_unavailable?: boolean;
          has_official_store?: boolean;
          has_amazon_store?: boolean;
          complaint_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      product_asins: {
        Row: {
          id: string;
          product_id: string;
          asin_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          asin_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          asin_id?: string;
          created_at?: string;
        };
      };
    };
  }
  console.warn('Supabase environment variables not configured. Using dummy values for development.');
}