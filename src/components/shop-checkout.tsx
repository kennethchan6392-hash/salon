"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { getMessages, isSupportedLocale, type Locale } from "@/lib/i18n";
import type { Messages } from "@/lib/i18n";

type Product = {
  id: string;
  nameZh: string;
  nameEn: string;
  priceCents: number;
  currency: string;
};

type ShopCheckoutProps = {
  locale: string;
  initialProducts: Product[];
};

type PaymentMethod = "mpay" | "boc" | "uepay" | "bank_transfer" | "stripe_card";
type SortKey = "default" | "price-asc" | "price-desc";

type LocalPaymentResponse = {
  orderId: string;
  paymentMethod: PaymentMethod;
  amountCents: number;
  currency: string;
  paymentAccount: string;
  paymentNote: string;
  message: string;
  uploadToken: string;
};

type CategoryKey = "shampoo" | "conditioner" | "treatment" | "styling" | "uncategorized";

const paymentOptions: { value: PaymentMethod; label: string }[] = [
  { value: "mpay", label: "MPay" },
  { value: "boc", label: "中銀" },
  { value: "uepay", label: "UEPAY" },
  { value: "bank_transfer", label: "銀行轉賬" },
  { value: "stripe_card", label: "Visa / Mastercard (Stripe)" },
];

function createIdempotencyKey() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return `idemp_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function inferCategoryKey(p: { nameZh: string; nameEn: string }): CategoryKey {
  const s = `${p.nameZh} ${p.nameEn}`.toLowerCase();
  if (/shampoo|洗髮|洗发/.test(s)) {
    return "shampoo";
  }
  if (/treatment|mask|髮膜|发膜|髮油|发油|髮朮|修護|修护|treatment|ampoule|serum|精華|精华|膜/.test(s)) {
    return "treatment";
  }
  if (/conditioner|護髮|护发|护髮素|护发素|cream/.test(s)) {
    return "conditioner";
  }
  if (/hairspray|mousse|spray|styling|wax|gel|造型|噴霧|啫/.test(s)) {
    return "styling";
  }
  return "uncategorized";
}

function categoryText(t: Messages, key: CategoryKey) {
  switch (key) {
    case "shampoo":
      return t.catShampoo;
    case "conditioner":
      return t.catConditioner;
    case "treatment":
      return t.catTreatment;
    case "styling":
      return t.catStyling;
    default:
      return t.catUncategorized;
  }
}

function formatProductTitle(p: Product, locale: string) {
  if (locale === "zh-HK") {
    return p.nameZh;
  }
  return p.nameEn.toUpperCase();
}

function priceDisplay(cents: number) {
  return `HK$ ${(cents / 100).toFixed(2)}`;
}

function ProductBottlePlaceholder() {
  return (
    <div
      className="flex h-28 w-16 items-end justify-center sm:h-32 sm:w-20"
      style={{ filter: "drop-shadow(0 12px 20px rgba(0,0,0,0.12))" }}
    >
      <svg viewBox="0 0 64 120" className="h-full w-full text-neutral-400" aria-hidden>
        <rect x="18" y="0" width="28" height="10" rx="2" className="fill-current opacity-50" />
        <rect x="14" y="10" width="36" height="70" rx="4" className="fill-white stroke-neutral-300" strokeWidth="1" />
        <rect x="20" y="18" width="24" height="48" rx="1" className="fill-neutral-200/80" />
        <path d="M22 80 Q32 90 42 80 L40 110 Q32 115 24 110 Z" className="fill-white stroke-neutral-300" strokeWidth="1" />
      </svg>
    </div>
  );
}

function ShopProductCard({
  product,
  isSelected,
  onSelect,
  onAdd,
  t,
  locale,
}: {
  product: Product;
  isSelected: boolean;
  onSelect: () => void;
  onAdd: () => void;
  t: Messages;
  locale: string;
}) {
  const cat = inferCategoryKey(product);
  return (
    <article
      className={`text-center ${isSelected ? "ring-2 ring-zinc-900 ring-offset-2 ring-offset-white" : ""}`}
    >
      <button
        type="button"
        onClick={onSelect}
        className="w-full text-left"
        aria-pressed={isSelected}
        aria-label={formatProductTitle(product, locale)}
      >
        <div className="flex aspect-square items-center justify-center bg-neutral-100 p-6 sm:p-8">
          <ProductBottlePlaceholder />
        </div>
        <p className="mt-3 text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-400">
          {categoryText(t, cat)}
        </p>
        <h3 className="mt-2 text-sm font-bold uppercase leading-tight text-neutral-900 sm:text-sm">
          {formatProductTitle(product, locale)}
        </h3>
        <p className="mt-1 text-sm text-neutral-800">{priceDisplay(product.priceCents)}</p>
      </button>
      <button
        type="button"
        onClick={onAdd}
        className="mt-3 w-full border border-neutral-200 bg-white py-2.5 text-xs font-medium uppercase tracking-wider text-neutral-800 transition hover:border-zinc-900 hover:bg-zinc-50"
      >
        {t.shopAddToCart}
      </button>
    </article>
  );
}

export function ShopCheckout({ locale, initialProducts }: ShopCheckoutProps) {
  const t = getMessages((isSupportedLocale(locale) ? locale : "en") as Locale);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [selectedProductId, setSelectedProductId] = useState(initialProducts[0]?.id ?? "");
  const [sort, setSort] = useState<SortKey>("default");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mpay");
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [localPaymentData, setLocalPaymentData] = useState<LocalPaymentResponse | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [checkoutIdempotencyKey, setCheckoutIdempotencyKey] = useState(createIdempotencyKey);

  const selectedProduct = useMemo(
    () => products.find((item) => item.id === selectedProductId),
    [products, selectedProductId],
  );

  const sortedProducts = useMemo(() => {
    const list = [...products];
    if (sort === "price-asc") {
      list.sort((a, b) => a.priceCents - b.priceCents);
    } else if (sort === "price-desc") {
      list.sort((a, b) => b.priceCents - a.priceCents);
    }
    return list;
  }, [products, sort]);

  const n = sortedProducts.length;
  const rangeText = t.shopShowing.replace("{from}", n ? "1" : "0").replace("{to}", String(n)).replace("{total}", String(n));

  useEffect(() => {
    if (initialProducts.length > 0) {
      return;
    }
    async function loadProducts() {
      const response = await fetch("/api/shop/products");
      const data = (await response.json()) as { products?: Product[]; message?: string };
      if (data.products) {
        setProducts(data.products);
        setSelectedProductId(data.products[0]?.id ?? "");
        return;
      }
      setMessage(data.message ?? "Failed to load products.");
    }
    void loadProducts();
  }, [initialProducts.length]);

  function scrollToCheckout() {
    document.getElementById("shop-checkout")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleAddToCart(product: Product) {
    setSelectedProductId(product.id);
    setQuantity(1);
    scrollToCheckout();
  }

  async function onCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setLocalPaymentData(null);

    const idempotencyKey = checkoutIdempotencyKey;
    const response = await fetch("/api/shop/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({
        locale,
        paymentMethod,
        customerName,
        customerEmail,
        items: [{ productId: selectedProductId, quantity }],
      }),
    });

    const data = (await response.json()) as
      | { checkoutUrl?: string; orderId?: string; message?: string; uploadToken?: string }
      | LocalPaymentResponse;

    if (response.ok && "uploadToken" in data && data.uploadToken) {
      setLocalPaymentData(data as LocalPaymentResponse);
      setMessage((data as LocalPaymentResponse).message ?? "");
      setIsSubmitting(false);
      return;
    }

    if (data && "checkoutUrl" in data && data.checkoutUrl) {
      setCheckoutIdempotencyKey(createIdempotencyKey());
      window.location.href = data.checkoutUrl;
      return;
    }

    setMessage(
      (data as { message?: string })?.message ?? "Checkout is unavailable. Please try again.",
    );
    setIsSubmitting(false);
  }

  async function onUploadProof(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!localPaymentData || !proofFile) {
      setMessage("Please select screenshot file first.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("orderId", localPaymentData.orderId);
    formData.append("uploadToken", localPaymentData.uploadToken);
    formData.append("proof", proofFile);

    const response = await fetch("/api/shop/orders/upload-proof", {
      method: "POST",
      body: formData,
    });

    const data = (await response.json()) as { message?: string; proofViewUrl?: string };
    setMessage(data.message ?? "Proof uploaded.");
    if (response.ok) {
      setCheckoutIdempotencyKey(createIdempotencyKey());
    }
    setIsUploading(false);
  }

  const subtotalCents = selectedProduct ? selectedProduct.priceCents * quantity : 0;
  const inputClass =
    "rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 shadow-sm focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700";
  const labelClass = "flex flex-col gap-1.5 text-sm text-neutral-700";

  return (
    <div className="mt-6 space-y-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-500">{rangeText}</p>
        <div className="w-full sm:w-56 sm:shrink-0">
          <label className="sr-only" htmlFor="shop-sort">
            Sort
          </label>
          <select
            id="shop-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="w-full cursor-pointer appearance-none rounded-md border border-neutral-300 bg-neutral-100/80 py-2 pl-3 pr-8 text-sm text-neutral-800 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23737373' d='M3 4.5L6 7.5L9 4.5'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 0.75rem center",
            }}
          >
            <option value="default">{t.shopSortDefault}</option>
            <option value="price-asc">{t.shopSortPriceAsc}</option>
            <option value="price-desc">{t.shopSortPriceDesc}</option>
          </select>
        </div>
      </div>

      {n === 0 ? (
        <div className="mt-10 space-y-3 py-12 text-center">
          <p className="text-sm text-neutral-600">{message || t.shopNoProducts}</p>
          <p className="text-sm text-neutral-500">{t.shopEmptyCta}</p>
        </div>
      ) : (
        <ul className="mt-10 grid list-none grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {sortedProducts.map((product) => (
            <li key={product.id}>
              <ShopProductCard
                product={product}
                isSelected={product.id === selectedProductId}
                onSelect={() => setSelectedProductId(product.id)}
                onAdd={() => handleAddToCart(product)}
                t={t}
                locale={locale}
              />
            </li>
          ))}
        </ul>
      )}

      <div id="shop-checkout" className="scroll-mt-24 border-t border-neutral-200/90 bg-neutral-50/90 px-0 py-10 sm:py-12">
        <h3 className={`text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500`}>
          {t.shopCheckoutTitle}
        </h3>
        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={onCheckout}>
          <div className="md:col-span-2 rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-800 shadow-sm">
            <p className="font-medium text-neutral-900">Order summary 訂單摘要</p>
            {selectedProduct ? (
              <p className="mt-1">
                {locale === "zh-HK" ? selectedProduct.nameZh : selectedProduct.nameEn} × {quantity} →
                {priceDisplay(subtotalCents)} {selectedProduct.currency.toUpperCase()}
              </p>
            ) : (
              <p className="mt-1 text-neutral-500">Select a product to see totals.</p>
            )}
            {paymentMethod !== "stripe_card" ? (
              <p className="mt-2 text-sm text-neutral-500">
                本地支付需人工審核，上傳截圖後一般於辦公時間內處理。 / Local bank transfers are verified manually
                during business hours.
              </p>
            ) : null}
          </div>

          <label className={`${labelClass} md:col-span-2`}>
            <span>Product</span>
            <select
              className={inputClass}
              value={selectedProductId}
              onChange={(event) => setSelectedProductId(event.target.value)}
            >
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {locale === "zh-HK" ? product.nameZh : product.nameEn} — {priceDisplay(product.priceCents)}
                </option>
              ))}
            </select>
          </label>

          <label className={labelClass}>
            <span>Payment</span>
            <select
              className={inputClass}
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
            >
              {paymentOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className={labelClass}>
            <span>Quantity</span>
            <input
              className={inputClass}
              type="number"
              min={1}
              max={10}
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
            />
          </label>

          <label className={labelClass}>
            <span>Name</span>
            <input
              className={inputClass}
              required
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              minLength={2}
            />
          </label>

          <label className={labelClass}>
            <span>Email</span>
            <input
              className={inputClass}
              type="email"
              required
              value={customerEmail}
              onChange={(event) => setCustomerEmail(event.target.value)}
            />
          </label>

          <button
            className="inline-flex w-fit rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60"
            type="submit"
            disabled={isSubmitting || !selectedProductId}
          >
            {isSubmitting
              ? "Processing..."
              : paymentMethod === "stripe_card"
                ? "Pay with Visa / Mastercard"
                : "Create Local Payment Order"}
          </button>
          {message ? <p className="text-sm text-neutral-600 md:col-span-2">{message}</p> : null}
        </form>

        {localPaymentData ? (
          <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-800 shadow-sm">
            <p>Order ID: {localPaymentData.orderId}</p>
            <p>
              Amount: {(localPaymentData.amountCents / 100).toFixed(2).toUpperCase()}{" "}
              {localPaymentData.currency.toUpperCase()}
            </p>
            <p>收款帳號: {localPaymentData.paymentAccount}</p>
            <p>付款說明: {localPaymentData.paymentNote}</p>
            <p className="mt-2 text-neutral-500">Upload key is required to attach proof. Keep this page until upload completes.</p>

            <form className="mt-4 flex flex-col gap-3" onSubmit={onUploadProof}>
              <label className="flex flex-col gap-2">
                <span>上傳付款截圖 Upload Payment Screenshot</span>
                <input
                  className="text-sm"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={(event) => setProofFile(event.target.files?.[0] ?? null)}
                />
              </label>
              <button
                className="inline-flex w-fit rounded-full border border-neutral-400 px-5 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-100"
                type="submit"
                disabled={isUploading || !proofFile}
              >
                {isUploading ? "Uploading..." : "Submit Payment Proof"}
              </button>
            </form>
          </div>
        ) : null}
      </div>
    </div>
  );
}
