import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ clubId: string; memberId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
        }

        const { memberId } = await params;
        const { role } = await req.json();

        const member = await prisma.clubMember.update({
            where: { id: memberId },
            data: { role },
            include: { user: { select: { id: true, name: true, email: true } } },
        });

        return NextResponse.json(member);
    } catch (error) {
        console.error("회원 수정 에러:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ clubId: string; memberId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
        }

        const { memberId } = await params;

        await prisma.clubMember.delete({ where: { id: memberId } });

        return NextResponse.json({ message: "회원이 삭제됐어요." });
    } catch (error) {
        console.error("회원 삭제 에러:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}