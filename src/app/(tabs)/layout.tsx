import { BottomNav } from "@/components/bottom-nav";

// The 4 main tabs share the bottom navigation. Screens like /imbas (later phases)
// live outside this (tabs) group so they can use the full screen.
export default function TabsLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  );
}
