"use client";

import { useState } from "react";
import Link from "next/link";
import { APP } from "@/lib/i18n-app";
import type { LanguageCode } from "@/lib/languages";
import { BagIcon, MapPinIcon, PhoneIcon } from "./Icons";

const DEFAULT_BRING: Record<LanguageCode, string[]> = {
  en: ["Photo ID", "Proof of income (pay stubs or letter from work)", "Proof of address (lease or utility bill)", "The letter you received"],
  es: ["Identificación con foto", "Prueba de ingresos (talones de pago o carta del trabajo)", "Prueba de domicilio (contrato o factura)", "La carta que recibió"],
  zh: ["带照片的身份证件", "收入证明（工资单或雇主信）", "住址证明（租约或水电账单）", "您收到的那封信"],
  tl: ["Photo ID", "Patunay ng kita (pay stubs o sulat mula sa trabaho)", "Patunay ng address (lease o utility bill)", "Ang sulat na natanggap mo"],
  vi: ["Giấy tờ tùy thân có ảnh", "Giấy chứng thu nhập (phiếu lương hoặc thư từ chủ)", "Giấy chứng địa chỉ (hợp đồng thuê hoặc hóa đơn)", "Lá thư bạn nhận được"],
};

/**
 * After Costa answers: clear paths to a real person — 211, enrollment help, what to bring.
 * Keeps the product deployable rather than “AI only.”
 */
export function HumanHandoff({
  lang,
  program,
  documents = [],
  letterPhone,
}: {
  lang: LanguageCode;
  program?: "medi-cal" | "calfresh" | "wic" | "caleitc" | "disaster" | "other" | "unknown";
  documents?: string[];
  letterPhone?: string | null;
}) {
  const h = APP[lang].handoff;
  const [showBring, setShowBring] = useState(false);
  const bring = documents.length > 0 ? documents : DEFAULT_BRING[lang];
  const topic = program && program !== "unknown" && program !== "other" ? program : "other";
  const letterTel = letterPhone?.replace(/[^\d+]/g, "");

  return (
    <section className="flex flex-col gap-3 rounded-md border border-pine-800/20 bg-pine-50/60 p-4 sm:p-5">
      <h2 className="text-[21px] leading-snug text-pine-950">{h.title}</h2>
      <p className="text-[15px] leading-relaxed text-stone-600">{h.body}</p>

      <ul className="flex flex-col gap-2">
        <li>
          <a
            href="tel:211"
            className="flex min-h-14 items-center gap-3 rounded-md bg-pine-800 px-4 text-[17px] font-semibold text-white active:bg-pine-900"
          >
            <PhoneIcon size={22} />
            <span className="flex flex-col items-start">
              <span>{h.call211}</span>
              <span className="text-[13px] font-normal text-pine-100">{h.call211Body}</span>
            </span>
          </a>
        </li>
        {letterTel && (
          <li>
            <a
              href={`tel:${letterTel}`}
              className="flex min-h-14 items-center gap-3 rounded-md border-2 border-pine-800/30 bg-white px-4 text-[17px] font-semibold text-pine-950 active:bg-stone-100"
            >
              <PhoneIcon size={22} />
              <span className="flex flex-col items-start">
                <span>{h.callLetter}</span>
                <span className="text-[13px] font-normal text-stone-500">{letterPhone}</span>
              </span>
            </a>
          </li>
        )}
        <li>
          <Link
            href={`/help?topic=${topic}`}
            className="flex min-h-14 items-center gap-3 rounded-md border-2 border-pine-800/30 bg-white px-4 text-[17px] font-semibold text-pine-950 active:bg-stone-100"
          >
            <MapPinIcon size={22} />
            <span>{h.findEnrollment}</span>
          </Link>
        </li>
        <li>
          <button
            type="button"
            onClick={() => setShowBring((v) => !v)}
            aria-expanded={showBring}
            className="flex min-h-14 w-full items-center gap-3 rounded-md border-2 border-pine-800/30 bg-white px-4 text-left text-[17px] font-semibold text-pine-950 active:bg-stone-100"
          >
            <BagIcon size={22} />
            <span>{h.whatToBring}</span>
          </button>
        </li>
      </ul>

      {showBring && (
        <div className="rounded-md border border-stone-300 bg-white px-4 py-3">
          <p className="text-[13px] font-semibold uppercase tracking-wider text-poppy-700">{h.whatToBringTitle}</p>
          <ul className="mt-2 flex flex-col gap-2">
            {bring.map((item) => (
              <li key={item} className="flex gap-2 text-[15px] leading-snug text-stone-800">
                <span aria-hidden className="text-pine-800">
                  ·
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[13px] leading-relaxed text-stone-500">{h.whatToBringNote}</p>
        </div>
      )}
    </section>
  );
}
