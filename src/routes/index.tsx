import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowUpLeft,
  Brush,
  Camera,
  ChevronDown,
  Globe2,
  Instagram,
  Mail,
  Menu,
  Moon,
  Phone,
  Quote,
  Share2,
  Sparkles,
  Sun,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import logoUrl from "../assets/relo-mofix-logo-new.png";
import wavesUrl from "../assets/relo-mofix-hero-new.jpg";
import hussainUrl from "../assets/hussain-keton.jpg";

const logoAsset = { url: logoUrl };
const wavesAsset = { url: wavesUrl };
const hussainAsset = { url: hussainUrl };

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RELO & MOFIX | نصنع هوية تُروى" },
      { name: "description", content: "وكالة إبداعية متخصصة في تصميم الهويات، صناعة المحتوى، التصوير، إدارة التواصل الاجتماعي وتصميم المواقع." },
      { property: "og:title", content: "RELO & MOFIX | Creative Design & Branding" },
      { property: "og:description", content: "نحوّل قصتك إلى هوية حاضرة ومؤثرة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const services = [
  { number: "01", arTitle: "التصميم والهوية", enTitle: "Creative Design & Branding", arText: "نبني هوية بصرية متماسكة تترك أثراً واضحاً في ذاكرة جمهورك.", enText: "We build cohesive visual identities that leave a clear, lasting impression.", icon: Brush },
  { number: "02", arTitle: "صناعة المحتوى", enTitle: "Content Creation", arText: "نحوّل أفكارك إلى محتوى أصيل يحكي قصتك ويقرّبك من جمهورك.", enText: "We turn your ideas into authentic content that tells your story and connects with your audience.", icon: Sparkles },
  { number: "03", arTitle: "التصوير والإنتاج", enTitle: "Photo & Video", arText: "صورة سينمائية وإنتاج متكامل يقدّم علامتك بأفضل حضور.", enText: "Cinematic visuals and end-to-end production that present your brand at its best.", icon: Camera },
  { number: "04", arTitle: "إدارة التواصل", enTitle: "Social Media Management", arText: "استراتيجية، نشر وتفاعل مستمر يصنع مجتمعاً حول علامتك.", enText: "Strategy, publishing, and ongoing engagement that build a community around your brand.", icon: Share2 },
  { number: "05", arTitle: "الويب والموبايل", enTitle: "Web Design & Mobile", arText: "تجارب رقمية سريعة، أنيقة ومصممة لتحقيق أهداف عملك.", enText: "Fast, elegant digital experiences designed to achieve your business goals.", icon: Globe2 },
];

const work = [
  { type: "branding", arType: "هويات بصرية", enType: "Brand Identity", arTitle: "هوية ريلو آند موفكس", enTitle: "RELO & MOFIX Identity", tag: "BRANDING", className: "work-orange" },
  { type: "editorial", arType: "مطبوعات", enType: "Editorial", arTitle: "بروشورات الشركات", enTitle: "Corporate Brochures", tag: "EDITORIAL", className: "work-paper" },
  { type: "social", arType: "محتوى رقمي", enType: "Digital Content", arTitle: "حملات التواصل", enTitle: "Social Campaigns", tag: "SOCIAL", className: "work-black" },
  { type: "production", arType: "تصوير", enType: "Photography", arTitle: "قصص بصرية", enTitle: "Visual Stories", tag: "PRODUCTION", className: "work-photo" },
];

const copy = {
  ar: {
    nav: ["خدماتنا", "أعمالنا", "الإدارة", "تواصل معنا"], start: "ابدأ مشروعك", light: "تفعيل الوضع الفاتح", dark: "تفعيل الوضع الداكن", menu: "فتح القائمة",
    heroTitle: <>نروي قصتك<br />بلغة <em>الإبداع.</em></>, heroCopy: "نصنع علامات لا تُنسى، ونحوّل الأفكار إلى تجارب بصرية تعيش في الذاكرة.", discover: "اكتشف أعمالنا",
    servicesEyebrow: "ما الذي نصنعه", servicesTitle: "خدماتنا", servicesCopy: "من الفكرة الأولى حتى حضورك الكامل، نمنح كل تفصيل سبباً وهدفاً.",
    workEyebrow: "مختارات من الاستوديو", workTitle: "أعمالنا", filters: ["الكل", "هويات بصرية", "مطبوعات", "محتوى رقمي", "تصوير"],
    managementEyebrow: "من يقود الحكاية", quote: "الإبداع ليس مجرد شكل جميل، بل فكرة صحيحة تُروى بالطريقة التي تستحقها.", name: "حسين كيطون", role: "المؤسس والمدير الإبداعي", bio: "يقود حسين فريق RELO & MOFIX برؤية تجمع بين الاستراتيجية والحس البصري، لبناء علامات واضحة، أصيلة وقادرة على النمو.",
    contactEyebrow: "فكرتك التالية تبدأ هنا", contactTitle: <>لنتحدث عن<br /><em>مشروعك القادم.</em></>, emailLabel: "أرسل لنا بريداً", contactLabels: ["اتصل بنا", "راسلنا", "زوروا موقعنا"], rights: "جميع الحقوق محفوظة", top: "العودة للأعلى",
  },
  en: {
    nav: ["Services", "Work", "Management", "Contact"], start: "Start a project", light: "Enable light mode", dark: "Enable dark mode", menu: "Open menu",
    heroTitle: <>We tell your story<br />through <em>creativity.</em></>, heroCopy: "We create unforgettable brands and turn ideas into visual experiences that live in memory.", discover: "Explore our work",
    servicesEyebrow: "What we create", servicesTitle: "Services", servicesCopy: "From the first idea to your complete presence, we give every detail a reason and a purpose.",
    workEyebrow: "Selected from the studio", workTitle: "Our work", filters: ["All", "Brand Identity", "Editorial", "Digital Content", "Photography"],
    managementEyebrow: "Leading the story", quote: "Creativity is more than a beautiful form. It is the right idea, told the way it deserves.", name: "Hussain Keton", role: "Founder & Creative Director", bio: "Hussain leads RELO & MOFIX with a vision that brings strategy and visual intuition together to build clear, authentic brands made to grow.",
    contactEyebrow: "Your next idea starts here", contactTitle: <>Let's talk about<br /><em>your next project.</em></>, emailLabel: "Send us an email", contactLabels: ["Call us", "Email us", "Visit our website"], rights: "All rights reserved", top: "Back to top",
  },
};

function IconButton({ label, onClick, children }: { label: string; onClick?: () => void; children: React.ReactNode }) {
  return <button type="button" aria-label={label} title={label} onClick={onClick} className="icon-button">{children}</button>;
}

function Index() {
  const [dark, setDark] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const [filter, setFilter] = useState("all");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  useEffect(() => {
    const updateHeader = () => setScrolled(window.scrollY > 32);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  const t = copy[language];
  const filterKeys = ["all", "branding", "editorial", "social", "production"];
  const visibleWork = filter === "all" ? work : work.filter((item) => item.type === filter);
  const isArabic = language === "ar";

  return (
    <main dir={isArabic ? "rtl" : "ltr"} className={`site-main min-h-screen overflow-hidden bg-background text-foreground ${isArabic ? "lang-ar" : "lang-en"}`}>
      <header className={`site-header ${scrolled || menuOpen ? "header-scrolled" : "header-at-top"}`}>
        <a href="#home" className="brand" aria-label="RELO & MOFIX">
          <img src={logoAsset.url} alt="RELO & MOFIX logo" />
          <span>RELO <b>&</b> MOFIX</span>
        </a>
        <nav className={menuOpen ? "nav-links nav-open" : "nav-links"} aria-label={isArabic ? "التنقل الرئيسي" : "Main navigation"}>
          {t.nav.map((label, index) => <a href={["#services", "#work", "#management", "#contact"][index]} onClick={() => setMenuOpen(false)} key={label}>{label}</a>)}
        </nav>
        <div className="header-actions">
          <button type="button" className="language-toggle" onClick={() => { setLanguage(isArabic ? "en" : "ar"); setMenuOpen(false); }} aria-label={isArabic ? "Switch to English" : "التبديل إلى العربية"}>{isArabic ? "EN" : "AR"}</button>
          <IconButton label={dark ? t.light : t.dark} onClick={() => setDark(!dark)}>
            {dark ? <Sun size={19} /> : <Moon size={19} />}
          </IconButton>
          <div className="mobile-menu"><IconButton label={t.menu} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</IconButton></div>
          <a className="header-cta" href="#contact">{t.start} <ArrowUpLeft size={17} /></a>
        </div>
      </header>

      <section id="home" className="hero">
        <img src={wavesAsset.url} alt="تموجات الهوية البصرية لريلو آند موفكس" className="hero-bg" />
        <div className="hero-shade" />
        <div className="hero-content">
          <p className="hero-kicker"><span /> CREATIVE DESIGN & BRANDING</p>
          <h1>{t.heroTitle}</h1>
          <p className="hero-copy">{t.heroCopy}</p>
          <a href="#work" className="hero-cta">{t.discover} <ArrowLeft size={20} /></a>
        </div>
        <div className="hero-aside"><span>WE TELL YOUR STORY</span><i /></div>
        <a href="#services" className="scroll-cue" aria-label="انتقل إلى خدماتنا"><ChevronDown /></a>
      </section>

      <section id="services" className="section services-section">
        <div className="section-heading">
          <div><p className="eyebrow">{t.servicesEyebrow}</p><h2>{t.servicesTitle}<span>.</span></h2></div>
          <p>{t.servicesCopy}</p>
        </div>
        <div className="services-list">
          {services.map((service) => {
            const Icon = service.icon;
            return <article className="service-row" key={service.number}>
              <span className="service-number">{service.number}</span>
              <div className="service-icon"><Icon strokeWidth={1.5} /></div>
              <div className="service-name"><h3>{isArabic ? service.arTitle : service.enTitle}</h3><span>{isArabic ? service.enTitle : service.arTitle}</span></div>
              <p>{isArabic ? service.arText : service.enText}</p>
              <ArrowUpLeft className="service-arrow" />
            </article>;
          })}
        </div>
      </section>

      <section id="work" className="section work-section">
        <div className="section-heading">
          <div><p className="eyebrow">{t.workEyebrow}</p><h2>{t.workTitle}<span>.</span></h2></div>
          <div className="work-filters" role="group" aria-label={isArabic ? "تصنيف الأعمال" : "Work categories"}>
            {filterKeys.map((key, index) => <button type="button" onClick={() => setFilter(key)} className={filter === key ? "active" : ""} key={key}>{t.filters[index]}</button>)}
          </div>
        </div>
        <div className="work-grid">
          {visibleWork.map((item, index) => <article className={`work-card ${item.className}`} key={item.type}>
            <div className="work-visual">
              {index === 0 && <img src={logoAsset.url} alt="مشروع هوية ريلو آند موفكس" />}
              <span className="work-tag">{item.tag}</span>
              <span className="work-index">0{index + 1}</span>
            </div>
            <div className="work-meta"><div><span>{isArabic ? item.arType : item.enType}</span><h3>{isArabic ? item.arTitle : item.enTitle}</h3></div><ArrowUpLeft /></div>
          </article>)}
        </div>
      </section>

      <section id="management" className="management">
        <div className="portrait-wrap">
          <img src={hussainAsset.url} alt={isArabic ? "حسين كيطون، المدير الإبداعي لريلو آند موفكس" : "Hussain Keton, Creative Director at RELO & MOFIX"} />
          <span className="portrait-label">FOUNDER / CREATIVE DIRECTOR</span>
        </div>
        <div className="management-copy">
          <p className="eyebrow">{t.managementEyebrow}</p>
          <Quote className="quote-icon" />
          <blockquote>{t.quote}</blockquote>
          <div className="signature"><h2>{t.name}</h2><span>{t.role}</span></div>
          <p>{t.bio}</p>
        </div>
      </section>

      <section id="contact" className="contact-section">
        <div className="contact-top">
          <p className="eyebrow">{t.contactEyebrow}</p>
          <h2>{t.contactTitle}</h2>
          <a href="mailto:info@reelo-agency.com" className="contact-circle" aria-label={t.emailLabel}><ArrowUpLeft /></a>
        </div>
        <div className="contact-details">
          <a href="tel:+963997596503"><Phone /><span>{t.contactLabels[0]}<strong dir="ltr">+963 997 596 503</strong></span></a>
          <a href="mailto:info@reelo-agency.com"><Mail /><span>{t.contactLabels[1]}<strong>info@reelo-agency.com</strong></span></a>
          <a href="https://reelo-agency.com"><Globe2 /><span>{t.contactLabels[2]}<strong>reelo-agency.com</strong></span></a>
        </div>
      </section>

      <footer>
        <div className="footer-brand">RELO <b>&</b> MOFIX</div>
        <p>© 2026 {t.rights}</p>
        <a href="#home" aria-label={t.top}><ArrowUpLeft /> {t.top}</a>
        <Instagram size={18} aria-label="Instagram" />
      </footer>
    </main>
  );
}