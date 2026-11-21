import {
  ArrowLeft,
  ArrowUpLeft,
  Brush,
  Camera,
  BarChart3,
  ChevronDown,
  ClipboardList,
  Facebook,
  FileText,
  Globe2,
  ExternalLink,
  Instagram,
  Mail,
  Megaphone,
  Menu,
  MessageCircle,
  Moon,
  Phone,
  Play,
  ClipboardCheck,
  Users,
  Quote,
  Share2,
  Sparkles,
  Sun,
  X,
} from "lucide-react";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import { AboutContent, api, Category, ClientLogo, Testimonial, WorkRecord } from "./lib/api";
import logoUrl from "./assets/relo-mofix-logo-new.png";
import wavesUrl from "./assets/relo-mofix-hero-new.jpg";
import hussainUrl from "./assets/hussain-keton.PNG";

const WorksPage = lazy(() => import("./pages/Works"));

const logoAsset = { url: logoUrl };
const wavesAsset = { url: wavesUrl };
const hussainAsset = { url: hussainUrl };
const whatsappNumber = "963997596503";
const seoCopy = {
  ar: {
    title: "RELO & MOFIX | وكالة إبداعية للتصميم وصناعة المحتوى والتصوير وإدارة التواصل والويب",
    description:
      "RELO & MOFIX وكالة إبداعية متخصصة في تصميم الهويات، صناعة المحتوى، التصوير، إدارة التواصل الاجتماعي وتصميم الويب. نحوّل قصتك إلى حضور بصري واضح ومؤثر.",
  },
  en: {
    title: "RELO & MOFIX | Creative Design, Content, Photography, Social Media & Web",
    description:
      "RELO & MOFIX is a creative agency specialising in brand identity, content creation, photography, social media management and web design.",
  },
};

function getApiImageUrl(imageUrl: string | null | undefined, fallback: string) {
  if (!imageUrl) return fallback;
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
  const apiOrigin = /^https?:\/\//i.test(apiUrl) ? new URL(apiUrl).origin : window.location.origin;
  return new URL(imageUrl, `${apiOrigin}/`).toString();
}

const services = [
  {
    number: "01",
    arTitle: "التصميم والهوية",
    enTitle: "Creative Design & Branding",
    arText: "نبني هوية بصرية متماسكة تترك أثراً واضحاً في ذاكرة جمهورك.",
    enText: "We build cohesive visual identities that leave a clear, lasting impression.",
    icon: Brush,
  },
  {
    number: "02",
    arTitle: "صناعة المحتوى",
    enTitle: "Content Creation",
    arText: "نحوّل أفكارك إلى محتوى أصيل يحكي قصتك ويقرّبك من جمهورك.",
    enText:
      "We turn your ideas into authentic content that tells your story and connects with your audience.",
    icon: Sparkles,
  },
  {
    number: "03",
    arTitle: "التصوير والإنتاج",
    enTitle: "Photo & Video",
    arText: "صورة سينمائية وإنتاج متكامل يقدّم علامتك بأفضل حضور.",
    enText: "Cinematic visuals and end-to-end production that present your brand at its best.",
    icon: Camera,
  },
  {
    number: "04",
    arTitle: "إدارة التواصل",
    enTitle: "Social Media Management",
    arText: "استراتيجية، نشر وتفاعل مستمر يصنع مجتمعاً حول علامتك.",
    enText:
      "Strategy, publishing, and ongoing engagement that build a community around your brand.",
    icon: Share2,
  },
  {
    number: "05",
    arTitle: "الويب والموبايل",
    enTitle: "Web Design & Mobile",
    arText: "تجارب رقمية سريعة، أنيقة ومصممة لتحقيق أهداف عملك.",
    enText: "Fast, elegant digital experiences designed to achieve your business goals.",
    icon: Globe2,
  },
  {
    number: "06",
    arTitle: "الإعلانات الممولة",
    enTitle: "Paid Advertising",
    arText: "نخطط ونطلق حملات إعلانية تصل بعلامتك إلى الجمهور المناسب.",
    enText: "We plan and launch campaigns that put your brand in front of the right audience.",
    icon: Megaphone,
  },
  {
    number: "07",
    arTitle: "خطط المحتوى",
    enTitle: "Content Planning",
    arText: "خطط محتوى واضحة ومنظمة تحافظ على حضورك وتدعم أهدافك.",
    enText: "Clear, organized content plans that sustain your presence and support your goals.",
    icon: ClipboardList,
  },
];

const processSteps = [
  {
    number: "01",
    arTitle: "اجتماع",
    enTitle: "Meeting",
    arText: "نستمع لفكرتك ونفهم احتياجك وأهدافك.",
    enText: "We listen to your idea and understand your goals.",
    icon: Users,
  },
  {
    number: "02",
    arTitle: "خطة",
    enTitle: "Plan",
    arText: "نضع مساراً واضحاً للعمل والمحتوى والنتائج.",
    enText: "We set a clear path for the work, content, and outcomes.",
    icon: ClipboardCheck,
  },
  {
    number: "03",
    arTitle: "تنفيذ",
    enTitle: "Execution",
    arText: "نحوّل الخطة إلى عمل إبداعي متكامل.",
    enText: "We turn the plan into polished creative work.",
    icon: Sparkles,
  },
  {
    number: "04",
    arTitle: "نتائج",
    enTitle: "Results",
    arText: "نقيس الأثر ونراجع ما تحقق معاً.",
    enText: "We measure the impact and review what we achieved together.",
    icon: BarChart3,
  },
  {
    number: "05",
    arTitle: "تقرير",
    enTitle: "Report",
    arText: "نشاركك تقريراً واضحاً وخطوات التطوير القادمة.",
    enText: "We share a clear report and the next steps for growth.",
    icon: FileText,
  },
];

const copy = {
  ar: {
    nav: ["خدماتنا", "كيف منشتغل", "من نحن", "أعمالنا", "الإدارة", "عملاؤنا", "تواصل معنا"],
    start: "ابدأ مشروعك",
    light: "تفعيل الوضع الفاتح",
    dark: "تفعيل الوضع الداكن",
    menu: "فتح القائمة",
    heroTitle: (
      <>
        نروي قصتك
        <br />
        بلغة <em>الإبداع.</em>
      </>
    ),
    heroCopy: "نصنع علامات لا تُنسى، ونحوّل الأفكار إلى تجارب بصرية تعيش في الذاكرة.",
    discover: "اكتشف أعمالنا",
    servicesEyebrow: "ما الذي نصنعه",
    servicesTitle: "خدماتنا",
    servicesCopy: "من الفكرة الأولى حتى حضورك الكامل، نمنح كل تفصيل سبباً وهدفاً.",
    processEyebrow: "من الفكرة إلى الأثر",
    processTitle: "كيف منشتغل",
    processCopy: "نحوّل التعاون إلى خطوات واضحة، من أول لقاء حتى قراءة النتائج وتقديم التقرير.",
    workEyebrow: "مختارات من الاستوديو",
    workTitle: "أعمالنا",
    filters: ["الكل", "هويات بصرية", "مطبوعات", "محتوى رقمي", "تصوير"],
    managementEyebrow: "من يقود الحكاية",
    quote: "الإبداع ليس مجرد شكل جميل، بل فكرة صحيحة تُروى بالطريقة التي تستحقها.",
    name: "حسين كيطون",
    role: "المؤسس والمدير الإبداعي",
    bio: "يقود حسين فريق RELO & MOFIX برؤية تجمع بين الاستراتيجية والحس البصري، لبناء علامات واضحة، أصيلة وقادرة على النمو.",
    contactEyebrow: "فكرتك التالية تبدأ هنا",
    contactTitle: (
      <>
        لنتحدث عن
        <br />
        <em>مشروعك القادم.</em>
      </>
    ),
    emailLabel: "أرسل لنا بريداً",
    contactLabels: ["اتصل بنا", "راسلنا", "زوروا موقعنا"],
    rights: "جميع الحقوق محفوظة",
    top: "العودة للأعلى",
  },
  en: {
    nav: ["Services", "How we work", "About", "Work", "Management", "Clients", "Contact"],
    start: "Start a project",
    light: "Enable light mode",
    dark: "Enable dark mode",
    menu: "Open menu",
    heroTitle: (
      <>
        We tell your story
        <br />
        through <em>creativity.</em>
      </>
    ),
    heroCopy:
      "We create unforgettable brands and turn ideas into visual experiences that live in memory.",
    discover: "Explore our work",
    servicesEyebrow: "What we create",
    servicesTitle: "Services",
    servicesCopy:
      "From the first idea to your complete presence, we give every detail a reason and a purpose.",
    processEyebrow: "From idea to impact",
    processTitle: "How we work",
    processCopy:
      "We turn collaboration into clear steps, from the first meeting to results and a final report.",
    workEyebrow: "Selected from the studio",
    workTitle: "Our work",
    filters: ["All", "Brand Identity", "Editorial", "Digital Content", "Photography"],
    managementEyebrow: "Leading the story",
    quote:
      "Creativity is more than a beautiful form. It is the right idea, told the way it deserves.",
    name: "Hussain Keton",
    role: "Founder & Creative Director",
    bio: "Hussain leads RELO & MOFIX with a vision that brings strategy and visual intuition together to build clear, authentic brands made to grow.",
    contactEyebrow: "Your next idea starts here",
    contactTitle: (
      <>
        Let's talk about
        <br />
        <em>your next project.</em>
      </>
    ),
    emailLabel: "Send us an email",
    contactLabels: ["Call us", "Email us", "Visit our website"],
    rights: "All rights reserved",
    top: "Back to top",
  },
};

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="icon-button"
    >
      {children}
    </button>
  );
}

function getWhatsAppUrl(message: string) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function updateSeoMetadata(language: "ar" | "en") {
  const metadata = seoCopy[language];
  document.title = metadata.title;
  document.querySelector('meta[name="description"]')?.setAttribute("content", metadata.description);
  document.querySelector('meta[property="og:title"]')?.setAttribute("content", metadata.title);
  document
    .querySelector('meta[property="og:description"]')
    ?.setAttribute("content", metadata.description);
  document.querySelector('meta[name="twitter:title"]')?.setAttribute("content", metadata.title);
  document
    .querySelector('meta[name="twitter:description"]')
    ?.setAttribute("content", metadata.description);
  document
    .querySelector('meta[property="og:locale"]')
    ?.setAttribute("content", language === "ar" ? "ar_SY" : "en_US");
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
    return (
      <div className="admin-route-loading" dir="rtl">
        جاري التحقق من الجلسة...
      </div>
    );
  }
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function getInstagramUrls(embedCode: string | null | undefined) {
  return [
    ...new Set(
      (embedCode || "").match(
        /https?:\/\/(?:www\.)?instagram\.com\/(?:reel|p|tv)\/[A-Za-z0-9_-]+/gi,
      ) || [],
    ),
  ];
}

function WorkPortfolio({
  works,
  isArabic,
  logoAsset,
}: {
  works: WorkRecord[];
  isArabic: boolean;
  logoAsset: { url: string };
}) {
  const [selectedWork, setSelectedWork] = useState<WorkRecord | null>(null);
  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) return logoAsset.url;
    if (/^https?:\/\//i.test(imageUrl)) return imageUrl;

    const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
    const apiOrigin = /^https?:\/\//i.test(apiUrl)
      ? new URL(apiUrl).origin
      : window.location.origin;
    return new URL(imageUrl, `${apiOrigin}/`).toString();
  };

  useEffect(() => {
    const openFromHash = () => {
      const slug = window.location.hash.startsWith("#work/") ? window.location.hash.slice(6) : "";
      setSelectedWork(works.find((work) => work.slug === slug) || null);
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, [works]);

  useEffect(() => {
    if (!selectedWork) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") window.history.back();
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectedWork]);

  const openWork = (work: WorkRecord) => {
    if (work.slug) window.location.hash = `work/${work.slug}`;
    setSelectedWork(work);
  };
  const closeWork = () => {
    if (window.location.hash.startsWith("#work/")) window.history.back();
    else setSelectedWork(null);
  };

  return (
    <>
      <div className="work-grid">
        {works.map((work) => (
          <button
            type="button"
            className="work-card work-card-button"
            key={work.id}
            onClick={() => openWork(work)}
          >
            <div className="work-visual work-visual--image">
              <img
                src={getImageUrl(work.image_url)}
                alt={isArabic ? work.ar_title : work.en_title}
                loading="lazy"
                decoding="async"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = logoAsset.url;
                }}
              />
              {getInstagramUrls(work.embed_code).length > 0 && (
                <span className="work-card-play">
                  <Play size={18} fill="currentColor" />
                </span>
              )}
            </div>
            <div className="work-card-meta">
              <span>{isArabic ? work.category_ar_name : work.category_en_name}</span>
              <h3>{isArabic ? work.ar_title : work.en_title}</h3>
              {work.result_value && (
                <strong>
                  {work.result_value} <small>{work.result_label}</small>
                </strong>
              )}
              <ArrowUpLeft size={20} />
            </div>
          </button>
        ))}
      </div>
      {selectedWork && (
        <div
          className="work-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeWork();
          }}
        >
          <section
            className="work-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="selected-work-title"
          >
            <button
              type="button"
              className="work-modal-close"
              onClick={closeWork}
              aria-label={isArabic ? "إغلاق" : "Close"}
            >
              <X />
            </button>
            <div className="work-modal-content">
              <div>
                <span className="eyebrow">
                  {isArabic ? selectedWork.category_ar_name : selectedWork.category_en_name}
                </span>
                <h2 id="selected-work-title">
                  {isArabic ? selectedWork.ar_title : selectedWork.en_title}
                </h2>
                {selectedWork.result_value && (
                  <div className="work-result">
                    <strong>{selectedWork.result_value}</strong>
                    <span>{selectedWork.result_label}</span>
                  </div>
                )}
                {selectedWork.problem && (
                  <p>
                    <b>{isArabic ? "المشكلة" : "The challenge"}</b>
                    {selectedWork.problem}
                  </p>
                )}
                {selectedWork.solution && (
                  <p>
                    <b>{isArabic ? "ما عملناه" : "What we did"}</b>
                    {selectedWork.solution}
                  </p>
                )}
                {selectedWork.testimonial && <blockquote>{selectedWork.testimonial}</blockquote>}
                {selectedWork.external_url && (
                  <a
                    className="work-external-link"
                    href={selectedWork.external_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink size={17} /> {isArabic ? "زيارة المشروع" : "Visit project"}
                  </a>
                )}
              </div>
              <div className="work-modal-reels">
                {getInstagramUrls(selectedWork.embed_code).map((url) => (
                  <iframe
                    key={url}
                    src={`${url}/embed`}
                    title={isArabic ? "ريل من إنستغرام" : "Instagram reel"}
                    loading="lazy"
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  />
                ))}
                {!getInstagramUrls(selectedWork.embed_code).length && selectedWork.image_url && (
                  <img src={getImageUrl(selectedWork.image_url)} alt="" />
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

function ClientCarousel({ clients }: { clients: ClientLogo[] }) {
  const getImageUrl = (imageUrl: string) => {
    if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
    const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
    const apiOrigin = /^https?:\/\//i.test(apiUrl)
      ? new URL(apiUrl).origin
      : window.location.origin;
    return new URL(imageUrl, `${apiOrigin}/`).toString();
  };

  return (
    <div className="clients-carousel" aria-label="شعارات العملاء">
      {clients.length > 0 && (
        <div className="clients-carousel__track">
          {clients.map((client) => (
            <div className="clients-carousel__slide" key={client.id}>
              <img
                src={getImageUrl(client.logo_url)}
                alt="شعار عميل"
                loading="lazy"
                decoding="async"
              />
            </div>
          ))}
          {clients.map((client) => (
            <div
              className="clients-carousel__slide clients-carousel__slide--duplicate"
              key={`${client.id}-duplicate`}
              aria-hidden="true"
            >
              <img src={getImageUrl(client.logo_url)} alt="" loading="lazy" decoding="async" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TestimonialsCarousel({
  testimonials,
  isArabic,
}: {
  testimonials: Testimonial[];
  isArabic: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => setActiveIndex(0), [testimonials]);
  useEffect(() => {
    if (testimonials.length < 2) return;
    const interval = window.setInterval(
      () => setActiveIndex((index) => (index + 1) % testimonials.length),
      5000,
    );
    return () => window.clearInterval(interval);
  }, [testimonials.length]);

  const testimonial = testimonials[activeIndex];
  if (!testimonial) return null;

  return (
    <div className="testimonials-carousel" aria-live="polite">
      <article className="testimonial-card" key={testimonial.id}>
        <Quote className="testimonial-card__quote-icon" />
        <blockquote>{isArabic ? testimonial.ar_quote : testimonial.en_quote}</blockquote>
        <div className="testimonial-card__author">
          <strong>{isArabic ? testimonial.ar_name : testimonial.en_name}</strong>
          <span>{isArabic ? testimonial.ar_role : testimonial.en_role}</span>
        </div>
      </article>
      {testimonials.length > 1 && (
        <div className="testimonials-carousel__dots">
          {testimonials.map((item, index) => (
            <button
              type="button"
              key={item.id}
              className={index === activeIndex ? "active" : ""}
              onClick={() => setActiveIndex(index)}
              aria-label={`الشهادة ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Website() {
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const [scrolled, setScrolled] = useState(false);
  const [works, setWorks] = useState<WorkRecord[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [clients, setClients] = useState<ClientLogo[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [about, setAbout] = useState<AboutContent | null>(null);

  useEffect(() => {
    Promise.all([
      api.getWorks(),
      api.getCategories(),
      api.getClients(),
      api.getTestimonials(),
      api.getAbout(),
    ])
      .then(
        ([
          worksResponse,
          categoriesResponse,
          clientsResponse,
          testimonialsResponse,
          aboutResponse,
        ]) => {
          if (worksResponse.success) setWorks(worksResponse.data || []);
          if (categoriesResponse.success) setCategories(categoriesResponse.data || []);
          if (clientsResponse.success) setClients(clientsResponse.data || []);
          if (testimonialsResponse.success) setTestimonials(testimonialsResponse.data || []);
          if (aboutResponse.success && aboutResponse.data) setAbout(aboutResponse.data);
        },
      )
      .catch((error) => console.error("Failed to load public work content:", error));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    updateSeoMetadata(language);
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
  const visibleWork = works
    .slice()
    .sort((a, b) => Number(b.sort_order || 0) - Number(a.sort_order || 0));
  const isArabic = language === "ar";

  const scrollToSection = (id: string | undefined) => {
    if (!id) return;
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <main
      dir={isArabic ? "rtl" : "ltr"}
      className={`site-main min-h-screen overflow-hidden bg-background text-foreground ${isArabic ? "lang-ar" : "lang-en"}`}
    >
      <CursorFollower />
      <header
        className={`site-header ${scrolled || menuOpen ? "header-scrolled" : "header-at-top"}`}
      >
        <a
          href="#home"
          className="brand"
          aria-label="RELO & MOFIX"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection("home");
          }}
        >
          <img src={logoAsset.url} alt="RELO & MOFIX logo" />
          <span>
            RELO <b>&</b> MOFIX
          </span>
        </a>
        <nav
          className={menuOpen ? "nav-links nav-open" : "nav-links"}
          aria-label={isArabic ? "التنقل الرئيسي" : "Main navigation"}
        >
          {t.nav.map((label, index) => (
            <a
              href={
                ["#services", "#process", "#about", "#work", "#management", "#clients", "#contact"][
                  index
                ]
              }
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(
                  ["services", "process", "about", "work", "management", "clients", "contact"][
                    index
                  ],
                );
                setMenuOpen(false);
              }}
              key={label}
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <button
            type="button"
            className="language-toggle"
            onClick={() => {
              setLanguage(isArabic ? "en" : "ar");
              setMenuOpen(false);
            }}
            aria-label={isArabic ? "Switch to English" : "التبديل إلى العربية"}
          >
            {isArabic ? "EN" : "AR"}
          </button>
          <IconButton label={dark ? t.light : t.dark} onClick={() => setDark(!dark)}>
            {dark ? <Sun size={19} /> : <Moon size={19} />}
          </IconButton>
          <div className="mobile-menu">
            <IconButton label={t.menu} onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X /> : <Menu />}
            </IconButton>
          </div>
          <a
            className="header-cta"
            href={getWhatsAppUrl(
              isArabic
                ? "مرحباً، أرغب ببدء مشروع جديد معكم."
                : "Hello, I would like to start a new project with you.",
            )}
            target="_blank"
            rel="noreferrer"
          >
            {t.start} <ArrowUpLeft size={17} />
          </a>
        </div>
      </header>

      <section id="home" className="hero">
        <img src={wavesAsset.url} alt="تموجات الهوية البصرية لريلو آند موفكس" className="hero-bg" />
        <div className="hero-shade" />
        <div className="hero-content">
          <h1>{t.heroTitle}</h1>
          <p className="hero-copy">{t.heroCopy}</p>
          <a
            href="#work"
            className="hero-cta"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("work");
            }}
          >
            {t.discover} <ArrowLeft size={20} />
          </a>
        </div>
        <div className="hero-aside">
          <span>WE TELL YOUR STORY</span>
          <i />
        </div>
        <a
          href="#services"
          className="scroll-cue"
          aria-label="انتقل إلى خدماتنا"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection("services");
          }}
        >
          <ChevronDown />
        </a>
      </section>

      <section id="services" className="section services-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{t.servicesEyebrow}</p>
            <h2>
              {t.servicesTitle}
              <span>.</span>
            </h2>
          </div>
          <p>{t.servicesCopy}</p>
        </div>
        <div className="services-list">
          {services.map((service) => {
            const Icon = service.icon;
            const serviceTitle = isArabic ? service.arTitle : service.enTitle;
            const whatsappMessage = isArabic
              ? `مرحباً، أرغب بالاستفسار عن خدمة ${serviceTitle} لدى RELO & MOFIX.`
              : `Hello, I would like to enquire about ${serviceTitle} at RELO & MOFIX.`;
            return (
              <article className="service-row" key={service.number}>
                <span className="service-number">{service.number}</span>
                <div className="service-icon">
                  <Icon strokeWidth={1.5} />
                </div>
                <div className="service-name">
                  <h3>{isArabic ? service.arTitle : service.enTitle}</h3>
                  <span>{isArabic ? service.enTitle : service.arTitle}</span>
                </div>
                <p>{isArabic ? service.arText : service.enText}</p>
                <a
                  className="service-whatsapp"
                  href={getWhatsAppUrl(whatsappMessage)}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={
                    isArabic
                      ? `راسلنا عن خدمة ${serviceTitle} عبر واتساب`
                      : `Message us about ${serviceTitle} on WhatsApp`
                  }
                  title={isArabic ? "راسلنا عبر واتساب" : "Message us on WhatsApp"}
                >
                  <MessageCircle size={19} />
                  <span>{isArabic ? "اطلب هالخدمة" : "Request this service"}</span>
                </a>
              </article>
            );
          })}
        </div>
      </section>

      <section id="process" className="section process-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{t.processEyebrow}</p>
            <h2>
              {t.processTitle}
              <span>.</span>
            </h2>
          </div>
          <p>{t.processCopy}</p>
        </div>
        <div className="process-grid">
          {processSteps.map((step) => {
            const Icon = step.icon;
            return (
              <article className="process-card" key={step.number}>
                <span className="process-number">{step.number}</span>
                <div className="process-icon">
                  <Icon strokeWidth={1.5} />
                </div>
                <h3>{isArabic ? step.arTitle : step.enTitle}</h3>
                <p>{isArabic ? step.arText : step.enText}</p>
              </article>
            );
          })}
        </div>
        <div className="process-socials">
          <span>
            {isArabic ? "تابعوا أعمالنا وكواليسنا" : "Follow our work and behind the scenes"}
          </span>
          <a href="https://www.instagram.com/relo.mofix/" target="_blank" rel="noreferrer">
            <Instagram size={18} /> @relo.mofix
          </a>
          <a
            href="https://www.facebook.com/61587323528346/posts/%D9%85%D9%88-%D8%A8%D8%B3-reels-%D9%86%D8%AD%D9%86%D8%A7-%D9%85%D9%86%D8%AD%D9%88%D9%91%D9%84-%D8%A7%D9%84%D8%A3%D9%81%D9%83%D8%A7%D8%B1-%D9%84%D9%87%D9%88%D9%8A%D8%A9-%D9%88%D8%A7%D9%84%D9%85%D8%AD%D8%AA%D9%88%D9%89-%D9%84%D8%AA%D8%A3%D8%AB%D9%8A%D8%B1-%D9%88%D8%A7%D9%84%D8%A5%D8%A8%D8%AF%D8%A7%D8%B9-%D9%84%D9%86%D8%AA%D8%A7%D8%A6%D8%AC-relo-mofix/122139611781244117/"
            target="_blank"
            rel="noreferrer"
          >
            <Facebook size={18} /> Facebook
          </a>
        </div>
      </section>

      <section id="about" className="section about-section">
        <div className="about-layout">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{isArabic ? "عن الاستوديو" : "The studio"}</p>
              <h2>
                {about
                  ? isArabic
                    ? about.ar_title
                    : about.en_title
                  : isArabic
                    ? "من نحن"
                    : "About us"}
                <span>.</span>
              </h2>
            </div>
            <p>
              {about
                ? isArabic
                  ? about.ar_text
                  : about.en_text
                : isArabic
                  ? "نصنع أفكارًا واضحة، هويات أصيلة وتجارب بصرية تترك أثرًا."
                  : "We create clear ideas, authentic identities, and visual experiences that leave a mark."}
            </p>
          </div>
          <div className="about-visual">
            <img
              src={getApiImageUrl(about?.image_url, wavesAsset.url)}
              alt={isArabic ? "هوية RELO & MOFIX البصرية" : "RELO & MOFIX visual identity"}
            />
          </div>
        </div>
      </section>

      <section id="work" className="section work-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{t.workEyebrow}</p>
            <h2>
              {t.workTitle}
              <span>.</span>
            </h2>
          </div>
        </div>
        <WorkPortfolio works={visibleWork.slice(0, 4)} isArabic={isArabic} logoAsset={logoAsset} />
        <div className="work-more-wrap">
          <a className="work-more-button" href="/works">
            {isArabic ? "عرض جميع الأعمال" : "View all work"}
            <ArrowUpLeft size={18} />
          </a>
        </div>
      </section>

      <section id="management" className="management">
        <div className="portrait-wrap">
          <img
            src={hussainAsset.url}
            alt={
              isArabic
                ? "حسين كيطون، المدير الإبداعي لريلو آند موفكس"
                : "Hussain Keton, Creative Director at RELO & MOFIX"
            }
          />
          <span className="portrait-label">FOUNDER / CREATIVE DIRECTOR</span>
        </div>
        <div className="management-copy">
          <p className="eyebrow">{t.managementEyebrow}</p>
          <Quote className="quote-icon" />
          <blockquote>{t.quote}</blockquote>
          <div className="signature">
            <h2>{t.name}</h2>
            <span>{t.role}</span>
          </div>
          <p>{t.bio}</p>
        </div>
      </section>

      <section id="clients" className="section clients-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{isArabic ? "شركاء النجاح" : "Partners in success"}</p>
            <h2>
              {isArabic ? "عملاؤنا" : "Our clients"}
              <span>.</span>
            </h2>
          </div>
          <p>
            {isArabic
              ? "شعارات العلامات التي شاركناها صناعة حضورها."
              : "The brands we have helped shape and bring to life."}
          </p>
        </div>
        <ClientCarousel clients={clients} />
      </section>

      <section id="testimonials" className="section testimonials-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{isArabic ? "ماذا يقولون عنا" : "Words from our clients"}</p>
            <h2>
              {isArabic ? "آراء العملاء" : "Testimonials"}
              <span>.</span>
            </h2>
          </div>
        </div>
        <TestimonialsCarousel testimonials={testimonials} isArabic={isArabic} />
      </section>

      <section id="contact" className="contact-section">
        <div className="contact-top">
          <p className="eyebrow">{t.contactEyebrow}</p>
          <h2>{t.contactTitle}</h2>
          <a
            href={getWhatsAppUrl(
              isArabic
                ? "مرحباً، أرغب بالتحدث معكم عن مشروعي القادم."
                : "Hello, I would like to discuss my next project with you.",
            )}
            target="_blank"
            rel="noreferrer"
            className="contact-circle"
            aria-label={isArabic ? "تحدث معنا عبر واتساب" : "Chat with us on WhatsApp"}
          >
            <ArrowUpLeft />
          </a>
        </div>
        <div className="contact-details">
          <a href="tel:+963997596503">
            <Phone />
            <span>
              {t.contactLabels[0]}
              <strong dir="ltr">+963 997 596 503</strong>
            </span>
          </a>
          <a
            href={getWhatsAppUrl(
              isArabic
                ? "مرحباً، أرغب بالتواصل معكم حول مشروعي القادم."
                : "Hello, I would like to discuss my next project with you.",
            )}
            target="_blank"
            rel="noreferrer"
            className="contact-whatsapp"
          >
            <MessageCircle />
            <span>
              {isArabic ? "راسلنا عبر واتساب" : "Chat on WhatsApp"}
              <strong dir="ltr">+963 997 596 503</strong>
            </span>
          </a>
          <a href="mailto:info@relomofix.com">
            <Mail />
            <span>
              {t.contactLabels[1]}
              <strong>info@relomofix.com</strong>
            </span>
          </a>
          <a href="https://relomofix.com">
            <Globe2 />
            <span>
              {t.contactLabels[2]}
              <strong>relomofix.com</strong>
            </span>
          </a>
          <div className="contact-socials">
            <a
              href="https://www.instagram.com/relo.mofix/"
              target="_blank"
              rel="noreferrer"
              aria-label="RELO & MOFIX Instagram"
            >
              <Instagram />
              <span>
                Instagram<strong dir="ltr">@relo.mofix</strong>
              </span>
            </a>
            <a
              href="https://www.facebook.com/61587323528346/posts/%D9%85%D9%88-%D8%A8%D8%B3-reels-%D9%86%D8%AD%D9%86%D8%A7-%D9%85%D9%86%D8%AD%D9%88%D9%91%D9%84-%D8%A7%D9%84%D8%A3%D9%81%D9%83%D8%A7%D8%B1-%D9%84%D9%87%D9%88%D9%8A%D8%A9-%D9%88%D8%A7%D9%84%D9%85%D8%AD%D8%AA%D9%88%D9%89-%D9%84%D8%AA%D8%A3%D8%AB%D9%8A%D8%B1-%D9%88%D8%A7%D9%84%D8%A5%D8%A8%D8%AF%D8%A7%D8%B9-%D9%84%D9%86%D8%AA%D8%A7%D8%A6%D8%AC-relo-mofix/122139611781244117/"
              target="_blank"
              rel="noreferrer"
              aria-label="RELO & MOFIX Facebook"
            >
              <Facebook />
              <span>
                Facebook<strong>RELO & MOFIX</strong>
              </span>
            </a>
            <a
              href="https://www.instagram.com/hussain_keton/"
              target="_blank"
              rel="noreferrer"
              aria-label="Hussain Keton Instagram"
            >
              <Instagram />
              <span>
                {isArabic ? "إنستغرام المؤسس" : "Founder Instagram"}
                <strong dir="ltr">@hussain_keton</strong>
              </span>
            </a>
          </div>
        </div>
      </section>

      <a
        className="whatsapp-floating"
        href={getWhatsAppUrl(
          isArabic
            ? "مرحباً، أرغب بالتواصل معكم."
            : "Hello, I would like to get in touch with you.",
        )}
        target="_blank"
        rel="noreferrer"
        aria-label={isArabic ? "تواصل معنا عبر واتساب" : "Contact us on WhatsApp"}
        title={isArabic ? "تواصل معنا عبر واتساب" : "Contact us on WhatsApp"}
      >
        <MessageCircle size={25} />
      </a>

      <footer>
        <div className="footer-brand">
          RELO <b>&</b> MOFIX
        </div>
        <p>© 2026 {t.rights}</p>
        <a
          href="#home"
          aria-label={t.top}
          onClick={(e) => {
            e.preventDefault();
            scrollToSection("home");
          }}
        >
          <ArrowUpLeft /> {t.top}
        </a>
        <div
          className="footer-socials"
          aria-label={isArabic ? "روابط التواصل الاجتماعي" : "Social media links"}
        >
          <a
            href="https://www.instagram.com/relo.mofix/"
            target="_blank"
            rel="noreferrer"
            aria-label="RELO & MOFIX Instagram"
            title="RELO & MOFIX Instagram"
          >
            <Instagram size={18} />
          </a>
          <a
            href="https://www.facebook.com/61587323528346/posts/%D9%85%D9%88-%D8%A8%D8%B3-reels-%D9%86%D8%AD%D9%86%D8%A7-%D9%85%D9%86%D8%AD%D9%88%D9%91%D9%84-%D8%A7%D9%84%D8%A3%D9%81%D9%83%D8%A7%D8%B1-%D9%84%D9%87%D9%88%D9%8A%D8%A9-%D9%88%D8%A7%D9%84%D9%85%D8%AD%D8%AA%D9%88%D9%89-%D9%84%D8%AA%D8%A3%D8%AB%D9%8A%D8%B1-%D9%88%D8%A7%D9%84%D8%A5%D8%A8%D8%AF%D8%A7%D8%B9-%D9%84%D9%86%D8%AA%D8%A7%D8%A6%D8%AC-relo-mofix/122139611781244117/"
            target="_blank"
            rel="noreferrer"
            aria-label="RELO & MOFIX Facebook"
            title="RELO & MOFIX Facebook"
          >
            <Facebook size={18} />
          </a>
          <a
            href="https://www.instagram.com/hussain_keton/"
            target="_blank"
            rel="noreferrer"
            aria-label="Hussain Keton Instagram"
            title="Hussain Keton Instagram"
          >
            <Instagram size={18} />
          </a>
        </div>
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
          <Route
            path="/works"
            element={
              <Suspense fallback={<div className="works-route-loading">جاري تحميل الأعمال...</div>}>
                <WorksPage />
              </Suspense>
            }
          />
          <Route
            path="/works/:slug"
            element={
              <Suspense fallback={<div className="works-route-loading">جاري تحميل الأعمال...</div>}>
                <WorksPage />
              </Suspense>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
