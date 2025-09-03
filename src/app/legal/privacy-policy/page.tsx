import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy - Barlink',
  description: 'Privacy policy and data protection information for Barlink job platform',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center border-b-4 border-black pb-6">
        <h1 className="text-4xl font-black text-black mb-2">🔒 PRIVACY POLICY – BARLINK</h1>
        <p className="text-lg text-gray-600">Terakhir diperbarui: 02 September 2025</p>
      </div>

      {/* Introduction */}
      <div className="bg-blue-50 p-6 rounded border-2 border-blue-200 mb-8">
        <p className="text-gray-700 leading-relaxed text-center">
          Kami menghargai privasi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi pengguna.
        </p>
      </div>

      {/* Content */}
      <div className="prose prose-lg max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-black border-l-4 border-blue-500 pl-4 mb-4">1. DATA YANG KAMI KUMPULKAN</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li><strong>Data pribadi:</strong> nama, email, nomor telepon, atau informasi lain yang diberikan pengguna.</li>
            <li><strong>Data penggunaan:</strong> aktivitas dalam aplikasi, perangkat, alamat IP, log interaksi.</li>
            <li><strong>Data tambahan:</strong> profil, resume, atau informasi lain yang pengguna pilih untuk dibagikan.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-black border-l-4 border-green-500 pl-4 mb-4">2. PENGGUNAAN DATA</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Kami menggunakan data untuk:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>Menyediakan dan meningkatkan layanan.</li>
            <li>Menyesuaikan pengalaman pengguna.</li>
            <li>Mengirimkan pembaruan, notifikasi, atau komunikasi penting.</li>
            <li>Menjaga keamanan dan mencegah penyalahgunaan.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-black border-l-4 border-yellow-500 pl-4 mb-4">3. BERBAGI DATA</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Kami tidak menjual data pribadi. Data hanya dapat dibagikan jika:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>Diperlukan untuk penyediaan layanan.</li>
            <li>Diminta oleh hukum atau proses hukum.</li>
            <li>Kepada mitra terpercaya dengan standar privasi yang sejalan.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-black border-l-4 border-red-500 pl-4 mb-4">4. KEAMANAN DATA</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Kami menggunakan langkah-langkah wajar untuk menjaga keamanan data. Namun, tidak ada sistem online yang sepenuhnya bebas risiko.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-black border-l-4 border-purple-500 pl-4 mb-4">5. HAK PENGGUNA</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Pengguna berhak untuk:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>Mengakses dan memperbarui informasi pribadi.</li>
            <li>Meminta penghapusan akun atau data pribadi.</li>
            <li>Menolak komunikasi non-esensial.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-black border-l-4 border-indigo-500 pl-4 mb-4">6. PERUBAHAN KEBIJAKAN</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Kebijakan ini dapat diperbarui sewaktu-waktu. Perubahan akan diumumkan di platform, dan penggunaan berkelanjutan berarti pengguna menyetujuinya.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-black border-l-4 border-teal-500 pl-4 mb-4">7. KONTAK</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Untuk pertanyaan tentang privasi, silakan hubungi kami di:
          </p>
          <div className="bg-gray-100 p-4 rounded border-2 border-gray-300">
            <p className="text-gray-700">[email resmi Barlink]</p>
          </div>
        </section>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-8 border-t-4 border-black">
        <Link 
          href="/legal/terms-conditions" 
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
        >
          ← Syarat & Ketentuan
        </Link>
        <Link 
          href="/legal/user-agreement" 
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
        >
          Perjanjian Pengguna →
        </Link>
      </div>
    </div>
  )
}