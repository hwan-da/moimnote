import { Suspense } from "react";
import CreatePostContent from "./CreatePostContent";

export default function CreatePostPage() {
    return (
        <Suspense fallback={<p className="text-slate-400 text-sm">불러오는 중...</p>}>
            <CreatePostContent />
        </Suspense>
    );
}