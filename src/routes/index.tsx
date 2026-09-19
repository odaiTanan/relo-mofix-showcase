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
import logoAsset from "../assets/relo-mofix-logo.jpg.asset.json";
import wavesAsset from "../assets/relo-mofix-waves.jpg.asset.json";
import hussainAsset from "../assets/hussain-keton.jpg.asset.json";

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
  { number: "01", title: "التصميم والهوية", en: "Creative Design & Branding", text: "نبني هوية بصرية متماسكة تترك أثراً واضحاً في ذاكرة جمهورك.", icon: Brush },
  { number: "02", title: "صناعة المحتوى", en: "Content Creation", text: "نحوّل أفكارك إلى محتوى أصيل يحكي قصتك ويقرّبك من جمهورك.", icon: Sparkles },
  { number: "03", title: "التصوير والإنتاج", en: "Photo & Video", text: "صورة سينمائية وإنتاج متكامل يقدّم علامتك بأفضل حضور.", icon: Camera },
  { number: "04", title: "إدارة التواصل", en: "Social Media Mgmt", text: "استراتيجية، نشر وتفاعل مستمر يصنع مجتمعاً حول علامتك.", icon: Share2 },
  { number: "05", title: "الويب والموبايل", en: "Web Design & Mobile", text: "تجارب رقمية سريعة، أنيقة ومصممة لتحقيق أهداف عملك.", icon: Globe2 },
];

const work = [
  { type: "هويات بصرية", title: "هوية ريلو آند موفكس", tag: "BRANDING", className: "work-orange" },
  { type: "مطبوعات", title: "بروشورات الشركات", tag: "EDITORIAL", className: "work-paper" },
  { type: "محتوى رقمي", title: "حملات التواصل", tag: "SOCIAL", className: "work-black" },
  { type: "تصوير", title: "قصص بصرية", tag: "PRODUCTION", className: "work-photo" },
];

function IconButton({ label, onClick, children }: { label: string; onClick?: () => void; children: React.ReactNode }) {
  return <button type="button" aria-label={label} title={label} onClick={onClick} className="icon-button">{children}</button>;
}

function Index() {
  const [dark, setDark] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState("الكل");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const filters = ["الكل", "هويات بصرية", "مطبوعات", "محتوى رقمي", "تصوير"];
  const visibleWork = filter === "الكل" ? work : work.filter((item) => item.type === filter);

  return (
    <main dir="rtl" className="min-h-screen overflow-hidden bg-background text-foreground">
      <header className="site-header">
        <a href="#home" className="brand" aria-label="RELO & MOFIX">
          <img src={logoAsset.url} alt="شعار ريلو آند موفكس" />
          <span>RELO <b>&</b> MOFIX</span>
        </a>
        <nav className={menuOpen ? "nav-links nav-open" : "nav-links"} aria-label="التنقل الرئيسي">
          <a href="#services" onClick={() => setMenuOpen(false)}>خدماتنا</a>
          <a href="#work" onClick={() => setMenuOpen(false)}>أعمالنا</a>
          <a href="#management" onClick={() => setMenuOpen(false)}>الإدارة</a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>تواصل معنا</a>
        </nav>
        <div className="header-actions">
          <IconButton label={dark ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"} onClick={() => setDark(!dark)}>
            {dark ? <Sun size={19} /> : <Moon size={19} />}
          </IconButton>
          <div className="mobile-menu"><IconButton label="فتح القائمة" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</IconButton></div>
          <a className="header-cta" href="#contact">ابدأ مشروعك <ArrowUpLeft size={17} /></a>
        </div>
      </header>

      <section id="home" className="hero">
        <img src={wavesAsset.url} alt="تموجات الهوية البصرية لريلو آند موفكس" className="hero-bg" />
        <div className="hero-shade" />
        <div className="hero-content">
          <p className="hero-kicker"><span /> CREATIVE DESIGN & BRANDING</p>
          <h1>نروي قصتك<br />بلغة <em>الإبداع.</em></h1>
          <p className="hero-copy">نصنع علامات لا تُنسى، ونحوّل الأفكار إلى تجارب بصرية تعيش في الذاكرة.</p>
          <a href="#work" className="hero-cta">اكتشف أعمالنا <ArrowLeft size={20} /></a>
        </div>
        <div className="hero-aside"><span>WE TELL YOUR STORY</span><i /></div>
        <a href="#services" className="scroll-cue" aria-label="انتقل إلى خدماتنا"><ChevronDown /></a>
      </section>

      <section id="services" className="section services-section">
        <div className="section-heading">
          <div><p className="eyebrow">ما الذي نصنعه</p><h2>خدماتنا<span>.</span></h2></div>
          <p>من الفكرة الأولى حتى حضورك الكامل، نمنح كل تفصيل سبباً وهدفاً.</p>
        </div>
        <div className="services-list">
          {services.map((service) => {
            const Icon = service.icon;
            return <article className="service-row" key={service.number}>
              <span className="service-number">{service.number}</span>
              <div className="service-icon"><Icon strokeWidth={1.5} /></div>
              <div className="service-name"><h3>{service.title}</h3><span>{service.en}</span></div>
              <p>{service.text}</p>
              <ArrowUpLeft className="service-arrow" />
            </article>;
          })}
        </div>
      </section>

      <section id="work" className="section work-section">
        <div className="section-heading">
          <div><p className="eyebrow">مختارات من الاستوديو</p><h2>أعمالنا<span>.</span></h2></div>
          <div className="work-filters" role="group" aria-label="تصنيف الأعمال">
            {filters.map((item) => <button type="button" onClick={() => setFilter(item)} className={filter === item ? "active" : ""} key={item}>{item}</button>)}
          </div>
        </div>
        <div className="work-grid">
          {visibleWork.map((item, index) => <article className={`work-card ${item.className}`} key={item.title}>
            <div className="work-visual">
              {index === 0 && <img src={logoAsset.url} alt="مشروع هوية ريلو آند موفكس" />}
              <span className="work-tag">{item.tag}</span>
              <span className="work-index">0{index + 1}</span>
            </div>
            <div className="work-meta"><div><span>{item.type}</span><h3>{item.title}</h3></div><ArrowUpLeft /></div>
          </article>)}
        </div>
      </section>

      <section id="management" className="management">
        <div className="portrait-wrap">
          <img src={hussainAsset.url} alt="حسين كيطون، المدير الإبداعي لريلو آند موفكس" />
          <span className="portrait-label">FOUNDER / CREATIVE DIRECTOR</span>
        </div>
        <div className="management-copy">
          <p className="eyebrow">من يقود الحكاية</p>
          <Quote className="quote-icon" />
          <blockquote>الإبداع ليس مجرد شكل جميل، بل فكرة صحيحة تُروى بالطريقة التي تستحقها.</blockquote>
          <div className="signature"><h2>حسين كيطون</h2><span>المؤسس والمدير الإبداعي</span></div>
          <p>يقود حسين فريق RELO & MOFIX برؤية تجمع بين الاستراتيجية والحس البصري، لبناء علامات واضحة، أصيلة وقادرة على النمو.</p>
        </div>
      </section>

      <section id="contact" className="contact-section">
        <div className="contact-top">
          <p className="eyebrow">فكرتك التالية تبدأ هنا</p>
          <h2>لنتحدث عن<br /><em>مشروعك القادم.</em></h2>
          <a href="mailto:info@reelo-agency.com" className="contact-circle" aria-label="أرسل لنا بريداً"><ArrowUpLeft /></a>
        </div>
        <div className="contact-details">
          <a href="tel:+963997596503"><Phone /><span>اتصل بنا<strong dir="ltr">+963 997 596 503</strong></span></a>
          <a href="mailto:info@reelo-agency.com"><Mail /><span>راسلنا<strong>info@reelo-agency.com</strong></span></a>
          <a href="https://reelo-agency.com"><Globe2 /><span>زوروا موقعنا<strong>reelo-agency.com</strong></span></a>
        </div>
      </section>

      <footer>
        <div className="footer-brand">RELO <b>&</b> MOFIX</div>
        <p>© 2026 جميع الحقوق محفوظة</p>
        <a href="#home" aria-label="العودة إلى الأعلى"><ArrowUpLeft /> العودة للأعلى</a>
        <Instagram size={18} aria-label="Instagram" />
      </footer>
    </main>
  );
}