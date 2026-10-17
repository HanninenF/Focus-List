import FocusWorkspace from "@/src/features/focus/components/FocusWorkspace";

export default async function FocusPage({
  params,
}: Readonly<{ params: Promise<{ name: string }> }>) {
  const { name } = await params;
  let decodedName = name;
  try {
    decodedName = decodeURIComponent(name);
  } catch {
    // Behåll råvärdet så att sidan kan visa ett tomt/ogiltigt fokusläge.
  }
  return <FocusWorkspace focusName={decodedName.toLowerCase()} />;
}
