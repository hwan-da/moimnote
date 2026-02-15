import { Suspense } from "react";
import MembersContent from "./MembersContent";

export default function MembersPage() {
    return (
        <Suspense fallback={<p className="text-slate-400 text-sm">불러오는 중...</p>}>
            <MembersContent />
        </Suspense>
    );
}