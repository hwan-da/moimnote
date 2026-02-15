"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ChevronLeft, Trash2 } from "lucide-react";

type PollOption = {
    id: string;
    label: string;
    _count: { votes: number };
    votes: { id: string }[];
};

type Post = {
    id: string;
    title: string;
    content: string;
    type: string;
    createdAt: string;
    author: { id: string; name: string };
    pollOptions: PollOption[];
};

export default function PostDetailPage() {
    const { postId } = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const clubId = searchParams.get("clubId");

    const [post, setPost] = useState<Post | null>(null);
    const [hasVoted, setHasVoted] = useState(false);
    const [totalVotes, setTotalVotes] = useState(0);

    useEffect(() => {
        fetchPost();
    }, [postId]);

    async function fetchPost() {
        const res = await fetch(`/api/clubs/${clubId}/posts/${postId}`);
        const data = await res.json();
        setPost(data);

        if (data.pollOptions) {
            const voted = data.pollOptions.some(
                (o: PollOption) => o.votes.length > 0
            );
            setHasVoted(voted);
            setTotalVotes(
                data.pollOptions.reduce(
                    (sum: number, o: PollOption) => sum + o._count.votes,
                    0
                )
            );
        }
    }

    async function vote(pollOptionId: string) {
        if (hasVoted) {
            toast.error("이미 투표했어요.");
            return;
        }

        const res = await fetch(`/api/clubs/${clubId}/posts/${postId}/vote`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pollOptionId }),
        });

        const result = await res.json();

        if (!res.ok) {
            toast.error(result.error);
            return;
        }

        toast.success("투표가 완료됐어요.");
        fetchPost();
    }

    async function deletePost() {
        if (!confirm("게시글을 삭제할까요?")) return;

        const res = await fetch(`/api/clubs/${clubId}/posts/${postId}`, {
            method: "DELETE",
        });

        if (!res.ok) {
            toast.error("삭제 중 오류가 발생했어요.");
            return;
        }

        toast.success("게시글이 삭제됐어요.");
        router.push(`/dashboard/board?clubId=${clubId}`);
    }

    if (!post) return <p className="text-slate-400 text-sm">불러오는 중...</p>;

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
                    <div className="flex items-center justify-between">
                        <Badge variant={post.type === "NOTICE" ? "default" : "secondary"}>
                            {post.type === "NOTICE" ? "공지" : "투표"}
                        </Badge>
                        <button
                            onClick={deletePost}
                            className="text-slate-300 hover:text-red-400 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                    <CardTitle className="text-lg mt-2">{post.title}</CardTitle>
                    <p className="text-xs text-slate-400">
                        {post.author.name} ·{" "}
                        {new Date(post.createdAt).toLocaleDateString("ko-KR")}
                    </p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">
                        {post.content}
                    </p>

                    {post.type === "POLL" && post.pollOptions.length > 0 && (
                        <div className="space-y-2 pt-2 border-t">
                            <p className="text-sm font-medium">
                                투표 · 총 {totalVotes}표
                            </p>
                            {post.pollOptions.map((option) => {
                                const percent =
                                    totalVotes > 0
                                        ? Math.round((option._count.votes / totalVotes) * 100)
                                        : 0;
                                const isMyVote = option.votes.length > 0;

                                return (
                                    <button
                                        key={option.id}
                                        onClick={() => vote(option.id)}
                                        disabled={hasVoted}
                                        className="w-full text-left"
                                    >
                                        <div
                                            className={`relative rounded-lg border px-4 py-3 transition-colors ${
                                                isMyVote
                                                    ? "border-slate-900 bg-slate-50"
                                                    : "hover:bg-slate-50"
                                            }`}
                                        >
                                            <div
                                                className="absolute inset-0 rounded-lg bg-slate-100 transition-all"
                                                style={{ width: hasVoted ? `${percent}%` : "0%" }}
                                            />
                                            <div className="relative flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {option.label}
                            {isMyVote && " ✓"}
                        </span>
                                                {hasVoted && (
                                                    <span className="text-xs text-slate-500">
                            {percent}%
                          </span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}