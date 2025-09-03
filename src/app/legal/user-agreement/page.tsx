import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'User Agreement - Barlink',
  description: 'User agreement and terms of use for Barlink job platform',
}

export default function UserAgreementPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center border-b-4 border-black pb-6">
        <h1 className="text-4xl font-black text-black mb-2">📑 PERJANJIAN PENGGUNA – BARLINK</h1>
        <p className="text-lg text-gray-600">Terakhir diperbarui: 02 September 2025</p>
      </div>

      {/* Introduction */}
      <div className="bg-blue-50 p-6 rounded border-2 border-blue-200 mb-8">
        <p className="text-gray-700 leading-relaxed text-center">
          Selamat datang di Barlink. Dengan mengakses atau menggunakan layanan kami, Anda menyetujui Perjanjian Pengguna ini. 
          Bacalah dengan saksama sebelum melanjutkan.
        </p>
      </div>

      {/* Content */}
      <div className="prose prose-lg max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-black border-l-4 border-blue-500 pl-4 mb-4">1. DEFINISI</h2>
          <div className="bg-gray-50 p-4 rounded border-2 border-gray-200">
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li><strong>&quot;Barlink&quot;</strong>: platform digital yang kami sediakan untuk berbagai layanan saat ini maupun di masa depan.</li>
              <li><strong>&quot;Pengguna&quot;</strong>: individu atau entitas yang mengakses atau menggunakan Barlink.</li>
              <li><strong>&quot;Konten&quot;</strong>: semua data, teks, gambar, atau materi lain yang diunggah, dibagikan, atau ditampilkan oleh pengguna.</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-black border-l-4 border-green-500 pl-4 mb-4">2. PERSETUJUAN</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Dengan menggunakan Barlink, Anda menegaskan telah membaca, memahami, dan menyetujui Perjanjian Pengguna ini beserta 
            <Link href="/legal/privacy-policy" className="text-blue-600 hover:text-blue-800 font-semibold underline">Kebijakan Privasi</Link>. 
            Jika tidak setuju, silakan hentikan penggunaan layanan.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-black border-l-4 border-yellow-500 pl-4 mb-4">3. HAK & KEWAJIBAN PENGGUNA</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>Menyediakan informasi yang benar dan dapat dipertanggungjawabkan.</li>
            <li>Tidak menggunakan layanan untuk aktivitas ilegal, penipuan, atau penyalahgunaan.</li>
            <li>Bertanggung jawab penuh atas interaksi dan transaksi yang dilakukan melalui Barlink.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-black border-l-4 border-red-500 pl-4 mb-4">4. HAK & KEWAJIBAN BARLINK</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>Berhak memperbarui, menambah, atau menghentikan layanan kapan saja.</li>
            <li>Berhak menghapus atau membatasi konten yang melanggar hukum atau merugikan pihak lain.</li>
            <li>Berupaya menjaga keamanan layanan, namun tidak menjamin bebas dari gangguan, bug, atau akses tidak sah.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-black border-l-4 border-purple-500 pl-4 mb-4">5. HAK KEKAYAAN INTELEKTUAL <span className="text-sm bg-yellow-200 px-2 py-1 rounded">(soon)</span></h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Seluruh desain, logo, merek, dan teknologi dalam Barlink dilindungi hukum. Pengguna dilarang menyalin, mendistribusikan, 
            atau menggunakannya tanpa izin tertulis.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-black border-l-4 border-indigo-500 pl-4 mb-4">6. BATASAN TANGGUNG JAWAB</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Barlink tidak bertanggung jawab atas kerugian langsung maupun tidak langsung akibat penggunaan platform. 
            Semua interaksi antar pengguna menjadi tanggung jawab masing-masing.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-black border-l-4 border-pink-500 pl-4 mb-4">7. PERUBAHAN</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Perjanjian ini dapat diperbarui sewaktu-waktu. Penggunaan berkelanjutan dianggap sebagai persetujuan atas versi terbaru.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-black border-l-4 border-teal-500 pl-4 mb-4">8. HUKUM YANG BERLAKU</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Perjanjian ini tunduk pada hukum Republik Indonesia. Sengketa akan diselesaikan melalui musyawarah, 
            atau mekanisme hukum jika diperlukan.
          </p>
        </section>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-8 border-t-4 border-black">
        <Button
          asChild
          variant="default"
          className="bg-blue-500 hover:bg-blue-600 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
        >
          <Link href="/legal/privacy-policy">
            ← Kebijakan Privasi
          </Link>
        </Button>
        <Button
          asChild
          variant="default" 
          className="bg-green-500 hover:bg-green-600 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
        >
          <Link href="/legal/terms-conditions">
            Syarat & Ketentuan →
          </Link>
        </Button>
      </div>
    </div>
  )
}