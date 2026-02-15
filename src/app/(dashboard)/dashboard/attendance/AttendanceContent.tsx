"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Member = {
    id: string;
    role: string;
    user: { id: string; name: string };
};

type Attendance = {
    id: string;
    userId: string;
    status: string;
    user: { id: string; name: string };
};

const statusLabel: Record<string, string> = {
    PRESENT: "출석",
    ABSENT: "결석",
    LATE: "지각",
};

const statusColor: Record<string, "default" | "destructive" | "secondary"> = {
    PRESENT: "default",
    ABSENT: "destructive",
    LATE: "secondary",
};

function formatDate(date: Date) {
    return date.toISOString().split("T")[0];
}

function formatDisplayDate(date: Date) {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

export default function AttendancePage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const clubId = searchParams.get("clubId");

    const [currentDate, setCurrentDate] = useState(new Date());
    const [members, setMembers] = useState<Member[]>([]);
    const [attendances, setAttendances] = useState<Attendance[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!clubId) return;
        fetchMembers();
    }, [clubId]);

    useEffect(() => {
        if (!clubId) return;
        fetchAttendances();
    }, [clubId, currentDate]);

    async function fetchMembers() {
        const res = await fetch(`/api/clubs/${clubId}/members`);
        const data = await res.json();
        setMembers(data);
        setIsLoading(false);
    }

    async function fetchAttendances() {
        const res = await fetch(
            `/api/clubs/${clubId}/attendance?date=${formatDate(currentDate)}`
        );
        const data = await res.json();
        setAttendances(data);
    }

    function getStatus(userId: string) {
        const a = attendances.find((a) => a.userId === userId);
        return a?.status ?? "ABSENT";
    }

    async function updateStatus(userId: string, status: string) {
        const res = await fetch(`/api/clubs/${clubId}/attendance`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId,
                date: formatDate(currentDate),
                status,
            }),
        });

        if (!res.ok) {
            toast.error("출석 저장 중 오류가 발생했어요.");
            return;
        }

        toast.success("출석이 저장됐어요.");
        fetchAttendances();
    }

    function prevDay() {
        const d = new Date(currentDate);
        d.setDate(d.getDate() - 1);
        setCurrentDate(d);
    }

    function nextDay() {
        const d = new Date(currentDate);
        d.setDate(d.getDate() + 1);
        setCurrentDate(d);
    }

    const presentCount = members.filter(
        (m) => getStatus(m.user.id) === "PRESENT"
    ).length;
    const lateCount = members.filter(
        (m) => getStatus(m.user.id) === "LATE"
    ).length;
    const absentCount = members.filter(
        (m) => getStatus(m.user.id) === "ABSENT"
    ).length;

    if (!clubId) {
        return (
            <div className="text-center py-16 text-slate-400">
                <p className="text-sm">동아리를 먼저 선택해주세요.</p>
                <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => router.push("/dashboard")}
                >
                    동아리 목록으로
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h1 className="text-xl font-bold text-slate-900">출석 관리</h1>

            {/* 날짜 선택 */}
            <div className="flex items-center justify-between bg-white border rounded-lg px-4 py-3">
                <button onClick={prevDay} className="text-slate-400 hover:text-slate-700">
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-medium">
          {formatDisplayDate(currentDate)}
        </span>
                <button onClick={nextDay} className="text-slate-400 hover:text-slate-700">
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* 통계 */}
            <div className="grid grid-cols-3 gap-2">
                <Card>
                    <CardContent className="py-3 px-4 text-center">
                        <p className="text-2xl font-bold text-slate-900">{presentCount}</p>
                        <p className="text-xs text-slate-400">출석</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="py-3 px-4 text-center">
                        <p className="text-2xl font-bold text-slate-900">{lateCount}</p>
                        <p className="text-xs text-slate-400">지각</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="py-3 px-4 text-center">
                        <p className="text-2xl font-bold text-slate-900">{absentCount}</p>
                        <p className="text-xs text-slate-400">결석</p>
                    </CardContent>
                </Card>
            </div>

            {/* 회원 출석 목록 */}
            {isLoading ? (
                <p className="text-slate-400 text-sm">불러오는 중...</p>
            ) : members.length === 0 ? (
                <p className="text-center py-16 text-slate-400 text-sm">
                    등록된 회원이 없어요.
                </p>
            ) : (
                <div className="space-y-2">
                    {members.map((m) => {
                        const status = getStatus(m.user.id);
                        return (
                            <Card key={m.id}>
                                <CardContent className="flex items-center justify-between py-3 px-4">
                                    <div className="flex items-center gap-3">
                                        <Badge variant={statusColor[status]} className="w-10 justify-center">
                                            {statusLabel[status]}
                                        </Badge>
                                        <span className="text-sm font-medium">{m.user.name}</span>
                                    </div>
                                    <select
                                        value={status}
                                        onChange={(e) => updateStatus(m.user.id, e.target.value)}
                                        className="text-xs border rounded-md px-2 h-8 bg-white text-slate-700 cursor-pointer"
                                    >
                                        <option value="PRESENT">출석</option>
                                        <option value="LATE">지각</option>
                                        <option value="ABSENT">결석</option>
                                    </select>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}