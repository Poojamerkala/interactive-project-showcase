export type MaterialCategory =
  | "Plastic"
  | "Paper"
  | "Glass"
  | "E-waste"
  | "Textile"
  | "Metal"
  | "Coastal";

export type MaterialOffer = {
  id: string;
  category: MaterialCategory;
  material: string;
  quantity: number;
  unitPrice: number;
  place: string;
  quality: string;
  sellerName: string;
  sellerEmail: string;
};

export type BuyerInterest = {
  id: string;
  category: MaterialCategory;
  quantity: number;
  maxPrice: number;
  place: string;
  receiverName: string;
  receiverEmail: string;
};

export function findMatchingOffers(
  offers: MaterialOffer[],
  interest: BuyerInterest,
): MaterialOffer[] {
  return offers.filter(
    (offer) =>
      offer.category === interest.category &&
      offer.quantity >= interest.quantity &&
      offer.unitPrice <= interest.maxPrice,
  );
}

export function findMatchingInterests(
  interests: BuyerInterest[],
  offer: MaterialOffer,
): BuyerInterest[] {
  return interests.filter(
    (interest) =>
      interest.category === offer.category &&
      interest.quantity <= offer.quantity &&
      interest.maxPrice >= offer.unitPrice,
  );
}