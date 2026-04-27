"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function HeaderActions({ boardName }: { boardName?: string }) {
  const { t } = useLanguage();

  return (
    <Link href={boardName ? "#create-post" : "/board/new"}>
      <Button size="sm" className="gap-1">
        <Plus size={14} />
        {boardName ? t.header.postAnnouncement : t.header.createBoard}
      </Button>
    </Link>
  );
}
