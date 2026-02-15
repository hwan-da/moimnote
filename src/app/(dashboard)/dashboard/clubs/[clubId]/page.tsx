"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Copy } from "lucide-react";
import { toast } from "sonner";

type Club = {
    id: string;
    name: string;
    description: string | null;
    inviteCode: string;
    _count: { members: number };
};

export default function ClubDetailPage() {
    const { clubId } = useParams();
    const router = useRouter();
    const [club, setClub] = useState<Club | null>(null);

    useEffect(() => {
        fetch(`/api/clubs/${clubId}`)
            .then((res) => res.json())
            .then(setClub);
    }, [clubId]);

    function copyInviteCode() {
        if (!club) return;
        navigator.clipboard.writeText(club.inviteCode);
        toast.success("초대 코드가 복사됐어요!");
    }

    if (!club) return <p className="text-slate-400 text-sm">불러오는 중...</p>;

    return (
        <div className="space-y-4">
            <button
                onClick={() => router.back()}
                className="flex items-center text-sm text-slate-500 hover:text-slate-900"
            >
                <ChevronLeft className="w-4 h-4" />
                뒤로
            </button>

            <Card>
                <CardHeader>
                    <CardTitle>{club.name}</CardTitle>
                    {club.description && (
                        <p className="text-sm text-slate-500">{club.description}</p>
                    )}
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">멤버</span>
                        <Badge variant="secondary">{club._count.members}명</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">초대 코드</span>
                        <button
                            onClick={copyInviteCode}
                            className="flex items-center gap-1 text-sm font-mono bg-slate-100 px-2 py-1 rounded hover:bg-slate-200"
                        >
                            {club.inviteCode.slice(0, 8)}...
                            <Copy className="w-3 h-3" />
                        </button>
                    </div>
                    <Button
                        className="w-full mt-2"
                        onClick={() => router.push(`/dashboard/members?clubId=${clubId}`)}
                    >
                        회원 관리
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => router.push(`/dashboard/attendance?clubId=${clubId}`)}
                    >
                        출석 관리
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => router.push(`/dashboard/schedule?clubId=${clubId}`)}
                    >
                        일정 관리
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => router.push(`/dashboard/board?clubId=${clubId}`)}
                    >
                        게시판
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}