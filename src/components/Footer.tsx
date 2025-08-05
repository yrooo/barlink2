import Image from 'next/image';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-main py-8 border-t-4">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0 hover:scale-103 transition-transform duration-300">
          <Link href="/">
            <Image src="/logo.png" alt="Barlink2 Logo" width={70} height={40} />
          </Link>
        </div>
        <div className="text-center text-black md:text-left mb-4 md:mb-0">
          <p>&copy; {new Date().getFullYear()} Barlink. All rights reserved.</p>
        </div>
        <div className="flex space-x-4">
          <Link href="#" className="text-black hover:text-white">
            Facebook
          </Link>
          <Link href="#" className="text-black hover:text-white">
            Twitter
          </Link>
          <Link href="#" className="text-black hover:text-white">
            Instagram
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;