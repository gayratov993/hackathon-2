# Dori Vaqti 💊
> Dorilarni o'z vaqtida ichish va qabul qilish intizomini kuzatish ilovasi (Medication Reminder & Adherence Tracker).

[![Railway Deploy](https://img.shields.io/badge/Deploy-Railway-success?style=flat-square&logo=railway)](https://hackathon-2-production-b692.up.railway.app)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-daisyUI%20emerald-38B2AC?style=flat-square&logo=tailwind-css)](https://daisyui.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20RLS-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)

---

## 1. Muammo va Yechim

### Muammo
Kuniga bir yoki bir necha marta muntazam dori ichishi kerak bo'lgan inson (masalan, har kuni ertalab va kechqurun tabletka ichuvchi) haftaning o'rtasiga kelib dorisini ichgan yoki ichmaganini unutib qo'yadi. An'anaviy eslatma ilovalari esa ortiqcha murakkab, foydalanuvchidan shaxsiy tashxislarni talab qiladi yoki o'nlab chala funksiyalarga to'la.

### Yechim: Bitta odat — to'liq yakunlangan
**Dori Vaqti** — faqat bitta muhim odatni boshidan oxirigacha mukammal hal qiladi:
1. **Eslatish va belgilash:** Kunlik rejadagi dorilarni bir teginish bilan **"Ichdim"** yoki **"O'tkazib yubordim"** deb belgilash.
2. **7 kunlik haftalik intizom:** Butun hafta davomida qanchalik izchil bo'lganingizni ko'rsatuvchi toza 7 kunlik ko'rinish va seriya (`streak`).
3. **Nolinchi hukm va maslahatsizlik:** Ilova sizga tashxis qo'ymaydi, "dozani o'tkazib yubormang" deb aql o'rgatmaydi — faqat faktlarni ko'rsatadi.

---

## 2. Asosiy Ekranlar va Imkoniyatlar

- 🚀 **1-kun (Onboarding):** Yangi ro'yxatdan o'tgan foydalanuvchi darhol o'zining birinchi dorisini (ixtiyoriy nom, miqdor va vaqt) kiritadi va asosiy ekranga yo'naltiriladi.
- 📱 **Bugun (Today):** Bugungi kun sanasi, ketma-ketlik nishoni (`🔥 X kun ketma-ket`), bajarilish darajasi (`Bugun: 2 / 3`) va doza kartochkalari.
  - **4 xil holat:** Kutilmoqda (`pending`), Kechikkan (`overdue` - sariq hoshiya), Ichildi (`taken` - yashil nishon), O'tkazib yuborildi (`skipped` - chizilgan vaqt).
  - **Optimistic UI:** Tugma bosilishi bilan interfeys bir zumda yangilanadi va fonda Supabase bilan sinxronlashadi.
- 📊 **Hafta (Week):** 7 kunlik doza matritsasi (Dushanbadan Yakshanbagacha) va intizom ko'rsatkichi.
- ⚙️ **Sozlamalar (Settings):** Dorilarni tahrirlash/nofaol qilish va **"Barcha ma'lumotlarimni o'chirish"** imkoniyati.

---

## 3. Texnologiyalar Steki

| Qatlam | Texnologiya |
|---|---|
| **Build & Bundler** | Vite 8 + React 19 (JavaScript) |
| **Styling** | Tailwind CSS v4 + daisyUI (Mavzu: `emerald`) |
| **Backend & Ma'lumotlar bazasi** | Supabase (PostgreSQL + Auth + Row Level Security) |
| **Routing** | react-router-dom |
| **Sana va vaqt** | date-fns + Sof schedule mantiqi |
| **Deploy** | Railway (Static SPA) |

---

## 4. Xavfsizlik va Maxfiylik Kafolati (Health Data & Privacy)

Sog'liqni saqlash ma'lumotlari o'ta nozik hisoblanadi. Shu sababli:
- ❌ **Biz nimalarni saqlamaymiz:** Hech qanday kasallik nomi, tashxis, shifokor ismi, telefon raqami yoki pasport ma'lumotlari so'ralmaydi va saqlanmaydi. Dori nomini foydalanuvchi o'zi istagancha belgilaydi (masalan: *"Ertalabki oq dori"*).
- 🛡️ **Row Level Security (RLS):** Barcha jadvallar `auth.uid()` orqali himoyalangan. Bir foydalanuvchi boshqa foydalanuvchining ma'lumotlarini o'qishi yoki o'zgartirishi mutlaqo imkonsiz.
- 🗑️ **Barcha ma'lumotlarni to'liq o'chirish:** Foydalanuvchi istalgan paytda barcha dorilari va qabul qilish tarixini bazadan qayta tiklanmaydigan qilib tozalashi mumkin.

---

## 5. Ma'lumotlar Bazasi Strukturasi (`supabase/schema.sql`)

```sql
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  created_at timestamptz default now()
);

create table meds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  name text not null,              -- foydalanuvchi bergan nom
  dose_text text,                  -- "1 tabletka", "2 tomchi"
  times time[] not null,           -- ['08:00', '20:00']
  active boolean not null default true,
  created_at timestamptz default now()
);

create table med_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  med_id uuid not null references meds on delete cascade,
  scheduled_for timestamptz not null,
  status text not null check (status in ('taken','skipped')),
  logged_at timestamptz default now(),
  unique (med_id, scheduled_for)
);

alter table profiles  enable row level security;
alter table meds      enable row level security;
alter table med_logs  enable row level security;

create policy "own profile"  on profiles  for all using (auth.uid() = id)      with check (auth.uid() = id);
create policy "own meds"     on meds      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own logs"     on med_logs  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

---

## 6. Loyihani Mahalliy O'rnatish va Ishga Tushirish

```bash
# 1. Repozitoriyani klonlash
git clone https://github.com/gayratov993/hackathon-2.git
cd hackathon-2

# 2. Muhit parametrlarini sozlash
cp .env.example .env.local
# .env.local fayliga VITE_SUPABASE_URL va VITE_SUPABASE_ANON_KEY ni kiriting

# 3. Paketlarni o'rnatish
npm install

# 4. Mahalliy serverni ishga tushirish
npm run dev

# 5. Ishlab chiqarish uchun build qilish
npm run build
```

---

## 7. Demo Hisobni To'ldirish (Video taqdimot uchun)

7 kunlik to'liq haftalik tarixni ko'rsatish uchun seed skripti mavjud:
```bash
node scripts/seed.js demo@dorivaqti.uz demo12345
```

---

## 8. Jonli Sayt (Production)
- **Railway URL:** [https://hackathon-2-production-b692.up.railway.app](https://hackathon-2-production-b692.up.railway.app)
