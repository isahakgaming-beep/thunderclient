import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata = {
  title: 'Thunder Client',
  description: 'Minecraft launcher',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-[#0b0f16] text-white">
        <div className="h-screen w-screen flex overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
