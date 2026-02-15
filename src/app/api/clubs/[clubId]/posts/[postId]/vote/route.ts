import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ clubId: string; postId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
        }

        const { pollOptionId } = await req.json();

        // 이미 투표했는지 확인
        const existing = await prisma.vote.findFirst({
            where: {
                userId: session.user.id,
                pollOption: { postId: (await params).postId },
            },
        });

        if (existing) {
            return NextResponse.json({ error: "이미 투표했어요." }, { status: 400 });
        }

        const vote = await prisma.vote.create({
            data: {
                userId: session.user.id,
                pollOptionId,
            },
        });

        return NextResponse.json(vote, { status: 201 });
    } catch (error) {
        console.error("투표 에러:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}