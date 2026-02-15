import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 출석 목록 조회
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
        const { searchParams } = new URL(req.url);
        const date = searchParams.get("date");

        const attendances = await prisma.attendance.findMany({
            where: {
                clubId,
                ...(date && {
                    date: {
                        gte: new Date(date),
                        lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000),
                    },
                }),
            },
            include: { user: { select: { id: true, name: true } } },
        });

        return NextResponse.json(attendances);
    } catch (error) {
        console.error("출석 조회 에러:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

// 출석 등록 / 수정
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
        const { userId, date, status } = await req.json();

        if (!userId || !date || !status) {
            return NextResponse.json({ error: "필수 항목이 누락됐어요." }, { status: 400 });
        }

        const attendance = await prisma.attendance.upsert({
            where: {
                userId_clubId_date: {
                    userId,
                    clubId,
                    date: new Date(date),
                },
            },
            update: { status },
            create: {
                userId,
                clubId,
                date: new Date(date),
                status,
            },
            include: { user: { select: { id: true, name: true } } },
        });

        return NextResponse.json(attendance);
    } catch (error) {
        console.error("출석 등록 에러:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}