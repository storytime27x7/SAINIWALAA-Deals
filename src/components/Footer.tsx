import React, { useState, useEffect } from 'react';
import { ShoppingBag, X, ShieldCheck, Zap, Sparkles, Heart, ExternalLink, Mail, Phone, MapPin, CheckCircle2, Info, Instagram, Youtube } from 'lucide-react';
import { FooterPage } from '../types';

interface FooterProps {
  footerPages?: FooterPage[];
}

export type PolicyKey = 'about' | 'contact' | 'privacy' | 'disclaimer' | 'affiliate';

interface PolicyData {
  title: string;
  badge: string;
  content: string[];
}

const STATIC_POLICIES: Record<PolicyKey, PolicyData> = {
  about: {
    title: 'About SAINIWALAA',
    badge: 'Brand & Creator Identity',
    content: [
      'SAINIWALAA (also known as SAINIWALAA Deals, SAINIWALAA.in, and sainiwalaa.in) is your dedicated Indian deal curation and smart shopping discovery brand. We hand-curate verified discounts, trending price drops, and high-value offers across premier Indian ecommerce platforms including Amazon India, Flipkart, Meesho, and Ajio.',
      'Rooted in Jaipur, Rajasthan, our mission is to eliminate shopping clutter and bring genuine savings directly to smart consumers without markups, memberships, or unnecessary redirects.',
      'Follow our official verified social channels: Instagram (@sainiwalaa.in) and YouTube (SAINIWALAA) for daily verified deals and shopping updates!'
    ]
  },
  contact: {
    title: 'Contact Us',
    badge: 'Customer Support & Inquiries',
    content: [
      'Have a question about a deal, want to suggest an offer, or explore brand collaborations? We are always happy to connect with our shoppers.',
      '• Email: support@sainiwalaadeals.com\n• Business Inquiries: contact@sainiwalaadeals.com\n• Location: Jaipur, Rajasthan, India\n• Support Hours: Monday to Saturday, 10:00 AM – 7:00 PM IST',
      'For queries regarding order tracking, returns, or refunds, please reach out directly to the platform where your purchase was completed (Amazon, Flipkart, Meesho, or Ajio) as orders are processed directly by their official merchant systems.'
    ]
  },
  privacy: {
    title: 'Privacy Policy',
    badge: 'Your Privacy Matters',
    content: [
      'At SAINIWALAA Deals, we are committed to respecting and protecting your privacy while you browse handpicked deals across India.',
      '• No Personal Sensitive Data: We do not collect or store your payment details, passwords, bank numbers, or personal identification.',
      '• Wishlist & Preferences: Your saved wishlist items and search preferences are stored strictly in your browser (HTML5 localStorage) and are never uploaded to any remote server.',
      '• Third-Party Links: Clicking "Buy Now" takes you to official merchant websites (Amazon, Flipkart, Meesho, Ajio). Their respective privacy and cookie policies govern your checkout experience.',
      '• Standard Analytics: Anonymous aggregate statistics may be monitored solely to understand popular deal categories and enhance website performance.'
    ]
  },
  disclaimer: {
    title: 'Disclaimer',
    badge: 'Marketplace Information & Pricing',
    content: [
      '• Public Deal Curation: Public deals ko curate karke official retailer/store links par direct redirect kiya jata hai.',
      '• Price & Stock Changes: Prices, availability aur coupons marketplace ke according real-time change ho sakte hain. Always verify final checkout pricing on the respective retailer platform before making a purchase.',
      '• Non-Seller Notice: SAINIWALAA Deals is an informational deals discovery portal and not a seller, supplier, or merchant. We do not manufacture, package, ship, or warranty any listed products.',
      '• Trademarks: Amazon, Flipkart, Meesho, Ajio and their associated brand marks and logos are trademarks of their respective owners.'
    ]
  },
  affiliate: {
    title: 'Affiliate Disclosure',
    badge: 'Transparency & Compliance',
    content: [
      'In compliance with digital advertising and affiliate disclosure guidelines:',
      'SAINIWALAA Deals participates in official affiliate advertising programs, including the Amazon Associates Program, Flipkart Affiliate Network, and other retailer partner programs.',
      'These programs are designed to provide a means for discovery platforms to earn modest referral fees by advertising and linking to official partner websites.',
      'Zero Extra Cost to Shoppers: When you click on a deal link and make a purchase, you never pay extra. Prices, discounts, and coupons remain completely identical to or better than shopping directly. These referral commissions support our server costs and daily deal curation.'
    ]
  }
};

export const Footer: React.FC<FooterProps> = ({ footerPages }) => {
  const [activePolicy, setActivePolicy] = useState<PolicyKey | null>(null);

  // Check URL hash on load for direct policy links (e.g. #about, #privacy)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (['about', 'contact', 'privacy', 'disclaimer', 'affiliate'].includes(hash)) {
        setActivePolicy(hash as PolicyKey);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActivePolicy(null);
    };
    if (activePolicy) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activePolicy]);

  const openPolicy = (key: PolicyKey) => {
    setActivePolicy(key);
  };

  const closePolicy = () => {
    setActivePolicy(null);
    if (window.location.hash) {
      history.replaceState(null, '', window.location.pathname);
    }
  };

  const activeData = activePolicy ? STATIC_POLICIES[activePolicy] : null;

  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 mt-14 pt-12 pb-16 w-full select-none">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Propositions Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-10 mb-10 border-b border-slate-800">
          <div className="flex items-center gap-3 bg-slate-800/60 p-4 rounded-2xl border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Daily Live Deals</h4>
              <p className="text-[11px] text-slate-400">Curated offers from Amazon, Flipkart & Meesho</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/60 p-4 rounded-2xl border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Direct Official Stores</h4>
              <p className="text-[11px] text-slate-400">Shop securely on verified retailer platforms</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/60 p-4 rounded-2xl border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Maximum Savings</h4>
              <p className="text-[11px] text-slate-400">Top discount tags, coupon codes & price drops</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/60 p-4 rounded-2xl border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">100% Free For Shoppers</h4>
              <p className="text-[11px] text-slate-400">No subscription or hidden markups ever</p>
            </div>
          </div>
        </div>

        {/* 4-COLUMN PREMIUM MARKETPLACE FOOTER */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10">
          {/* Column 1: Brand & Introduction */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-900 font-bold">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="text-white font-black text-lg tracking-wider">SAINIWALAA DEALS</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Amazon, Flipkart & Meesho ke behtareen products aur verified deals ek jagah. Discover smart shopping with SAINIWALAA (sainiwalaa.in).
            </p>
            <div className="inline-flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-full text-xs text-amber-300 font-semibold border border-slate-700 mb-4">
              <span>⚡ India's Smart Shopping Companion</span>
            </div>

            {/* Confirmed Official Social Channels */}
            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Official Social Channels
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <a
                  href="https://www.instagram.com/sainiwalaa.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition border border-slate-700/80 min-h-[36px]"
                  aria-label="Follow SAINIWALAA on Instagram @sainiwalaa.in"
                >
                  <Instagram className="w-3.5 h-3.5 text-rose-400" />
                  <span>@sainiwalaa.in</span>
                </a>

                <a
                  href="https://www.youtube.com/@SAINIWALAA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition border border-slate-700/80 min-h-[36px]"
                  aria-label="Subscribe to SAINIWALAA on YouTube"
                >
                  <Youtube className="w-3.5 h-3.5 text-red-500" />
                  <span>SAINIWALAA</span>
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Marketplaces We Cover */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">
              Marketplaces We Cover
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF9900]" />
                <span className="font-semibold">Amazon India</span>
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2874F0]" />
                <span className="font-semibold">Flipkart</span>
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F43397]" />
                <span className="font-semibold">Meesho</span>
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2C4152]" />
                <span className="font-semibold">Ajio</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Company & Policies */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">
              Company & Policies
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => openPolicy('about')}
                  className="text-amber-400 hover:text-amber-300 hover:underline font-semibold transition cursor-pointer text-left py-0.5"
                >
                  About
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openPolicy('contact')}
                  className="text-amber-400 hover:text-amber-300 hover:underline font-semibold transition cursor-pointer text-left py-0.5"
                >
                  Contact
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openPolicy('privacy')}
                  className="text-amber-400 hover:text-amber-300 hover:underline font-semibold transition cursor-pointer text-left py-0.5"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openPolicy('disclaimer')}
                  className="text-amber-400 hover:text-amber-300 hover:underline font-semibold transition cursor-pointer text-left py-0.5"
                >
                  Disclaimer
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openPolicy('affiliate')}
                  className="text-amber-400 hover:text-amber-300 hover:underline font-semibold transition cursor-pointer text-left py-0.5"
                >
                  Affiliate Disclosure
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: How Deals Work */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">
              How Deals Work
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Public deals ko curate karke official retailer/store links par direct redirect kiya jata hai.
            </p>
            <p className="text-[11px] text-slate-400 leading-normal">
              Prices, availability aur coupons marketplace ke according change ho sakte hain.
            </p>
          </div>
        </div>

        {/* Bottom Disclaimer & Copyright */}
        <div className="border-t border-slate-800/90 pt-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} SAINIWALAA (sainiwalaa.in) • SAINIWALAA Deals. All rights reserved.</p>
          <p className="text-[11px]">
            India's Smart Shopping Companion • Official retailer redirection
          </p>
        </div>
      </div>

      {/* POLICY MODAL DIALOG */}
      {activeData && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closePolicy}
        >
          <div
            className="relative w-full max-w-lg bg-white text-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3.5 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60 inline-block mb-1">
                  {activeData.badge}
                </span>
                <h3 className="font-black text-lg sm:text-xl text-slate-900">
                  {activeData.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={closePolicy}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="mt-4 flex-1 overflow-y-auto text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3 pr-1">
              {activeData.content.map((paragraph, idx) => (
                <p key={idx} className="whitespace-pre-line text-slate-700">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">SAINIWALAA Deals</span>
              <button
                type="button"
                onClick={closePolicy}
                className="bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
