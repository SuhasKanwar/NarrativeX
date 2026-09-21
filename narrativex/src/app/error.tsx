import StatusScreen from "@/components/ui/StatusScreen";

export default function ErrorPage({error, reset}: {error: Error, reset: () => void}) {
    return (
        <StatusScreen></StatusScreen>
    );
}