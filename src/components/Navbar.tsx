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
import { Menu } from 'lucide-react';
import { useState } from 'react';
import { useUserData } from '@/hooks/useUserData';

export default function UpdatedNavbar() {
  const { data: session } = useSession();
  const { userData } = useUserData();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);



  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <nav className="bg-white border-b-2 sm:border-b-4 border-black sticky top-0 z-50">
      <div className="container-responsive">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center hover:scale-103 hover:rotate-1 duration-300">
            <Link href="/" className="flex items-center space-x-1 sm:space-x-2">
              <Image
                src="/logo.png"
                alt="BarLink Logo"
                width={40}
                height={40}
                className="sm:w-[50px] sm:h-[50px]"
              />
              <span className="text-xl sm:text-2xl font-black text-black">Barlink</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            <Link
              href="/#beranda"
              className="text-black hover:text-main font-semibold hover:-translate-y-1 duration-300 text-sm xl:text-base"
            >
              Beranda
            </Link>
            <Link
              href="/#tentang-kami"
              className="text-black hover:text-main font-semibold hover:-translate-y-1 duration-300 text-sm xl:text-base"
            >
              Tentang Kami
            </Link>
            <Link
              href="/#bantuan"
              className="text-black hover:text-main font-semibold hover:-translate-y-1 duration-300 text-sm xl:text-base"
            >
              Bantuan
            </Link>
            <Link
              href="/job?type=seek"
              className="text-black hover:text-main font-semibold hover:-translate-y-1 duration-300 text-sm xl:text-base"
            >
              Lowongan Kerja
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-3 xl:space-x-4">
            {session ? (
              <DropdownMenu open={isProfileDropdownOpen} onOpenChange={setIsProfileDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="noShadow" className="relative h-8 w-8 xl:h-10 xl:w-10 rounded-full touch-target">
                    <Avatar className="h-8 w-8 xl:h-10 xl:w-10">
                      <AvatarImage src={userData?.image || ''} alt={userData?.name || 'User'} />
                      <AvatarFallback className="text-xs xl:text-sm">{userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{userData?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {userData?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {userData?.role === 'pencari_kandidat' && (
                    <DropdownMenuItem asChild isButton>
                      <Link href="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  {userData?.role === 'pelamar_kerja' && (
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
              <div className="flex items-center space-x-2 xl:space-x-4">
                <Button asChild variant="noShadow" size="sm" className="text-xs xl:text-sm px-3 xl:px-4 touch-target">
                  <Link href="/auth/signin">Masuk</Link>
                </Button>
                <Button asChild size="sm" className="text-xs xl:text-sm px-3 xl:px-4 touch-target">
                  <Link href="/auth/signup">Daftar</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Navigation Menu using DropdownMenu */}
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="noShadow"
              size="icon"
              className="lg:hidden touch-target"
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-64 mt-2 max-h-[calc(100vh-5rem)] overflow-y-auto"
          >
            {/* Navigation Links */}
            <DropdownMenuItem asChild>
              <Link href="/#beranda" onClick={() => setIsMenuOpen(false)}>
                Beranda
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/#tentang-kami" onClick={() => setIsMenuOpen(false)}>
                Tentang Kami
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/#bantuan" onClick={() => setIsMenuOpen(false)}>
                Bantuan
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/job?type=seek" onClick={() => setIsMenuOpen(false)}>
                Lowongan Kerja
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            {/* Auth Section */}
            {session ? (
              <>
                {/* User Greeting */}
                <div className="px-2 py-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6 border border-black">
                      <AvatarImage src={userData?.image || ''} alt={userData?.name || 'User'} />
                      <AvatarFallback className="text-xs">{userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                    </Avatar>
                    <span>Halo, {userData?.name}</span>
                  </div>
                </div>
                
                <DropdownMenuSeparator />
                
                {/* Role-based Navigation */}
                {userData?.role === 'pencari_kandidat' ? (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                      📊 Dashboard
                    </Link>
                  </DropdownMenuItem>
                ) : userData?.role === 'pelamar_kerja' ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/my-applications" onClick={() => setIsMenuOpen(false)}>
                        📋 Lamaran Saya
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                        👤 Profil
                      </Link>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem asChild>
                    <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                      👤 Profil
                    </Link>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
                
                {/* Logout Button */}
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                >
                  🚪 Keluar
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem asChild>
                  <Link href="/auth/signin" onClick={() => setIsMenuOpen(false)}>
                    Masuk
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/auth/signup" onClick={() => setIsMenuOpen(false)}>
                    Daftar
                  </Link>
                </DropdownMenuItem>
              </>
            )}
           </DropdownMenuContent>
         </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}

