"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ChevronLeft, Plus, X } from "lucide-react";

const postSchema = z.object({
    title: z.string().min(1, "제목을 입력해주세요."),
    content: z.string().min(1, "내용을 입력해주세요."),
});

type PostForm = z.infer<typeof postSchema>;

export default function CreatePostPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const clubId = searchParams.get("clubId");

    const [type, setType] = useState<"NOTICE" | "POLL">("NOTICE");
    const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<PostForm>({
        resolver: zodResolver(postSchema),
        defaultValues: { title: "", content: "" },
    });

    function addOption() {
        setPollOptions([...pollOptions, ""]);
    }

    function removeOption(index: number) {
        if (pollOptions.length <= 2) return;
        setPollOptions(pollOptions.filter((_, i) => i !== index));
    }

    function updateOption(index: number, value: string) {
        const updated = [...pollOptions];
        updated[index] = value;
        setPollOptions(updated);
    }

    async function onSubmit(data: PostForm) {
        setIsLoading(true);

        const validOptions = pollOptions.filter((o) => o.trim() !== "");
        if (type === "POLL" && validOptions.length < 2) {
            toast.error("투표 항목을 2개 이상 입력해주세요.");
            setIsLoading(false);
            return;
        }

        const res = await fetch(`/api/clubs/${clubId}/posts`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...data,
                type,
                pollOptions: type === "POLL" ? validOptions : [],
            }),
        });

        const result = await res.json();

        if (!res.ok) {
            toast.error(result.error);
            setIsLoading(false);
            return;
        }

        toast.success("게시글이 등록됐어요.");
        router.push(`/dashboard/board?clubId=${clubId}`);
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
                    <CardTitle>글쓰기</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Tabs
                        value={type}
                        onValueChange={(v) => setType(v as "NOTICE" | "POLL")}
                    >
                        <TabsList className="w-full">
                            <TabsTrigger value="NOTICE" className="flex-1">공지</TabsTrigger>
                            <TabsTrigger value="POLL" className="flex-1">투표</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>제목</FormLabel>
                                        <FormControl>
                                            <Input placeholder="제목을 입력해주세요." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="content"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>내용</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="내용을 입력해주세요."
                                                className="resize-none"
                                                rows={4}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {type === "POLL" && (
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">투표 항목</p>
                                    {pollOptions.map((option, index) => (
                                        <div key={index} className="flex gap-2">
                                            <Input
                                                value={option}
                                                onChange={(e) => updateOption(index, e.target.value)}
                                                placeholder={`항목 ${index + 1}`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeOption(index)}
                                                className="text-slate-300 hover:text-red-400"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addOption}
                                        className="w-full"
                                    >
                                        <Plus className="w-4 h-4 mr-1" />
                                        항목 추가
                                    </Button>
                                </div>
                            )}

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? "등록 중..." : "등록하기"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}