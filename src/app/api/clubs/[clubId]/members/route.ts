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

        const members = await prisma.clubMember.findMany({
            where: { clubId },
            include: { user: { select: { id: true, name: true, email: true } } },
            orderBy: { joinedAt: "asc" },
        });

        return NextResponse.json(members);
    } catch (error) {
        console.error("회원 목록 조회 에러:", error);
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
        const { name, email } = await req.json();

        if (!name || !email) {
            return NextResponse.json({ error: "이름과 이메일을 입력해주세요." }, { status: 400 });
        }

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            user = await prisma.user.create({
                data: { email, name, password: "" },
            });
        }

        const existing = await prisma.clubMember.findUnique({
            where: { userId_clubId: { userId: user.id, clubId } },
        });

        if (existing) {
            return NextResponse.json({ error: "이미 등록된 회원이에요." }, { status: 400 });
        }

        const member = await prisma.clubMember.create({
            data: { userId: user.id, clubId, role: "MEMBER" },
            include: { user: { select: { id: true, name: true, email: true } } },
        });

        return NextResponse.json(member, { status: 201 });
    } catch (error) {
        console.error("회원 등록 에러:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}