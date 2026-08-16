import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Nav } from '../components/Nav'
import { EmptyState } from '../components/EmptyState'
import { MedForm } from '../components/MedForm'
import { ThemeToggle } from '../components/ThemeToggle'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { useLanguage } from '../context/LanguageContext'
import { useTheme } from '../context/ThemeContext'

const toTime = (value) => (/^\d{2}:\d{2}/.test(value) ? value.slice(0, 5) : value)

export function Settings() {
  const { user, signOut } = useAuth()
  const { t } = useLanguage()
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const [meds, setMeds] = useState(null)
  const [error, setError] = useState(null)
  const [editingMed, setEditingMed] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [profile, setProfile] = useState(null)
  const [linking, setLinking] = useState(false)
  const editDialog = useRef(null)
  const deleteDialog = useRef(null)

  const loadProfile = useCallback(async () => {
    const { data } = await supabase
      .from('profiles')
      .select('telegram_chat_id, telegram_link_code')
      .eq('id', user.id)
      .maybeSingle()
    setProfile(data ?? null)
  }, [user])

  async function generateTelegramCode() {
    setLinking(true)
    const code = Math.random().toString(36).slice(2, 8).toUpperCase()
    const { error } = await supabase
      .from('profiles')
      .update({ telegram_link_code: code })
      .eq('id', user.id)
    setLinking(false)
    if (error) {
      setError(error.message)
      return
    }
    loadProfile()
  }

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('meds')
      .select('id, name, dose_text, notes, times, active, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
    if (error) {
      setError(error.message)
      return
    }
    setError(null)
    setMeds(data ?? [])
  }, [user])

  useEffect(() => {
    if (user) load()
  }, [user, load])

  useEffect(() => {
    if (user) loadProfile()
  }, [user, loadProfile])

  useEffect(() => {
    if (!user) return
    supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => setDisplayName(data?.display_name ?? ''))
  }, [user])

  async function handleSaveName(e) {
    e.preventDefault()
    setSavingName(true)
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, display_name: displayName.trim() || null })
    setSavingName(false)
    if (error) {
      setError(error.message)
      return
    }
  }

  async function handleSignOut() {
    setSigningOut(true)
    const { error } = await signOut()
    if (error) {
      setSigningOut(false)
      setError(error.message)
      return
    }
    navigate('/login', { replace: true })
  }

  function openEdit(med) {
    setEditingMed(med)
    editDialog.current?.showModal()
  }

  async function handleUpdate(payload) {
    if (!editingMed) return
    setSaving(true)
    const { error } = await supabase
      .from('meds')
      .update({
        name: payload.name,
        dose_text: payload.dose_text,
        notes: payload.notes,
        times: payload.times,
      })
      .eq('id', editingMed.id)
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    editDialog.current?.close()
    setEditingMed(null)
    load()
  }

  async function toggleActive(med) {
    const { error } = await supabase
      .from('meds')
      .update({ active: !med.active })
      .eq('id', med.id)
    if (error) {
      setError(error.message)
      return
    }
    load()
  }

  async function deleteAll() {
    setDeleting(true)
    const { error: logsError } = await supabase
      .from('med_logs')
      .delete()
      .eq('user_id', user.id)
    const { error: medsError } = await supabase
      .from('meds')
      .delete()
      .eq('user_id', user.id)
    setDeleting(false)
    deleteDialog.current?.close()
    if (logsError || medsError) {
      setError((logsError ?? medsError).message)
      return
    }
    navigate('/onboarding', { replace: true })
  }

  if (!meds) {
    return (
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="skeleton h-8 w-40 mb-4" />
        <div className="skeleton h-24 w-full mb-3" />
        <div className="skeleton h-24 w-full" />
        <Nav />
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-36">
      <div className="anim-rise mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">{t('settings.title')}</h1>
          <div className="anim-underline mt-1 h-0.5 w-12 rounded-full bg-primary/70" />
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-sm text-error"
          onClick={handleSignOut}
          disabled={signingOut}
        >
          {signingOut ? <span className="loading loading-spinner loading-xs" /> : t('settings.signOut')}
        </button>
      </div>

      {error && (
        <div className="anim-rise alert alert-error mb-4 text-sm" role="alert">
          <span>{error}</span>
        </div>
      )}

      <section className="anim-rise mb-6 card bg-base-100 border border-base-200 p-4" style={{ '--i': 0 }}>
        <h2 className="font-semibold mb-2">Profil</h2>
        <form onSubmit={handleSaveName} className="flex flex-col gap-2">
          <label className="fieldset-label" htmlFor="displayName">
            To'liq ism
          </label>
          <input
            id="displayName"
            type="text"
            className="input input-bordered w-full"
            placeholder="Masalan: Aziz Aliyev"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={savingName}
          />
          <button type="submit" className="btn btn-primary btn-sm self-start tap" disabled={savingName}>
            {savingName ? <span className="loading loading-spinner loading-xs" /> : t('form.save')}
          </button>
        </form>
      </section>

      {meds.length === 0 ? (
        <EmptyState
          title={t('settings.emptyTitle')}
          body={t('settings.emptyBody')}
          actionLabel={t('settings.addMed')}
          onAction={() => navigate('/onboarding')}
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {meds.map((med, index) => (
            <li
              key={med.id}
              className={`anim-rise lift card border p-4 ${
                med.active ? 'bg-base-100 border-base-300' : 'bg-base-200/40 border-base-200'
              }`}
              style={{ '--i': index + 1 }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className={`font-semibold ${med.active ? '' : 'text-base-content/50'}`}>
                    {med.name}
                  </p>
                  {med.dose_text && (
                    <p className="text-sm text-base-content/60">{med.dose_text}</p>
                  )}
                  <p className="text-sm text-base-content/60">{med.times.map(toTime).join(' · ')}</p>
                  {med.notes && (
                    <p className="mt-1 text-sm italic text-base-content/50">{med.notes}</p>
                  )}
                  {!med.active && (
                    <span className="anim-pop badge badge-ghost badge-sm mt-1">{t('settings.inactive')}</span>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <button className="btn btn-ghost btn-xs tap" onClick={() => openEdit(med)}>
                    {t('settings.edit')}
                  </button>
                  <button
                    className={`btn btn-ghost btn-xs tap ${
                      med.active ? 'text-error' : 'text-base-content/60'
                    }`}
                    onClick={() => toggleActive(med)}
                  >
                    {med.active ? t('settings.deactivate') : t('settings.activate')}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <section className="anim-rise mt-8 card bg-base-100 border border-base-200 p-4" style={{ '--i': 4 }}>
        <h2 className="font-semibold mb-2">Telegram orqali eslatma</h2>
        {profile?.telegram_chat_id ? (
          <p className="text-sm text-success">Ulangan. Dorilaringiz vaqti kelganda Telegramga eslatma yuboriladi.</p>
        ) : (
          <>
            <p className="text-sm text-base-content/60 mb-3">
              Botga ulaning va dorilaringiz vaqti kelganda shu yerdan tashqari Telegramda ham eslatma oling.
            </p>
            {profile?.telegram_link_code ? (
              <div className="flex flex-col gap-2">
                <p className="text-sm">
                  Botga o'ting va yuboring: <code className="font-mono font-bold">/start {profile.telegram_link_code}</code>
                </p>
                <button className="btn btn-outline btn-sm tap w-fit" disabled={linking} onClick={generateTelegramCode}>
                  Yangi kod olish
                </button>
              </div>
            ) : (
              <button className="btn btn-outline btn-sm tap" disabled={linking} onClick={generateTelegramCode}>
                {linking ? <span className="loading loading-spinner loading-xs" /> : 'Ulanish kodini olish'}
              </button>
            )}
          </>
        )}
      </section>

      <section
        className="anim-rise mt-4 card bg-base-100 border border-base-200 p-4 gap-4"
        style={{ '--i': 4 }}
      >
        <div className="flex items-center justify-between gap-3">
          <span className="font-semibold">{t('settings.language')}</span>
          <LanguageSwitcher />
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="font-semibold">{t('settings.appearance')}</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-base-content/60">
              {isDark ? t('settings.darkMode') : t('settings.lightMode')}
            </span>
            <ThemeToggle />
          </div>
        </div>
      </section>

      <section className="anim-rise mt-4 card bg-base-100 border border-base-200 p-4" style={{ '--i': 4 }}>
        <h2 className="font-semibold mb-2">{t('settings.dataTitle')}</h2>
        <p className="text-sm text-base-content/60">
          Biz saqlaymiz: siz kiritgan nom, miqdor va vaqtlar, hamda siz belgilagan doza holati.
          Biz saqlamaymiz: tashxis, kasallik, shifokor, telefon raqam. O'tkazib yuborilgan doza
          alohida yozilmaydi — u shunchaki qatorning yo'qligi. Har bir foydalanuvchi faqat o'z
          ma'lumotini ko'ra oladi.
        </p>
      </section>

      <div className="anim-rise mt-8" style={{ '--i': 5 }}>
        <button
          className="btn btn-error btn-block tap hover:shadow-md"
          onClick={() => deleteDialog.current?.showModal()}
        >
          {t('settings.deleteAll')}
        </button>
      </div>

      <dialog ref={editDialog} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">{t('settings.editMed')}</h3>
          {editingMed && (
            <MedForm
              initial={editingMed}
              onSubmit={handleUpdate}
              submitting={saving}
            />
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>yopish</button>
        </form>
      </dialog>

      <dialog ref={deleteDialog} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">{t('settings.deleteTitle')}</h3>
          <p className="text-sm text-base-content/60 mt-2">
            Barcha dorilaringiz va tarixingiz butunlay o'chadi. Bu amalni qaytarib bo'lmaydi.
          </p>
          <div className="modal-action">
            <button className="btn" onClick={() => deleteDialog.current?.close()}>
              {t('settings.cancel')}
            </button>
            <button
              className="btn btn-error"
              disabled={deleting}
              onClick={deleteAll}
            >
              {deleting ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                t('settings.confirmDelete')
              )}
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>yopish</button>
        </form>
      </dialog>

      <Nav />
    </div>
  )
}
