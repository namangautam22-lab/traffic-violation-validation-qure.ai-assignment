import { redirect } from "next/navigation";

// Queue is the primary surface — redirect root to it
export default function RootPage() {
  redirect("/queue");
}
