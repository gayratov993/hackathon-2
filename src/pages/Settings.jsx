import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Nav } from '../components/Nav'
import { EmptyState } from '../components/EmptyState'
import { MedForm } from '../components/MedForm'

const toTime = (value) => (/^\d{2}:\d{2}/.test(value) ? value.slice(0, 5) : value)

export function Settings() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [meds, setMeds] = useState(null)
  const [error, setError] = useState(null)
  const [editingMed, setEditingMed] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const editDialog = useRef(null)
  const deleteDialog = useRef(null)

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('meds')
      .select('id, name, dose_text, times, active, created_at')
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

  function openEdit(med) {
    setEditingMed(med)
    editDialog.current?.showModal()
  }

  async function handleUpdate(payload) {
    if (!editingMed) return
    setSaving(true)
    const { error } = await supabase
      .from('meds')
      .update({ name: payload.name, dose_text: payload.dose_text, times: payload.times })
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
      <h1 className="text-xl font-bold mb-6">Sozlamalar</h1>

      {error && (
        <div className="alert alert-error mb-4 text-sm" role="alert">
          <span>{error}</span>
        </div>
      )}

      {meds.length === 0 ? (
        <EmptyState
          title="Hali dori yo'q."
          body="Birinchi dorini qo'shishdan boshlang."
          actionLabel="Dori qo'shish"
          onAction={() => navigate('/onboarding')}
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {meds.map((med) => (
            <li key={med.id} className="card bg-base-100 border border-base-300 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className={`font-semibold ${med.active ? '' : 'text-base-content/50'}`}>
                    {med.name}
                  </p>
                  {med.dose_text && (
                    <p className="text-sm text-base-content/60">{med.dose_text}</p>
                  )}
                  <p className="text-sm text-base-content/60">{med.times.map(toTime).join(' · ')}</p>
                  {!med.active && <span className="badge badge-ghost badge-sm mt-1">faol emas</span>}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <button className="btn btn-ghost btn-xs" onClick={() => openEdit(med)}>
                    Tahrirlash
                  </button>
                  <button
                    className={`btn btn-ghost btn-xs ${
                      med.active ? 'text-error' : 'text-base-content/60'
                    }`}
                    onClick={() => toggleActive(med)}
                  >
                    {med.active ? 'O\'chirish' : 'Faollashtirish'}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <section className="mt-8">
        <h2 className="font-semibold mb-2">Ma'lumotlaringiz haqida</h2>
        <p className="text-sm text-base-content/60">
          Biz saqlaymiz: siz kiritgan nom, miqdor va vaqtlar, hamda siz belgilagan doza holati.
          Biz saqlamaymiz: tashxis, kasallik, shifokor, telefon raqam. O'tkazib yuborilgan doza
          alohida yozilmaydi — u shunchaki qatorning yo'qligi. Har bir foydalanuvchi faqat o'z
          ma'lumotini ko'ra oladi.
        </p>
      </section>

      <div className="mt-8">
        <button
          className="btn btn-error btn-block"
          onClick={() => deleteDialog.current?.showModal()}
        >
          Barcha ma'lumotlarimni o'chirish
        </button>
      </div>

      <dialog ref={editDialog} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Dorini tahrirlash</h3>
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
          <h3 className="font-bold text-lg">Barcha ma'lumotlarni o'chirish</h3>
          <p className="text-sm text-base-content/60 mt-2">
            Barcha dorilaringiz va tarixingiz butunlay o'chadi. Bu amalni qaytarib bo'lmaydi.
          </p>
          <div className="modal-action">
            <button className="btn" onClick={() => deleteDialog.current?.close()}>
              Bekor qilish
            </button>
            <button
              className="btn btn-error"
              disabled={deleting}
              onClick={deleteAll}
            >
              {deleting ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                'Ha, o\'chirish'
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
