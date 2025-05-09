// components/Footer.js
import Image from 'next/image';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="w-full bg-black text-white">
      {/* Banner Image */}
      <div className="w-full h-85 relative overflow-hidden">
        <Image
          src="/image/footer.avif"
          alt="Misty forest"
          layout="fill"
          objectFit="cover"
          className="opacity-80"
          priority
        />
      </div>

      {/* Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-10 flex flex-wrap justify-between">
        {/* Main Links */}
        <div className="w-full md:w-auto mb-2 md:mb-0">
          <nav className="flex flex-col space-y-3">
            <Link href="/" className="text-orange-500 hover:text-orange-400 transition-colors">
              Home
            </Link>
            <Link href="/road-trips" className="text-orange-500 hover:text-orange-400 transition-colors">
              Categories
            </Link>
            <Link href="/blog" className="text-orange-500 hover:text-orange-400 transition-colors">
              Contact Us
            </Link>
          </nav>
        </div>
      </div>

    </footer>
  );
};

export default Footer;
