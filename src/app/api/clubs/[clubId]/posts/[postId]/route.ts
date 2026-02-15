import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ clubId: string; postId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
        }

        const { postId } = await params;

        const post = await prisma.post.findUnique({
            where: { id: postId },
            include: {
                author: { select: { id: true, name: true } },
                pollOptions: {
                    include: {
                        _count: { select: { votes: true } },
                        votes: { where: { userId: session.user.id } },
                    },
                },
            },
        });

        if (!post) {
            return NextResponse.json({ error: "게시글을 찾을 수 없어요." }, { status: 404 });
        }

        return NextResponse.json(post);
    } catch (error) {
        console.error("게시글 상세 조회 에러:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ clubId: string; postId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
        }

        const { postId } = await params;

        await prisma.post.delete({ where: { id: postId } });

        return NextResponse.json({ message: "게시글이 삭제됐어요." });
    } catch (error) {
        console.error("게시글 삭제 에러:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}