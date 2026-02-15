import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { email, password, name } = await req.json();

        if (!email || !password || !name) {
            return NextResponse.json(
                { error: "모든 항목을 입력해주세요." },
                { status: 400 }
            );
        }

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json(
                { error: "이미 사용 중인 이메일이에요." },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: { email, password: hashedPassword, name },
        });

        return NextResponse.json(
            { message: "회원가입 성공", userId: user.id },
            { status: 201 }
        );
    } catch (error) {
        console.log("ENV CHECK:", process.env.DATABASE_URL)
        console.error("회원가입 에러:", error);
        return NextResponse.json(
            { error: "서버 오류가 발생했어요." },
            { status: 500 }
        );
    }
}