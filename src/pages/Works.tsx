import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowUpLeft, ChevronLeft, ChevronRight, ExternalLink, MessageCircle, Play, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import logoUrl from "../assets/relo-mofix-logo-new.png";
import { api, WorkRecord } from "../lib/api";
import { getInstagramUrls, getWorkCoverSources, resolveLocalImageUrl } from "../lib/work-media";
import { WorkCoverImage } from "../components/WorkCoverImage";

const WHATSAPP_NUMBER = "963997596503";

const workFilters = [
  { id: "all", ar: "الكل", en: "All" },
  { id: "reels", ar: "فيديو وريلز", en: "Video & Reels" },
  { id: "branding", ar: "هوية بصرية", en: "Brand Identity" },
  { id: "design", ar: "تصميم", en: "Design" },
  { id: "ads", ar: "إعلانات ممولة", en: "Paid Ads" },
  { id: "digital", ar: "مواقع وتطبيقات", en: "Web & Apps" },
] as const;

function matchesWorkFilter(work: WorkRecord, filter: string) {
  if (filter === "all") return true;
  if (filter === "reels") return Boolean(work.embed_code?.trim());

  const searchable = [
    work.category_slug,
    work.category_ar_name,
    work.category_en_name,
    work.ar_type,
    work.en_type,
    work.tag,
  ].join(" ").toLowerCase();

  if (filter === "branding") return /brand|هوية|identity|براند/.test(searchable);
  if (filter === "design") return /design|تصميم|جرافيك|print|مطبوع/.test(searchable);
  if (filter === "ads") return /ad|ads|اعلان|إعلان|ممولة|campaign/.test(searchable);
  if (filter === "digital") return /web|site|website|app|موقع|تطبيق|ويب/.test(searchable);
  return true;
}

function getWhatsAppUrl(projectName: string) {
  const message = `مرحباً، بدي نفس شغل مشروع "${projectName}" لمشروعي.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function getImageUrl(imageUrl: string | null | undefined) {
  if (!imageUrl) return logoUrl;
  return resolveLocalImageUrl(imageUrl);
}

export default function WorksPage() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const [works, setWorks] = useState<WorkRecord[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedWorkState, setSelectedWorkState] = useState<WorkRecord | null>(null);

  useEffect(() => {
    Promise.all([api.getWorks(), api.getCategories()])
      .then(([worksResponse]) => {
        if (worksResponse.success) setWorks(worksResponse.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  const filteredWorks = useMemo(() => {
    const sorted = works
      .slice()
      .sort((a, b) => Number(b.sort_order || 0) - Number(a.sort_order || 0));
    return sorted.filter((work) => matchesWorkFilter(work, filter));
  }, [filter, works]);

  const selectedWork =
    selectedWorkState ||
    (slug
      ? filteredWorks.find((work) => work.slug === slug) ||
        works.find((work) => work.slug === slug) ||
        null
      : null);

  useEffect(() => {
    if (!selectedWork) return;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedWorkState(null);
        if (slug) navigate("/works");
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [navigate, selectedWork, slug]);

  const closeModal = () => {
    setSelectedWorkState(null);
    if (slug) navigate("/works");
  };
  const openModal = (work: WorkRecord) => {
    setSelectedWorkState(work);
    if (work.slug) navigate(`/works/${work.slug}`, { replace: false });
  };
  const navigateAdjacentWork = (direction: -1 | 1) => {
    if (!selectedWork) return;
    const currentIndex = filteredWorks.findIndex((work) => work.id === selectedWork.id);
    const nextIndex = currentIndex + direction;
    if (nextIndex < 0 || nextIndex >= filteredWorks.length) return;
    const nextWork = filteredWorks[nextIndex];
    setSelectedWorkState(nextWork);
    if (nextWork.slug) navigate(`/works/${nextWork.slug}`, { replace: true });
  };

  const isArabic = language === "ar";

  return (
    <main className="works-page" dir={isArabic ? "rtl" : "ltr"}>
      <header className="works-page-header">
        <a className="works-page-brand" href="/" aria-label="RELO & MOFIX">
          <img src={logoUrl} alt="RELO & MOFIX" />
          <span>
            RELO <b>&</b> MOFIX
          </span>
        </a>
        <div>
          <button
            type="button"
            className="works-language"
            onClick={() => setLanguage(isArabic ? "en" : "ar")}
          >
            {isArabic ? "EN" : "AR"}
          </button>
          <a className="works-back-link" href="/">
            <ArrowLeft size={18} />
            {isArabic ? "الصفحة الرئيسية" : "Home"}
          </a>
        </div>
      </header>

      <section className="works-page-hero">
        <p className="eyebrow">{isArabic ? "مختارات الاستوديو" : "Selected work"}</p>
        <h1>
          {isArabic ? "أعمالنا" : "Our work"}
          <span>.</span>
        </h1>
      </section>

      <section className="works-page-content">
        <div className="works-page-filters" role="group" aria-label="Work filters">
          {workFilters.map((item) => (
            <button
              type="button"
              key={item.id}
              className={filter === item.id ? "active" : ""}
              onClick={() => setFilter(item.id)}
            >
              {isArabic ? item.ar : item.en}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="works-page-empty">
            {isArabic ? "جاري تحميل الأعمال..." : "Loading work..."}
          </div>
        ) : filteredWorks.length === 0 ? (
          <div className="works-page-empty">
            {isArabic ? "لا توجد أعمال في هذا التصنيف." : "No work in this category."}
          </div>
        ) : (
          <div className="work-grid works-page-grid">
            {filteredWorks.map((work) => (
              <button
                type="button"
                className="work-card work-card-button work-card--text"
                key={work.id}
                onClick={() => openModal(work)}
              >
                <span className="work-text-card-number">
                  {String(filteredWorks.indexOf(work) + 1).padStart(2, "0")}
                </span>
                <span className="work-card-tag">
                  {isArabic
                    ? work.category_ar_name || work.ar_type || "مشروع"
                    : work.category_en_name || work.en_type || "Project"}
                </span>
                <h3>{isArabic ? work.ar_title : work.en_title}</h3>
                <div className="work-card-result">
                  {work.result_value && (
                    <strong>
                      {work.result_value}
                    </strong>
                  )}
                  {work.result_label && <small>{work.result_label}</small>}
                </div>
                {getInstagramUrls(work.embed_code).length > 0 ? (
                  <span className="work-card-action" aria-label="تشغيل">
                    <Play size={18} fill="currentColor" />
                  </span>
                ) : (
                  <ArrowUpLeft className="work-card-action" size={20} />
                )}
              </button>
            ))}
          </div>
        )}
      </section>

      {selectedWork && (
        <div
          className="work-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section
            className="work-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="works-selected-title"
          >
            <button
              type="button"
              className="work-modal-close"
              onClick={closeModal}
              aria-label={isArabic ? "إغلاق" : "Close"}
            >
              <X />
            </button>
            <button
              type="button"
              className="work-modal-nav work-modal-prev"
              onClick={() => navigateAdjacentWork(-1)}
              disabled={filteredWorks.findIndex((work) => work.id === selectedWork.id) <= 0}
              aria-label={isArabic ? "المشروع السابق" : "Previous project"}
            >
              <ChevronRight />
            </button>
            <button
              type="button"
              className="work-modal-nav work-modal-next"
              onClick={() => navigateAdjacentWork(1)}
              disabled={
                filteredWorks.findIndex((work) => work.id === selectedWork.id) >=
                filteredWorks.length - 1
              }
              aria-label={isArabic ? "المشروع التالي" : "Next project"}
            >
              <ChevronLeft />
            </button>
            <div className="work-modal-content">
              <div>
                <span className="eyebrow">
                  {isArabic ? selectedWork.category_ar_name : selectedWork.category_en_name}
                </span>
                <h2 id="works-selected-title">
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
                <a
                  className="work-whatsapp-button"
                  href={getWhatsAppUrl(
                    isArabic ? selectedWork.ar_title : selectedWork.en_title,
                  )}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle size={20} />
                  {isArabic ? "بدي نفس الشي لمشروعي" : "I want the same for my project"}
                </a>
                {selectedWork.external_url && (
                  <a
                    className="work-external-link"
                    href={selectedWork.external_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink size={17} />
                    {isArabic ? "زيارة المشروع" : "Visit project"}
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
                    allowFullScreen
                  />
                ))}
                {!getInstagramUrls(selectedWork.embed_code).length &&
                  getWorkCoverSources(selectedWork, getImageUrl, logoUrl).length > 0 && (
                    <WorkCoverImage
                      sources={getWorkCoverSources(selectedWork, getImageUrl, logoUrl)}
                      alt=""
                    />
                  )}
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
