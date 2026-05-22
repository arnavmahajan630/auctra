export default function Footer() {
  return (
    <footer className="w-full py-8 border-t border-slate-800/50 bg-[#04050a] mt-auto">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left - Logo */}
        <div className="text-white font-bold text-lg tracking-tight">Oktra</div>

        {/* Center - Links */}
        <div className="flex flex-wrap justify-center gap-6 text-[13px] text-slate-500 font-medium">
          <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-slate-300 transition-colors">Docs</a>
          <a href="#" className="hover:text-slate-300 transition-colors">Twitter</a>
          <a href="#" className="hover:text-slate-300 transition-colors">Discord</a>
        </div>

        {/* Right - Copyright */}
        <div className="text-[13px] text-slate-500 font-medium">
          © 2026 Oktra Protocol. Elite Technical Liquidity.
        </div>
      </div>
    </footer>
  );
}
