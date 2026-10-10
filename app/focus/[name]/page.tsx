import Home from "@/app/page";

export default async function FocusPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  return <Home focusName={decodeURIComponent(name).toLowerCase()} />;
}
