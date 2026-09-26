import ResearchStudio from "@/components/dashboard/ResearchStudio";
import { notFound } from "next/navigation";
export default async function ActiveConversationPage({
  params,
  searchParams,
}: {
  params: Promise<{ conversationId: string }>;
  searchParams: Promise<{ failed?: string }>;
}) {
  const { conversationId } = await params;
  const { failed } = await searchParams;
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      conversationId,
    )
  )
    notFound();
  return (
    <ResearchStudio
      key={conversationId}
      conversationId={conversationId}
      failed={failed === "1"}
    />
  );
}
