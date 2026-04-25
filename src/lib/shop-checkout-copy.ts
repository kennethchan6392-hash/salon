import type { Messages } from "@/lib/i18n";

/** Strings needed by `ShopCheckout` only — pass from the server to avoid bundling full locale JSON on the client. */
export type ShopCheckoutCopy = Pick<
  Messages,
  | "shopShowing"
  | "shopSortDefault"
  | "shopSortPriceAsc"
  | "shopSortPriceDesc"
  | "shopAddToCart"
  | "shopCheckoutTitle"
  | "catShampoo"
  | "catConditioner"
  | "catTreatment"
  | "catStyling"
  | "catUncategorized"
  | "shopNoProducts"
  | "shopEmptyCta"
>;

export function pickShopCheckoutCopy(t: Messages): ShopCheckoutCopy {
  return {
    shopShowing: t.shopShowing,
    shopSortDefault: t.shopSortDefault,
    shopSortPriceAsc: t.shopSortPriceAsc,
    shopSortPriceDesc: t.shopSortPriceDesc,
    shopAddToCart: t.shopAddToCart,
    shopCheckoutTitle: t.shopCheckoutTitle,
    catShampoo: t.catShampoo,
    catConditioner: t.catConditioner,
    catTreatment: t.catTreatment,
    catStyling: t.catStyling,
    catUncategorized: t.catUncategorized,
    shopNoProducts: t.shopNoProducts,
    shopEmptyCta: t.shopEmptyCta,
  };
}
