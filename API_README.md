# RELO & MOFIX - Backend API Setup Guide

## 📋 نظرة عامة
هذا دليل إعداد Backend PHP الآمن لمشروع RELO & MOFIX. الـ Backend يوفر:
- نظام مصادقة آمن مع JWT
- إدارة الأعمال والصور
- حماية من الهجمات الشائعة
- Rate limiting
- تشفير كلمات المرور

## 🔒 ميزات الأمان

### المصادقة
- **تشفير كلمات المرور**: bcrypt مع cost factor 12
- **JWT Tokens**: للتأكد من الهوية في كل طلب
- **Rate Limiting**: 100 طلب في الساعة لكل IP
- **Session Security**: HTTPOnly, Secure, SameSite cookies

### حماية البيانات
- **PDO Prepared Statements**: منع SQL Injection
- **Input Validation**: تنظيف وتحقق من جميع المدخلات
- **File Upload Security**: التحقق من نوع وحجم الملفات
- **CORS Headers**: تحديد المصادر المسموح بها

### Security Headers
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security: max-age=31536000
- Content-Security-Policy

## 📁 هيكل الملفات

```
api/
├── config.php       # إعدادات الأمان وقاعدة البيانات
├── database.php     # اتصال قاعدة البيانات (PDO)
├── auth.php         # نظام المصادقة (JWT + bcrypt)
├── works.php        # إدارة الأعمال والصور
├── schema.sql       # هيكل قاعدة البيانات
└── .htaccess        # إعدادات Apache للحماية
```

## 🚀 خطوات الإعداد

### 1. إنشاء قاعدة البيانات

1. ادخل إلى phpMyAdmin أو MySQL
2. أنشئ قاعدة بيانات جديدة باسم `relo_mofix_db`
3. شغل ملف `api/schema.sql` لإنشاء الجداول

```bash
# أو عبر سطر الأوامر
mysql -u username -p < api/schema.sql
```

### 2. إعداد Cloudinary (موصى به)

Cloudinary يوفر تخزين سحابي للصور مع CDN وتحسين تلقائي.

#### إنشاء حساب Cloudinary:

1. سجل في [cloudinary.com](https://cloudinary.com/) (الخطة المجانية كافية)
2. من Dashboard، احصل على:
   - **Cloud Name**: اسم السحابة
   - **API Key**: مفتاح API
   - **API Secret**: سر API

#### إنشاء Upload Preset:

1. اذهب إلى Settings → Upload
2. أنشئ **Unsigned upload preset** باسم `relo_uploads`
3. فعّل:
   - Allowed formats: jpg, png, webp, gif
   - Max file size: 5MB
   - Auto-formatting: Yes
   - Auto-quality: Yes

#### إعداد config.php:

```php
// Cloudinary configuration
define('CLOUDINARY_CLOUD_NAME', 'your_cloud_name'); // من Dashboard
define('CLOUDINARY_API_KEY', 'your_api_key'); // من Dashboard
define('CLOUDINARY_API_SECRET', 'your_api_secret'); // من Dashboard
define('CLOUDINARY_UPLOAD_PRESET', 'relo_uploads'); // Preset الذي أنشأته
define('USE_CLOUDINARY', true); // true لاستخدام Cloudinary، false للتخزين المحلي
```

**⚠️ مهم**: إذا كنت تريد استخدام التخزين المحلي بدلاً من Cloudinary، اضبط `USE_CLOUDINARY` إلى `false`.

### 3. إعداد قاعدة البيانات

افتح `api/config.php` وعدل إعدادات قاعدة البيانات:

```php
// إعدادات قاعدة البيانات
define('DB_HOST', 'localhost');
define('DB_NAME', 'relo_mofix_db');
define('DB_USER', 'your_db_user');      // غيّر هذا
define('DB_PASS', 'your_secure_password'); // غيّر هذا

// JWT Secret (مهم جداً!)
define('JWT_SECRET', 'CHANGE_THIS_TO_A_VERY_LONG_RANDOM_STRING_AT_LEAST_32_CHARS');
```

**⚠️ مهم**: غيّر `JWT_SECRET` إلى سلسلة عشوائية طويلة جداً (32 حرف على الأقل).

### 4. إنشاء مستخدم Admin

#### الطريقة الأولى: عبر API

```bash
curl -X POST http://yourdomain.com/api/auth.php \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create_admin",
    "username": "admin",
    "password": "YourVeryStrongPassword123!"
  }'
```

#### الطريقة الثانية: عبر PHP مباشرة

أنشئ ملف `create_admin.php` مؤقتاً:

```php
<?php
require_once 'api/config.php';
require_once 'api/database.php';
require_once 'api/auth.php';

$auth = new Auth();
$result = $auth->createAdminUser('admin', 'YourVeryStrongPassword123!');
print_r($result);
?>
```

ثم احذف الملف بعد الاستخدام.

### 5. إنشاء مجلد uploads (اختياري - فقط إذا استخدمت التخزين المحلي)

إذا كنت تستخدم `USE_CLOUDINARY = false`، أنشئ مجلد التخزين المحلي:

```bash
mkdir uploads
chmod 755 uploads
```

### 6. نشر على cPanel

1. ارفع جميع الملفات إلى `public_html`
2. تأكد أن مجلد `api` موجود في `public_html`
3. إذا استخدمت التخزين المحلي، تأكد أن مجلد `uploads` موجود وله صلاحيات 755
4. ارفع ملفات React المبنية (`dist/`) إلى `public_html`

## 📸 Cloudinary vs التخزين المحلي

### Cloudinary (موصى به)
- ✅ CDN مدموج - تحميل سريع عالمياً
- ✅ تحسين تلقائي للصور (ضغط، تغيير حجم)
- ✅ تخزين غير محدود (25GB مجاني)
- ✅ أمان أفضل - لا ملفات قابلة للتنفيذ
- ✅ نسخ احتياطي تلقائي
- ✅ لا يحتاج مساحة على السيرفر

### التخزين المحلي
- ✅ مجاني تماماً
- ✅ تحكم كامل
- ❌ يحتاج مساحة على السيرفر
- ❌ لا يوجد CDN
- ❌ مخاطر أمنية
- ❌ يحتاج إدارة يدوية

## 🔧 API Endpoints

### المصادقة

#### POST `/api/auth.php`
تسجيل الدخول

```json
{
  "action": "login",
  "username": "admin",
  "password": "your_password"
}
```

**الرد**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin"
  }
}
```

### الأعمال

#### GET `/api/works.php`
جلب جميع الأعمال
- **Header**: `Authorization: Bearer {token}`

#### GET `/api/works.php?id=1`
جلب عمل محدد
- **Header**: `Authorization: Bearer {token}`

#### POST `/api/works.php`
إنشاء عمل جديد
- **Header**: `Authorization: Bearer {token}`
- **Body**: FormData مع الحقول:
  - `ar_title`: العنوان بالعربية
  - `en_title`: العنوان بالإنجليزية
  - `ar_type`: النوع بالعربية
  - `en_type`: النوع بالإنجليزية
  - `tag`: الوسم
  - `class_name`: نوع الكرت (work-orange, work-paper, work-black, work-photo)
  - `image`: ملف الصورة (اختياري)

#### PUT `/api/works.php?id=1`
تحديث عمل
- **Header**: `Authorization: Bearer {token}`
- **Body**: نفس POST

#### DELETE `/api/works.php?id=1`
حذف عمل
- **Header**: `Authorization: Bearer {token}`

## 🛡️ نصائح أمان إضافية

### 1. تفعيل HTTPS
```apache
# في .htaccess
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### 2. حماية مجلد uploads
```apache
# في uploads/.htaccess
Options -Indexes
<FilesMatch "\.(php|phtml|php3|php4|php5|phps|html|htm|shtml)$">
    Order allow,deny
    Deny from all
</FilesMatch>
```

### 3. تعطيل عرض الأخطاء في Production
في `config.php`:
```php
define('ENVIRONMENT', 'production');
```

### 4. نسخ احتياطي دوري
```bash
# نسخ قاعدة البيانات
mysqldump -u username -p relo_mofix_db > backup.sql

# نسخ الملفات المرفوعة
tar -czf uploads-backup.tar.gz uploads/
```

## 📊 مراقبة الأداء

### Logs
توجد logs في `logs/php_errors.log`

### Rate Limiting
- 100 طلب في الساعة لكل IP
- يمكن تعديلها في `config.php`:
```php
define('RATE_LIMIT_REQUESTS', 100);
define('RATE_LIMIT_WINDOW', 3600); // 1 hour
```

## 🐛 استكشاف الأخطاء

### خطأ في الاتصال بقاعدة البيانات
- تأكد من إعدادات `config.php`
- تأكد أن قاعدة البيانات موجودة
- تأكد من صلاحيات المستخدم

### خطأ 401 Unauthorized
- تأكد من إرسال Header `Authorization`
- تأكد أن Token صالح ولم تنتهي صلاحيته

### خطأ في رفع الصور
- تأكد أن مجلد `uploads` موجود وله صلاحيات 755
- تأكد أن حجم الملف أقل من 5MB
- تأكد أن نوع الملف مسموح (jpg, png, webp, gif)

## 📞 الدعم

للمساعدة أو الاستفسارات، راجع:
- وثائق PHP: https://www.php.net/docs.php
- وثائق PDO: https://www.php.net/manual/en/book.pdo.php
- وثائق JWT: https://jwt.io/

---

**⚠️ تنبيه هام**: هذا Backend آمن نسبياً لكنه ليس بديلاً عن نظام أمان احترافي. للمشاريع الحساسة جداً، استخدم framework مثل Laravel أو استخدم حلول SaaS مثل Firebase Auth أو Auth0.
