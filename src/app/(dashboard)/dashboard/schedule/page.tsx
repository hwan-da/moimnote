import { Suspense } from "react";
import ScheduleContent from "./ScheduleContent";

export default function SchedulePage() {
    return (
        <Suspense fallback={<p className="text-slate-400 text-sm">불러오는 중...</p>}>
            <ScheduleContent />
        </Suspense>
    );
}