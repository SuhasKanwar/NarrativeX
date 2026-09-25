import StatusScreen from "@/components/ui/StatusScreen";

const content = {
  code: "CONNECTING THE DOTS",
  title: "A little more context.",
  description: "Getting your next perspective ready. Just a moment.",
};
export default function LoadingPage() {
  return <StatusScreen {...content} loading />;
}
