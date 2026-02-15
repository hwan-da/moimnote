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

const createSchema = z.object({
    name: z.string().min(2, "동아리 이름은 2자 이상이에요."),
    description: z.string().optional(),
});

type CreateForm = z.infer<typeof createSchema>;

export default function CreateClubPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<CreateForm>({
        resolver: zodResolver(createSchema),
        defaultValues: { name: "", description: "" },
    });

    async function onSubmit(data: CreateForm) {
        setIsLoading(true);
        setError(null);

        const res = await fetch("/api/clubs", {
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
                    <CardTitle>동아리 만들기</CardTitle>
                    <CardDescription>새로운 동아리를 개설해요.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>동아리 이름</FormLabel>
                                        <FormControl>
                                            <Input placeholder="ex) 런닝 크루 서울" {...field} />
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
                                        <FormLabel>소개 (선택)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="동아리를 간단히 소개해주세요." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {error && <p className="text-sm text-red-500">{error}</p>}
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? "생성 중..." : "동아리 만들기"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}