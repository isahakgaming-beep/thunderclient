import TopBar from '@/components/TopBar';
import Sidebar from '@/components/Sidebar';
import HomeHUD from '@/components/HomeHUD';

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-neutral-100">
      <TopBar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6">
          <HomeHUD />
        </main>
      </div>
    </div>
  );
}
