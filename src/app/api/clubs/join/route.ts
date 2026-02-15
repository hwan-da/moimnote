import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
        }

        const { inviteCode } = await req.json();

        if (!inviteCode) {
            return NextResponse.json({ error: "초대 코드를 입력해주세요." }, { status: 400 });
        }

        const club = await prisma.club.findUnique({ where: { inviteCode } });

        if (!club) {
            return NextResponse.json({ error: "유효하지 않은 초대 코드예요." }, { status: 404 });
        }

        const existing = await prisma.clubMember.findUnique({
            where: {
                userId_clubId: {
                    userId: session.user.id,
                    clubId: club.id,
                },
            },
        });

        if (existing) {
            return NextResponse.json({ error: "이미 가입한 동아리예요." }, { status: 400 });
        }

        await prisma.clubMember.create({
            data: {
                userId: session.user.id,
                clubId: club.id,
                role: "ADMIN",
            },
        });

        return NextResponse.json(club, { status: 201 });
    } catch (error) {
        console.error("동아리 가입 에러:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}