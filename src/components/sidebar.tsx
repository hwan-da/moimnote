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
    {
        label: "대시보드",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "회원 관리",
        href: "/dashboard/members",
        icon: Users,
    },
    {
        label: "출석 관리",
        href: "/dashboard/attendance",
        icon: ClipboardList,
    },
    {
        label: "일정 관리",
        href: "/dashboard/schedule",
        icon: CalendarDays,
    },
    {
        label: "게시판",
        href: "/dashboard/board",
        icon: Megaphone,
    },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-60 min-h-screen bg-white border-r flex flex-col">
            <div className="h-16 flex items-center px-6 border-b">
                <span className="font-bold text-lg">동아리 매니저</span>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-slate-100 text-slate-900"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}