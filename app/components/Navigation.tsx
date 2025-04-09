import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="w-full flex justify-center py-6 relative z-20">
      <div className="fixed top-0 left-0 right-0 h-20 bg-black/20 backdrop-blur-xl border-b border-pink-500/10 z-[-1]" />
      <ul className="flex flex-wrap justify-center gap-3">
        {[
          { href: "/", text: "Forside" },
          { href: "/turne", text: "Turné" },
          { href: "/brevkasse", text: "Brevkasse" },
          { href: "/opslagstavle", text: "Opslagstavle" }
        ].map((item) => (
          <li key={item.href}>
            <Link 
              href={item.href}
              className={`relative px-6 py-2.5 group transition-all duration-300 rounded-lg inline-block 
                ${pathname === item.href 
                  ? "bg-pink-600/20 text-white border border-pink-400/50" 
                  : "backdrop-blur-md bg-black/20 border border-pink-400/20 text-white/80 hover:bg-pink-600/10 hover:border-pink-400/40 hover:text-white"
                }`}
            >
              <span className="relative z-10 font-medium tracking-wide text-sm">
                {item.text}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/0 via-pink-500/20 to-pink-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
} 