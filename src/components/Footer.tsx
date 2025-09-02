import Image from 'next/image';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-main py-6 border-t-responsive border-t-4">
      <div className="container-responsive flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6">
        <div className="hover:scale-103 transition-transform duration-300 order-1 sm:order-1">
          <Link href="/" className="touch-target">
            <Image 
              src="/logo.png" 
              alt="Barlink2 Logo" 
              width={60} 
              height={35}
              className="" 
            />
          </Link>
        </div>
        <div className="text-center text-black order-3 sm:order-2">
          <p className="text-sm sm:text-base">&copy; {new Date().getFullYear()} Barlink. All rights reserved.</p>
        </div>
        <div className="flex space-x-3 sm:space-x-4 order-2 sm:order-3">
          <Link href="#" className="text-black hover:text-white touch-target text-sm sm:text-base font-medium transition-colors duration-200">
            Facebook
          </Link>
          <Link href="#" className="text-black hover:text-white touch-target text-sm sm:text-base font-medium transition-colors duration-200">
            Twitter
          </Link>
          <Link href="#" className="text-black hover:text-white touch-target text-sm sm:text-base font-medium transition-colors duration-200">
            Instagram
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;