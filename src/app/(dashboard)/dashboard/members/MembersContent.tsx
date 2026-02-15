"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { UserPlus, Trash2 } from "lucide-react";

type Member = {
    id: string;
    role: string;
    user: { id: string; name: string; email: string };
};

const addSchema = z.object({
    name: z.string().min(2, "이름은 2자 이상이에요."),
    email: z.string().email("올바른 이메일을 입력해주세요."),
});

type AddForm = z.infer<typeof addSchema>;

const roleLabel: Record<string, string> = {
    OWNER: "대표",
    ADMIN: "운영진",
    MEMBER: "회원",
};

const roleColor: Record<string, "default" | "secondary" | "outline"> = {
    OWNER: "default",
    ADMIN: "secondary",
    MEMBER: "outline",
};

export default function MembersPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const clubId = searchParams.get("clubId");
    const [members, setMembers] = useState<Member[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const form = useForm<AddForm>({
        resolver: zodResolver(addSchema),
        defaultValues: { name: "", email: "" },
    });

    useEffect(() => {
        if (!clubId) return;
        fetchMembers();
    }, [clubId]);

    async function fetchMembers() {
        const res = await fetch(`/api/clubs/${clubId}/members`);
        const data = await res.json();
        setMembers(data);
        setIsLoading(false);
    }

    async function onSubmit(data: AddForm) {
        const res = await fetch(`/api/clubs/${clubId}/members`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        const result = await res.json();

        if (!res.ok) {
            toast.error(result.error);
            return;
        }

        toast.success(`${data.name}님이 등록됐어요.`);
        form.reset();
        setIsDialogOpen(false);
        fetchMembers();
    }

    async function deleteMember(memberId: string, name: string) {
        if (!confirm(`${name}님을 삭제할까요?`)) return;

        const res = await fetch(`/api/clubs/${clubId}/members/${memberId}`, {
            method: "DELETE",
        });

        if (!res.ok) {
            toast.error("삭제 중 오류가 발생했어요.");
            return;
        }

        toast.success(`${name}님이 삭제됐어요.`);
        fetchMembers();
    }

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
                <h1 className="text-xl font-bold text-slate-900">회원 관리</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm">
                            <UserPlus className="w-4 h-4 mr-1" />
                            회원 추가
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>회원 등록</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>이름</FormLabel>
                                            <FormControl>
                                                <Input placeholder="홍길동" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>이메일</FormLabel>
                                            <FormControl>
                                                <Input placeholder="example@email.com" {...field} />
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
            </div>

            {isLoading ? (
                <p className="text-slate-400 text-sm">불러오는 중...</p>
            ) : members.length === 0 ? (
                <p className="text-center py-16 text-slate-400 text-sm">
                    등록된 회원이 없어요.
                </p>
            ) : (
                <div className="space-y-2">
                    {members.map((m) => (
                        <Card key={m.id}>
                            <CardContent className="flex items-center justify-between py-3 px-4">
                                <div>
                                    <p className="text-sm font-medium">{m.user.name}</p>
                                    <p className="text-xs text-slate-400">{m.user.email}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant={roleColor[m.role]}>{roleLabel[m.role]}</Badge>
                                    {m.role !== "OWNER" && (
                                        <button
                                            onClick={() => deleteMember(m.id, m.user.name)}
                                            className="text-slate-300 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}