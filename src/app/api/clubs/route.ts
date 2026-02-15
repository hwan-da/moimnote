import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
        }

        const { name, description } = await req.json();

        if (!name) {
            return NextResponse.json({ error: "동아리 이름을 입력해주세요." }, { status: 400 });
        }

        const club = await prisma.club.create({
            data: {
                name,
                description,
                members: {
                    create: {
                        userId: session.user.id,
                        role: "OWNER",
                    },
                },
            },
        });

        return NextResponse.json(club, { status: 201 });
    } catch (error) {
        console.error("동아리 생성 에러:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}