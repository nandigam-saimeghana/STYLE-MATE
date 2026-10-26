import { createFileRoute } from "@tanstack/react-router";
import { StyleMateApp } from "@/components/StyleMateApp";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <StyleMateApp />;
}
