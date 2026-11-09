import Link from 'next/link';
import { ShieldCheck, Calculator, Building2, BookOpen, ChevronRight, CheckCircle } from 'lucide-react';

export default function Home() {
  const services = [
    { icon: ShieldCheck, title: 'Credit Repair', desc: 'Dispute inaccuracies and track your credit score growth.' },
    { icon: Calculator, title: 'Personal Tax', desc: 'Expert preparation for W-2s, 1099s, and personal returns.' },
    { icon: Building2, title: 'Business Tax', desc: 'S-Corp, LLC, and C-Corp filings handled by professionals.' },
    { icon: BookOpen, title: 'Bookkeeping', desc: 'Monthly financials, expense tracking, and clean books.' },
  ];

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#0f4c81] rounded flex items-center justify-center text-white font-bold text-xl">Q</div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">Quantum Flux</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-semibold text-gray-700 hover:text-[#0f4c81]">Client Login</Link>
          <Link href="/register" className="text-sm font-semibold bg-[#0f4c81] text-white px-5 py-2.5 rounded-md hover:bg-[#0a3a63] transition-colors">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gray-50 py-24 px-6 text-center border-b border-gray-200">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
            Financial clarity for you and your business.
          </h1>
          <p className="text-xl text-gray-600 mb-10">
            From credit repair to corporate tax, we handle the numbers so you can focus on growth.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/register" className="flex items-center gap-2 bg-[#0f4c81] text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-[#0a3a63] transition-all shadow-lg hover:shadow-xl">
              Start Your Journey <ChevronRight className="w-5 h-5" />
            </Link>
            <Link href="/login" className="flex items-center gap-2 bg-white text-gray-800 border-2 border-gray-300 px-8 py-4 rounded-lg text-lg font-bold hover:bg-gray-50 transition-all">
              Client Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything your finances need.</h2>
          <p className="text-gray-500">Four core services. One unified portal.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((svc, i) => (
            <div key={i} className="p-8 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-50 text-[#0f4c81] rounded-lg flex items-center justify-center mb-6">
                <svc.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{svc.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{svc.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} Quantum Flux Solutions. All rights reserved.</p>
        <div className="mt-4 flex justify-center gap-6">
          <Link href="/login" className="hover:text-gray-900">Client Portal</Link>
          <Link href="/login" className="hover:text-gray-900">Staff Portal</Link>
        </div>
      </footer>
    </div>
  );
}
