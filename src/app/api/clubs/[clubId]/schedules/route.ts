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

        const schedules = await prisma.schedule.findMany({
            where: { clubId },
            orderBy: { startAt: "asc" },
        });

        return NextResponse.json(schedules);
    } catch (error) {
        console.error("일정 조회 에러:", error);
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
        const { title, description, startAt, endAt } = await req.json();

        if (!title || !startAt) {
            return NextResponse.json({ error: "제목과 시작일을 입력해주세요." }, { status: 400 });
        }

        const schedule = await prisma.schedule.create({
            data: {
                title,
                description,
                startAt: new Date(startAt),
                endAt: endAt ? new Date(endAt) : null,
                clubId,
            },
        });

        return NextResponse.json(schedule, { status: 201 });
    } catch (error) {
        console.error("일정 등록 에러:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}