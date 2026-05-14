import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-background relative">
      <div className="scanline" />
      <div className="scanline-bar" />
      <Header />
      <div className="flex pt-24">
        <Sidebar />
        <main className="flex-1 ml-64 p-12">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
