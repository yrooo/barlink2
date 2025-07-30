'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from 'react';

export default function UpdatedNavbar() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
    setIsMenuOpen(false); // Close mobile menu after clicking
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <nav className="bg-white border-b-4 border-black sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center hover:scale-102 hover:rotate-1 duration-300">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/logo.png"
                alt="BarLink Logo"
                width={50}
                height={50}
                className=""
              />
              <span className="text-2xl font-black text-black">Barlink</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection('beranda')}
              className="text-black hover:text-main font-semibold hover:-translate-y-1 hover:rotate-1 duration-300"
            >
              Beranda
            </button>
            <button
              onClick={() => scrollToSection('tentang-kami')}
              className="text-black hover:text-main font-semibold transition-colors duration-200"
            >
              Tentang Kami
            </button>
            <button
              onClick={() => scrollToSection('bantuan')}
              className="text-black hover:text-main font-semibold transition-colors duration-200"
            >
              Bantuan
            </button>
            <Link
              href="/job?type=seek"
              className="text-black hover:text-main font-semibold transition-colors duration-200"
            >
              Lowongan Kerja
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {session ? (
              <DropdownMenu open={isProfileDropdownOpen} onOpenChange={setIsProfileDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 border-2 border-black">
                      <AvatarImage src={session.user.image || ''} alt={session.user.name || 'User'} />
                      <AvatarFallback>{session.user.name ? session.user.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session.user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {session.user.role === 'pencari_kandidat' && (
                    <DropdownMenuItem asChild isButton>
                      <Link href="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  {session.user.role === 'pelamar_kerja' && (
                    <DropdownMenuItem asChild isButton>
                      <Link href="/dashboard/my-applications">Lamaran Saya</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild isButton>
                    <Link href="/profile">Profil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} isButton className="text-red-600 hover:text-red-700">
                    Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-4">
                <Button asChild variant="noShadow" size="sm">
                  <Link href="/auth/signin">Masuk</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/auth/signup">Daftar</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-black hover:text-main focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t-2 border-black bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <button
                onClick={() => scrollToSection('beranda')}
                className="block w-full text-left px-3 py-2 text-black hover:text-main font-semibold"
              >
                Beranda
              </button>
              <button
                onClick={() => scrollToSection('tentang-kami')}
                className="block w-full text-left px-3 py-2 text-black hover:text-main font-semibold"
              >
                Tentang Kami
              </button>
              <button
                onClick={() => scrollToSection('bantuan')}
                className="block w-full text-left px-3 py-2 text-black hover:text-main font-semibold"
              >
                Bantuan
              </button>
              <Link
                href="/job"
                className="block px-3 py-2 text-black hover:text-main font-semibold"
                onClick={() => setIsMenuOpen(false)}
              >
                Lowongan Kerja
              </Link>

              {/* Mobile Auth Section */}
              <div className="border-t-2 border-gray-200 pt-4 mt-4">
                {session ? (
                  <div className="space-y-2">
                    <div className="px-3 py-2 text-sm text-gray-600">
                      Halo, {session.user.name}
                    </div>
                    {session.user.role === 'pencari_kandidat' ? (
                      <Link
                        href="/dashboard"
                        className="block px-3 py-2 text-black hover:text-main font-semibold"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                    ) : session.user.role === 'pelamar_kerja' ? (
                      <>
                        <Link
                          href="/dashboard/my-applications"
                          className="block px-3 py-2 text-black hover:text-main font-semibold"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Lamaran Saya
                        </Link>
                        <Link
                          href="/profile"
                          className="block px-3 py-2 text-black hover:text-main font-semibold"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Profil
                        </Link>
                      </>
                    ) : (
                      // Fallback for other roles
                      <Link
                        href="/profile"
                        className="block px-3 py-2 text-black hover:text-main font-semibold"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Profil
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-3 py-2 text-red-600 hover:text-red-800 font-semibold"
                    >
                      Keluar
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href="/auth/signin"
                      className="block px-3 py-2 text-black hover:text-main font-semibold"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Masuk
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="block px-3 py-2 text-black hover:text-main font-semibold"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Daftar
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

