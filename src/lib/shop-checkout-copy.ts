import type { Messages } from "@/lib/i18n";

/** Strings needed by `ShopCheckout` only — pass from the server to avoid bundling full locale JSON on the client. */
export type ShopCheckoutCopy = Pick<
  Messages,
  | "shopShowing"
  | "shopProductCount"
  | "shopSortByLabel"
  | "shopViewGridLarge"
  | "shopViewGridSmall"
  | "shopViewList"
  | "shopFilterProductType"
  | "shopFilterProductTypeEn"
  | "shopFilterHairType"
  | "shopFilterHairTypeEn"
  | "shopFilterStyle"
  | "shopFilterStyleEn"
  | "shopFilterPlaceholder"
  | "shopFilterAllTypes"
  | "shopSortDefault"
  | "shopSortPriceAsc"
  | "shopSortPriceDesc"
  | "shopAddToCart"
  | "shopCheckoutTitle"
  | "shopStaticCheckoutNote"
  | "shopWhatsappOrder"
  | "shopMailOrder"
  | "catShampoo"
  | "catConditioner"
  | "catTreatment"
  | "catStyling"
  | "catUncategorized"
  | "shopNoFilterMatch"
  | "shopClearFilters"
  | "shopNoProducts"
  | "shopEmptyCta"
  | "shopLocalPayFlowTitle"
  | "shopPayStepOrder"
  | "shopPayStepTransfer"
  | "shopPayStepUpload"
  | "shopPayStepReview"
  | "shopProofPreviewLabel"
  | "shopProofSubmit"
  | "shopProofReceived"
  | "shopProofReviewPending"
>;

export function pickShopCheckoutCopy(t: Messages): ShopCheckoutCopy {
  return {
    shopShowing: t.shopShowing,
    shopProductCount: t.shopProductCount,
    shopSortByLabel: t.shopSortByLabel,
    shopViewGridLarge: t.shopViewGridLarge,
    shopViewGridSmall: t.shopViewGridSmall,
    shopViewList: t.shopViewList,
    shopFilterProductType: t.shopFilterProductType,
    shopFilterProductTypeEn: t.shopFilterProductTypeEn,
    shopFilterHairType: t.shopFilterHairType,
    shopFilterHairTypeEn: t.shopFilterHairTypeEn,
    shopFilterStyle: t.shopFilterStyle,
    shopFilterStyleEn: t.shopFilterStyleEn,
    shopFilterPlaceholder: t.shopFilterPlaceholder,
    shopFilterAllTypes: t.shopFilterAllTypes,
    shopSortDefault: t.shopSortDefault,
    shopSortPriceAsc: t.shopSortPriceAsc,
    shopSortPriceDesc: t.shopSortPriceDesc,
    shopAddToCart: t.shopAddToCart,
    shopCheckoutTitle: t.shopCheckoutTitle,
    shopStaticCheckoutNote: t.shopStaticCheckoutNote,
    shopWhatsappOrder: t.shopWhatsappOrder,
    shopMailOrder: t.shopMailOrder,
    catShampoo: t.catShampoo,
    catConditioner: t.catConditioner,
    catTreatment: t.catTreatment,
    catStyling: t.catStyling,
    catUncategorized: t.catUncategorized,
    shopNoFilterMatch: t.shopNoFilterMatch,
    shopClearFilters: t.shopClearFilters,
    shopNoProducts: t.shopNoProducts,
    shopEmptyCta: t.shopEmptyCta,
    shopLocalPayFlowTitle: t.shopLocalPayFlowTitle,
    shopPayStepOrder: t.shopPayStepOrder,
    shopPayStepTransfer: t.shopPayStepTransfer,
    shopPayStepUpload: t.shopPayStepUpload,
    shopPayStepReview: t.shopPayStepReview,
    shopProofPreviewLabel: t.shopProofPreviewLabel,
    shopProofSubmit: t.shopProofSubmit,
    shopProofReceived: t.shopProofReceived,
    shopProofReviewPending: t.shopProofReviewPending,
  };
}
