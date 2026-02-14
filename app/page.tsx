import MainLayout from "@/components/layout/MainLayout";
import LeftSidebar from "@/components/sidebar/LeftSidebar";
import WelcomeBoard from "@/components/dashboard/WelcomeBoard";

export default function Home() {
  return (
    <MainLayout
      leftSidebar={<LeftSidebar />}
      rightSidebar={<div />} // Pass empty div to force 2:6:2 layout
    >
      <WelcomeBoard />
    </MainLayout>
  );
}
