'use client';
import { Button } from '@/components/ui/button';

export default function TentangKamiPage() {
  return (
    <div id="tentang-kami" className="min-h-screen bg-white py-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black text-black mb-6 bg-white p-4 inline-block shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all duration-200">
            Tentang Kami 🚀
          </h1>
          <p className="text-xl text-black mx-auto text-justify mt-4">
            Terinspirasi oleh sebuah visi untuk membawa berbagai dampak yang lebih luas, Barlink terlahir dari tangan-tangan kreatif generasi muda Indonesia. Dibangun bukan hanya untuk memenuhi kebutuhan hari ini, tapi juga sebagai sebuah langkah awal menuju solusi berkelanjutan di tengah dinamika sosial yang terus berubah kian hari. Barlink membuka sebuah ruang kolaborasi, serta mempertemukan potensi dengan kesempatan, dan terus berkembang melampaui batas fungsi utamanya. Lebih dari sekadar platform digital, Barlink membawa harapan bagi berbagai kalangan, bahwa teknologi bisa menjadi jembatan untuk membantu sesama, serta menjangkau lebih banyak orang, dan menjadi bagian dari perubahan yang bermakna.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold text-black mb-6">Cerita Kami</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                Barlink lahir dari kebutuhan untuk menyederhanakan aspek penting dalam kehidupan sehari-hari: mencari pekerjaan.
              </p>
              <p>
                Kami percaya bahwa setiap orang berhak mendapatkan kesempatan kerja yang layak. Itulah mengapa kami menciptakan platform ini.
              </p>
              <p>
                Dengan teknologi terdepan dan antarmuka yang user-friendly, Barlink hadir untuk memudahkan perjalanan karir dan gaya hidup Anda.
              </p>
            </div>
          </div>
          <div className="bg-main rounded-lg p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-2xl font-bold mb-4">Visi Kami</h3>
            <p className="mb-6">
              Menjadi platform terdepan di Indonesia yang menghubungkan talenta dengan peluang kerja terbaik.
            </p>
            <h3 className="text-2xl font-bold mb-4">Misi Kami</h3>
            <ul className="space-y-2">
              <li>• Memudahkan pencarian kerja untuk semua kalangan</li>

              <li>• Menciptakan ekosistem digital yang berkelanjutan</li>
            </ul>
          </div>
        </div>

        {/* Values Section */}
        {/* <div className="mb-16">
          <h2 className="text-3xl font-bold text-black text-center mb-12">Nilai-Nilai Kami</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-gray-50 rounded-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all duration-200">
              <div className="w-16 h-16 bg-main rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Kepercayaan</h3>
              <p className="text-gray-600">
                Membangun kepercayaan melalui transparansi, keamanan, dan layanan yang konsisten untuk semua pengguna.
              </p>
            </div>

            <div className="text-center p-6 bg-gray-50 rounded-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all duration-200">
              <div className="w-16 h-16 bg-main rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-2xl">💡</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Inovasi</h3>
              <p className="text-gray-600">
                Terus berinovasi untuk memberikan solusi terbaik dan pengalaman pengguna yang luar biasa.
              </p>
            </div>

            <div className="text-center p-6 bg-gray-50 rounded-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all duration-200">
              <div className="w-16 h-16 bg-main rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-2xl">🌱</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Berkelanjutan</h3>
              <p className="text-gray-600">
                Mendukung ekonomi berkelanjutan melalui penggunaan kembali barang dan penciptaan lapangan kerja.
              </p>
            </div>
          </div>
        </div> */}

        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-black text-center mb-12">Tim Kami</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            <div className="text-center p-6 bg-white rounded-sm border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all duration-200">
              <Button
                variant="default"
                className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <span className="text-4xl">👨‍💼</span>
              </Button>
              <h3 className="text-xl font-bold mb-1">Lionel Maxmiliam</h3>
              <p className="text-main font-semibold mb-2">CEO & Founder</p>
              <p className="text-sm text-gray-600">
                Visioner dengan pengalaman 10+ tahun di industri teknologi.
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-sm border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all duration-200">
              <Button
                variant="default"
                className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <span className="text-4xl">👩‍💻</span>
              </Button>
              <h3 className="text-xl font-bold mb-1">Antonius Yohri</h3>
              <p className="text-main font-semibold mb-2">Co-CEO & Founder</p>
              <p className="text-sm text-gray-600">
                Expert teknologi dengan spesialisasi dalam pengembangan platform digital.
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="bg-main rounded-lg p-8 text-white text-center border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-3xl font-bold mb-8">Pencapaian Kami</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl font-black mb-2">10K+</div>
              <p className="text-lg">Pengguna Aktif</p>
            </div>
            <div>
              <div className="text-4xl font-black mb-2">5K+</div>
              <p className="text-lg">Lowongan Kerja</p>
            </div>
            <div>
              <div className="text-4xl font-black mb-2">15K+</div>
              <p className="text-lg">Produk Terjual</p>
            </div>
            <div>
              <div className="text-4xl font-black mb-2">98%</div>
              <p className="text-lg">Kepuasan Pengguna</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

