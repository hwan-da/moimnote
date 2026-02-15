"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

type Schedule = {
    id: string;
    title: string;
    description: string | null;
    startAt: string;
    endAt: string | null;
};

const scheduleSchema = z.object({
    title: z.string().min(1, "제목을 입력해주세요."),
    description: z.string().optional(),
    startAt: z.string().min(1, "시작일을 입력해주세요."),
    endAt: z.string().optional(),
});

type ScheduleForm = z.infer<typeof scheduleSchema>;

export default function SchedulePage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const clubId = searchParams.get("clubId");

    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const form = useForm<ScheduleForm>({
        resolver: zodResolver(scheduleSchema),
        defaultValues: { title: "", description: "", startAt: "", endAt: "" },
    });

    useEffect(() => {
        if (!clubId) return;
        fetchSchedules();
    }, [clubId]);

    async function fetchSchedules() {
        const res = await fetch(`/api/clubs/${clubId}/schedules`);
        const data = await res.json();
        setSchedules(data);
    }

    async function onSubmit(data: ScheduleForm) {
        const res = await fetch(`/api/clubs/${clubId}/schedules`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        const result = await res.json();

        if (!res.ok) {
            toast.error(result.error);
            return;
        }

        toast.success("일정이 등록됐어요.");
        form.reset();
        setIsDialogOpen(false);
        fetchSchedules();
    }

    async function deleteSchedule(scheduleId: string) {
        if (!confirm("일정을 삭제할까요?")) return;

        const res = await fetch(`/api/clubs/${clubId}/schedules/${scheduleId}`, {
            method: "DELETE",
        });

        if (!res.ok) {
            toast.error("삭제 중 오류가 발생했어요.");
            return;
        }

        toast.success("일정이 삭제됐어요.");
        setIsDetailOpen(false);
        fetchSchedules();
    }

    function handleDateClick(info: { dateStr: string }) {
        setSelectedDate(info.dateStr);
        form.setValue("startAt", info.dateStr);
        setIsDialogOpen(true);
    }

    function handleEventClick(info: { event: { id: string } }) {
        const schedule = schedules.find((s) => s.id === info.event.id);
        if (schedule) {
            setSelectedSchedule(schedule);
            setIsDetailOpen(true);
        }
    }

    const calendarEvents = schedules.map((s) => ({
        id: s.id,
        title: s.title,
        start: s.startAt,
        end: s.endAt ?? undefined,
    }));

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
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-slate-900">일정 관리</h1>
                <Button size="sm" onClick={() => setIsDialogOpen(true)}>
                    + 일정 추가
                </Button>
            </div>

            {/* 캘린더 */}
            <Card>
                <CardContent className="p-2">
                    <FullCalendar
                        plugins={[dayGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        locale="ko"
                        events={calendarEvents}
                        dateClick={handleDateClick}
                        eventClick={handleEventClick}
                        headerToolbar={{
                            left: "prev",
                            center: "title",
                            right: "next",
                        }}
                        height="auto"
                    />
                </CardContent>
            </Card>

            {/* 일정 등록 다이얼로그 */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-white">
                    <DialogHeader>
                        <DialogTitle>일정 등록</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>제목</FormLabel>
                                        <FormControl>
                                            <Input placeholder="일정 제목" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>설명 (선택)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="일정 설명" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="startAt"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>시작일</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="endAt"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>종료일 (선택)</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full">
                                등록하기
                            </Button>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* 일정 상세 다이얼로그 */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="bg-white">
                    <DialogHeader>
                        <DialogTitle>{selectedSchedule?.title}</DialogTitle>
                    </DialogHeader>
                    {selectedSchedule && (
                        <div className="space-y-3">
                            {selectedSchedule.description && (
                                <p className="text-sm text-slate-500">
                                    {selectedSchedule.description}
                                </p>
                            )}
                            <p className="text-sm text-slate-500">
                                시작일: {new Date(selectedSchedule.startAt).toLocaleDateString("ko-KR")}
                            </p>
                            {selectedSchedule.endAt && (
                                <p className="text-sm text-slate-500">
                                    종료일: {new Date(selectedSchedule.endAt).toLocaleDateString("ko-KR")}
                                </p>
                            )}
                            <Button
                                variant="destructive"
                                className="w-full"
                                onClick={() => deleteSchedule(selectedSchedule.id)}
                            >
                                <Trash2 className="w-4 h-4 mr-1" />
                                일정 삭제
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}