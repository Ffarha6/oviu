import { Menu, Search, Bell, MessageSquare, ChevronDown } from "lucide-react";

export default function Topbar({ onOpenMobileNav }) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-4 bg-background/90 backdrop-blur border-b border-primary/10 px-4 sm:px-6 py-3">
      {/* Mobile menu toggle */}
      <button
        onClick={onOpenMobileNav}
        className="lg:hidden p-2 rounded-lg text-primary hover:bg-primary/5"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="flex items-center gap-2 bg-surface rounded-xl px-3.5 py-2.5 text-primary/50">
          <Search size={17} />
          <input
            type="text"
            placeholder="ابحثي عن أي شيء..."
            className="bg-transparent outline-none text-sm flex-1 text-primary placeholder:text-primary/40"
          />
          <kbd className="hidden sm:flex items-center gap-0.5 text-[11px] text-primary/40 border border-primary/10 rounded px-1.5 py-0.5">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="flex-1" />

      {/* Notifications */}
      <IconBadgeButton icon={Bell} count={5} />
      <IconBadgeButton icon={MessageSquare} count={3} />

      {/* Admin profile */}
      <button className="flex items-center gap-2.5 pl-2 pr-1 py-1 rounded-xl hover:bg-primary/5 transition">
        <img
          src="https://i.pravatar.cc/64?img=13"
          alt="Admin avatar"
          className="w-9 h-9 rounded-full object-cover"
        />
        <div className="hidden sm:block text-right leading-tight">
          <p className="text-sm font-semibold text-primary">أدمن</p>
          <p className="text-[11px] text-secondary">مشرف عام</p>
        </div>
        <ChevronDown size={16} className="text-primary/40 hidden sm:block" />
      </button>
    </header>
  );
}

function IconBadgeButton({ icon: Icon, count }) {
  return (
    <button
      className="relative w-10 h-10 rounded-xl flex items-center justify-center text-primary/70 hover:bg-primary/5 transition"
      aria-label="Notifications"
    >
      <Icon size={19} />
      {count ? (
        <span className="absolute -top-1 -right-1 bg-secondary text-primary text-[10px] font-bold w-4.5 h-4.5 min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center">
          {count}
        </span>
      ) : null}
    </button>
  );
}