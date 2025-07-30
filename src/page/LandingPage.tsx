'use client';

import { useRouter } from 'next/navigation';
import React from 'react';

const LandingPage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-main p-8 bg-[linear-gradient(to_right,#80808012_3px,transparent_1px),linear-gradient(to_bottom,#80808012_3px,transparent_1px)] bg-[size:64px_64px]">
      <div className="max-w-5xl mx-auto">
        {/* Section: Beranda */}
        <section id="beranda" className="text-center py-20">
          {/* <div> */}
          <h1 className="text-6xl font-black mb-4 text-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 inline-block duration-300 hover:scale-102 hover:rotate-1">
            Temukan Jodoh Karirmu
          </h1>
          <p className="text-2xl text-black mt-8 max-w-3xl mx-auto">Baik Anda merekrut atau mencari pekerjaan, kami siap membantu Anda menemukan yang paling cocok!</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-yellow-400 p-8 rounded-md border-4 border-black shadow-shadow duration-200 hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none"
            >
              <h2 className="text-4xl font-bold mb-4">Pasang Lowongan</h2>
              <p className="text-xl">Publikasikan lowongan Anda dan temukan kandidat yang sempurna.</p>
            </button>

            <button
              onClick={() => router.push('/job?type=seek')}
              className="bg-blue-400 p-8 rounded-md border-4 border-black shadow-shadow duration-200 hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none"
            >
              <h2 className="text-4xl font-bold mb-4">Cari Pekerjaan</h2>
              <p className="text-xl">Jelajahi posisi yang tersedia dan lamar sekarang juga.</p>
            </button>
          </div>
        </section>

        {/* Section: Tentang Kami */}
        <section id="tentang-kami" className="py-20">
          <div className="bg-white p-8 rounded-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-5xl font-black mb-6 text-center">Tentang Kami</h2>
            <p className="text-xl leading-relaxed text-gray-800">
              BarLink adalah platform revolusioner yang menghubungkan para pencari kerja dengan perusahaan impian mereka. Misi kami adalah menyederhanakan proses rekrutmen dan membuatnya lebih transparan dan efisien bagi kedua belah pihak. Dengan antarmuka yang terinspirasi dari neobrutalism, kami menawarkan pengalaman yang unik, jujur, dan langsung ke intinya.
            </p>
          </div>
        </section>

        {/* Section: Bantuan */}
        <section id="bantuan" className="py-20">
          <div className="bg-white p-8 rounded-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-5xl font-black mb-6 text-center">Butuh Bantuan?</h2>
            <p className="text-xl text-center text-gray-800 mb-8">
              Punya pertanyaan atau butuh bantuan? Jangan ragu untuk menghubungi kami.
            </p>
            <div className="max-w-md mx-auto">
              <form className="space-y-4">
                <input type="email" placeholder="Email Anda" className="w-full p-3 border-4 border-black rounded focus:outline-none focus:ring-2 focus:ring-green-400" />
                <textarea placeholder="Pesan Anda" rows={5} className="w-full p-3 border-4 border-black rounded focus:outline-none focus:ring-2 focus:ring-green-400"></textarea>
                <button type="submit" className="w-full bg-main px-8 py-4 text-xl font-bold rounded-md border-4 border-black shadow-shadow duration-200 hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none">
                  Kirim Pesan
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LandingPage;

