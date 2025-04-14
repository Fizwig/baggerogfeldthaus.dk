'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  
  const isActive = (path: string) => pathname === path;
  
  return (
    <nav className="navbar backdrop-blur-sm bg-black/10 border-b border-pink-900/20 py-0">
      <div className="max-w-4xl mx-auto py-0.5">
        <div className="flex items-center justify-center space-x-4">
          <Link 
            href="/" 
            className={`nav-link text-xs font-light px-1.5 py-0.5 rounded transition-all duration-300 ${isActive('/') 
              ? 'text-white bg-pink-500/10 border-b border-pink-500/70' 
              : 'text-pink-300/90 hover:text-white hover:bg-pink-500/5'}`}
          >
            FORSIDE
          </Link>
          <Link 
            href="/turne" 
            className={`nav-link text-xs font-light px-1.5 py-0.5 rounded transition-all duration-300 ${isActive('/turne') 
              ? 'text-white bg-pink-500/10 border-b border-pink-500/70' 
              : 'text-pink-300/90 hover:text-white hover:bg-pink-500/5'}`}
          >
            TOUR
          </Link>
          <Link 
            href="/brevkasse" 
            className={`nav-link text-xs font-light px-1.5 py-0.5 rounded transition-all duration-300 ${isActive('/brevkasse') 
              ? 'text-white bg-pink-500/10 border-b border-pink-500/70' 
              : 'text-pink-300/90 hover:text-white hover:bg-pink-500/5'}`}
          >
            BREVKASSE
          </Link>
          <Link 
            href="/opslagstavle" 
            className={`nav-link text-xs font-light px-1.5 py-0.5 rounded transition-all duration-300 ${isActive('/opslagstavle') 
              ? 'text-white bg-pink-500/10 border-b border-pink-500/70' 
              : 'text-pink-300/90 hover:text-white hover:bg-pink-500/5'}`}
          >
            OPSLAGSTAVLE
          </Link>
        </div>
      </div>
    </nav>
  );
} 