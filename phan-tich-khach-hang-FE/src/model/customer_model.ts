export interface CustomerDTO {
  id: number;
  fileName: string;
  education: string;
  maritalStatus: string;
  income: number | null;
  mntWines: number | null;
  mntFruits: number | null;
  mntMeatProducts: number | null;
  mntFishProducts: number | null;
  mntSweetProducts: number | null;
  mntGoldProds: number | null;
  numWebPurchases: number | null;
  numCatalogPurchases: number | null;
  numStorePurchases: number | null;
  numDealsPurchases: number | null;
  acceptedCmp1: number | null;
  acceptedCmp2: number | null;
  acceptedCmp3: number | null;
  acceptedCmp4: number | null;
  acceptedCmp5: number | null;
  segment: number | null;
  totalSpending: number | null;
  totalCampaignAccepted: number | null;
}