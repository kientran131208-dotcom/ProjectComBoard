"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function DashboardHeaderTitle() {
  const { t } = useLanguage();
  return (
    <h1 className="font-headline font-bold text-lg text-[#2d2d42]">
      {t.dashboard.page.myCommunities}
    </h1>
  );
}
