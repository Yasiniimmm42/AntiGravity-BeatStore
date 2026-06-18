import { LicenseType } from "@prisma/client";

export const LICENSE_ORDER: LicenseType[] = ["BASIC", "PREMIUM", "UNLIMITED"];

export const LICENSE_INFO: Record<LicenseType, { label: string; tr: string; en: string; summary: string }> = {
  BASIC: {
    label: "Basic",
    tr: "/licenses/basic-tr.pdf",
    en: "/licenses/basic-en.pdf",
    summary: "MP3 • 50.000 stream • 1 video • Ticari olmayan canlı performans",
  },
  PREMIUM: {
    label: "Premium",
    tr: "/licenses/premium-tr.pdf",
    en: "/licenses/premium-en.pdf",
    summary: "WAV • 500.000 stream • 2 video • $2000'a kadar ücretli performans",
  },
  UNLIMITED: {
    label: "Unlimited",
    tr: "/licenses/unlimited-tr.pdf",
    en: "/licenses/unlimited-en.pdf",
    summary: "WAV + Stems • Sınırsız stream / video / performans / radyo",
  },
};
