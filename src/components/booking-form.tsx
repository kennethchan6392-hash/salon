"use client";

import { FormEvent, useEffect, useState } from "react";

type Slot = {
  id: string;
  label: string;
};

type BookingFormProps = {
  locale: string;
  initialSlots: Slot[];
  defaultServiceId: string;
  /** Shown when there are no bookable slots (e.g. DB empty or all full). */
  noSlotsHint: string;
};

const services = [
  { id: "haircut", label: "Haircut / 洗剪造型" },
  { id: "color", label: "Color / 染髮" },
  { id: "perm", label: "Perm / 燙髮" },
];

function createIdempotencyKey() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return `idemp_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function digitsOnly(phone: string) {
  return phone.replace(/\D/g, "");
}

function isValidPhoneDigits(phone: string) {
  const d = digitsOnly(phone);
  return d.length >= 6 && d.length <= 15;
}

export function BookingForm({ locale, initialSlots, defaultServiceId, noSlotsHint }: BookingFormProps) {
  const [selectedService, setSelectedService] = useState(defaultServiceId);
  const [selectedSlot, setSelectedSlot] = useState(initialSlots[0]?.id ?? "");
  const [slots, setSlots] = useState<Slot[]>(initialSlots);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState(createIdempotencyKey);

  useEffect(() => {
    async function loadSlots() {
      try {
        const response = await fetch(`/api/booking/slots?service=${selectedService}`);
        if (!response.ok) {
          setMessage("Could not load time slots. Please try again later.");
          setSlots([]);
          setSelectedSlot("");
          return;
        }
        const raw = await response.text();
        let data: { slots: Slot[] };
        try {
          data = raw ? (JSON.parse(raw) as { slots: Slot[] }) : { slots: [] };
        } catch {
          setMessage("Could not load time slots. Please try again later.");
          setSlots([]);
          setSelectedSlot("");
          return;
        }
        setSlots(data.slots);
        setSelectedSlot(data.slots[0]?.id ?? "");
        setMessage("");
      } catch {
        setMessage(
          locale === "zh-HK"
            ? "無法載入時段（網絡或伺服器問題）。請稍後再試。"
            : "Could not load time slots (network or server). Please try again.",
        );
        setSlots([]);
        setSelectedSlot("");
      }
    }
    void loadSlots();
  }, [selectedService, locale]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValidPhoneDigits(phone)) {
      setMessage(
        locale === "zh-HK"
          ? "請輸入有效聯絡電話（6–15 位數字，可含空格或 +853）。"
          : "Please enter a valid phone number (6–15 digits; spaces or + country code are OK).",
      );
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          locale,
          serviceId: selectedService,
          slotId: selectedSlot,
          customerName: name,
          customerPhone: digitsOnly(phone),
        }),
      });

      const raw = await response.text();
      let data: { message: string };
      try {
        data = raw ? (JSON.parse(raw) as { message: string }) : { message: "Unknown error." };
      } catch {
        data = { message: raw.slice(0, 200) || "Invalid response from server." };
      }
      setMessage(data.message);
      if (response.ok) {
        setIdempotencyKey(createIdempotencyKey());
      }
    } catch {
      setMessage(
        locale === "zh-HK"
          ? "無法提交預約，請檢查網絡後再試。"
          : "Could not submit booking. Check your connection and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
      <p className="md:col-span-2 text-sm text-zinc-400">
        {locale === "zh-HK"
          ? "提交後我們會盡快以電話或訊息確認。若該時段額滿，請改選其他時間。"
          : "We will confirm by phone or message. If a slot is full, please pick another time."}
      </p>
      <label className="flex flex-col gap-2 text-sm">
        <span>Service</span>
        <select
          className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2"
          value={selectedService}
          onChange={(event) => setSelectedService(event.target.value)}
        >
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span>Time Slot</span>
        <select
          className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2"
          value={selectedSlot}
          onChange={(event) => setSelectedSlot(event.target.value)}
          aria-invalid={slots.length === 0}
        >
          {slots.map((slot) => (
            <option key={slot.id} value={slot.id}>
              {slot.label}
            </option>
          ))}
        </select>
        {slots.length === 0 ? (
          <p className="text-sm leading-relaxed text-amber-200/90" role="status">
            {noSlotsHint}
          </p>
        ) : null}
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span>Name</span>
        <input
          className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          minLength={2}
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span>Phone 電話</span>
        <input
          className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder={locale === "zh-HK" ? "例：28304175 或 6xxxxxxx" : "e.g. 28304175 or +853 …"}
        />
      </label>
      <button
        className="inline-flex w-fit rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-zinc-950 disabled:opacity-60"
        type="submit"
        disabled={isSubmitting || !selectedSlot}
      >
        {isSubmitting ? "Submitting..." : "Confirm Booking"}
      </button>
      {message ? <p className="text-sm text-zinc-300 md:col-span-2">{message}</p> : null}
    </form>
  );
}
