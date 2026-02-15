"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, LogIn, Users } from "lucide-react";

type Membership = {
    id: string;
    role: string;
    club: {
        id: string;
        name: string;
        description: string | null;
        inviteCode: string;
        _count: { members: number };
    };
};

export default function DashboardPage() {
    const router = useRouter();
    const [memberships, setMemberships] = useState<Membership[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch("/api/clubs/my")
            .then((res) => res.json())
            .then((data) => {
                setMemberships(data);
                setIsLoading(false);
            });
    }, []);

    const roleLabel: Record<string, string> = {
        OWNER: "대표",
        ADMIN: "운영진",
        MEMBER: "회원",
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-slate-900">내 동아리</h1>
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push("/dashboard/join")}
                    >
                        <LogIn className="w-4 h-4 mr-1" />
                        가입
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => router.push("/dashboard/create")}
                    >
                        <Plus className="w-4 h-4 mr-1" />
                        만들기
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <p className="text-slate-400 text-sm">불러오는 중...</p>
            ) : memberships.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">아직 가입한 동아리가 없어요.</p>
                    <p className="text-sm">동아리를 만들거나 초대 코드로 가입해보세요.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {memberships.map((m) => (
                        <Card
                            key={m.id}
                            className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => router.push(`/dashboard/clubs/${m.club.id}`)}
                        >
                            <CardHeader className="pb-2 pt-4 px-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">{m.club.name}</CardTitle>
                                    <Badge variant="secondary">{roleLabel[m.role]}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="px-4 pb-4">
                                {m.club.description && (
                                    <p className="text-sm text-slate-500 mb-2">{m.club.description}</p>
                                )}
                                <p className="text-xs text-slate-400">
                                    멤버 {m.club._count.members}명
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}