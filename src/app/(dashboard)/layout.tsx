import Header from "@/components/header";
import BottomNav from "@/components/bottom-nav";

export default function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col h-screen bg-slate-50">
            <Header />
            <main className="flex-1 overflow-y-auto px-4 py-4">
                {children}
            </main>
            <BottomNav />
        </div>
    );
}