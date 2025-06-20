import { NextResponse } from 'next/server';

export interface FeeInfo {
  fee: number;
  referralFee: number;
  shippingFee: number;
  fbaFee: number;
  storageFee: number;
  totalFee: number;
  profit: number;
  profitRate: number;
  price: number;
  currency: string;
  lastUpdated: string;
  monthlySales?: number;
  amazonPrice?: number;
  salesFee?: number;
  roi?: number;
}

export async function fetchKeepaData(asin: string): Promise<FeeInfo> {
  // ダミーデータを返す
  return {
    fee: 1000,
    referralFee: 150,
    shippingFee: 500,
    fbaFee: 350,
    storageFee: 50,
    totalFee: 1050,
    profit: 2000,
    profitRate: 0.2,
    price: 2500,
    currency: 'JPY',
    lastUpdated: new Date().toISOString(),
  };
}

export async function POST(request: Request) {
  try {
    const { asin } = await request.json();
    
    if (!asin) {
      return NextResponse.json(
        { error: 'ASIN is required' },
        { status: 400 }
      );
    }

    const data = await fetchKeepaData(asin);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in Keepa API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
