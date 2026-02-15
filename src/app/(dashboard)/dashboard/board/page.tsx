"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Megaphone, Vote } from "lucide-react";

type Post = {
    id: string;
    title: string;
    content: string;
    type: string;
    createdAt: string;
    author: { id: string; name: string };
    pollOptions: { id: string; label: string; _count: { votes: number } }[];
};

export default function BoardPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const clubId = searchParams.get("clubId");

    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [tab, setTab] = useState("ALL");

    useEffect(() => {
        if (!clubId) return;
        fetchPosts();
    }, [clubId]);

    async function fetchPosts() {
        const res = await fetch(`/api/clubs/${clubId}/posts`);
        const data = await res.json();
        setPosts(data);
        setIsLoading(false);
    }

    const filtered = posts.filter((p) => tab === "ALL" || p.type === tab);

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
                <h1 className="text-xl font-bold text-slate-900">게시판</h1>
                <Button
                    size="sm"
                    onClick={() =>
                        router.push(`/dashboard/board/create?clubId=${clubId}`)
                    }
                >
                    + 글쓰기
                </Button>
            </div>

            <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="w-full">
                    <TabsTrigger value="ALL" className="flex-1">전체</TabsTrigger>
                    <TabsTrigger value="NOTICE" className="flex-1">공지</TabsTrigger>
                    <TabsTrigger value="POLL" className="flex-1">투표</TabsTrigger>
                </TabsList>
            </Tabs>

            {isLoading ? (
                <p className="text-slate-400 text-sm">불러오는 중...</p>
            ) : filtered.length === 0 ? (
                <p className="text-center py-16 text-slate-400 text-sm">
                    게시글이 없어요.
                </p>
            ) : (
                <div className="space-y-2">
                    {filtered.map((post) => (
                        <Card
                            key={post.id}
                            className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() =>
                                router.push(
                                    `/dashboard/board/${post.id}?clubId=${clubId}`
                                )
                            }
                        >
                            <CardHeader className="pb-1 pt-4 px-4">
                                <div className="flex items-center gap-2">
                                    {post.type === "NOTICE" ? (
                                        <Badge variant="default" className="text-xs">
                                            <Megaphone className="w-3 h-3 mr-1" />
                                            공지
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary" className="text-xs">
                                            <Vote className="w-3 h-3 mr-1" />
                                            투표
                                        </Badge>
                                    )}
                                </div>
                                <CardTitle className="text-base mt-1">{post.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="px-4 pb-4">
                                <p className="text-sm text-slate-500 line-clamp-2">
                                    {post.content}
                                </p>
                                <p className="text-xs text-slate-400 mt-2">
                                    {post.author.name} ·{" "}
                                    {new Date(post.createdAt).toLocaleDateString("ko-KR")}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}