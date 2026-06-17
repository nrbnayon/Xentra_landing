/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import { QRCodeSVG } from "qrcode.react";

// ── Types ──────────────────────────────────────────────────────────────────
interface FeatureCardProps {
  iconSrc: string;
  iconBg: string;
  title: string;
  description: string;
}

// ── Sub-components ─────────────────────────────────────────────────────────
function SectionDivider({ label, dark }: { label: string; dark?: boolean }) {
  const lineColor = dark ? "bg-white" : "bg-[#16467a]";
  const textColor = dark ? "text-white" : "text-[#16467a]";
  return (
    <div className="flex items-center gap-2">
      <div className={`${lineColor} h-[3px] w-12 rounded-full`} />
      <p className={`${textColor} font-semibold text-2xl leading-5 whitespace-nowrap`}>
        {label}
      </p>
      <div className={`${lineColor} h-[3px] w-12 rounded-full`} />
    </div>
  );
}

function StatCard({
  label,
  value,
  bg,
}: {
  label: string;
  value: string;
  bg: string;
}) {
  const { translate } = useLanguage();
  return (
    <button
      className={`${bg} flex flex-col items-center justify-center gap-2 rounded-lg p-6 
        w-full sm:w-[200px] md:w-[220px] lg:w-[250px] min-h-[140px] md:min-h-[160px]
        hover:scale-105 hover:brightness-110 transition-all duration-300 cursor-pointer shadow-lg active:scale-95`}
    >
      <p className="font-medium text-[#f8f3f3] text-lg md:text-[22px]">{translate(label)}</p>
      <p className="font-semibold text-white text-4xl md:text-[48px] text-center">
        {value}
      </p>
    </button>
  );
}

function FeatureCard({ iconSrc, iconBg, title, description }: FeatureCardProps) {
  const { translate } = useLanguage();
  return (
    <div className="bg-white rounded-xl p-8 flex flex-col items-center gap-5 shadow-[0px_0px_22.5px_rgba(101,101,101,0.18)] flex-1 min-w-[200px]">
      <div
        className={`${iconBg} w-12 h-12 rounded-3xl flex items-center justify-center shrink-0`}
      >
        <img src={iconSrc} alt="" className="w-7 h-7" />
      </div>
      <div className="flex flex-col items-center gap-3 text-center w-full">
        <p className="font-semibold text-[#1c5898] text-xl whitespace-pre-line leading-snug">
          {translate(title)}
        </p>
        <p className="text-[#737373] text-sm leading-relaxed">{translate(description)}</p>
      </div>
    </div>
  );
}

// ── Navbar ─────────────────────────────────────────────────────────────────
function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [langOpen, setLangOpen] = useState(false);
  const { translate, changeLanguage, supportedLanguages, currentLanguage } = useLanguage();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);

    const observerOptions = {
      root: null,
      rootMargin: "-40% 0px -40% 0px",
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    ["home", "about", "contact"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  const navLinks = ["Home", "About", "Contact"];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-300 ${
        scrolled ? "bg-[#0d2947]/95 backdrop-blur-md shadow-lg" : "bg-transparent"
      }`}
    >
      <nav className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-0 flex items-center justify-between h-20">
        {/* Logo */}
        <img src='/logo.svg' alt="Xentra Sports" className="w-12 h-12 shrink-0" />

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-10 text-lg">
          {navLinks.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className={`transition-colors duration-300 ${
                activeSection === link.toLowerCase()
                  ? "font-semibold text-white scale-105"
                  : "font-normal text-white/60 hover:text-white"
              }`}
            >
              {translate(link)}
            </a>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="border border-white/30 text-white font-medium text-base px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-white/10 transition-colors"
            >
              {currentLanguage.nativeName}
              <img src="/down.svg" alt="" className={`w-4 h-3.5 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {langOpen && (
              <div className="absolute top-full mt-2 right-0 bg-[#0d2947] border border-white/10 rounded-lg shadow-xl overflow-hidden min-w-[180px]">
                {supportedLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      changeLanguage(lang.code);
                      setLangOpen(false);
                    }}
                    className={`w-full text-left px-5 py-3 hover:bg-white/10 transition-colors text-white text-sm ${
                      currentLanguage.code === lang.code ? 'bg-white/20 font-semibold' : 'font-normal'
                    }`}
                  >
                    {lang.nativeName} ({lang.name})
                  </button>
                ))}
              </div>
            )}
          </div>

          <a
            href="/Xentra%20Sports.apk"
            download
            className="bg-white text-[#16467a] font-medium text-base px-7 py-2.5 rounded-lg hover:bg-white/90 transition-colors"
          >
            {translate("Install Now")}
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#0d2947]/97 backdrop-blur-md px-6 pb-6 flex flex-col gap-4">
          {navLinks.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className={`text-lg py-2 border-b border-white/10 transition-colors duration-300 ${
                activeSection === link.toLowerCase()
                  ? "font-semibold text-white"
                  : "text-white/60 hover:text-white"
              }`}
              onClick={() => setMenuOpen(false)}
            >
              {translate(link)}
            </a>
          ))}
          <div className="flex flex-col gap-3 pt-2">
            <div className="flex flex-wrap gap-2 py-2">
              {supportedLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    changeLanguage(lang.code);
                    setMenuOpen(false);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm border ${
                    currentLanguage.code === lang.code
                      ? "bg-white text-[#0d2947] border-white"
                      : "text-white border-white/30"
                  }`}
                >
                  {lang.nativeName}
                </button>
              ))}
            </div>
            <a
              href="/Xentra%20Sports.apk"
              download
              className="bg-white text-[#16467a] font-medium text-base px-7 py-2.5 rounded-lg text-center"
            >
              {translate("Install Now")}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

// ── Hero Section ───────────────────────────────────────────────────────────
function HeroSection() {
  const { translate } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const downloadUrl = mounted ? window.location.origin + "/Xentra%20Sports.apk" : "";

  return (
    <section
      id="home"
      className="relative min-h-screen flex flex-col scroll-mt-20"
    >
      {/* Background */}
      <img
        src='/background.png'
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Football pattern - decorative, right side */}
      <div className="absolute right-0 top-[-10%] w-[45%] max-w-[660px] aspect-square opacity-80 pointer-events-none hidden sm:block">
        <img src='/bg_solar_football-broken.svg' alt="" className="w-full h-full object-contain" />
      </div>

      {/* Soccer player - right side */}
      <div className="absolute right-[2%] md:right-[5%] lg:right-[14%] bottom-24 md:bottom-0 w-[42%] sm:w-[38%] md:w-[40%] lg:w-[38%] max-w-[619px] pointer-events-none">
        <img
          src='/soccer-player-kicking-ball.svg'
          alt="Soccer Player"
          className="w-full h-auto object-contain"
        />
      </div>

      {/* Hero content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center pt-28 pb-60 md:pb-52 px-6 sm:px-10 lg:px-[100px] max-w-[1440px] mx-auto w-full">
       <div className="flex justify-between item-center"> 
         <div className="flex flex-col gap-8 max-w-[637px]">
          {/* Headline */}
          <div className="flex flex-col gap-4">
            <h1 className="font-semibold text-4xl sm:text-5xl md:text-[48px] text-white leading-tight">
              {translate("hero experience") === "hero experience" ? "EXPERIENCE" : translate("hero experience")}{" "}
              <span className="text-[#f3b530]">
                {translate("hero sports") === "hero sports" ? "SPORTS" : translate("hero sports")}{" "}
              </span>
              <br />
              {translate("hero like never before") === "hero like never before" ? "LIKE NEVER BEFORE" : translate("hero like never before")}
            </h1>
            <p className="text-[#c8c7c7] text-base leading-relaxed max-w-[536px]">
              {translate("Join thousands of users enjoying live match updates, secure transactions, and an immersive sports experience designed for every fan.")}
            </p>
          </div>

        

          {/* User avatars + description */}
          <div className="flex flex-col gap-6">
            {/* Avatars row */}
            <div className="flex items-center gap-7">
              <div className="flex items-center">
                {["/user1.png", "/user2.png", "/user3.png", "/user4.png", "/user5.png", "/user6.png"].map(
                  (src, i) => (
                    <div
                      key={i}
                      className="w-[52px] h-[52px] sm:w-[60px] sm:h-[60px] rounded-full overflow-hidden border-2 border-[#0d2947] -mr-3 last:mr-0"
                    >
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </div>
                  )
                )}
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-white text-base font-normal">10k+</span>
                <span className="text-[#dedede] text-sm">{translate("Users")}</span>
              </div>
            </div>

            {/* Feature blurb */}
            <div className="flex items-center gap-4 max-w-[461px]">
              <div className="flex items-center shrink-0">
                <div className="w-[52px] h-[52px] rounded-full overflow-hidden -mr-10">
                  <img src="/circle.svg" alt="" className="w-full h-full object-cover" />
                </div>
                <div className="bg-[#25a5c4] w-[52px] h-[52px] rounded-full flex items-center justify-center shrink-0">
                  <img
                    src="/arrow-up-linear.svg"
                    alt=""
                    className="w-8 h-8"
                  />
                </div>
              </div>
              <p className="text-[#c5c5c5] text-sm leading-5">
                {translate("Enjoy a seamless sports experience with advanced analytics, secure payments, and real-time match tracking designed to keep you ahead of the game.")}
              </p>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-4 items-center">
            <a
              href="/Xentra%20Sports.apk"
              download
              className="bg-white text-[#16467a] font-medium text-base px-8 py-3 rounded-lg hover:bg-white/90 transition-colors inline-block text-center shadow-lg"
            >
              {translate("Android APK")}
            </a>
            <a
              href="https://testflight.apple.com/join/BA5xQ25p"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-[#16467a] font-medium text-base px-8 py-3 rounded-lg hover:bg-white/90 transition-colors inline-block text-center shadow-lg"
            >
              {translate("iOS TestFlight")}
            </a>
            <a
              href="#about"
              className="border border-white/30 text-white font-medium text-base px-8 py-3 rounded-lg hover:bg-white/10 transition-colors inline-block text-center"
            >
              {translate("Learn More")}
            </a>
          </div>
        </div>

                  {/* Prominent QR Code for Desktop */}
          {mounted && (
            <div className="hidden lg:flex mt-4 items-center gap-6 p-5 rounded-2xl border border-white/10 shadow-2xl max-w-fit">
              <div className="bg-white p-3 rounded-xl shadow-inner shrink-0">
                <QRCodeSVG
                  value={downloadUrl}
                  size={120}
                  bgColor={"#ffffff"}
                  fgColor={"#0d2947"}
                  level={"H"}
                  imageSettings={{
                    src: "/logo.svg",
                    x: undefined,
                    y: undefined,
                    height: 28,
                    width: 28,
                    excavate: true,
                  }}
                />
              </div>
              <div className="flex flex-col gap-2 max-w-[200px]">
                <p className="text-white font-bold text-xl leading-tight">{translate("Scan to Download")}</p>
                <p className="text-[#dedede] text-[14px] leading-relaxed">{translate("Get the Xentra Sports Android app instantly on your phone.")}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-white/80 text-xs font-medium uppercase tracking-wider">Fast & Secure</span>
                </div>
              </div>
            </div>
          )}
       </div>
      </div>

      {/* Stats bar */}
      <div className="absolute bottom-0 z-[999] left-0 right-0 translate-y-1/2">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center sm:justify-end gap-4">
            <StatCard label="Users" value="10K+" bg="bg-[#49c0e0]" />
            <StatCard label="Experience" value="10K+" bg="bg-[#f3b530]" />
            <StatCard label="Matches" value="10K+" bg="bg-[#2ab0b9]" />
          </div>
        </div>
      </div>
    </section>
  );
}

// ── About Section ──────────────────────────────────────────────────────────
function AboutSection() {
  const { translate } = useLanguage();
  const features: FeatureCardProps[] = [
    {
      iconSrc: "/power.svg",
      iconBg: "bg-[#f3b530]",
      title: "REAL-TIME\nEXPERIENCE",
      description:
        "Stay updated with real-time scores, stats, and match highlights.",
    },
    {
      iconSrc: "/brain.svg",
      iconBg: "bg-[#16467a]",
      title: "SMART\nPREDICTIONS",
      description:
        "Compete in live predictions and test your knowledge against fans worldwide.",
    },
    {
      iconSrc: "/globe.svg",
      iconBg: "bg-[#f3b530]",
      title: "GLOBAL\nCOMPETITION",
      description:
        "Play, compete, and climb the leaderboards across the world.",
    },
    {
      iconSrc: "/security.svg",
      iconBg: "bg-[#16467a]",
      title: "SECURE &\nFAIR",
      description:
        "Transparent systems and a fair play environment you can trust.",
    },
  ];

  return (
    <section
      id="about"
      className="mt-24 sm:mt-28 md:mt-32 pt-16 pb-20 px-4 sm:px-6 lg:px-8 scroll-mt-20"
    >
      <div className="max-w-[1240px] mx-auto flex flex-col items-center gap-14 md:gap-[60px]">
        {/* Header */}
        <div className="flex flex-col items-center gap-8 max-w-[661px] text-center">
          <SectionDivider label={translate("About Us")} />
          <div className="flex flex-col gap-5">
            <h2 className="font-semibold text-[#0d2947] text-3xl sm:text-4xl md:text-[44px] leading-tight">
              {translate("Built for the next generation of sports fans.")}
            </h2>
            <p className="text-[#535353] text-base leading-relaxed">
              {translate("We are focused on creating a next-generation sports platform with fast performance, real-time updates, secure transactions, and user-friendly experiences that keep fans connected to every moment of the game.")}
            </p>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {features.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Contact Section ────────────────────────────────────────────────────────
function ContactSection() {
  const { translate } = useLanguage();
  const [email, setEmail] = useState("");

  const socialIcons = [
    {
      src: '/facebook.svg',
      alt: "Facebook",
      href: "https://www.facebook.com/profile.php?id=61580775195702",
    },
    {
      src: "/insta.svg",
      alt: "Instagram",
      href: "https://www.instagram.com/playxentra",
    },
    {
      src: "/x-logo.svg",
      alt: "X (Twitter)",
      href: "https://x.com/playxentra",
      isX: true,
    },
    {
      src: "/tiktok.svg",
      alt: "TikTok",
      href: "https://www.tiktok.com/@playxentra",
    },
  ];

  return (
    <section
      id="contact"
      className="bg-[#0d2947] px-4 sm:px-6 lg:px-[100px] py-16 md:py-[60px] scroll-mt-20"
    >
      <div className="max-w-[1240px] mx-auto flex flex-col gap-10 md:gap-10 items-center">
        <SectionDivider label={translate("Contact")} dark />

        {/* Contact card grid */}
        <div className="bg-[#deeaf7] border border-[#f3f3f3] rounded-xl w-full grid grid-cols-1 md:grid-cols-3 overflow-hidden">
          {/* Left: Social */}
          <div className="flex flex-col gap-8 px-8 py-6 border-b md:border-b-0 md:border-r border-white">
            <img src='/logo.svg' alt="Xentra" className="w-[60px] h-auto" />
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <p className="font-semibold text-[#242424] text-xl">
                  {translate("We're here to help!")}
                </p>
                <p className="text-[#686868] text-base">
                  {translate("Questions? Reach out anytime, we're here")}
                </p>
              </div>
              <div className="flex gap-3 items-center">
                {socialIcons.map(({ src, alt, href, isX }) => (
                  <a
                    key={alt}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white shadow-[0px_0px_22.5px_rgba(101,101,101,0.18)] w-8 h-8 rounded-2xl flex items-center justify-center hover:scale-110 transition-all duration-300"
                  >
                    {isX ? (
                      <svg
                        viewBox="0 0 24 24"
                        className="w-[14px] h-[14px] fill-[#0d2947]"
                        aria-hidden="true"
                      >
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    ) : (
                      <img
                        src={src}
                        alt={alt}
                        className="w-[18px] h-[18px] object-contain"
                      />
                    )}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Middle: Email */}
          <div className="flex flex-col items-center justify-center gap-5 px-8 py-6 border-b md:border-b-0 md:border-r border-white text-center">
            <div className="bg-[#16467a] border-[1.25px] border-[#1c5898] shadow-[0px_0px_28px_rgba(101,101,101,0.18)] w-10 h-10 rounded-[20px] flex items-center justify-center">
              <img src="/email.svg" alt="" className="w-6 h-6" />
            </div>
            <div className="flex flex-col gap-5">
              <p className="font-semibold text-[#242424] text-xl">Email</p>
              <a
                href="mailto:info@xentrasports.com"
                className="text-[#686868] text-base hover:text-[#16467a] transition-colors"
              >
                info@xentrasports.com
              </a>
            </div>
          </div>

          {/* Right: Subscribe */}
          <div className="flex flex-col gap-6 px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="bg-[#16467a] border-[1.25px] border-[#1c5898] shadow-[0px_0px_28px_rgba(101,101,101,0.18)] w-10 h-10 rounded-[20px] flex items-center justify-center shrink-0">
                <img src="/phone.svg" alt="" className="w-6 h-6" />
              </div>
              <p className="font-semibold text-[#242424] text-xl whitespace-nowrap">
                {translate("Get Updates")}
              </p>
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={translate("Enter your email to get updates")}
              className="bg-white shadow-[0px_0px_22.5px_rgba(101,101,101,0.18)] rounded-lg px-3 py-3 text-[#7c7c7c] text-sm h-12 w-full focus:outline-none focus:ring-2 focus:ring-[#16467a]"
            />
            <a
              href={`mailto:info@xentrasports.com?subject=Get Updates&body=Hi, I would like to get updates. My email is: ${email}`}
              className="bg-[#16467a] text-white font-medium text-base px-8 py-3 rounded-lg w-full hover:bg-[#1c5898] transition-colors text-center"
            >
              {translate("Send Message")}
            </a>
          </div>
        </div>

        {/* Footer bar */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-[110px] items-center">
          <div className="flex items-center gap-1.5">
            <img src="/copyright.svg" alt="" className="w-[18px] h-[18px]" />
            <span className="text-[#dbdbdb] text-base text-center">
              2026 Xentra Sports. {translate("All rights reserved.")}
            </span>
          </div>
          {[
            { label: translate("Privacy Policy"), href: "https://admin.xentrasports.com/app-privacy-policy" },
            { label: translate("Terms of Service"), href: "https://admin.xentrasports.com/app-terms-conditions" },
            { label: translate("Powered by Travex LLC"), href: "#" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#dbdbdb] text-base hover:text-white transition-colors"
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <main className="min-h-screen font-sans overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <ContactSection />
    </main>
  );
}