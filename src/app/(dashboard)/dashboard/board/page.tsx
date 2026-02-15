import { Suspense } from "react";
import BoardContent from "./BoardContent";

export default function BoardPage() {
    return (
        <Suspense fallback={<p className="text-slate-400 text-sm">불러오는 중...</p>}>
            <BoardContent />
        </Suspense>
    );
}