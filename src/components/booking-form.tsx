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

export function BookingForm({ locale, initialSlots, defaultServiceId }: BookingFormProps) {
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
      const response = await fetch(`/api/booking/slots?service=${selectedService}`);
      if (!response.ok) {
        setMessage("Could not load time slots. Please try again later.");
        return;
      }
      const data = (await response.json()) as { slots: Slot[] };
      setSlots(data.slots);
      setSelectedSlot(data.slots[0]?.id ?? "");
    }
    void loadSlots();
  }, [selectedService]);

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

    const data = (await response.json()) as { message: string };
    setMessage(data.message);
    if (response.ok) {
      setIdempotencyKey(createIdempotencyKey());
    }
    setIsSubmitting(false);
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
        >
          {slots.map((slot) => (
            <option key={slot.id} value={slot.id}>
              {slot.label}
            </option>
          ))}
        </select>
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
