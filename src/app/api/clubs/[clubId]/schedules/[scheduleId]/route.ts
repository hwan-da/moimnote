import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ clubId: string; scheduleId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
        }

        const { scheduleId } = await params;

        await prisma.schedule.delete({ where: { id: scheduleId } });

        return NextResponse.json({ message: "일정이 삭제됐어요." });
    } catch (error) {
        console.error("일정 삭제 에러:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}