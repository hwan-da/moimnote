"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

const joinSchema = z.object({
    inviteCode: z.string().min(1, "초대 코드를 입력해주세요."),
});

type JoinForm = z.infer<typeof joinSchema>;

export default function JoinClubPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<JoinForm>({
        resolver: zodResolver(joinSchema),
        defaultValues: { inviteCode: "" },
    });

    async function onSubmit(data: JoinForm) {
        setIsLoading(true);
        setError(null);

        const res = await fetch("/api/clubs/join", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        const result = await res.json();

        if (!res.ok) {
            setError(result.error);
            setIsLoading(false);
            return;
        }

        router.push("/dashboard");
    }

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
                    <CardTitle>동아리 가입</CardTitle>
                    <CardDescription>초대 코드로 동아리에 참여해요.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="inviteCode"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>초대 코드</FormLabel>
                                        <FormControl>
                                            <Input placeholder="초대 코드를 입력해주세요." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {error && <p className="text-sm text-red-500">{error}</p>}
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? "가입 중..." : "가입하기"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}