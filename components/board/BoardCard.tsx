import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Users, FileText } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface Board {
  id: string;
  name: string;
  description: string | null;
  emoji: string;
  color: string;
  isPublic: boolean;
  _count: { members: number; posts: number };
  posts?: { id: string }[];
}

interface BoardCardProps {
  board: Board;
  isOwn?: boolean;
}

export function BoardCard({ board, isOwn }: BoardCardProps) {
  const { t } = useLanguage();
  const newPostsCount = board.posts?.length ?? 0;

  return (
    <div className="bg-white border-2 border-cb-navy rounded shadow-hard card-hover group">
      {/* Color Strip Header */}
      <div
        className="relative h-20 rounded-t flex items-center justify-center border-b-2 border-cb-navy"
        style={{ backgroundColor: board.color }}
      >
        {/* Memphis pattern overlay */}
        <div
          className="absolute inset-0 rounded-t opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle, #1A1A2E 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />
        <span className="text-4xl relative z-10">{board.emoji}</span>
        {newPostsCount > 0 && (
          <span className="absolute top-2 right-2 bg-cb-red text-white text-xs font-poppins font-bold px-2 py-0.5 rounded border border-white">
            {newPostsCount} {t.dashboard.page.active}
          </span>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4">
        <h3 className="font-poppins font-bold text-base text-cb-navy line-clamp-1">
          {board.name}
        </h3>
        {board.description && (
          <p className="font-inter text-xs text-cb-gray mt-1 line-clamp-2">
            {board.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-3 mt-3 text-cb-gray font-inter text-xs">
          <span className="flex items-center gap-1">
            <Users size={12} /> {board._count.members} {t.dashboard.page.citizens}
          </span>
          <span className="flex items-center gap-1">
            <FileText size={12} /> {board._count.posts} {t.dashboard.page.postsShort}
          </span>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-4 pb-4 flex items-center justify-between">
        <Badge variant={isOwn ? "green" : "gray"}>
          {isOwn ? t.dashboard.page.myBoard : t.dashboard.page.publicBoard}
        </Badge>
        {isOwn ? (
          <Link href={`/board/${board.id}`}>
            <Button size="sm">{t.dashboard.page.manageBoard} →</Button>
          </Link>
        ) : (
          <Button size="sm" variant="mint">
            + {t.dashboard.page.join}
          </Button>
        )}
      </div>
    </div>
  );
}
