import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
        }

        const memberships = await prisma.clubMember.findMany({
            where: { userId: session.user.id },
            include: {
                club: {
                    include: {
                        _count: { select: { members: true } },
                    },
                },
            },
        });

        return NextResponse.json(memberships);
    } catch (error) {
        console.error("내 동아리 조회 에러:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}