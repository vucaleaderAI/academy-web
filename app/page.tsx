import MainLayout from "@/components/layout/MainLayout";
import LeftSidebar from "@/components/sidebar/LeftSidebar";
import RightSidebar from "@/components/sidebar/RightSidebar";
import WelcomeBoard from "@/components/dashboard/WelcomeBoard";

export default function Home() {
  return (
    <MainLayout
      leftSidebar={<LeftSidebar />}
      rightSidebar={<RightSidebar />}
    >
      <WelcomeBoard />
    </MainLayout>
  );
}
