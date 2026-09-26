import ResearchStudio from "@/components/dashboard/ResearchStudio";
import { notFound } from "next/navigation";
export default async function ActiveConversationPage({ params }: { params: Promise<{ conversationId: string }> }) {
    const { conversationId } = await params;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(conversationId)) notFound();
    return <ResearchStudio key={conversationId} conversationId={conversationId} />;
}
