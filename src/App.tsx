import {
  ArrowLeft,
  ArrowUpLeft,
  Brush,
  Camera,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
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
import { useEffect, useRef, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import { AboutContent, api, Category, ClientLogo, Testimonial } from "./lib/api";
import logoUrl from "./assets/relo-mofix-logo-new.png";
import wavesUrl from "./assets/relo-mofix-hero-new.jpg";
import hussainUrl from "./assets/hussain-keton.PNG";

const logoAsset = { url: logoUrl };
const wavesAsset = { url: wavesUrl };
const hussainAsset = { url: hussainUrl };

function getApiImageUrl(imageUrl: string | null | undefined, fallback: string) {
  if (!imageUrl) return fallback;
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
  const apiOrigin = /^https?:\/\//i.test(apiUrl) ? new URL(apiUrl).origin : window.location.origin;
  return new URL(imageUrl, `${apiOrigin}/`).toString();
}

const services = [
  { number: "01", arTitle: "التصميم والهوية", enTitle: "Creative Design & Branding", arText: "نبني هوية بصرية متماسكة تترك أثراً واضحاً في ذاكرة جمهورك.", enText: "We build cohesive visual identities that leave a clear, lasting impression.", icon: Brush },
  { number: "02", arTitle: "صناعة المحتوى", enTitle: "Content Creation", arText: "نحوّل أفكارك إلى محتوى أصيل يحكي قصتك ويقرّبك من جمهورك.", enText: "We turn your ideas into authentic content that tells your story and connects with your audience.", icon: Sparkles },
  { number: "03", arTitle: "التصوير والإنتاج", enTitle: "Photo & Video", arText: "صورة سينمائية وإنتاج متكامل يقدّم علامتك بأفضل حضور.", enText: "Cinematic visuals and end-to-end production that present your brand at its best.", icon: Camera },
  { number: "04", arTitle: "إدارة التواصل", enTitle: "Social Media Management", arText: "استراتيجية، نشر وتفاعل مستمر يصنع مجتمعاً حول علامتك.", enText: "Strategy, publishing, and ongoing engagement that build a community around your brand.", icon: Share2 },
  { number: "05", arTitle: "الويب والموبايل", enTitle: "Web Design & Mobile", arText: "تجارب رقمية سريعة، أنيقة ومصممة لتحقيق أهداف عملك.", enText: "Fast, elegant digital experiences designed to achieve your business goals.", icon: Globe2 },
];

interface WorkRecord {
  id: string;
  ar_title: string;
  en_title: string;
  ar_type: string;
  en_type: string;
  tag: string;
  category_id: string | null;
  category_ar_name?: string;
  category_en_name?: string;
  image_url: string | null;
}

const copy = {
  ar: {
    nav: ["خدماتنا", "من نحن", "أعمالنا", "الإدارة", "عملاؤنا", "تواصل معنا"], start: "ابدأ مشروعك", light: "تفعيل الوضع الفاتح", dark: "تفعيل الوضع الداكن", menu: "فتح القائمة",
    heroTitle: <>نروي قصتك<br />بلغة <em>الإبداع.</em></>, heroCopy: "نصنع علامات لا تُنسى، ونحوّل الأفكار إلى تجارب بصرية تعيش في الذاكرة.", discover: "اكتشف أعمالنا",
    servicesEyebrow: "ما الذي نصنعه", servicesTitle: "خدماتنا", servicesCopy: "من الفكرة الأولى حتى حضورك الكامل، نمنح كل تفصيل سبباً وهدفاً.",
    workEyebrow: "مختارات من الاستوديو", workTitle: "أعمالنا", filters: ["الكل", "هويات بصرية", "مطبوعات", "محتوى رقمي", "تصوير"],
    managementEyebrow: "من يقود الحكاية", quote: "الإبداع ليس مجرد شكل جميل، بل فكرة صحيحة تُروى بالطريقة التي تستحقها.", name: "حسين كيطون", role: "المؤسس والمدير الإبداعي", bio: "يقود حسين فريق RELO & MOFIX برؤية تجمع بين الاستراتيجية والحس البصري، لبناء علامات واضحة، أصيلة وقادرة على النمو.",
    contactEyebrow: "فكرتك التالية تبدأ هنا", contactTitle: <>لنتحدث عن<br /><em>مشروعك القادم.</em></>, emailLabel: "أرسل لنا بريداً", contactLabels: ["اتصل بنا", "راسلنا", "زوروا موقعنا"], rights: "جميع الحقوق محفوظة", top: "العودة للأعلى",
  },
  en: {
    nav: ["Services", "About", "Work", "Management", "Clients", "Contact"], start: "Start a project", light: "Enable light mode", dark: "Enable dark mode", menu: "Open menu",
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

function CursorFollower() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    let x = -100;
    let y = -100;
    const handlePointerMove = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        if (cursorRef.current) cursorRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        frame = 0;
      });
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return <div ref={cursorRef} className="cursor-follower" aria-hidden="true" />;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return <div className="admin-route-loading" dir="rtl">جاري التحقق من الجلسة...</div>;
  }
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function WorkCarousel({ works, isArabic, logoAsset }: { works: WorkRecord[], isArabic: boolean, logoAsset: { url: string } }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [works]);

  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) return logoAsset.url;
    if (/^https?:\/\//i.test(imageUrl)) return imageUrl;

    const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
    const apiOrigin = /^https?:\/\//i.test(apiUrl) ? new URL(apiUrl).origin : window.location.origin;
    return new URL(imageUrl, `${apiOrigin}/`).toString();
  };

  const currentWork = works[activeIndex];
  const scrollPrev = () => setActiveIndex((index) => works.length ? (index - 1 + works.length) % works.length : 0);
  const scrollNext = () => setActiveIndex((index) => works.length ? (index + 1) % works.length : 0);

  return (
    <div className="work-carousel-container">
      <div className="work-carousel">
        {currentWork && <div className="work-carousel__slide" key={currentWork.id}>
          <article className="work-card">
            <div className="work-visual work-visual--image">
              <img
                src={getImageUrl(currentWork.image_url)}
                alt={isArabic ? currentWork.ar_title : currentWork.en_title}
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = logoAsset.url;
                }}
              />
            </div>
          </article>
        </div>}
      </div>
      <button className="work-carousel__prev" onClick={scrollPrev} disabled={works.length < 2} aria-label="Previous">
        <ChevronLeft size={24} />
      </button>
      <button className="work-carousel__next" onClick={scrollNext} disabled={works.length < 2} aria-label="Next">
        <ChevronRight size={24} />
      </button>
    </div>
  );
}

function ClientCarousel({ clients }: { clients: ClientLogo[] }) {
  const getImageUrl = (imageUrl: string) => {
    if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
    const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
    const apiOrigin = /^https?:\/\//i.test(apiUrl) ? new URL(apiUrl).origin : window.location.origin;
    return new URL(imageUrl, `${apiOrigin}/`).toString();
  };

  const tickerDuration = 28;

  return <div className="clients-carousel" aria-label="شعارات العملاء">
    {clients.length > 0 && <div className="clients-carousel__track">
      {clients.map((client, index) => <div className="clients-carousel__slide" style={{ "--ticker-delay": `${-(index * tickerDuration / clients.length)}s` } as React.CSSProperties} key={client.id}><img src={getImageUrl(client.logo_url)} alt="شعار عميل" /></div>)}
    </div>}
  </div>;
}

function TestimonialsCarousel({ testimonials, isArabic }: { testimonials: Testimonial[]; isArabic: boolean }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => setActiveIndex(0), [testimonials]);
  useEffect(() => {
    if (testimonials.length < 2) return;
    const interval = window.setInterval(() => setActiveIndex((index) => (index + 1) % testimonials.length), 5000);
    return () => window.clearInterval(interval);
  }, [testimonials.length]);

  const testimonial = testimonials[activeIndex];
  if (!testimonial) return null;

  return <div className="testimonials-carousel" aria-live="polite">
    <article className="testimonial-card" key={testimonial.id}>
      <Quote className="testimonial-card__quote-icon" />
      <blockquote>{isArabic ? testimonial.ar_quote : testimonial.en_quote}</blockquote>
      <div className="testimonial-card__author">
        <strong>{isArabic ? testimonial.ar_name : testimonial.en_name}</strong>
        <span>{isArabic ? testimonial.ar_role : testimonial.en_role}</span>
      </div>
    </article>
    {testimonials.length > 1 && <div className="testimonials-carousel__dots">
      {testimonials.map((item, index) => <button type="button" key={item.id} className={index === activeIndex ? "active" : ""} onClick={() => setActiveIndex(index)} aria-label={`الشهادة ${index + 1}`} />)}
    </div>}
  </div>;
}

function Website() {
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const [filter, setFilter] = useState("all");
  const [scrolled, setScrolled] = useState(false);
  const [works, setWorks] = useState<WorkRecord[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [clients, setClients] = useState<ClientLogo[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [about, setAbout] = useState<AboutContent | null>(null);

  useEffect(() => {
    Promise.all([api.getWorks(), api.getCategories(), api.getClients(), api.getTestimonials(), api.getAbout()]).then(([worksResponse, categoriesResponse, clientsResponse, testimonialsResponse, aboutResponse]) => {
      if (worksResponse.success) setWorks(worksResponse.data || []);
      if (categoriesResponse.success) setCategories(categoriesResponse.data || []);
      if (clientsResponse.success) setClients(clientsResponse.data || []);
      if (testimonialsResponse.success) setTestimonials(testimonialsResponse.data || []);
      if (aboutResponse.success && aboutResponse.data) setAbout(aboutResponse.data);
    }).catch((error) => console.error("Failed to load public work content:", error));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    document.title = language === "ar" ? "RELO & MOFIX | نصنع هوية تُروى" : "RELO & MOFIX | Creative Design & Branding";
  }, [dark, language]);

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
  const visibleWork = filter === "all" ? works : works.filter((item) => String(item.category_id) === filter);
  const isArabic = language === "ar";

  const scrollToSection = (id: string | undefined) => {
    if (!id) return;
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <main dir={isArabic ? "rtl" : "ltr"} className={`site-main min-h-screen overflow-hidden bg-background text-foreground ${isArabic ? "lang-ar" : "lang-en"}`}>
      <CursorFollower />
      <header className={`site-header ${scrolled || menuOpen ? "header-scrolled" : "header-at-top"}`}>
        <a href="#home" className="brand" aria-label="RELO & MOFIX" onClick={(e) => { e.preventDefault(); scrollToSection("home"); }}>
          <img src={logoAsset.url} alt="RELO & MOFIX logo" />
          <span>RELO <b>&</b> MOFIX</span>
        </a>
        <nav className={menuOpen ? "nav-links nav-open" : "nav-links"} aria-label={isArabic ? "التنقل الرئيسي" : "Main navigation"}>
          {t.nav.map((label, index) => <a href={["#services", "#about", "#work", "#management", "#clients", "#contact"][index]} onClick={(e) => { e.preventDefault(); scrollToSection(["services", "about", "work", "management", "clients", "contact"][index]); setMenuOpen(false); }} key={label}>{label}</a>)}
        </nav>
        <div className="header-actions">
          <button type="button" className="language-toggle" onClick={() => { setLanguage(isArabic ? "en" : "ar"); setMenuOpen(false); }} aria-label={isArabic ? "Switch to English" : "التبديل إلى العربية"}>{isArabic ? "EN" : "AR"}</button>
          <IconButton label={dark ? t.light : t.dark} onClick={() => setDark(!dark)}>
            {dark ? <Sun size={19} /> : <Moon size={19} />}
          </IconButton>
          <div className="mobile-menu"><IconButton label={t.menu} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</IconButton></div>
          <a className="header-cta" href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection("contact"); }}>{t.start} <ArrowUpLeft size={17} /></a>
        </div>
      </header>

      <section id="home" className="hero">
        <img src={wavesAsset.url} alt="تموجات الهوية البصرية لريلو آند موفكس" className="hero-bg" />
        <div className="hero-shade" />
        <div className="hero-content">
       
          <h1>{t.heroTitle}</h1>
          <p className="hero-copy">{t.heroCopy}</p>
          <a href="#work" className="hero-cta" onClick={(e) => { e.preventDefault(); scrollToSection("work"); }}>{t.discover} <ArrowLeft size={20} /></a>
        </div>
        <div className="hero-aside"><span>WE TELL YOUR STORY</span><i /></div>
        <a href="#services" className="scroll-cue" aria-label="انتقل إلى خدماتنا" onClick={(e) => { e.preventDefault(); scrollToSection("services"); }}><ChevronDown /></a>
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

      <section id="about" className="section about-section">
        <div className="about-layout">
          <div className="section-heading">
            <div><p className="eyebrow">{isArabic ? "عن الاستوديو" : "The studio"}</p><h2>{about ? (isArabic ? about.ar_title : about.en_title) : (isArabic ? "من نحن" : "About us")}<span>.</span></h2></div>
            <p>{about ? (isArabic ? about.ar_text : about.en_text) : (isArabic ? "نصنع أفكارًا واضحة، هويات أصيلة وتجارب بصرية تترك أثرًا." : "We create clear ideas, authentic identities, and visual experiences that leave a mark.")}</p>
          </div>
          <div className="about-visual"><img src={getApiImageUrl(about?.image_url, wavesAsset.url)} alt={isArabic ? "هوية RELO & MOFIX البصرية" : "RELO & MOFIX visual identity"} /></div>
        </div>
      </section>

      <section id="work" className="section work-section">
        <div className="section-heading">
          <div><p className="eyebrow">{t.workEyebrow}</p><h2>{t.workTitle}<span>.</span></h2></div>
          <div className="work-filters" role="group" aria-label={isArabic ? "تصنيف الأعمال" : "Work categories"}>
            <button type="button" onClick={() => setFilter("all")} className={filter === "all" ? "active" : ""}>{isArabic ? "الكل" : "All"}</button>
            {categories.map((category) => <button type="button" onClick={() => setFilter(String(category.id))} className={filter === String(category.id) ? "active" : ""} key={category.id}>{isArabic ? category.ar_name : category.en_name}</button>)}
          </div>
        </div>
        <WorkCarousel works={visibleWork} isArabic={isArabic} logoAsset={logoAsset} />
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

      <section id="clients" className="section clients-section">
        <div className="section-heading">
          <div><p className="eyebrow">{isArabic ? "شركاء النجاح" : "Partners in success"}</p><h2>{isArabic ? "عملاؤنا" : "Our clients"}<span>.</span></h2></div>
          <p>{isArabic ? "شعارات العلامات التي شاركناها صناعة حضورها." : "The brands we have helped shape and bring to life."}</p>
        </div>
        <ClientCarousel clients={clients} />
      </section>

      <section id="testimonials" className="section testimonials-section">
        <div className="section-heading">
          <div><p className="eyebrow">{isArabic ? "ماذا يقولون عنا" : "Words from our clients"}</p><h2>{isArabic ? "آراء العملاء" : "Testimonials"}<span>.</span></h2></div>
        </div>
        <TestimonialsCarousel testimonials={testimonials} isArabic={isArabic} />
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
        <a href="#home" aria-label={t.top} onClick={(e) => { e.preventDefault(); scrollToSection("home"); }}><ArrowUpLeft /> {t.top}</a>
        <Instagram size={18} aria-label="Instagram" />
      </footer>
    </main>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Website />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
