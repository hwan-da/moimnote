"use client";

import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
    const { data: session } = useSession();
    const user = session?.user;
    const initials = user?.name?.slice(0, 2) ?? "??";

    return (
        <header className="h-14 border-b bg-white flex items-center justify-between px-4 sticky top-0 z-40">
            <span className="font-bold text-lg">동아리 매니저</span>
            <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
                    <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-sm bg-slate-100">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem className="font-medium text-slate-700">
                        {user?.name}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="text-red-500 cursor-pointer"
                        onClick={() => signOut({ callbackUrl: "/login" })}
                    >
                        로그아웃
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
}