import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Legal - Barlink',
  description: 'Complete legal information including terms of use, user agreement, and privacy policy for Barlink job platform',
}

export default function LegalPage() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center border-b-4 border-black pb-6">
        <h1 className="text-4xl font-black text-black mb-2">📋 LEGAL - BARLINK</h1>
        <p className="text-lg text-gray-600">Informasi Legal Lengkap Platform Barlink</p>
        <p className="text-sm text-gray-500 mt-2">Terakhir diperbarui: 02 September 2025</p>
      </div>

      {/* Table of Contents */}
      <div className="bg-gray-50 p-6 rounded border-2 border-gray-200">
        <h2 className="text-xl font-bold text-black mb-4">📑 Daftar Isi</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <a href="#user-agreement" className="block p-3 bg-blue-100 border-2 border-blue-300 rounded hover:bg-blue-200 transition-colors">
            <div className="font-semibold text-blue-800">1. Perjanjian Pengguna</div>
            <div className="text-sm text-blue-600">Definisi, persetujuan, hak & kewajiban</div>
          </a>
          <a href="#privacy-policy" className="block p-3 bg-green-100 border-2 border-green-300 rounded hover:bg-green-200 transition-colors">
            <div className="font-semibold text-green-800">2. Kebijakan Privasi</div>
            <div className="text-sm text-green-600">Pengumpulan & penggunaan data</div>
          </a>
          <a href="#terms-conditions" className="block p-3 bg-purple-100 border-2 border-purple-300 rounded hover:bg-purple-200 transition-colors">
            <div className="font-semibold text-purple-800">3. Ketentuan Penggunaan</div>
            <div className="text-sm text-purple-600">Aturan lengkap platform</div>
          </a>
        </div>
      </div>

      {/* User Agreement Section */}
      <section id="user-agreement" className="scroll-mt-8">
        <div className="bg-blue-50 p-6 rounded border-2 border-blue-200 mb-6">
          <h2 className="text-3xl font-black text-black mb-4">📑 1. PERJANJIAN PENGGUNA – BARLINK</h2>
          <p className="text-gray-700 leading-relaxed text-center">
            Selamat datang di Barlink. Dengan mengakses atau menggunakan layanan kami, Anda menyetujui Perjanjian Pengguna ini. 
            Bacalah dengan saksama sebelum melanjutkan.
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-black border-l-4 border-blue-500 pl-4 mb-4">1.1 DEFINISI</h3>
            <div className="bg-gray-50 p-4 rounded border-2 border-gray-200">
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>&quot;Barlink&quot;</strong>: platform digital yang kami sediakan untuk berbagai layanan saat ini maupun di masa depan.</li>
                <li><strong>&quot;Pengguna&quot;</strong>: individu atau entitas yang mengakses atau menggunakan Barlink.</li>
                <li><strong>&quot;Konten&quot;</strong>: semua data, teks, gambar, atau materi lain yang diunggah, dibagikan, atau ditampilkan oleh pengguna.</li>
              </ul>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-bold text-black border-l-4 border-green-500 pl-4 mb-4">1.2 PERSETUJUAN</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Dengan menggunakan Barlink, Anda menegaskan telah membaca, memahami, dan menyetujui Perjanjian Pengguna ini beserta 
              Kebijakan Privasi. Jika tidak setuju, silakan hentikan penggunaan layanan.
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-bold text-black border-l-4 border-yellow-500 pl-4 mb-4">1.3 HAK & KEWAJIBAN PENGGUNA</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Menyediakan informasi yang benar dan dapat dipertanggungjawabkan.</li>
              <li>Tidak menggunakan layanan untuk aktivitas ilegal, penipuan, atau penyalahgunaan.</li>
              <li>Bertanggung jawab penuh atas interaksi dan transaksi yang dilakukan melalui Barlink.</li>
            </ul>
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-bold text-black border-l-4 border-red-500 pl-4 mb-4">1.4 HAK & KEWAJIBAN BARLINK</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Berhak memperbarui, menambah, atau menghentikan layanan kapan saja.</li>
              <li>Berhak menghapus atau membatasi konten yang melanggar hukum atau merugikan pihak lain.</li>
              <li>Berupaya menjaga keamanan layanan, namun tidak menjamin bebas dari gangguan, bug, atau akses tidak sah.</li>
            </ul>
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-bold text-black border-l-4 border-purple-500 pl-4 mb-4">1.5 BATASAN TANGGUNG JAWAB</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Barlink tidak bertanggung jawab atas kerugian langsung maupun tidak langsung akibat penggunaan platform. 
              Semua interaksi antar pengguna menjadi tanggung jawab masing-masing.
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Policy Section */}
      <section id="privacy-policy" className="scroll-mt-8">
        <div className="bg-green-50 p-6 rounded border-2 border-green-200 mb-6">
          <h2 className="text-3xl font-black text-black mb-4">🔒 2. KEBIJAKAN PRIVASI – BARLINK</h2>
          <p className="text-gray-700 leading-relaxed text-center">
            Kami menghargai privasi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi pengguna.
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-black border-l-4 border-blue-500 pl-4 mb-4">2.1 DATA YANG KAMI KUMPULKAN</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Data pribadi:</strong> nama, email, nomor telepon, atau informasi lain yang diberikan pengguna.</li>
              <li><strong>Data penggunaan:</strong> aktivitas dalam aplikasi, perangkat, alamat IP, log interaksi.</li>
              <li><strong>Data tambahan:</strong> profil, resume, atau informasi lain yang pengguna pilih untuk dibagikan.</li>
            </ul>
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-bold text-black border-l-4 border-green-500 pl-4 mb-4">2.2 PENGGUNAAN DATA</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Kami menggunakan data untuk:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Menyediakan dan meningkatkan layanan.</li>
              <li>Menyesuaikan pengalaman pengguna.</li>
              <li>Mengirimkan pembaruan, notifikasi, atau komunikasi penting.</li>
              <li>Menjaga keamanan dan mencegah penyalahgunaan.</li>
            </ul>
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-bold text-black border-l-4 border-yellow-500 pl-4 mb-4">2.3 BERBAGI DATA</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Kami tidak menjual data pribadi. Data hanya dapat dibagikan jika:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Diperlukan untuk penyediaan layanan.</li>
              <li>Diminta oleh hukum atau proses hukum.</li>
              <li>Kepada mitra terpercaya dengan standar privasi yang sejalan.</li>
            </ul>
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-bold text-black border-l-4 border-red-500 pl-4 mb-4">2.4 KEAMANAN DATA</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Kami menggunakan langkah-langkah wajar untuk menjaga keamanan data. Namun, tidak ada sistem online yang sepenuhnya bebas risiko.
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-bold text-black border-l-4 border-purple-500 pl-4 mb-4">2.5 HAK PENGGUNA</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Pengguna berhak untuk:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Mengakses dan memperbarui informasi pribadi.</li>
              <li>Meminta penghapusan akun atau data pribadi.</li>
              <li>Menolak komunikasi non-esensial.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Terms and Conditions Section */}
      <section id="terms-conditions" className="scroll-mt-8">
        <div className="bg-purple-50 p-6 rounded border-2 border-purple-200 mb-6">
          <h2 className="text-3xl font-black text-black mb-4">⚖️ 3. KETENTUAN PENGGUNAAN BARLINK</h2>
          <p className="text-gray-700 leading-relaxed text-center">
            <strong>HARAP MEMBACA SELURUH KETENTUAN PENGGUNAAN INI SEBELUM MENGAKSES ATAU MENGGUNAKAN LAYANAN BARLINK.</strong>
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-black border-l-4 border-blue-500 pl-4 mb-4">3.1 KETENTUAN UMUM</h3>
            <p className="text-gray-700 leading-relaxed">
              Ketentuan Penggunaan ini adalah perjanjian antara pengguna (&quot;Anda&quot;) dan Barlink (&quot;Kami&quot;), sebuah layanan yang dibangun dan beroperasi di Tangerang Selatan, Banten, Indonesia. Ketentuan Penggunaan ini mengatur akses dan penggunaan Anda atas situs web (barlink2.vercel.app), konten dan layanan yang disediakan oleh Kami.
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-bold text-black border-l-4 border-green-500 pl-4 mb-4">3.2 PENGGUNAAN LAYANAN</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Akses dan penggunaan layanan Kami tunduk pada Ketentuan Penggunaan ini.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Anda memiliki kebebasan penuh untuk memilih menggunakan layanan, menggunakan fitur yang tersedia pada situs web atau tidak, atau berhenti menggunakan layanan.
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-bold text-black border-l-4 border-yellow-500 pl-4 mb-4">3.3 PEMBUKAAN DAN PENGAKSESAN AKUN BARLINK</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Sebelum menggunakan layanan, Anda wajib menyetujui Ketentuan Penggunaan ini dan Pemberitahuan Privasi, dan mendaftarkan diri Anda dengan memberikan informasi yang dibutuhkan oleh Kami. Saat melakukan pendaftaran, Kami akan meminta Anda untuk memberikan nama lengkap, alamat surel, dan nomor telepon Anda yang sah, serta peran Anda sebagai Pelamar Kerja atau Pencari Kandidat (Perusahaan) dan kata sandi Akun.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Setelah melakukan pendaftaran, sistem Kami akan menghasilkan tautan verifikasi secara otomatis dan mengirim tautan verifikasi tersebut melalui surel yang Anda berikan. Anda perlu melakukan verifikasi dengan masuk ke tautan verifikasi tersebut.
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-bold text-black border-l-4 border-indigo-500 pl-4 mb-4">3.4 KEKAYAAN INTELEKTUAL</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Layanan, termasuk namun tidak terbatas pada, nama, logo, kode program, desain, merek dagang, teknologi, basis data, proses dan model bisnis, dilindungi oleh hak cipta, merek, paten dan hak kekayaan intelektual lainnya yang tersedia berdasarkan hukum Republik Indonesia yang terdaftar atas nama Kami.
            </p>
            <div className="bg-red-50 p-4 rounded border-2 border-red-200 mb-4">
              <p className="text-gray-700 leading-relaxed mb-2">
                <strong>Anda tidak boleh:</strong>
              </p>
              <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2">
                <li>menghapus setiap pemberitahuan hak cipta, merek dagang atau pemberitahuan hak milik lainnya;</li>
                <li>menyalin, memodifikasi, mengadaptasi, menerjemahkan, membuat karya turunan dari layanan;</li>
                <li>meluncurkan program otomatis atau script yang dapat menghambat operasi layanan;</li>
                <li>menggunakan layanan untuk tujuan yang merugikan atau melanggar hukum.</li>
              </ul>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-bold text-black border-l-4 border-pink-500 pl-4 mb-4">3.5 PENYELESAIAN MASALAH</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Apabila Anda mengalami gangguan sistem, mengetahui atau menduga bahwa Akun Anda diretas, digunakan atau disalahgunakan oleh pihak lain, segera laporkan kepada Kami sehingga Kami dapat segera mengambil tindakan yang diperlukan.
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-bold text-black border-l-4 border-gray-500 pl-4 mb-4">3.6 BATASAN TANGGUNG JAWAB KAMI</h3>
            <p className="text-gray-700 leading-relaxed">
              Kami menyediakan layanan sebagaimana adanya dan Kami tidak menyatakan atau menjamin bahwa keandalan, ketepatan waktu, kualitas, kesesuaian, ketersediaan, akurasi, kelengkapan atau keamanan dari layanan dapat memenuhi kebutuhan dan akan sesuai dengan harapan Anda.
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-bold text-black border-l-4 border-amber-500 pl-4 mb-4">3.7 KEADAAN KAHAR</h3>
            <p className="text-gray-700 leading-relaxed">
              Layanan dapat diinterupsi oleh kejadian di luar kewenangan atau kontrol Kami (&quot;Keadaan Kahar&quot;/force majeure), termasuk namun tidak terbatas pada bencana alam, gangguan listrik, gangguan telekomunikasi, kebijakan pemerintah, dan lain-lain.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-emerald-50 p-6 rounded border-2 border-emerald-200">
        <h2 className="text-2xl font-bold text-black border-l-4 border-emerald-500 pl-4 mb-4">📞 Cara Menghubungi Kami</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          Untuk pertanyaan tentang dokumen legal ini atau layanan Barlink, Anda dapat menghubungi kami melalui:
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded border-2 border-emerald-300">
            <p className="text-gray-700 leading-relaxed">
              <strong>Email:</strong> barlinkid@gmail.com
            </p>
          </div>
          <div className="bg-white p-4 rounded border-2 border-emerald-300">
            <p className="text-gray-700 leading-relaxed">
              <strong>WhatsApp:</strong> +62 878-8372-2694
            </p>
          </div>
        </div>
        <p className="text-gray-700 leading-relaxed mt-4 text-sm">
          Semua korespondensi Anda akan direkam dan disimpan untuk arsip Kami.
        </p>
      </section>

      {/* Footer Navigation */}
      <div className="flex justify-center pt-8 border-t-4 border-black">
        <Link 
          href="/" 
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
        >
          ← Kembali ke Beranda
        </Link>
      </div>
    </div>
  )
}