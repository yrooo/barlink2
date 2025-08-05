'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  description: string;
  createdAt: string;
}

// interface MarketplaceItem {
//   id: string;
//   title: string;
//   price: string;
//   location: string;
//   image: string;
//   condition: string;
// }

export default function BerandaPage() {
  const { data: session } = useSession();
  const [jobs, setJobs] = useState<Job[]>([]);
  // const [marketplaceItems] = useState<MarketplaceItem[]>([
  //   {
  //     id: '1',
  //     title: 'iPhone 13 Pro Max',
  //     price: 'Rp 12.000.000',
  //     location: 'Jakarta Selatan',
  //     image: '/placeholder-phone.jpg',
  //     condition: 'Seperti Baru'
  //   },
  //   {
  //     id: '2',
  //     title: 'MacBook Air M2',
  //     price: 'Rp 18.500.000',
  //     location: 'Bandung',
  //     image: '/placeholder-laptop.jpg',
  //     condition: 'Bekas'
  //   },
  //   {
  //     id: '3',
  //     title: 'Honda Beat 2020',
  //     price: 'Rp 15.000.000',
  //     location: 'Surabaya',
  //     image: '/placeholder-motor.jpg',
  //     condition: 'Terawat'
  //   },
  //   {
  //     id: '4',
  //     title: 'Kamera Canon EOS R5',
  //     price: 'Rp 45.000.000',
  //     location: 'Yogyakarta',
  //     image: '/placeholder-camera.jpg',
  //     condition: 'Seperti Baru'
  //   }
  // ]);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs');
      if (response.ok) {
        const data = await response.json();
        setJobs(data.slice(0, 6)); // Show only first 6 jobs
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  return (
    <div id="beranda" className="min-h-screen bg-main">
      {/* Hero Section */}
      <section className="bg-main border-b-4 py-48 bg-[linear-gradient(to_right,#80808012_3px,transparent_1px),linear-gradient(to_bottom,#80808012_3px,transparent_1px)] bg-[size:64px_64px]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-6xl font-black mb-8 text-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black inline-block duration-300 hover:scale-102 hover:shake">
            Selamat Datang di Barlink! 👋
          </h1>
          <p className="text-2xl mb-12 max-w-3xl mx-auto">
            Coming Soon!!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              asChild 
              size="lg" 
              className="bg-white hover:bg-black hover:text-white text-xl px-8 py-4 h-auto border-2 border-black"
            >
              <Link href="/job?type=seek">🔍 Cari Lowongan Kerja</Link>
            </Button>
            {/* <Button 
              asChild 
              size="lg" 
              variant="default" 
              className="border-white hover:bg-black hover:text-white hover:border-black text-xl px-8 py-4 h-auto"
            >
              <Link href="#marketplace">🛒 Jelajahi Marketplace</Link>
            </Button> */}
          </div>
        </div>
      </section>

      {/* Job Seeking Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-black mb-4">
              💼 Lowongan Kerja Terbaru
            </h2>
            <p className="text-xl text-gray-600">
              Temukan pekerjaan impian Anda dengan mudah
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="bg-white p-6 rounded-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:-translate-y-1"
              >
                <h3 className="text-xl font-bold text-black mb-2">{job.title}</h3>
                <p className="text-main font-semibold mb-2">{job.company}</p>
                <p className="text-gray-600 mb-2">📍 {job.location}</p>
                <p className="text-green-600 font-bold mb-4">💰 {job.salary}</p>
                <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                  {job.description}
                </p>
                <Button asChild className="w-full">
                  <Link href="/job?type=seek">Lihat Detail</Link>
                </Button>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button asChild size="lg" variant="default">
              <Link href="/job?type=seek">Lihat Semua Lowongan →</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Marketplace Section */}
      {/* <section id="marketplace" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-black mb-4">
              🛒 Marketplace Barang Bekas
            </h2>
            <p className="text-xl text-gray-600">
              Jual beli barang bekas berkualitas dengan harga terjangkau
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {marketplaceItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 overflow-hidden hover:-translate-y-1"
              >
                <div className="h-48 bg-black flex items-center justify-center border-b-4 border-black">
                  <span className="text-white font-bold text-2xl tracking-widest">FOTO</span>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-black mb-2">{item.title}</h3>
                  <p className="text-main font-bold text-xl mb-2">{item.price}</p>
                  <p className="text-gray-600 text-sm mb-2">📍 {item.location}</p>
                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mb-3">
                    {item.condition}
                  </span>
                  <Button className="w-full" size="sm">
                    Lihat Detail
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button asChild size="lg" variant="outline">
              <Link href="#marketplace">Jelajahi Semua Produk →</Link>
            </Button>
          </div>
        </div>
      </section> */}

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-black mb-4">
              ✨ Mengapa Memilih Barlink?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-main rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Mudah & Cepat</h3>
              <p className="text-gray-600">
                Proses pencarian kerja dan jual beli yang simpel dan efisien
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-main rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Aman & Terpercaya</h3>
              <p className="text-gray-600">
                Sistem keamanan berlapis untuk melindungi data dan transaksi Anda
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-main rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-2xl">💼</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Lowongan Berkualitas</h3>
              <p className="text-gray-600">
                Ribuan lowongan kerja dari perusahaan terpercaya di seluruh Indonesia
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-main rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-2xl">🛍️</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Produk Berkualitas</h3>
              <p className="text-gray-600">
                Barang bekas berkualitas dengan harga terjangkau dan kondisi terjamin
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-main border-t-4 border-b-4">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-black mb-6">
            Siap Memulai Perjalanan Anda?
          </h2>
          <p className="text-xl mb-8">
            Bergabunglah dengan ribuan pengguna yang telah merasakan kemudahan Barlink
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white hover:bg-black hover:text-white">
              <Link href="/auth/signup">Daftar Sekarang</Link>
              </Button>
              <Button asChild size="lg" variant="default" className="border-white text-white hover:bg-black hover:text-white border-black">
              <Link href="/auth/signin">Masuk</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

