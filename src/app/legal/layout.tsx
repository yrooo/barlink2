import { Metadata } from 'next'
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Legal - Barlink',
  description: 'Legal documents and policies for Barlink job platform',
}

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-main">
      <Link href="/" className="absolute top-4 left-4 z-10">
        <Button variant="default" size="icon" className="bg-white text-black touch-target">
          <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>
      </Link>
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-4xl">
        <div className="bg-white border-2 sm:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-4 sm:p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}