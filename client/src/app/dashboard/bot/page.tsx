import ResearchStudio from "@/components/dashboard/ResearchStudio";
export default async function BotPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  const { topic } = await searchParams;
  return <ResearchStudio key={topic || "new"} topic={topic} />;
}
