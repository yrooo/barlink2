import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Ketentuan Penggunaan - Barlink',
  description: 'Ketentuan penggunaan platform Barlink',
}

export default function TermsConditionsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center border-b-4 border-black pb-6">
        <h1 className="text-4xl font-black text-black mb-2">KETENTUAN PENGGUNAAN BARLINK</h1>
        <p className="text-lg text-gray-600">Diperbarui pada tanggal 02 September 2025</p>
      </div>

      {/* Content */}
      <div className="prose prose-lg max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-black border-l-4 border-blue-500 pl-4 mb-4">Ketentuan Umum</h2>
          <div className="bg-blue-50 p-4 rounded border-2 border-blue-200">
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>HARAP MEMBACA SELURUH KETENTUAN PENGGUNAAN INI SEBELUM MENGAKSES ATAU MENGGUNAKAN LAYANAN BARLINK.</strong>
            </p>
            <p className="text-gray-700 leading-relaxed">
              Ketentuan Penggunaan ini adalah perjanjian antara pengguna (&quot;Anda&quot;) dan Barlink (&quot;Kami&quot;), sebuah layanan yang dibangun dan beroperasi di Tangerang Selatan, Banten, Indonesia. Ketentuan Penggunaan ini mengatur akses dan penggunaan Anda atas situs web (barlink2.vercel.app), konten dan layanan yang disediakan oleh Kami.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-black border-l-4 border-green-500 pl-4 mb-4">Penggunaan Layanan</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Akses dan penggunaan layanan Kami tunduk pada Ketentuan Penggunaan ini.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Anda memiliki kebebasan penuh untuk memilih menggunakan layanan, menggunakan fitur yang tersedia pada situs web atau tidak, atau berhenti menggunakan layanan.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-black border-l-4 border-yellow-500 pl-4 mb-4">Pembukaan dan Pengaksesan Akun Barlink</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Sebelum menggunakan layanan, Anda wajib menyetujui Ketentuan Penggunaan ini dan Pemberitahuan Privasi, dan mendaftarkan diri Anda dengan memberikan informasi yang dibutuhkan oleh Kami. Saat melakukan pendaftaran, Kami akan meminta Anda untuk memberikan nama lengkap, alamat surel, dan nomor telepon Anda yang sah, serta peran Anda sebagai Pelamar Kerja atau Pencari Kandidat (Perusahaan) dan kata sandi Akun. Anda dapat mengubah informasi data diri Anda serta kata sandi Akun pada fitur pengaturan dalam situs web.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            Setelah melakukan pendaftaran, sistem Kami akan menghasilkan tautan verifikasi secara otomatis dan mengirim tautan verifikasi tersebut melalui surel yang Anda berikan. Anda perlu melakukan verifikasi dengan masuk ke tautan verifikasi tersebut.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            Setelah melakukan verifikasi, sistem Kami akan membuatkan Akun untuk Anda menggunakan situs web. Alamat surel Anda melekat pada Akun Anda sehingga Anda tidak bisa membuat Akun baru dengan alamat surel yang sudah terdaftar. Hal yang sama juga berlaku apabila di kemudian hari Anda mengubah alamat surel Anda pada menu pengaturan di situs web.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            Dalam hal Anda telah keluar dari Akun Anda, maka Anda perlu memasukan alamat surel yang Anda berikan pada saat mendaftarkan diri Anda dan memasukkan kata sandi pada halaman pengaksesan.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Dalam hal Anda hendak mengubah kata sandi Akun, maka Anda perlu melakukan verifikasi ulang melalui alamat surel yang terdaftar pada Akun.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-black border-l-4 border-purple-500 pl-4 mb-4">Informasi Pribadi</h2>
          <p className="text-gray-700 leading-relaxed">
            Pengumpulan, penyimpanan, pengolahan, penggunaan, dan pembagian informasi pribadi Anda, seperti data pribadi Anda yang Anda berikan ketika Anda membuka Akun tunduk pada Pemberitahuan Privasi yang merupakan bagian yang tidak terpisahkan dari Ketentuan Penggunaan ini.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-black border-l-4 border-red-500 pl-4 mb-4">Akun Anda</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Akun Anda hanya dapat digunakan oleh Anda dan tidak bisa dipindahtangankan kepada orang lain dengan alasan apapun. Kami berhak menolak untuk memfasilitasi layanan jika Kami mengetahui atau mempunyai alasan yang cukup untuk menduga bahwa Anda telah memindahtangankan atau membiarkan Akun Anda digunakan oleh orang lain.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            Keamanan dan kerahasiaan Akun Anda, termasuk nama terdaftar, alamat surel terdaftar, dan nomor telepon terdaftar sepenuhnya merupakan tanggung jawab pribadi Anda. Semua kerugian dan risiko yang ada akibat kelalaian Anda dalam menjaga keamanan dan kerahasiaan sebagaimana disebutkan ditanggung oleh Anda sendiri. Dalam hal demikian, Kami akan menganggap setiap penggunaan atau pesanan yang dilakukan melalui Akun Anda sebagai tindakan yang sah dari Anda.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            Segera hubungi Kami jika Anda mengetahui atau menduga bahwa Akun Anda telah digunakan tanpa sepengetahuan dan persetujuan Anda. Kami akan melakukan tindakan yang Kami anggap perlu dan dapat Kami lakukan terhadap penggunaan tanpa persetujuan tersebut.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Jika Anda ingin melakukan deaktivasi akun Barlink Anda, Anda dapat mengakses opsi tersebut dalam situs web Barlink atau mengirimkan permintaan Anda secara langsung ke kontak Kami.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-black border-l-4 border-orange-500 pl-4 mb-4">Pernyataan Anda</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Anda setuju untuk mengakses atau menggunakan layanan untuk tujuan sebagaimana ditentukan dalam Ketentuan Penggunaan ini dan tidak menyalahgunakan atau menggunakan layanan untuk tujuan penipuan yang menyebabkan ketidaknyamanan kepada orang lain dengan memberikan profil dan resume palsu jika Anda merupakan Pelamar Kerja atau menawarkan lowongan kerja palsu jika Anda merupakan Pencari Kandidat (Perusahaan), atau tindakan-tindakan lain yang dapat atau dianggap dapat menimbulkan kerugian dalam bentuk apapun terhadap orang lain.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Anda memahami dan menyetujui bahwa seluruh risiko yang timbul dari penggunaan layanan sepenuhnya menjadi tanggung jawab Anda dan Anda dengan ini setuju untuk melepaskan Kami dari segala tuntutan apapun sehubungan dengan kerusakan, gangguan, atau bentuk lain dari gangguan sistem elektronik yang disebabkan oleh akses tidak resmi oleh pihak lain.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-black border-l-4 border-teal-500 pl-4 mb-4">Tanggung Jawab Anda</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Anda bertanggung jawab penuh atas keputusan yang Anda buat untuk menggunakan atau mengakses layanan Kami. Anda harus memperlakukan Penyedia Layanan, Pelamar Kerja, dan Pencari Kandidat (Perusahaan) dengan hormat dan tidak boleh terlibat dalam perilaku atau tindakan yang tidak sah, mengancam atau melecehkan ketika menggunakan layanan.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Anda bertanggung jawab secara penuh atas setiap kerugian dan/atau klaim yang timbul dari penggunaan situs web melalui Akun Anda, baik oleh Anda atau pihak lain yang menggunakan Akun Anda, dengan cara yang bertentangan dengan Ketentuan Penggunaan ini, Pemberitahuan Privasi, termasuk syarat dan ketentuan dan kebijakan privasi yang ditentukan oleh Penyedia Layanan atau Peraturan Perundang-undangan yang berlaku, termasuk namun tidak terbatas untuk tujuan aktivitas kriminal, perdagangan manusia (baik domestik maupun lintas negara), penipuan dalam bentuk apapun (termasuk namun tidak terbatas pada kegiatan phising dan/atau social engineering), pelanggaran hak kekayaan intelektual, dan/atau aktivitas lain yang merugikan publik dan/atau pihak lain manapun atau yang dapat atau dianggap dapat merusak reputasi Kami.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-black border-l-4 border-indigo-500 pl-4 mb-4">Kekayaan Intelektual</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Layanan, termasuk namun tidak terbatas pada, nama, logo, kode program, desain, merek dagang, teknologi, basis data, proses dan model bisnis, dilindungi oleh hak cipta, merek, paten dan hak kekayaan intelektual lainnya yang tersedia berdasarkan hukum Republik Indonesia yang terdaftar atas nama Kami. Kami memiliki seluruh hak dan kepentingan atas Layanan, termasuk seluruh hak kekayaan intelektual terkait dengan seluruh fitur yang terdapat didalamnya dan hak kekayaan intelektual terkait.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            Tunduk pada Ketentuan Penggunaan ini, Kami memberikan Anda lisensi terbatas yang tidak eksklusif, dapat ditarik kembali, tidak dapat dialihkan (tanpa hak sublisensi) untuk (i) mengunduh, mengakses, dan menggunakan layanan, sebagaimana adanya, dan (ii) mengakses atau menggunakan konten, informasi dan materi terkait yang tersedia pada situs web hanya untuk kepentingan pribadi dan bukan tujuan komersial. Hak dan hak istimewa lainnya yang tidak secara tegas diberikan dalam Ketentuan Penggunaan ini, adalah hak Kami atau pemberi lisensi Kami.
          </p>
          <div className="bg-red-50 p-4 rounded border-2 border-red-200 mb-4">
            <p className="text-gray-700 leading-relaxed mb-2">
              <strong>Anda tidak boleh:</strong>
            </p>
            <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2">
              <li>menghapus setiap pemberitahuan hak cipta, merek dagang atau pemberitahuan hak milik lainnya yang terkandung dalam situs web;</li>
              <li>menyalin, memodifikasi, mengadaptasi, menerjemahkan, membuat karya turunan dari, mendistribusikan, memberikan lisensi, menjual, mengalihkan, menampilkan di muka umum baik sebagian maupun seluruhnya, merekayasa balik (reverse engineer), mentransmisikan, memindahkan, menyiarkan, menguraikan, atau membongkar bagian manapun dari atau dengan cara lain mengeksploitasi situs web (termasuk perangkat lunak, fitur, dan layanan di dalamnya);</li>
              <li>memberikan lisensi, mensublisensikan, menjual, menjual kembali, memindahkan, mengalihkan, mendistribusikan atau mengeksploitasi secara komersial atau membuat tersedia kepada pihak lain situs web dan/atau perangkat lunak dengan cara menciptakan tautan internet ke situs web atau frame atau mirror setiap perangkat lunak pada server lain atau perangkat nirkabel atau yang berbasis internet;</li>
              <li>meluncurkan program otomatis atau script, termasuk, namun tidak terbatas pada, web spiders, web crawlers, web robots, web ants, web indexers, bots, virus, atau worm, atau program apapun yang mungkin membuat beberapa permintaan server per detik, menciptakan beban berat atau menghambat operasi dan/atau kinerja Aplikasi;</li>
              <li>menggunakan aplikasi pencarian atau pengambilan kembali situs, perangkat manual atau otomatis lainnya untuk mengambil (scraping), indeks (indexing), survei (surveying), tambang data (data mining), atau dengan cara apapun memperbanyak atau menghindari struktur navigasi atau presentasi dari situs web atau isinya;</li>
              <li>menerbitkan, mendistribusikan atau memperbanyak dengan cara apapun materi yang dilindungi hak cipta, merek dagang, atau informasi lain yang Kami miliki tanpa persetujuan tertulis terlebih dahulu dari Kami atau pemilik hak yang melisensikan hak-nya kepada Kami, dan</li>
              <li>menggunakan dan/atau mengakses secara tidak resmi situs web untuk (a) merusak, melemahkan atau membahayakan setiap aspek dari situs web, layanan atau sistem dan jaringan terkait, dan/atau (b) membuat produk atau layanan tandingan serupa menggunakan ide, fitur, fungsi atau grafik menyerupai layanan.</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-black border-l-4 border-pink-500 pl-4 mb-4">Penyelesaian Masalah</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Apabila Anda mengalami gangguan sistem, mengetahui atau menduga bahwa Akun Anda diretas, digunakan atau disalahgunakan oleh pihak lain, atau apabila perangkat telepon genggam atau tablet pribadi Anda hilang, dicuri, diretas atau terkena virus, segera laporkan kepada Kami sehingga Kami dapat segera mengambil tindakan yang diperlukan untuk menghindari penggunaan, penyalahgunaan, atau kerugian yang timbul atau mungkin timbul lebih lanjut.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            Apabila Anda mengalami kendala atau masalah terkait layanan, Anda dapat menyampaikan keluhan Anda melalui fitur yang Kami sediakan, termasuk pemberian umpan balik atau dengan menghubungi Kami. Untuk menyampaikan keluhan, pertanyaan, sanggahan, dan lain-lain, Anda perlu memberikan informasi yang cukup, termasuk namun tidak terbatas pada ringkasan fakta yang terjadi, bukti-bukti yang Anda miliki, dan informasi pribadi, seperti nama lengkap dan alamat surel.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            Untuk menanggapi setiap Laporan yang Anda sampaikan, Kami akan melakukan verifikasi terlebih dahulu dengan mencocokan informasi yang Anda berikan dan informasi pribadi Anda yang terdapat dalam sistem Kami. Jika diperlukan, Kami dapat secara langsung meminta Anda memberikan informasi yang diperlukan untuk tujuan verifikasi.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Kami dapat menolak untuk menindaklanjuti Laporan Anda jika informasi yang Anda berikan tidak cocok dengan informasi pribadi yang terdapat dalam sistem Kami atau apabila Laporan disampaikan terkait, terhadap, atas nama atau oleh pihak lain yang berbeda dengan pemilik Akun yang bersangkutan yang terdaftar secara resmi pada sistem Kami. Kami dapat memberhentikan tindak lanjut terhadap Laporan Anda jika Kami, dengan kebijakan Kami sepenuhnya, menganggap bahwa Laporan Anda tidak didukung oleh fakta-fakta yang cukup dan jelas, atau telah selesai.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-black border-l-4 border-gray-500 pl-4 mb-4">Batasan Tanggung Jawab Kami</h2>
          <p className="text-gray-700 leading-relaxed">
            Kami menyediakan layanan sebagaimana adanya dan Kami tidak menyatakan atau menjamin bahwa keandalan, ketepatan waktu, kualitas, kesesuaian, ketersediaan, akurasi, kelengkapan atau keamanan dari layanan dapat memenuhi kebutuhan dan akan sesuai dengan harapan Anda. Kami tidak bertanggung jawab atas setiap kerugian atau kerusakan yang disebabkan oleh setiap kegagalan atau kesalahan yang dilakukan oleh Pelamar Kerja, Pencari Kandidat (Perusahaan), ataupun ataupun kegagalan atau kesalahan Anda dalam mematuhi Ketentuan Penggunaan Kami.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-black border-l-4 border-amber-500 pl-4 mb-4">Keadaan Kahar</h2>
          <p className="text-gray-700 leading-relaxed">
            Layanan dapat diinterupsi oleh kejadian di luar kewenangan atau kontrol Kami (&quot;Keadaan Kahar&quot;/force majeure), termasuk namun tidak terbatas pada bencana alam, gangguan listrik, gangguan telekomunikasi, kebijakan pemerintah, dan lain-lain. Anda setuju untuk membebaskan Kami dari setiap tuntutan dan tanggung jawab, jika Kami tidak dapat memfasilitasi layanan, termasuk memenuhi instruksi yang Anda berikan melalui situs web, baik sebagian maupun seluruhnya, karena suatu Keadaan Kahar.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-black border-l-4 border-cyan-500 pl-4 mb-4">Lain-Lain</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Anda mengerti dan setuju bahwa Ketentuan Penggunaan ini merupakan perjanjian dalam bentuk elektronik dan tindakan Anda menekan tombol &quot;daftar&quot; saat pembukaan Akun atau tombol &quot;masuk&quot; saat akan mengakses Akun Anda merupakan persetujuan aktif Anda untuk mengikatkan diri dalam perjanjian dengan Kami sehingga keberlakuan Ketentuan Penggunaan ini dan Pemberitahuan Privasi adalah sah dan mengikat secara hukum dan terus berlaku sepanjang penggunaan layanan oleh Anda.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            Anda tidak akan mengajukan tuntutan atau keberatan apapun terhadap keabsahan dari Ketentuan Penggunaan atau Pemberitahuan Privasi yang dibuat dalam bentuk elektronik.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            Anda tidak dapat mengalihkan hak Anda berdasarkan Ketentuan Penggunaan ini tanpa persetujuan tertulis sebelumnya dari Kami. Namun, Kami dapat mengalihkan hak Kami berdasarkan Ketentuan Penggunaan ini setiap saat kepada pihak lain tanpa perlu mendapatkan persetujuan terlebih dahulu dari atau memberikan pemberitahuan sebelumnya kepada Anda.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            Bila Anda tidak mematuhi atau melanggar ketentuan dalam Ketentuan Penggunaan ini, dan Kami tidak mengambil tindakan secara langsung, bukan berarti Kami mengesampingkan hak Kami untuk mengambil tindakan yang diperlukan di kemudian hari.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Ketentuan ini tetap berlaku bahkan setelah pembekuan sementara, pembekuan permanen, penghapusan layanan atau setelah berakhirnya perjanjian ini antara Anda dan Kami.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-black border-l-4 border-emerald-500 pl-4 mb-4">Cara Menghubungi Kami</h2>
          <div className="bg-emerald-50 p-4 rounded border-2 border-emerald-200">
            <p className="text-gray-700 leading-relaxed mb-2">
              Anda dapat menghubungi Kami melalui:
            </p>
            <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-1">
              <li><strong>Email:</strong> barlinkid@gmail.com</li>
              <li><strong>WhatsApp:</strong> +62 878-8372-2694</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3 text-sm">
              Semua korespondensi Anda akan direkam dan disimpan untuk arsip Kami.
            </p>
          </div>
        </section>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-8 border-t-4 border-black">
        <Link 
          href="/legal/user-agreement" 
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
        >
          ← Perjanjian Pengguna
        </Link>
        <Link 
          href="/legal/privacy-policy" 
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
        >
          Kebijakan Privasi →
        </Link>
      </div>
    </div>
  )
}