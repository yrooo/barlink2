'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

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
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 border-b-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="text-left space-y-6 sm:space-y-8 order-2 lg:order-1">
            
            {/* Main Heading */}
            <div className="space-y-4 sm:space-y-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-center lg:text-left">
                <span className="block transform hover:scale-103 transition-transform duration-300 drop-shadow-xl">Temukan</span>
                <span className="block transform hover:scale-103 transition-transform duration-300 drop-shadow-xl">karir impian</span>
                <span className="block transform hover:scale-103 transition-transform duration-300 drop-shadow-xl">Anda</span>
              </h1>
              
              <p className="text-sm sm:text-md lg:text-lg text-gray-800 max-w-md leading-relaxed text-center lg:text-left mx-auto lg:mx-0">
                Platform terpercaya untuk mencari lowongan kerja dan menemukan talenta terbaik di Indonesia.
              </p>
            </div>
            
            {/* CTA Section */}
            <div className="space-y-4 flex flex-col items-center lg:items-start">
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <Button className="bg-white px-8 py-4 rounded-md font-semibold text-lg w-full sm:w-auto">
                  🚀 Mulai Sekarang
                </Button>
                <Button variant="noShadow" className="px-6 py-4 rounded-md font-medium w-full sm:w-auto hover:bg-white transition-all duration-200">
                  📋 Lihat Lowongan
                </Button>
              </div>
            </div>
          </div>
          
          {/* Right Illustration - Hidden on mobile */}
          <div className="hidden lg:flex justify-center lg:justify-end w-full order-1 lg:order-2">
            <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-full h-64 sm:h-80 lg:h-full">
              <Image 
                src="/barlinkhero.png" 
                alt="Hero illustration" 
                width={600}
                height={400}
                className="w-full h-full object-contain transform hover:scale-102 transition-transform duration-500 drop-shadow-2xl"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Job Seeking Section */}
      <section className="section-padding bg-background">
        <div className="container-responsive">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="font-black text-black mb-4">
              💼 Lowongan Kerja Terbaru
            </h2>
            <p className="text-responsive text-gray-600 px-4">
              Temukan pekerjaan impian Anda dengan mudah
            </p>
          </div>

          <div className="grid-responsive mb-6 sm:mb-8">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="bg-white content-padding border-responsive shadow-responsive hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:-translate-y-1 w-full flex flex-col h-full">
                <h3 className="text-lg sm:text-xl font-bold text-black mb-2 line-clamp-2">{job.title}</h3>
                <p className="text-main font-semibold mb-2 text-sm sm:text-base">{job.company}</p>
                <p className="text-gray-600 mb-2 text-sm sm:text-base">📍 {job.location}</p>
                <p className="text-green-600 font-bold mb-4 text-sm sm:text-base">💰 Rp {job.salary}</p>
                <p className="text-gray-700 text-xs sm:text-sm mb-4 line-clamp-3 flex-grow">
                  {job.description}
                </p>
                <Button asChild className="w-full touch-target">
                  <Link href={`/job/${job._id}`}>Lihat Detail</Link>
                </Button>
              </div>
            ))}
          </div>

          <div className="text-center sm:pt-4">
            <Button asChild size="lg" variant="default" className="touch-target w-full sm:w-auto">
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
      <section className="section-padding sm:pt-0 bg-background">
        <div className="container-responsive">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="font-black text-black mb-4">
              ✨ Mengapa Memilih Barlink?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center content-padding bg-white border-responsive shadow-responsive hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:-translate-y-1">
              <Button className="w-12 h-12 sm:w-16 sm:h-16 bg-main rounded-full flex items-center justify-center mx-auto mb-4 border-responsive border-black">
                <span className="text-xl sm:text-2xl">🎯</span>
              </Button>
              <h3 className="text-lg sm:text-xl font-bold mb-2">Mudah & Cepat</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Proses pencarian kerja dan jual beli yang simpel dan efisien
              </p>
            </div>

            <div className="text-center content-padding bg-white border-responsive shadow-responsive hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:-translate-y-1">
              <Button className="w-12 h-12 sm:w-16 sm:h-16 bg-main rounded-full flex items-center justify-center mx-auto mb-4 border-responsive border-black">
                <span className="text-xl sm:text-2xl">🔒</span>
              </Button>
              <h3 className="text-lg sm:text-xl font-bold mb-2">Aman & Terpercaya</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Sistem keamanan berlapis untuk melindungi data dan transaksi Anda
              </p>
            </div>

            <div className="text-center content-padding bg-white border-responsive shadow-responsive hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:-translate-y-1 md:col-span-2 lg:col-span-1">
              <Button className="w-12 h-12 sm:w-16 sm:h-16 bg-main rounded-full flex items-center justify-center mx-auto mb-4 border-responsive border-black">
                <span className="text-xl sm:text-2xl">💼</span>
              </Button>
              <h3 className="text-lg sm:text-xl font-bold mb-2">Lowongan Berkualitas</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Ribuan lowongan kerja dari perusahaan terpercaya di seluruh Indonesia
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-main border-t-2 sm:border-t-4 border-b-2 sm:border-b-4 border-black">
        <div className="container-responsive text-center">
          <h2 className="font-black mb-4 sm:mb-6">
            Siap Memulai Perjalanan Anda?
          </h2>
          <p className="text-responsive mb-6 sm:mb-8 px-4">
            Bergabunglah dengan ribuan pengguna yang telah merasakan kemudahan Barlink
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="bg-white hover:bg-black hover:text-white sm:text-md px-6 sm:px-8 py-3 h-auto touch-target w-full sm:w-auto">
              <Link href="/auth/signup">Daftar Sekarang</Link>
            </Button>
            <Button asChild size="lg" variant="default" className="sm:text-md px-6 sm:px-8 py-3 h-auto touch-target w-full sm:w-auto">
              <Link href="/auth/signin">Masuk</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

