import { Link } from 'react-router-dom'

const steps = [
  {
    title: 'Dorini qo’shing',
    body: 'Nomi, dozasi va ichish vaqt(lar)ini kiriting. Kasallik nomi yoki shifokor haqida hech narsa so’ramaymiz.',
  },
  {
    title: 'Bugungi ro’yxatni ko’ring',
    body: 'Har kuni "Bugun" sahifasida qaysi dorini qachon ichish kerakligi aniq vaqti bilan chiqadi.',
  },
  {
    title: 'Ichdim yoki o’tkazib yubordim deb belgilang',
    body: 'Bir bosish yetarli. Haftalik jadvalda tarixingiz o’zi shakllanadi, ketma-ket kunlar seriya sifatida ko’rinadi.',
  },
]

const features = [
  {
    title: 'Bugungi ro’yxat',
    body: 'Har kuni qaysi dorini, qachon ichish kerakligini ko’rasiz va bir bosishda belgilaysiz.',
  },
  {
    title: 'Haftalik jadval va seriya',
    body: '7 kunlik jadval qanchalik izchil bo’lganingizni ko’rsatadi, ketma-ket kunlar kichik motivatsiya beradi.',
  },
  {
    title: 'Maxfiylik birinchi o’rinda',
    body: 'Faqat kerakli ma’lumot saqlanadi. Har bir foydalanuvchi faqat o’z yozuvlarini ko’ra oladi.',
  },
  {
    title: 'Oddiy va tez',
    body: 'Ro’yxatdan o’tish va birinchi dorini qo’shish bir necha daqiqa ichida tugaydi.',
  },
]

const privacyFacts = [
  'Tashxis, kasallik nomi, shifokor ismi yoki telefon raqami so’ralmaydi va saqlanmaydi.',
  'Faqat siz kiritgan dori nomi, doza yozuvi va vaqtlari saqlanadi.',
  'Ma’lumotlar bazasi darajasida himoyalangan (Row Level Security) — boshqa hech kim sizning yozuvlaringizni ko’ra olmaydi.',
  'O’tkazib yuborilgan doza — shunchaki yozuv yo’qligi, hukm emas.',
  'Sozlamalarda "Barcha ma’lumotlarimni o’chirish" tugmasi bilan istalgan vaqtda hammasini o’chira olasiz.',
]

const faqs = [
  {
    q: 'Dori Vaqti nima?',
    a: 'Dori Vaqti — dorilaringizni ichish vaqtini eslab qolish va har kuni belgilangan dozalarni kuzatib borish uchun sodda ilova. U dorilaringizni qo’shish, kunlik ro’yxatni ko’rish va "Ichdim" yoki "O’tkazib yubordim" deb belgilash imkonini beradi.',
  },
  {
    q: 'Dori Vaqti tibbiy maslahat yoki diagnostika beradimi?',
    a: 'Yo’q. Dori Vaqti faqat eslatma va kuzatuv vositasi — u dozani tavsiya qilmaydi, dori-darmon o’zaro ta’sirini tekshirmaydi va hech qanday tashxis qo’ymaydi. Dozangiz yoki davolanishingiz haqida savollar uchun shifokoringizga murojaat qiling.',
  },
  {
    q: 'Mening ma’lumotlarim xavfsizmi?',
    a: 'Ha. Har bir foydalanuvchi faqat o’z ma’lumotlarini ko’ra oladi (Supabase Row Level Security orqali). Biz tashxis, kasallik nomi, shifokor ismi yoki telefon raqamingizni so’ramaymiz va saqlamaymiz — faqat dori nomi, doza yozuvi va vaqtlari.',
  },
  {
    q: 'Ma’lumotlarimni o’chira olamanmi?',
    a: 'Ha, istalgan vaqtda. Sozlamalar bo’limida "Barcha ma’lumotlarimni o’chirish" tugmasi bor — u bosilganda barcha dorilaringiz va yozuvlaringiz butunlay o’chiriladi.',
  },
  {
    q: 'Ilovadan foydalanish pulmi?',
    a: 'Yo’q, Dori Vaqti hozircha to’liq bepul.',
  },
  {
    q: 'Necha xil dori qo’sha olaman va necha marta eslatma sozlay olaman?',
    a: 'Xohlagancha dori qo’shishingiz va har biriga bir nechta vaqt belgilashingiz mumkin — masalan, kuniga ikki marta ichiladigan dori uchun ertalabki va kechki vaqtlarni alohida qo’shasiz.',
  },
]

export function Landing() {
  return (
    <div className="min-h-screen bg-base-200">
      <header className="sticky top-0 z-20 bg-base-100/90 backdrop-blur border-b border-base-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <span className="text-lg font-bold tracking-tight text-base-content">
            Dori Vaqti
          </span>
          <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-base-content/70">
            {[
              ['#qanday-ishlaydi', 'Qanday ishlaydi'],
              ['#xususiyatlar', 'Xususiyatlar'],
              ['#maxfiylik', 'Maxfiylik'],
              ['#savollar', 'Savollar'],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="relative py-1 transition-colors hover:text-base-content after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-primary after:transition-transform after:duration-300 hover:after:scale-x-100"
              >
                {label}
              </a>
            ))}
          </nav>
          <Link to="/login" className="btn btn-primary btn-sm tap hover:shadow-md hover:brightness-105">
            Kirish
          </Link>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          {/* Soft colour wash behind the hero. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-32 -left-24 h-80 w-80 rounded-full bg-primary/15 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-40 -right-16 h-96 w-96 rounded-full bg-success/10 blur-3xl"
          />

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-14 pb-16 grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <span
                className="anim-rise badge badge-primary badge-outline gap-1.5 py-3 mb-5"
                style={{ '--i': 0 }}
              >
                <span className="anim-ember inline-block" aria-hidden="true">💊</span>
                Bitta odat, oxirigacha
              </span>
              <h1
                className="anim-rise text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-base-content leading-tight"
                style={{ '--i': 1 }}
              >
                Dorilaringizni ichishni hech qachon unutmang
              </h1>
              <p
                className="anim-rise mt-4 text-base sm:text-lg text-base-content/70 max-w-lg"
                style={{ '--i': 2 }}
              >
                Dori Vaqti — dorilaringizni qo’shib, har kuni belgilangan dozalarni kuzatib
                boradigan sodda va maxfiy ilova. Diagnostika yo’q, faqat eslatma va aniq tarix.
              </p>
              <div className="anim-rise mt-7 flex flex-wrap items-center gap-3" style={{ '--i': 3 }}>
                <Link
                  to="/login"
                  className="btn btn-primary tap shadow-sm hover:shadow-lg hover:brightness-105"
                >
                  Bepul boshlash
                </Link>
                <Link to="/login" className="btn btn-ghost tap">
                  Hisobim bor — kirish
                </Link>
              </div>
              <div className="anim-rise mt-8 flex flex-wrap gap-2" style={{ '--i': 4 }}>
                <span className="badge badge-ghost gap-1.5 py-3">🆓 Bepul</span>
                <span className="badge badge-ghost gap-1.5 py-3">🔒 Maxfiy</span>
                <span className="badge badge-ghost gap-1.5 py-3">🇺🇿 O’zbek tilida</span>
              </div>
            </div>

            <div className="anim-rise flex justify-center lg:justify-end" style={{ '--i': 5 }} aria-hidden="true">
              <div className="anim-float w-[280px] rounded-[2.25rem] border-[10px] border-neutral bg-neutral shadow-2xl">
              <div className="bg-base-100 rounded-[1.5rem] overflow-hidden px-4 pt-6 pb-6 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-base-content">16-avgust, yakshanba</span>
                  <span className="badge badge-primary badge-outline text-xs gap-1">
                    🔥 3 kun
                  </span>
                </div>
                <progress className="progress progress-primary w-full h-1.5" value={2} max={3} />

                <div className="card bg-base-100 border border-base-200 rounded-2xl shadow-sm mt-2">
                  <div className="card-body p-3 gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">Bosim tabletkasi</span>
                      <span className="font-mono text-xs bg-base-200/60 rounded-lg px-2 py-1">08:00</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="btn btn-primary btn-xs flex-1 pointer-events-none">Ichdim</span>
                      <span className="btn btn-ghost btn-xs flex-1 pointer-events-none">O’tkazdim</span>
                    </div>
                  </div>
                </div>

                <div className="card border border-success/30 bg-base-100/70 rounded-2xl shadow-xs">
                  <div className="card-body p-3 gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">Vitamin D</span>
                      <span className="badge badge-success badge-sm">Ichildi</span>
                    </div>
                  </div>
                </div>

                <div className="card border-warning/80 bg-warning/5 rounded-2xl shadow-sm border">
                  <div className="card-body p-3 gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">Bosim tabletkasi</span>
                      <span className="font-mono text-xs bg-warning/20 rounded-lg px-2 py-1">20:00</span>
                    </div>
                    <span className="text-xs text-warning font-medium">Belgilangan vaqt o’tgan</span>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="qanday-ishlaydi" className="bg-base-100 border-y border-base-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
            <h2 className="reveal text-2xl sm:text-3xl font-bold text-center text-base-content">
              Qanday ishlaydi
            </h2>
            <p className="reveal mt-2 text-center text-base-content/60 max-w-md mx-auto">
              Uch qadam — boshqa hech narsa kerak emas.
            </p>
            <ol className="mt-10 grid gap-6 sm:grid-cols-3">
              {steps.map((step, i) => (
                <li
                  key={step.title}
                  className="reveal lift card bg-base-200/50 border border-base-200 rounded-2xl hover:border-primary/40 hover:shadow-md"
                >
                  <div className="card-body">
                    <span className="badge badge-primary badge-outline font-mono">{i + 1}</span>
                    <h3 className="font-bold text-base-content mt-2">{step.title}</h3>
                    <p className="text-sm text-base-content/70">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Features */}
        <section id="xususiyatlar" className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
          <h2 className="reveal text-2xl sm:text-3xl font-bold text-center text-base-content">
            Xususiyatlar
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="reveal lift card bg-base-100 border border-base-200 rounded-2xl shadow-xs hover:border-primary/40 hover:shadow-md"
              >
                <div className="card-body">
                  <h3 className="font-bold text-base-content">{feature.title}</h3>
                  <p className="text-sm text-base-content/70">{feature.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Privacy */}
        <section id="maxfiylik" className="bg-base-100 border-y border-base-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
            <h2 className="reveal text-2xl sm:text-3xl font-bold text-center text-base-content">
              Maxfiylik birinchi o’rinda
            </h2>
            <p className="reveal mt-2 text-center text-base-content/60">
              Sog’liq bilan bog’liq ma’lumot nozik — shuning uchun eng kami saqlanadi.
            </p>
            <ul className="mt-8 space-y-3">
              {privacyFacts.map((fact) => (
                <li
                  key={fact}
                  className="reveal flex items-start gap-3 rounded-xl px-3 py-2 text-sm text-base-content/80 transition-colors hover:bg-base-200/50"
                >
                  <span
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/15 text-xs font-bold text-success"
                    aria-hidden="true"
                  >
                    ✓
                  </span>
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
            <div role="note" className="reveal alert mt-8 text-sm bg-base-200/60 border border-base-200">
              <span>
                Dori Vaqti tibbiy maslahat bermaydi va diagnostika qilmaydi — bu faqat eslatma va
                kuzatuv vositasi. Davolanish bo’yicha savollaringiz uchun shifokoringizga murojaat
                qiling.
              </span>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="savollar" className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
          <h2 className="reveal text-2xl sm:text-3xl font-bold text-center text-base-content">
            Ko’p so’raladigan savollar
          </h2>
          <div className="mt-8 space-y-3">
            {faqs.map((item) => (
              <details
                key={item.q}
                className="reveal collapse collapse-plus bg-base-100 border border-base-200 rounded-2xl transition-colors hover:border-primary/40"
              >
                <summary className="collapse-title font-semibold text-base-content">
                  {item.q}
                </summary>
                <div className="collapse-content text-sm text-base-content/70">
                  <p>{item.a}</p>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-primary text-primary-content">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
            <h2 className="reveal text-2xl sm:text-3xl font-bold">Bugundan boshlang</h2>
            <p className="reveal mt-2 opacity-90">
              Birinchi doringizni qo’shish bir necha daqiqa vaqt oladi.
            </p>
            <Link
              to="/login"
              className="reveal tap btn btn-lg bg-base-100 text-primary hover:bg-base-100/90 border-none mt-6 shadow-lg hover:shadow-xl"
            >
              Bepul boshlash
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-base-200 bg-base-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-base-content/60">
          <span>&copy; {new Date().getFullYear()} Dori Vaqti</span>
          <div className="flex items-center gap-5">
            <Link to="/login" className="hover:text-base-content">
              Kirish
            </Link>
            <a
              href="https://github.com/gayratov993/hackathon-2"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-base-content"
            >
              Manba kodi
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
