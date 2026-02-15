"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    CalendarDays,
    ClipboardList,
    Megaphone,
} from "lucide-react";

const navItems = [
    { label: "홈", href: "/dashboard", icon: LayoutDashboard },
    { label: "회원", href: "/dashboard/members", icon: Users },
    { label: "출석", href: "/dashboard/attendance", icon: ClipboardList },
    { label: "일정", href: "/dashboard/schedule", icon: CalendarDays },
    { label: "게시판", href: "/dashboard/board", icon: Megaphone },
];

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="h-16 bg-white border-t flex items-center justify-around">
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center gap-1 px-3 py-2 rounded-md transition-colors",
                            isActive
                                ? "text-slate-900"
                                : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        <Icon className="w-5 h-5"/>
                        <span className="text-xs font-medium">{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}