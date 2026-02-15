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

        const club = await prisma.club.findUnique({
            where: { id: clubId },
            include: { _count: { select: { members: true } } },
        });

        if (!club) {
            return NextResponse.json({ error: "동아리를 찾을 수 없어요." }, { status: 404 });
        }

        return NextResponse.json(club);
    } catch (error) {
        console.error("동아리 조회 에러:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}