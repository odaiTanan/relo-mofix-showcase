import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowUpLeft, ExternalLink, Play, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import logoUrl from "../assets/relo-mofix-logo-new.png";
import { api, Category, WorkRecord } from "../lib/api";

const PAGE_SIZE = 12;

function getInstagramUrls(embedCode: string | null | undefined) {
  return [
    ...new Set(
      (embedCode || "").match(
        /https?:\/\/(?:www\.)?instagram\.com\/(?:reel|p|tv)\/[A-Za-z0-9_-]+(?:\/[^"'<> \t\r\n]*)?/gi,
      ) || [],
    ),
  ].map((url) => url.split(/[?#]/)[0].replace(/\/+$/, ""));
}

function getInstagramThumbnailUrl(embedCode: string | null | undefined) {
  const reelUrl = getInstagramUrls(embedCode)[0];
  if (!reelUrl) return null;

  const match = reelUrl.match(/instagram\.com\/(reel|p|tv)\/([A-Za-z0-9_-]+)/i);
  if (!match) return null;

  return `https://www.instagram.com/${match[1]}/${match[2]}/media/?size=l`;
}

function getImageUrl(imageUrl: string | null | undefined) {
  if (!imageUrl) return logoUrl;
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
  const apiOrigin = /^https?:\/\//i.test(apiUrl) ? new URL(apiUrl).origin : window.location.origin;
  return new URL(imageUrl, `${apiOrigin}/`).toString();
}

export default function WorksPage() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const [works, setWorks] = useState<WorkRecord[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedWorkState, setSelectedWorkState] = useState<WorkRecord | null>(null);

  useEffect(() => {
    Promise.all([api.getWorks(), api.getCategories()])
      .then(([worksResponse, categoriesResponse]) => {
        if (worksResponse.success) setWorks(worksResponse.data || []);
        if (categoriesResponse.success) setCategories(categoriesResponse.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  const filteredWorks = useMemo(() => {
    const sorted = works
      .slice()
      .sort((a, b) => Number(b.sort_order || 0) - Number(a.sort_order || 0));
    return filter === "all" ? sorted : sorted.filter((work) => String(work.category_id) === filter);
  }, [filter, works]);

  const pageCount = Math.max(1, Math.ceil(filteredWorks.length / PAGE_SIZE));
  const visibleWorks = filteredWorks.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
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
          <button
            type="button"
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            {isArabic ? "الكل" : "All"}
          </button>
          {categories.map((category) => (
            <button
              type="button"
              key={category.id}
              className={filter === String(category.id) ? "active" : ""}
              onClick={() => setFilter(String(category.id))}
            >
              {isArabic ? category.ar_name : category.en_name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="works-page-empty">
            {isArabic ? "جاري تحميل الأعمال..." : "Loading work..."}
          </div>
        ) : visibleWorks.length === 0 ? (
          <div className="works-page-empty">
            {isArabic ? "لا توجد أعمال في هذا التصنيف." : "No work in this category."}
          </div>
        ) : (
          <div className="work-grid works-page-grid">
            {visibleWorks.map((work) => (
              <button
                type="button"
                className="work-card work-card-button"
                key={work.id}
                onClick={() => openModal(work)}
              >
                <div className="work-visual work-visual--image">
                  <img
                    src={
                      work.image_url
                        ? getImageUrl(work.image_url)
                        : work.thumbnail_url || getInstagramThumbnailUrl(work.embed_code) || undefined
                    }
                    alt={isArabic ? work.ar_title : work.en_title}
                    loading="lazy"
                    decoding="async"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.style.display = "none";
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
        )}

        {pageCount > 1 && (
          <nav className="works-pagination" aria-label="Pagination">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              {isArabic ? "السابق" : "Previous"}
            </button>
            <span>
              {page} / {pageCount}
            </span>
            <button
              type="button"
              disabled={page === pageCount}
              onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
            >
              {isArabic ? "التالي" : "Next"}
            </button>
          </nav>
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
                  (selectedWork.image_url || getInstagramThumbnailUrl(selectedWork.embed_code)) && (
                    <img
                      src={
                        selectedWork.image_url
                          ? getImageUrl(selectedWork.image_url)
                          : selectedWork.thumbnail_url ||
                            getInstagramThumbnailUrl(selectedWork.embed_code) ||
                            undefined
                      }
                      alt=""
                      loading="lazy"
                      decoding="async"
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.style.display = "none";
                      }}
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
