import Navbar from '@/components/Navbar';
import BerandaPage from '@/components/Beranda';
import TentangKamiPage from '@/components/Tentangkami';
import BantuanPage from '@/components/Bantuan';

export default function BerandaRoute() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <BerandaPage />
      <TentangKamiPage />
      <BantuanPage />
    </div>
  );
}

