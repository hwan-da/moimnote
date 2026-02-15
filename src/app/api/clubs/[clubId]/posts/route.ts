import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ clubId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
        }

        const { clubId } = await params;

        const posts = await prisma.post.findMany({
            where: { clubId },
            include: {
                author: { select: { id: true, name: true } },
                pollOptions: {
                    include: { _count: { select: { votes: true } } },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(posts);
    } catch (error) {
        console.error("게시글 조회 에러:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ clubId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
        }

        const { clubId } = await params;
        const { title, content, type, pollOptions } = await req.json();

        if (!title || !content) {
            return NextResponse.json({ error: "제목과 내용을 입력해주세요." }, { status: 400 });
        }

        const post = await prisma.post.create({
            data: {
                title,
                content,
                type: type ?? "NOTICE",
                authorId: session.user.id,
                clubId,
                pollOptions:
                    type === "POLL" && pollOptions?.length > 0
                        ? { create: pollOptions.map((label: string) => ({ label })) }
                        : undefined,
            },
            include: {
                author: { select: { id: true, name: true } },
                pollOptions: {
                    include: { _count: { select: { votes: true } } },
                },
            },
        });

        return NextResponse.json(post, { status: 201 });
    } catch (error) {
        console.error("게시글 등록 에러:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}