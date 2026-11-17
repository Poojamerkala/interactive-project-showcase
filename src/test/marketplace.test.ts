import { describe, expect, it } from "vitest";

import {
  findMatchingInterests,
  findMatchingOffers,
  type BuyerInterest,
  type MaterialOffer,
} from "@/lib/marketplace";

const offer: MaterialOffer = {
  id: "offer-1",
  category: "Plastic",
  material: "Sorted PET bottles",
  quantity: 50,
  unitPrice: 12,
  place: "Kadri, Mangaluru",
  quality: "Clean & sorted",
  sellerName: "Sample Seller",
  sellerEmail: "seller@example.demo",
};

const interest: BuyerInterest = {
  id: "interest-1",
  category: "Plastic",
  quantity: 20,
  maxPrice: 15,
  place: "Bejai, Mangaluru",
  receiverName: "Sample Receiver",
  receiverEmail: "receiver@example.demo",
};

describe("Blueloop marketplace matching", () => {
  it("matches only the same material category", () => {
    expect(findMatchingOffers([offer], { ...interest, category: "Paper" })).toEqual([]);
  });

  it("matches when the seller has at least the requested quantity", () => {
    expect(findMatchingOffers([offer], { ...interest, quantity: 51 })).toEqual([]);
  });

  it("matches when the seller price is within the receiver's maximum", () => {
    expect(findMatchingOffers([offer], { ...interest, maxPrice: 11 })).toEqual([]);
  });

  it("shows eligible receiver interests to the seller", () => {
    expect(findMatchingInterests([interest], offer)).toEqual([interest]);
  });
});