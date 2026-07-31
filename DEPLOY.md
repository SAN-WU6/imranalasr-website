# النشر على imranalasr.sa — استضافة cPanel

## الحالة المفحوصة فعليًا (٣١ يوليو ٢٠٢٦)

| البند | النتيجة |
|---|---|
| `imranalasr.sa` و`ftp.imranalasr.sa` | كلاهما يشير إلى `208.91.199.129` |
| المنفذ 21 (FTP) | **مفتوح** |
| المنفذ 22 (SSH/SFTP) | **مفتوح** |
| المنفذ 2083 (cPanel) | **مفتوح**، صفحة دخول cPanel تعمل |
| الموقع الحالي | Apache يرد `403 Forbidden` (المجلد فارغ) |

**لا حاجة لتغيير الـDNS.** النطاق يشير للاستضافة أصلًا، فالنشر لا يمسّ إعدادات النطاق إطلاقًا.

---

## الحزمة الجاهزة

```
site/deploy/imran-site.tar.gz     43 ميجابايت مضغوطة · 103 مفكوكة
```

بُنيت بـ`NEXT_PUBLIC_SITE_URL=https://imranalasr.sa`، وتحتوي على:

| المحتوى | الغرض |
|---|---|
| `server.js` · `.next/` · `node_modules/` | مخرجات `output: "standalone"` — مكتفية ذاتيًا |
| `public/` | الصور والخطوط وملفات العلامة |
| `scripts/` | `db-init` و`create-admin` (تُشغَّل مرة واحدة) |
| `data/` | مجلد فارغ لملف SQLite |
| `.htaccess` ×6 | تمنع Apache من تسليم قاعدة البيانات والمصادر |

**مفحوصة قبل التغليف:** الأنواع سليمة · 19 اختبارًا ناجحًا · البناء تمّ · وشُغِّلت الحزمة فعليًا فردّت `/ar` بـ200 و`/` بـ307 و`/admin` بـ307 و`sitemap.xml` بالنطاق الصحيح.

**تنبيه تقني مهم عولج:** مخرجات `standalone` تحزم نسخة `sharp` الخاصة بجهاز البناء — أي ثنائيات **macOS/ARM**. لو رُفعت كما هي لفشل كل طلب `/_next/image` على الخادم و**تعطّلت كل صور الموقع**. استُبدلت بثنائيات **linux-x64** (glibc وmusl معًا)، وتُحقّق من ذلك بـ:

```bash
tar tzf site/deploy/imran-site.tar.gz | grep -c darwin   # يجب أن يكون 0
```

---

## الخطوة ١ — الرفع

```bash
cd site && ./deploy/upload-ftp.sh
```

يسأل عن كلمة المرور ويقرأها دون إظهارها، ولا يكتبها في أي ملف ولا في سجل الأوامر. يجرّب **FTPS** أولًا، ولا ينزل إلى FTP العادي إلا بموافقتك — لأن FTP العادي يرسل كلمة المرور **بنص واضح** عبر الشبكة.

يرفع **ملفًا واحدًا** لا آلاف الملفات: FTP يفتح اتصال بيانات منفصلًا لكل ملف، فرفع `node_modules` مفكوكًا يستغرق ساعات، بينما الأرشيف دقائق.

بما أن المنفذ 22 مفتوح، فـSFTP أسرع وأكثر أمانًا إن توفّر لك مستخدم SSH:

```bash
scp site/deploy/imran-site.tar.gz <cpanel-user>@imranalasr.sa:~/public_html/imran-site/
```

يرفع ثلاثة ملفات: الأرشيف، وبصمة `sha256` بجانبه، وسكربت الإنهاء.

## الخطوة ٢ — الباقي كله بأمر واحد على الخادم

```bash
ssh <cpanel-user>@imranalasr.sa
cd ~/public_html/imran-site && bash finish-on-server.sh
```

يقوم بثمانِ خطوات ويقول لك بالضبط ما نجح وما فشل:

1. يتحقق أن الأرشيف وصل **بصمة ببصمة** (لا مجرد «موجود») — ويرفض المتابعة إن اختلفت بايت واحد.
2. يفكّ الضغط، **ويحتفظ بالإصدار السابق** في `~/imran-site.previous.<تاريخ>` للتراجع، ولا يمسّ `data/` أبدًا فلا تضيع أي طلبات.
3. يفحص إصدار Node ويقرّر هل SQLite صالح، ويقترح البديل إن لم يكن.
4. **يفحص ثنائيات `sharp`** — الفخ الصامت الذي يجعل كل الصفحات ترد 200 بينما كل الصور معطّلة.
5. لا يشغّل `npm install` إلا إن لزم فعلًا.
6. ينشئ قاعدة البيانات، ثم حساب المدير (يسأل عن البريد وكلمة المرور ويقرأها دون إظهارها).
7. يعيد تشغيل التطبيق عبر `tmp/restart.txt` (آلية Passenger القياسية)، ثم **ينتظر أول استجابة فعلية** بدل انتظار أعمى.
8. يختبر الموقع الحيّ: `/` و`/ar` و`/en` و`/ar/projects` و`/admin` و`robots.txt` و**مسار الصور**، ويتأكد أن قاعدة البيانات غير قابلة للتنزيل عبر HTTP.

عند الفشل يطبع سبب كل إخفاق وأمر الإصلاح وأمر التراجع الكامل.

**إن لم تكن أنشأت تطبيق Node.js بعد**، سيقول لك ذلك ويطبع الحقول الثلاثة المطلوبة؛ أنشئه ثم أعد تشغيل الأمر نفسه. والسكربت آمن للتشغيل أكثر من مرة.

لا SSH في حسابك؟ **cPanel ← Terminal** يشغّل الأمر نفسه.

## الخطوة ٣ — Setup Node.js App

cPanel ← **Setup Node.js App** ← **Create Application**:

| الحقل | القيمة |
|---|---|
| Node.js version | **الأعلى المتاح** — ويجب أن يكون **22.5 أو أحدث** (انظر التحذير أدناه) |
| Application mode | `Production` |
| Application root | `public_html/imran-site` |
| Application URL | `imranalasr.sa` (اتركه على جذر النطاق) |
| Application startup file | `server.js` |

### متغيرات البيئة

أضفها في الأداة نفسها (**Add Variable**) — لا تضعها في ملف داخل مجلد التطبيق:

| المتغير | القيمة |
|---|---|
| `NODE_ENV` | `production` |
| `NEXT_PUBLIC_SITE_URL` | `https://imranalasr.sa` |
| `AUTH_SECRET` | ولّده أنت ولا تشاركه: `openssl rand -base64 48` |
| `SQLITE_PATH` | `./data/imran.db` |
| `MAIL_TO` | `requests@imranalasr.sa` |
| `RESEND_API_KEY` | اختياري — بدونه تُحفظ الطلبات وتظهر في لوحة الإدارة لكن دون إشعار بريدي |

### ⚠ إصدار Node وقاعدة البيانات

الموقع يستخدم `node:sqlite` المدمج، وهو **يحتاج Node ≥ 22.5**.

- إن كان أعلى إصدار في خطتك **أقل من 22.5** ← فلن يعمل SQLite. الحل: `DB_DRIVER=supabase` مع `SUPABASE_URL` و`SUPABASE_SERVICE_ROLE_KEY`، بعد تشغيل [`supabase/schema.sql`](supabase/schema.sql).
- إن كان الإصدار بين **22.5 و22.12** فقد يلزم `NODE_OPTIONS=--experimental-sqlite`. لا تضفه إلا إذا ظهر الخطأ فعلًا.

عُدّلت الشيفرة بحيث لا تُحمّل `node:sqlite` إلا عند أول استخدام حقيقي. قبل هذا التعديل كان الاستيراد يقع عند الإقلاع، فيسقط الخادم كله على Node قديم **حتى مع `DB_DRIVER=supabase`** — أي أن مخرج الطوارئ نفسه كان معطّلًا على الخوادم التي تحتاجه. الآن يقلع الموقع في كل الحالات، ويفشل SQLite وحده برسالة واضحة.

## الخطوة ٤ — npm install

**غالبًا لا تحتاجه.** حزمة `standalone` تحمل `node_modules` كاملة وجاهزة.

وزر **Run NPM Install** في cPanel **قد يضرّ**: فهو ينشئ بيئة افتراضية ويستبدل `node_modules` برابط رمزي إليها، مما قد يمحو الوحدات المرفقة — وأخطرها ثنائيات `sharp` الخاصة بلينكس التي جُهِّزت بعناية.

شغّله فقط إن اشتكى التطبيق من وحدة ناقصة، وبعدها تحقّق فورًا:

```bash
ls ~/public_html/imran-site/node_modules/@img/    # يجب أن تبقى sharp-linux-x64
```

## الخطوة ٥ — Restart ثم تهيئة قاعدة البيانات

اضغط **Restart** في الأداة، ثم:

```bash
cd ~/public_html/imran-site
source ~/nodevenv/public_html/imran-site/<version>/bin/activate   # الأمر يظهر أعلى صفحة الأداة
node scripts/db-init.mjs
node scripts/create-admin.mjs <email> '<password>'
```

## الخطوة ٦ — التحقق

```bash
curl -I https://imranalasr.sa/ar          # 200
curl -I https://imranalasr.sa/            # 307 → /ar
curl -I https://imranalasr.sa/admin       # 307 → /admin/login
curl -s https://imranalasr.sa/sitemap.xml | head -5
curl -sI "https://imranalasr.sa/_next/image?url=%2Fprojects%2Fbisha-project%2F12.webp&w=828&q=75"
```

آخر أمر هو الأهم: **إن ردّ بغير 200 فثنائيات `sharp` هي السبب** ولن تظهر أي صورة على الموقع.

ثم يدويًا: أرسل طلب عرض سعر تجريبي وتأكد من ظهوره في `/admin/quotes`.

## الخطوة ٧ — SSL

cPanel ← **SSL/TLS Status** ← فعّل AutoSSL على `imranalasr.sa` و`www`. الموقع يرسل ترويسة `Strict-Transport-Security` لمدة سنتين، **فلا تفعّلها قبل أن تعمل الشهادة**، وإلا حُجب الموقع عن كل زائر سبق أن فتحه.

---

## ملاحظتان أمنيّتان

**١. مجلد التطبيق داخل `public_html`.** هذا يعني أن Apache يستطيع تسليم ملفاته مباشرة كملفات ساكنة — بما فيها `data/imran.db` (كل الطلبات وكلمات مرور المديرين المُعمّاة) وشيفرة الخادم. وضعتُ ست ملفات `.htaccess` تمنع ذلك، لكنها خط دفاع ثانٍ يعتمد على بقاء `AllowOverride` مفعّلًا.

**الأسلم:** اجعل Application root خارج `public_html` تمامًا، مثل `imran-site` في مجلد المنزل. أداة Node.js App لا تشترط أن يكون داخل `public_html` — هي تربط النطاق بالتطبيق عبر Passenger لا عبر مسار الملفات. للتحقق بعد النشر:

```bash
curl -sI https://imranalasr.sa/imran-site/data/imran.db   # يجب 403 أو 404 — لا 200
```

**٢. كلمة مرور FTP.** كلمة المرور التي أرسلتها ظهرت في محادثة نصية، وهي تنتقل عبر FTP بنص واضح ما لم يُستخدم FTPS. **غيّرها من cPanel ← FTP Accounts بعد انتهاء النشر.**
