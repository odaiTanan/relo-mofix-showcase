import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FolderKanban,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Images,
  LayoutDashboard,
  LogOut,
  Pencil,
  Plus,
  Quote,
  Save,
  Tags,
  Trash2,
  X,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { AboutContent, api, Category, ClientLogo, Testimonial } from "../lib/api";

interface WorkItem {
  id: string;
  ar_title: string;
  en_title: string;
  tag: string;
  category_id: string | null;
  category_ar_name?: string;
  image_url: string | null;
}

type View = "works" | "categories" | "clients" | "testimonials" | "about";

const emptyCategory = { slug: "", ar_name: "", en_name: "" };
const emptyWork = { ar_title: "", en_title: "", tag: "", category_id: "" };
const emptyTestimonial = { ar_quote: "", en_quote: "", ar_name: "", en_name: "", ar_role: "", en_role: "" };
const emptyAbout: AboutContent = { ar_title: "من نحن", en_title: "About us", ar_text: "", en_text: "" };
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export default function Admin() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<View>("works");
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [clients, setClients] = useState<ClientLogo[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [about, setAbout] = useState<AboutContent>(emptyAbout);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [workFormOpen, setWorkFormOpen] = useState(false);
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState(emptyCategory);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [workForm, setWorkForm] = useState(emptyWork);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [bulkFormOpen, setBulkFormOpen] = useState(false);
  const [bulkCategory, setBulkCategory] = useState("");
  const [bulkFiles, setBulkFiles] = useState<File[]>([]);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [testimonialFormOpen, setTestimonialFormOpen] = useState(false);
  const [testimonialForm, setTestimonialForm] = useState(emptyTestimonial);
  const [aboutForm, setAboutForm] = useState<AboutContent>(emptyAbout);

  const loadData = async () => {
    setLoading(true);
    try {
      const [worksResponse, categoriesResponse, clientsResponse, testimonialsResponse, aboutResponse] = await Promise.all([
        api.getWorks(),
        api.getCategories(),
        api.getClients(),
        api.getTestimonials(),
        api.getAbout(),
      ]);
      if (worksResponse.success) setWorks(worksResponse.data || []);
      if (categoriesResponse.success) setCategories(categoriesResponse.data || []);
      if (clientsResponse.success) setClients(clientsResponse.data || []);
      if (testimonialsResponse.success) setTestimonials(testimonialsResponse.data || []);
      if (aboutResponse.success && aboutResponse.data) { setAbout(aboutResponse.data); setAboutForm(aboutResponse.data); }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "تعذر تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleClientUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_SIZE) { setMessage("حجم الشعار يجب ألا يتجاوز 5MB"); event.target.value = ""; return; }
    try {
      const response = await api.createClient(file);
      if (!response.success) throw new Error(response.error || "تعذر حفظ الشعار");
      await loadData();
      event.target.value = "";
      setMessage("تمت إضافة شعار العميل");
    } catch (error) { setMessage(error instanceof Error ? error.message : "تعذر حفظ الشعار"); }
  };

  const moveClient = async (client: ClientLogo, direction: "up" | "down") => {
    const response = await api.moveClient(client.id, direction);
    if (response.success) await loadData();
    else setMessage(response.error || "تعذر تغيير الترتيب");
  };

  const deleteClient = async (id: string) => {
    if (!window.confirm("هل تريد حذف شعار هذا العميل؟")) return;
    const response = await api.deleteClient(id);
    if (response.success) await loadData();
    else setMessage(response.error || "تعذر حذف الشعار");
  };

  const handleSaveTestimonial = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await api.createTestimonial(testimonialForm);
      if (!response.success) throw new Error(response.error || "تعذر حفظ الشهادة");
      await loadData();
      setTestimonialForm(emptyTestimonial);
      setTestimonialFormOpen(false);
      setMessage("تمت إضافة شهادة العميل");
    } catch (error) { setMessage(error instanceof Error ? error.message : "تعذر حفظ الشهادة"); }
  };

  const moveTestimonial = async (testimonial: Testimonial, direction: "up" | "down") => {
    const response = await api.moveTestimonial(testimonial.id, direction);
    if (response.success) await loadData();
    else setMessage(response.error || "تعذر تغيير ترتيب الشهادة");
  };

  const deleteTestimonial = async (id: string) => {
    if (!window.confirm("هل تريد حذف شهادة العميل؟")) return;
    const response = await api.deleteTestimonial(id);
    if (response.success) await loadData();
    else setMessage(response.error || "تعذر حذف الشهادة");
  };

  const handleSaveAbout = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await api.saveAbout(aboutForm);
      if (!response.success) throw new Error(response.error || "تعذر حفظ قسم من نحن");
      setAbout(aboutForm);
      setMessage("تم حفظ قسم من نحن");
    } catch (error) { setMessage(error instanceof Error ? error.message : "تعذر حفظ قسم من نحن"); }
  };

  const handleAboutImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_SIZE) { setMessage("حجم الصورة يجب ألا يتجاوز 5MB"); event.target.value = ""; return; }
    try {
      const response = await api.uploadAboutImage(file);
      if (!response.success) throw new Error(response.error || "تعذر رفع صورة قسم من نحن");
      const nextAbout = { ...aboutForm, image_url: response.data?.image_url || null };
      setAbout(nextAbout);
      setAboutForm(nextAbout);
      event.target.value = "";
      setMessage("تم تحديث صورة قسم من نحن");
    } catch (error) { setMessage(error instanceof Error ? error.message : "تعذر رفع الصورة"); }
  };

  const visibleWorks = useMemo(
    () =>
      activeCategory === "all"
        ? works
        : works.filter((work) => String(work.category_id) === activeCategory),
    [activeCategory, works],
  );

  const resetWorkForm = () => {
    setWorkForm({ ...emptyWork, category_id: categories[0]?.id || "" });
    setImageFile(null);
    setImagePreview("");
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_SIZE) {
      setMessage("حجم الصورة يجب ألا يتجاوز 5MB");
      event.target.value = "";
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const handleCreateWork = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await api.createWork(workForm, imageFile || undefined);
      if (!response.success) throw new Error(response.error || "تعذر حفظ العمل");
      await loadData();
      resetWorkForm();
      setWorkFormOpen(false);
      setMessage("تمت إضافة العمل بنجاح");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "تعذر حفظ العمل");
    }
  };

  const handleBulkUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (bulkUploading || !bulkFiles.length || !bulkCategory) return;
    setBulkUploading(true);
    setBulkProgress(0);
    try {
      const response = await api.createWorksBulk(bulkCategory, bulkFiles, (completed, total) => {
        setBulkProgress(Math.round((completed / total) * 100));
      });
      if (!response.success) throw new Error(response.error || "تعذر رفع الصور");
      await loadData();
      setBulkFiles([]);
      setBulkProgress(100);
      setBulkFormOpen(false);
      setMessage(`تمت إضافة ${response.count || bulkFiles.length} أعمال بنجاح`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "تعذر رفع الصور");
    } finally {
      setBulkUploading(false);
    }
  };

  const handleSaveCategory = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = editingCategory
        ? await api.updateCategory(editingCategory, categoryForm)
        : await api.createCategory(categoryForm);
      if (!response.success) throw new Error(response.error || "تعذر حفظ التصنيف");
      await loadData();
      setCategoryForm(emptyCategory);
      setEditingCategory(null);
      setCategoryFormOpen(false);
      setMessage("تم حفظ التصنيف بنجاح");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "تعذر حفظ التصنيف");
    }
  };

  const deleteCategory = async (id: string) => {
    if (!window.confirm("هل تريد حذف هذا التصنيف؟")) return;
    const response = await api.deleteCategory(id);
    if (response.success) await loadData();
    else setMessage(response.error || "تعذر حذف التصنيف");
  };

  const deleteWork = async (id: string) => {
    if (!window.confirm("هل تريد حذف هذا العمل؟")) return;
    const response = await api.deleteWork(id);
    if (response.success) await loadData();
    else setMessage(response.error || "تعذر حذف العمل");
  };

  const logoutAndLeave = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span>RELO</span>
          <b>&</b>
          <span>MOFIX</span>
          <small>STUDIO CONTROL</small>
        </div>
        <nav className="admin-nav" aria-label="التنقل في لوحة التحكم">
          <button className={view === "works" ? "active" : ""} onClick={() => setView("works")}>
            <LayoutDashboard size={18} /> الأعمال
          </button>
          <button
            className={view === "categories" ? "active" : ""}
            onClick={() => setView("categories")}
          >
            <Tags size={18} /> التصنيفات
          </button>
          <button className={view === "clients" ? "active" : ""} onClick={() => setView("clients")}>
            <ImageIcon size={18} /> عملاؤنا
          </button>
          <button className={view === "testimonials" ? "active" : ""} onClick={() => setView("testimonials")}>
            <Quote size={18} /> آراء العملاء
          </button>
          <button className={view === "about" ? "active" : ""} onClick={() => setView("about")}>
            <LayoutDashboard size={18} /> من نحن
          </button>
        </nav>
        <div className="admin-sidebar-footer">
          <span>المحتوى المنشور</span>
          <strong>
            {works.length} أعمال / {clients.length} عملاء / {testimonials.length} آراء
          </strong>
          <button onClick={logoutAndLeave}>
            <LogOut size={17} /> تسجيل الخروج
          </button>
        </div>
      </aside>

      <main className="admin-content">
        <header className="admin-topbar">
          <div>
            <span className="admin-kicker">RELO / ADMIN</span>
            <h1>{view === "works" ? "الأعمال" : view === "categories" ? "التصنيفات" : view === "clients" ? "عملاؤنا" : view === "testimonials" ? "آراء العملاء" : "من نحن"}</h1>
          </div>
          {view === "works" ? (
            <div className="admin-topbar-actions">
              <button className="admin-secondary-button" onClick={() => { setBulkCategory(categories[0]?.id || ""); setBulkFiles([]); setBulkFormOpen(true); }}><Images size={18} /> رفع جماعي</button>
              <button
                className="admin-primary-button"
                onClick={() => {
                  resetWorkForm();
                  setWorkFormOpen(true);
                }}
              >
                <Plus size={18} /> عمل جديد
              </button>
            </div>
          ) : view === "categories" ? (
            <button
              className="admin-primary-button"
              onClick={() => {
                setCategoryForm(emptyCategory);
                setEditingCategory(null);
                setCategoryFormOpen(true);
              }}
            >
              <Plus size={18} /> تصنيف جديد
            </button>
          ) : null}
        </header>

        {message && <div className="admin-notice">{message}</div>}

        {view === "works" && (
          <>
            <div className="admin-filter-bar">
              <button
                className={activeCategory === "all" ? "active" : ""}
                onClick={() => setActiveCategory("all")}
              >
                كل الأعمال <span>{works.length}</span>
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={activeCategory === String(category.id) ? "active" : ""}
                  onClick={() => setActiveCategory(String(category.id))}
                >
                  {category.ar_name} <span>{category.works_count || 0}</span>
                </button>
              ))}
            </div>
            {workFormOpen && (
              <section className="admin-form-panel">
                <div className="admin-panel-heading">
                  <div>
                    <span className="admin-kicker">NEW PROJECT</span>
                    <h2>إضافة عمل للكاروسيل</h2>
                  </div>
                  <button className="admin-icon-button" onClick={() => setWorkFormOpen(false)}>
                    <X size={18} />
                  </button>
                </div>
                <form onSubmit={handleCreateWork} className="admin-form-grid">
                  <label>
                    العنوان بالعربية
                    <input
                      required
                      value={workForm.ar_title}
                      onChange={(e) => setWorkForm({ ...workForm, ar_title: e.target.value })}
                    />
                  </label>
                  <label>
                    العنوان بالإنجليزية
                    <input
                      required
                      value={workForm.en_title}
                      onChange={(e) => setWorkForm({ ...workForm, en_title: e.target.value })}
                    />
                  </label>
                  <label>
                    التصنيف
                    <select
                      required
                      value={workForm.category_id}
                      onChange={(e) => setWorkForm({ ...workForm, category_id: e.target.value })}
                    >
                      <option value="">اختر التصنيف</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.ar_name} / {category.en_name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    الوسم
                    <input
                      required
                      value={workForm.tag}
                      onChange={(e) => setWorkForm({ ...workForm, tag: e.target.value })}
                      placeholder="BRANDING"
                    />
                  </label>
                  <label className="admin-upload-label">
                    صورة المشروع <span>صورة كبيرة مناسبة للكاروسيل، حتى 5MB</span>
                    <input
                      required={!imagePreview}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageUpload}
                    />
                  </label>
                  {imagePreview && (
                    <img
                      className="admin-image-preview"
                      src={imagePreview}
                      alt="معاينة صورة العمل"
                    />
                  )}
                  <button className="admin-primary-button admin-form-submit" type="submit">
                    <Save size={18} /> نشر العمل
                  </button>
                </form>
              </section>
            )}
            {bulkFormOpen && (
              <section className="admin-form-panel admin-bulk-panel">
                <div className="admin-panel-heading">
                  <div><span className="admin-kicker">BATCH UPLOAD</span><h2>رفع صور متعددة</h2></div>
                  <button className="admin-icon-button" onClick={() => setBulkFormOpen(false)}><X size={18} /></button>
                </div>
                <form onSubmit={handleBulkUpload} className="admin-bulk-form">
                  <label>التصنيف<select required value={bulkCategory} onChange={(event) => setBulkCategory(event.target.value)}><option value="">اختر التصنيف</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.ar_name} / {category.en_name}</option>)}</select></label>
                  <label className="admin-bulk-file-label">الصور <span>يمكنك اختيار عدة صور، وسيتم إنشاء عمل لكل صورة، بحد أقصى 5MB للصورة</span><input required={!bulkFiles.length} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => { const files = Array.from(event.target.files || []); const invalid = files.find((file) => file.size > MAX_IMAGE_SIZE); if (invalid) { setMessage(`الصورة ${invalid.name} تتجاوز 5MB`); setBulkFiles([]); event.target.value = ""; return; } setBulkFiles(files); }} /></label>
                  <div className="admin-bulk-summary">{bulkFiles.length ? `تم اختيار ${bulkFiles.length} صور` : "لم يتم اختيار صور بعد"}</div>
                  {bulkUploading && <div className="admin-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={bulkProgress}><div className="admin-progress-track"><span style={{ width: `${bulkProgress}%` }} /></div><div className="admin-progress-label"><span>تم رفع {Math.round((bulkProgress / 100) * bulkFiles.length)} من {bulkFiles.length} صور</span><strong>{bulkProgress}%</strong></div></div>}
                  <button className="admin-primary-button" type="submit" disabled={bulkUploading}>{bulkUploading ? <><span className="admin-spinner" /> جاري رفع الصور...</> : <><Images size={18} /> رفع وإضافة الأعمال</>}</button>
                </form>
              </section>
            )}
            <section className="admin-table-panel">
              <div className="admin-panel-heading">
                <div>
                  <span className="admin-kicker">WORK LIBRARY</span>
                  <h2>مكتبة الأعمال</h2>
                </div>
                <span className="admin-count">{visibleWorks.length} نتيجة</span>
              </div>
              {loading ? (
                <div className="admin-empty">جاري تحميل المحتوى...</div>
              ) : visibleWorks.length === 0 ? (
                <div className="admin-empty">لا توجد أعمال في هذا التصنيف.</div>
              ) : (
                <div className="admin-work-list">
                  {visibleWorks.map((work) => (
                    <article className="admin-work-item" key={work.id}>
                      <div className="admin-work-image">
                        {work.image_url ? (
                          <img src={work.image_url} alt={work.ar_title} />
                        ) : (
                          <ImageIcon size={22} />
                        )}
                      </div>
                      <div className="admin-work-copy">
                        <span>{work.category_ar_name || "بدون تصنيف"}</span>
                        <h3>{work.ar_title}</h3>
                        <p>
                          {work.en_title} · {work.tag}
                        </p>
                      </div>
                      <button
                        className="admin-delete-button"
                        onClick={() => deleteWork(work.id)}
                        aria-label={`حذف ${work.ar_title}`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {view === "categories" && (
          <section className="admin-table-panel">
            <div className="admin-panel-heading">
              <div>
                <span className="admin-kicker">CONTENT TAXONOMY</span>
                <h2>تصنيفات الموقع</h2>
              </div>
              <span className="admin-count">{categories.length} تصنيفات</span>
            </div>
            {categoryFormOpen && (
              <form onSubmit={handleSaveCategory} className="admin-category-form">
                <label>
                  الاسم بالعربية
                  <input
                    required
                    value={categoryForm.ar_name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, ar_name: e.target.value })}
                  />
                </label>
                <label>
                  الاسم بالإنجليزية
                  <input
                    required
                    value={categoryForm.en_name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, en_name: e.target.value })}
                  />
                </label>
                <label>
                  المعرف التقني
                  <input
                    required
                    pattern="[a-z0-9-]+"
                    value={categoryForm.slug}
                    onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                    placeholder="brand-identity"
                  />
                </label>
                <button className="admin-primary-button" type="submit">
                  <Save size={18} /> {editingCategory ? "حفظ التعديل" : "إضافة التصنيف"}
                </button>
              </form>
            )}
            <div className="admin-category-list">
              {categories.map((category) => (
                <article className="admin-category-item" key={category.id}>
                  <div className="admin-category-mark">
                    <FolderKanban size={20} />
                  </div>
                  <div>
                    <h3>{category.ar_name}</h3>
                    <p>
                      {category.en_name} · /{category.slug}
                    </p>
                  </div>
                  <span className="admin-category-count">{category.works_count || 0} أعمال</span>
                  <button
                    className="admin-icon-button"
                    onClick={() => {
                      setCategoryForm({
                        slug: category.slug,
                        ar_name: category.ar_name,
                        en_name: category.en_name,
                      });
                      setEditingCategory(category.id);
                      setCategoryFormOpen(true);
                    }}
                  >
                    <Pencil size={17} />
                  </button>
                  <button
                    className="admin-delete-button"
                    onClick={() => deleteCategory(category.id)}
                  >
                    <Trash2 size={17} />
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}

        {view === "clients" && (
          <section className="admin-table-panel">
            <div className="admin-panel-heading">
              <div><span className="admin-kicker">CLIENT LOGOS</span><h2>شعارات عملائنا</h2></div>
              <label className="admin-primary-button admin-file-button"><Plus size={18} /> إضافة شعار<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleClientUpload} /></label>
            </div>
            {clients.length === 0 ? <div className="admin-empty">لم تتم إضافة شعارات بعد.</div> : (
              <div className="admin-client-list">
                {clients.map((client, index) => (
                  <article className="admin-client-item" key={client.id}>
                    <img src={client.logo_url} alt="" />
                    <span>الشعار {index + 1}</span>
                    <div className="admin-order-actions">
                      <button className="admin-icon-button" disabled={index === 0} onClick={() => moveClient(client, "up")} aria-label="تحريك لأعلى"><ChevronUp size={17} /></button>
                      <button className="admin-icon-button" disabled={index === clients.length - 1} onClick={() => moveClient(client, "down")} aria-label="تحريك لأسفل"><ChevronDown size={17} /></button>
                    </div>
                    <button className="admin-delete-button" onClick={() => deleteClient(client.id)} aria-label="حذف الشعار"><Trash2 size={18} /></button>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {view === "testimonials" && (
          <section className="admin-table-panel">
            <div className="admin-panel-heading">
              <div><span className="admin-kicker">TESTIMONIALS</span><h2>آراء العملاء</h2></div>
              <button className="admin-primary-button" onClick={() => { setTestimonialForm(emptyTestimonial); setTestimonialFormOpen(true); }}><Plus size={18} /> شهادة جديدة</button>
            </div>
            {testimonialFormOpen && (
              <form onSubmit={handleSaveTestimonial} className="admin-testimonial-form">
                <label>الشهادة بالعربية<textarea required value={testimonialForm.ar_quote} onChange={(event) => setTestimonialForm({ ...testimonialForm, ar_quote: event.target.value })} /></label>
                <label>الشهادة بالإنجليزية<textarea required value={testimonialForm.en_quote} onChange={(event) => setTestimonialForm({ ...testimonialForm, en_quote: event.target.value })} /></label>
                <label>اسم العميل بالعربية<input required value={testimonialForm.ar_name} onChange={(event) => setTestimonialForm({ ...testimonialForm, ar_name: event.target.value })} /></label>
                <label>اسم العميل بالإنجليزية<input required value={testimonialForm.en_name} onChange={(event) => setTestimonialForm({ ...testimonialForm, en_name: event.target.value })} /></label>
                <label>الصفة بالعربية<input required value={testimonialForm.ar_role} onChange={(event) => setTestimonialForm({ ...testimonialForm, ar_role: event.target.value })} /></label>
                <label>الصفة بالإنجليزية<input required value={testimonialForm.en_role} onChange={(event) => setTestimonialForm({ ...testimonialForm, en_role: event.target.value })} /></label>
                <button className="admin-primary-button" type="submit"><Save size={18} /> حفظ الشهادة</button>
                <button className="admin-secondary-button" type="button" onClick={() => setTestimonialFormOpen(false)}><X size={18} /> إلغاء</button>
              </form>
            )}
            {testimonials.length === 0 ? <div className="admin-empty">لم تتم إضافة شهادات بعد.</div> : (
              <div className="admin-testimonial-list">
                {testimonials.map((testimonial, index) => (
                  <article className="admin-testimonial-item" key={testimonial.id}>
                    <Quote size={24} />
                    <div><p>{testimonial.ar_quote}</p><strong>{testimonial.ar_name}</strong><span>{testimonial.ar_role}</span></div>
                    <div className="admin-order-actions">
                      <button className="admin-icon-button" disabled={index === 0} onClick={() => moveTestimonial(testimonial, "up")} aria-label="تحريك لأعلى"><ChevronUp size={17} /></button>
                      <button className="admin-icon-button" disabled={index === testimonials.length - 1} onClick={() => moveTestimonial(testimonial, "down")} aria-label="تحريك لأسفل"><ChevronDown size={17} /></button>
                    </div>
                    <button className="admin-delete-button" onClick={() => deleteTestimonial(testimonial.id)} aria-label="حذف الشهادة"><Trash2 size={18} /></button>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {view === "about" && (
          <section className="admin-table-panel">
            <div className="admin-panel-heading">
              <div><span className="admin-kicker">ABOUT THE STUDIO</span><h2>محتوى قسم من نحن</h2></div>
            </div>
            <form onSubmit={handleSaveAbout} className="admin-about-form">
              <label>العنوان بالعربية<input required value={aboutForm.ar_title} onChange={(event) => setAboutForm({ ...aboutForm, ar_title: event.target.value })} /></label>
              <label>العنوان بالإنجليزية<input required value={aboutForm.en_title} onChange={(event) => setAboutForm({ ...aboutForm, en_title: event.target.value })} /></label>
              <label>النص بالعربية<textarea required value={aboutForm.ar_text} onChange={(event) => setAboutForm({ ...aboutForm, ar_text: event.target.value })} /></label>
              <label>النص بالإنجليزية<textarea required value={aboutForm.en_text} onChange={(event) => setAboutForm({ ...aboutForm, en_text: event.target.value })} /></label>
              <button className="admin-primary-button" type="submit"><Save size={18} /> حفظ التعديلات</button>
              <label className="admin-about-image-upload">صورة قسم من نحن<span>صورة مناسبة للعرض على اللابتوب، حتى 5MB</span><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleAboutImageUpload} /></label>
              {aboutForm.image_url && <img className="admin-about-image-preview" src={aboutForm.image_url} alt="معاينة صورة قسم من نحن" />}
            </form>
          </section>
        )}
      </main>
    </div>
  );
}
