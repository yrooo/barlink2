'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";


interface FAQItem {
  question: string;
  answer: string;
  category: 'job' | 'marketplace' | 'account' | 'general';
}

export default function BantuanPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');


  const faqs: FAQItem[] = [
    {
      question: 'Bagaimana cara mendaftar di Barlink?',
      answer: 'Klik tombol "Daftar" di halaman utama, pilih peran Anda (pencari kerja atau perusahaan), isi formulir pendaftaran dengan lengkap, dan verifikasi email Anda.',
      category: 'account'
    },
    {
      question: 'Apakah gratis untuk mencari kerja di Barlink?',
      answer: 'Ya, pencarian kerja di Barlink sepenuhnya gratis untuk pencari kerja. Anda dapat melamar sebanyak-banyaknya tanpa biaya.',
      category: 'job'
    },
    {
      question: 'Bagaimana cara melamar pekerjaan?',
      answer: 'Setelah login, cari lowongan yang sesuai, klik "Lihat Detail", isi formulir aplikasi yang disediakan perusahaan, dan klik "Kirim Lamaran".',
      category: 'job'
    },
    // {
    //   question: 'Bagaimana cara menjual barang di marketplace?',
    //   answer: 'Fitur marketplace sedang dalam tahap pengembangan. Saat ini Anda dapat melihat produk yang tersedia, dan fitur penjualan akan segera hadir.',
    //   category: 'marketplace'
    // },
    // {
    //   question: 'Apakah transaksi di marketplace aman?',
    //   answer: 'Ya, kami menggunakan sistem keamanan berlapis untuk melindungi setiap transaksi. Semua pembayaran melalui gateway yang terverifikasi.',
    //   category: 'marketplace'
    // },
    {
      question: 'Bagaimana cara mengubah profil saya?',
      answer: 'Login ke akun Anda, klik menu profil di navbar, lalu pilih "Edit Profil" untuk mengubah informasi pribadi atau perusahaan.',
      category: 'account'
    },
    {
      question: 'Lupa password, bagaimana cara reset?',
      answer: 'Klik "Lupa Password" di halaman login, masukkan email Anda, dan ikuti instruksi yang dikirim ke email untuk reset password.',
      category: 'account'
    },
    {
      question: 'Bagaimana cara menghubungi customer service?',
      answer: 'Anda dapat menghubungi kami melalui email support@barlink.com atau WhatsApp di +62 812-3456-7890. Tim kami siap membantu 24/7.',
      category: 'general'
    }
  ];

  const categories = [
    { id: 'all', name: 'Semua', icon: '📋' },
    { id: 'job', name: 'Lowongan Kerja', icon: '💼' },
    // { id: 'marketplace', name: 'Marketplace', icon: '🛒' },
    { id: 'account', name: 'Akun', icon: '👤' },
    { id: 'general', name: 'Umum', icon: '❓' }
  ];

  const filteredFAQs = activeCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === activeCategory);



  return (
    <div id="bantuan" className="border-t-4 border-black min-h-screen bg-gray-50 section-padding">
      <div className="container-responsive">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-black mb-4 sm:mb-6 bg-white content-padding inline-block shadow-responsive border-responsive hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all duration-200">
            Pusat Bantuan 🆘
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-black max-w-3xl mx-auto px-4">
            Temukan jawaban untuk pertanyaan Anda atau hubungi tim support kami yang siap membantu.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12 lg:mb-16">
          <div className="bg-white content-padding border-responsive shadow-responsive text-center hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all duration-200">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-main rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 border-responsive">
              <span className="text-xl sm:text-2xl">📧</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2">Email Support</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 break-all">barlinkid@gmail.com</p>
            <Button className="w-full bg-main touch-target text-sm sm:text-base">Kirim Email</Button>
          </div>

          <div className="bg-white content-padding border-responsive shadow-responsive text-center hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all duration-200">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-main rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 border-responsive">
              <span className="text-xl sm:text-2xl">💬</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2">WhatsApp</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">+62 878-8372-2694</p>
            <Button 
              className="w-full bg-main touch-target text-sm sm:text-base"
              onClick={() => window.open('https://wa.me/6287883722694', '_blank')}
            >
              Chat WhatsApp
            </Button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-responsive border-responsive shadow-responsive content-padding">
          <h2 className="text-2xl sm:text-3xl font-bold text-black mb-6 sm:mb-8 text-center">
            Pertanyaan yang Sering Diajukan (FAQ)
          </h2>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg border-responsive font-semibold transition-all duration-200 touch-target text-sm sm:text-base ${
                  activeCategory === category.id
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                <span className="hidden sm:inline">{category.icon} </span>{category.name}
              </button>
            ))}
          </div>

          {/* FAQ List */}
          <Accordion type="single" collapsible className="w-full">
            {filteredFAQs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-responsive rounded-responsive mb-3 sm:mb-4">
                <AccordionTrigger className="content-padding hover:no-underline bg-white hover:bg-gray-100 border-b-responsive touch-target">
                  <span className="font-semibold text-black text-sm sm:text-base text-left">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="content-padding bg-gray-50">
                  <p className="text-gray-700 text-sm sm:text-base leading-relaxed">{faq.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Additional Help Section */}
        <div className="section-padding text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-black mb-4 sm:mb-6">
            Masih Butuh Bantuan?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Tim support kami siap membantu Anda. Jangan ragu untuk menghubungi kami!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
            <Button size="lg" className="bg-main px-6 sm:px-8 py-3 touch-target text-sm sm:text-base">
              Hubungi Support
            </Button>
            <Button 
              size="lg" 
              className="bg-white text-black px-6 sm:px-8 py-3 touch-target text-sm sm:text-base"
              onClick={() => window.open('https://tally.so/r/wL8J22', '_blank')}
            >
              Kirim Feedback
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

