import { useState } from 'react'

const emptyInitial = { name: '', dose_text: '', times: [''] }

const toTime = (value) => (/^\d{2}:\d{2}/.test(value) ? value.slice(0, 5) : value)

export function MedForm({ initial = emptyInitial, onSubmit, submitting = false }) {
  const [name, setName] = useState(initial.name ?? '')
  const [doseText, setDoseText] = useState(initial.dose_text ?? '')
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
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label className="form-control flex flex-col w-full">
        <span className="label-text">Nomi</span>
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder="masalan: ertalabki dori"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={!!errors.name}
        />
        <span className="text-sm text-base-content/60 mt-1">
          Istagan nom bering. Biz kasallik nomini so'ramaymiz.
        </span>
        {errors.name && <span className="text-sm text-error mt-1">{errors.name}</span>}
      </label>

      <label className="form-control flex flex-col w-full mt-4">
        <span className="label-text">Miqdori</span>
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder="1 tabletka"
          value={doseText}
          onChange={(e) => setDoseText(e.target.value)}
        />
        <span className="text-sm text-base-content/60 mt-1">Ixtiyoriy.</span>
      </label>

      <fieldset className="mt-4">
        <legend className="label-text">Vaqtlari</legend>
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
          + vaqt qo'shish
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
        ) : initial?.name ? (
          'Saqlash'
        ) : (
          'Qo\'shish'
        )}
      </button>
    </form>
  )
}
