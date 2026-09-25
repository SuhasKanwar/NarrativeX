import StatusScreen from "@/components/ui/StatusScreen";

const content = {
  code: "404",
  title: "This trail ends here.",
  description:
    "The page you're looking for has moved, or the story hasn't been written yet.",
  action: { label: "Back to the bigger picture", href: "/" },
};
export default function NotFoundPage() {
  return <StatusScreen {...content} />;
}
