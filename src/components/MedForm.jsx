import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'

const emptyInitial = { name: '', dose_text: '', times: [''], notes: '' }

const NOTES_MAX = 200

const toTime = (value) => (/^\d{2}:\d{2}/.test(value) ? value.slice(0, 5) : value)

export function MedForm({ initial = emptyInitial, onSubmit, submitting = false }) {
  const { t } = useLanguage()
  const [name, setName] = useState(initial.name ?? '')
  const [doseText, setDoseText] = useState(initial.dose_text ?? '')
  const [notes, setNotes] = useState(initial.notes ?? '')
  const [times, setTimes] = useState(
    Array.isArray(initial.times) && initial.times.length > 0
      ? initial.times.map(toTime)
      : [''],
  )
  const [errors, setErrors] = useState({})

  function updateTime(index, value) {
    setTimes((prev) => prev.map((t, i) => (i === index ? value : t)))
  }

  function addTime() {
    setTimes((prev) => [...prev, ''])
  }

  function removeTime(index) {
    setTimes((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev))
  }

  function validate() {
    const next = {}
    if (!name.trim()) next.name = 'Nom kerak.'
    if (times.some((t) => !t)) next.times = 'Kamida bitta vaqt kiriting.'
    if (new Set(times.filter(Boolean)).size !== times.filter(Boolean).length)
      next.times = 'Vaqtlar takrorlanmasligi kerak.'
    if (notes.length > NOTES_MAX) next.notes = t('form.notesTooLong')
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!validate()) return
    onSubmit({
      name: name.trim(),
      dose_text: doseText.trim() || null,
      times: times.filter(Boolean).map(toTime),
      notes: notes.trim() || null,
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label className="form-control flex flex-col w-full">
        <span className="label-text">{t('form.name')}</span>
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder={t('form.namePlaceholder')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={!!errors.name}
        />
        <span className="text-sm text-base-content/60 mt-1">
          {t('form.nameHint')}
        </span>
        {errors.name && <span className="text-sm text-error mt-1">{errors.name}</span>}
      </label>

      <label className="form-control flex flex-col w-full mt-4">
        <span className="label-text">{t('form.dose')}</span>
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder={t('form.dosePlaceholder')}
          value={doseText}
          onChange={(e) => setDoseText(e.target.value)}
        />
        <span className="text-sm text-base-content/60 mt-1">Ixtiyoriy.</span>
      </label>

      <label className="form-control flex flex-col w-full mt-4">
        <span className="label-text">{t('form.notes')}</span>
        <textarea
          className="textarea textarea-bordered w-full transition-all duration-200 focus:border-primary"
          rows={2}
          maxLength={NOTES_MAX}
          placeholder={t('form.notesPlaceholder')}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          aria-invalid={!!errors.notes}
        />
        <div className="mt-1 flex items-start justify-between gap-2">
          <span className="text-sm text-base-content/60">{t('form.notesHint')}</span>
          <span
            className={`shrink-0 font-mono text-xs ${
              notes.length > NOTES_MAX - 20 ? 'text-warning' : 'text-base-content/40'
            }`}
          >
            {notes.length}/{NOTES_MAX}
          </span>
        </div>
        {errors.notes && <span className="text-sm text-error mt-1">{errors.notes}</span>}
      </label>

      <fieldset className="mt-4">
        <legend className="label-text">{t('form.times')}</legend>
        <div className="flex flex-col gap-2">
          {times.map((time, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="time"
                className="input input-bordered w-full"
                value={time}
                onChange={(e) => updateTime(index, e.target.value)}
                aria-invalid={!!errors.times}
              />
              <button
                type="button"
                className="btn btn-ghost btn-square"
                onClick={() => removeTime(index)}
                disabled={times.length <= 1}
                aria-label="Vaqtni olib tashlash"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
        <button type="button" className="btn btn-ghost btn-sm mt-2" onClick={addTime}>
          + {t('form.addTime')}
        </button>
        {errors.times && <p className="text-sm text-error mt-1">{errors.times}</p>}
      </fieldset>

      <button
        type="submit"
        className="btn btn-primary btn-block mt-6"
        disabled={submitting}
      >
        {submitting ? (
          <span className="loading loading-spinner loading-sm" />
        ) : (
          t('form.save')
        )}
      </button>
    </form>
  )
}
