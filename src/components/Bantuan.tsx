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
    <div id="bantuan" className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black text-black mb-6 bg-white p-4 inline-block shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black">
            Pusat Bantuan 🆘
          </h1>
          <p className="text-xl text-black max-w-3xl mx-auto">
            Temukan jawaban untuk pertanyaan Anda atau hubungi tim support kami yang siap membantu 24/7.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white p-6 rounded-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all duration-200">
            <div className="w-16 h-16 bg-main rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-2xl">📧</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Email Support</h3>
            <p className="text-gray-600 mb-4">support@barlink.com</p>
            <Button className="w-full bg-black text-white hover:bg-gray-700 border-2 border-black">Kirim Email</Button>
          </div>

          <div className="bg-white p-6 rounded-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all duration-200">
            <div className="w-16 h-16 bg-main rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-2xl">💬</span>
            </div>
            <h3 className="text-xl font-bold mb-2">WhatsApp</h3>
            <p className="text-gray-600 mb-4">+62 812-3456-7890</p>
            <Button className="w-full bg-black text-white hover:bg-gray-700 border-2 border-black">Chat WhatsApp</Button>
          </div>

          <div className="bg-white p-6 rounded-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all duration-200">
            <div className="w-16 h-16 bg-main rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-2xl">📞</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Telepon</h3>
            <p className="text-gray-600 mb-4">021-1234-5678</p>
            <Button className="w-full bg-black text-white hover:bg-gray-700 border-2 border-black">Hubungi Kami</Button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
          <h2 className="text-3xl font-bold text-black mb-8 text-center">
            Pertanyaan yang Sering Diajukan (FAQ)
          </h2>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-lg border-2 border-black font-semibold transition-all duration-200 ${
                  activeCategory === category.id
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                {category.icon} {category.name}
              </button>
            ))}
          </div>

          {/* FAQ List */}
          <Accordion type="single" collapsible className="w-full">
            {filteredFAQs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-2 border-black rounded-lg mb-4">
                <AccordionTrigger className="p-4 hover:no-underline bg-white hover:bg-gray-100 border-b-2 border-black">
                  <span className="font-semibold text-black">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="p-4 bg-gray-50">
                  <p className="text-gray-700">{faq.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Additional Help Section */}
        <div className="py-20 text-center">
          <h2 className="text-3xl font-bold text-black mb-6">
            Masih Butuh Bantuan?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Tim support kami siap membantu Anda 24/7. Jangan ragu untuk menghubungi kami!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-black text-white hover:bg-gray-700 border-2 border-black px-8 py-3">
              Hubungi Support
            </Button>
            <Button size="lg" className="bg-white text-black hover:bg-gray-100 border-2 border-black px-8 py-3">
              Kirim Feedback
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

