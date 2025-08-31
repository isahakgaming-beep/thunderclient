import TopBar from '@/components/TopBar';
import HomeHUD from '@/components/HomeHUD';

// Ne pas rendre <Sidebar /> ici : elle est rendue par layout.tsx
export default function Page() {
  return (
    <div className="p-4 md:p-6">
      <TopBar />
      <HomeHUD />
    </div>
  );
}
