import { AsinInfo } from "@/types/product";

export const fetchASINInfo = async (asin: string, brand: string): Promise<AsinInfo> => {
  const params = new URLSearchParams({ asin, brand });
  const response = await fetch(`/api/asin-info?${params.toString()}`);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to fetch ASIN info");
  }
  
  return response.json();
};
