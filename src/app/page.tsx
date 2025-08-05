import Navbar from '@/components/Navbar';
import BerandaPage from '@/components/Beranda';
import TentangKamiPage from '@/components/Tentangkami';
import BantuanPage from '@/components/Bantuan';
import Footer from '@/components/Footer';

export default function BerandaRoute() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <BerandaPage />
      <TentangKamiPage />
      <BantuanPage />
      <Footer />
    </div>
  );
}

