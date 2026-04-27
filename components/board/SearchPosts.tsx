"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Search, X, MapPin, AlignLeft, Image as ImageIcon, Link as LinkIcon, AlertCircle, User, Zap } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface SearchPostsProps {
  posts: any[];
  onNavigate: (x: number, y: number) => void;
  onSelectPost: (id: string) => void;
}

type FilterType = 'all' | 'notification' | 'image' | 'link' | 'author';

const SearchPosts = ({ posts, onNavigate, onSelectPost }: SearchPostsProps) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  const displayPosts = useMemo(() => {
    if (query.trim() === "") return [];
    
    return posts.filter(post => {
      const q = query.toLowerCase();
      
      // Matchers
      const matchTitle = post.title?.toLowerCase().includes(q);
      const matchContent = post.content?.toLowerCase().includes(q);
      const matchAuthor = post.author?.name?.toLowerCase().includes(q);
      
      // 1. Filter Logic based on User Request:
      // "Thông báo" tab searches specifically by Title
      if (activeFilter === 'notification') {
        return matchTitle; 
      }
      
      if (activeFilter === 'author') {
        return matchAuthor;
      }
      
      if (activeFilter === 'image') {
        return !!post.image && (matchTitle || matchContent || matchAuthor);
      }
      
      if (activeFilter === 'link') {
        return !!post.link && (matchTitle || matchContent || matchAuthor);
      }
      
      // 'all' searches everything
      return matchTitle || matchContent || matchAuthor;
    });
  }, [posts, query, activeFilter]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleResultClick = (post: any) => {
    onNavigate(post.x + (post.width || 300) / 2, post.y + (post.height || 400) / 2);
    onSelectPost(post.id);
    setIsOpen(false);
    setQuery("");
  };

  const filters: { id: FilterType, label: string, icon: any }[] = [
    { id: 'all', label: t.search.all, icon: Zap },
    { id: 'notification', label: t.search.notification, icon: AlignLeft },
    { id: 'image', label: t.search.image, icon: ImageIcon },
    { id: 'link', label: t.search.link, icon: LinkIcon },
    { id: 'author', label: t.search.author, icon: User },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 border-2 border-black transition-all shadow-[2px_2px_0_0_#000000] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] ${isOpen ? 'bg-black text-white' : 'bg-white text-black hover:bg-slate-50'}`}
        title={t.header.search}
      >
        {isOpen ? <X size={20} /> : <Search size={20} />}
      </button>

      {isOpen && (
        <div className="absolute top-12 right-0 w-80 md:w-[450px] bg-white border-4 border-black shadow-[8px_8px_0_0_#000000] z-[1000] animate-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b-2 border-black bg-slate-50">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                ref={inputRef}
                type="text"
                placeholder={activeFilter === 'notification' ? t.search.placeholderAnnouncement : t.search.placeholder}
                className="w-full pl-10 pr-4 py-2 bg-white border-2 border-black focus:outline-none focus:ring-0 placeholder:text-slate-400 font-bold"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Escape' && setIsOpen(false)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {filters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-wider border-2 border-black transition-all
                    ${activeFilter === f.id 
                      ? 'bg-black text-white translate-x-[1px] translate-y-[1px] shadow-none' 
                      : 'bg-white text-black hover:bg-zinc-100 shadow-[2px_2px_0_0_#000]'}`}
                >
                  <f.icon size={12} />
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {query.trim() !== "" && displayPosts.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <AlertCircle className="mx-auto mb-3 opacity-20" size={48} />
                <p className="font-bold italic">{t.search.noResults.replace('{type}', activeFilter === 'notification' ? t.search.notification : t.search.all)}</p>
                <p className="text-xs uppercase mt-2 opacity-50 tracking-widest text-[#F24236]">{t.search.tryAll}</p>
              </div>
            ) : query.trim() === "" ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-white border-2 border-black border-dashed flex items-center justify-center mx-auto mb-4 scale-75 rotate-3">
                   <Search className="text-black/20" size={32} />
                </div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{t.search.searching}</p>
              </div>
            ) : (
              <div className="divide-y-2 divide-black/5">
                {displayPosts.map((post) => (
                  <button
                    key={post.id}
                    onClick={() => handleResultClick(post)}
                    className="w-full p-4 flex items-start gap-4 hover:bg-[#FFF8F6] transition-colors text-left group"
                  >
                    <div className="mt-1 shrink-0 w-10 h-10 border-2 border-black flex items-center justify-center bg-white shadow-[2px_2px_0_0_#000] group-hover:bg-[#FFD166] group-hover:-translate-x-[2px] group-hover:-translate-y-[2px] transition-all">
                      {post.image ? <ImageIcon size={20} /> : post.link ? <LinkIcon size={20} /> : <AlignLeft size={20} />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <span className="bg-black text-white text-[8px] font-black px-2 py-0.5 uppercase tracking-widest">
                          {post.image ? t.types.image : post.link ? t.types.link : t.types.announcement}
                        </span>
                        <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
                          <MapPin size={10} />
                          <span>P: {Math.round(post.x)}, {Math.round(post.y)}</span>
                        </div>
                      </div>
                      
                      <p className="font-black text-sm line-clamp-1 mb-0.5 group-hover:text-[#F24236] transition-colors uppercase tracking-tight">
                        {post.title || t.search.noTitle}
                      </p>
                      <p className="font-medium text-xs line-clamp-1 mb-2 text-slate-500 italic">
                        {post.content || t.search.noContent}
                      </p>
                      
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full border border-black bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                          {post.author?.image ? (
                            <img src={post.author.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[8px] font-black">{post.author?.name?.charAt(0)}</span>
                          )}
                        </div>
                        <span className="text-[10px] font-black text-slate-600 truncate">{post.author?.name || t.search.anonymous}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {displayPosts.length > 0 && (
            <div className="p-3 bg-black text-white text-[10px] font-black text-center uppercase tracking-[0.2em]">
              {t.search.results} ({displayPosts.length})
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPosts;
