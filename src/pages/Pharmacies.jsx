import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Nav } from '../components/Nav'
import { EmptyState } from '../components/EmptyState'
import { useLanguage } from '../context/LanguageContext'
import {
  findNearbyPharmacies,
  formatDistance,
  walkingMinutes,
  directionsUrl,
  mapEmbedUrl,
} from '../lib/pharmacy'

const GEO_OPTIONS = { enableHighAccuracy: true, timeout: 12000, maximumAge: 300000 }

function getPosition() {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('unsupported'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => reject(err),
      GEO_OPTIONS,
    )
  })
}

export function Pharmacies() {
  const { t } = useLanguage()
  const [state, setState] = useState({ status: 'idle' })
  const [expandedId, setExpandedId] = useState(null)
  const abortRef = useRef(null)

  const search = useCallback(async () => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setState({ status: 'locating' })

    let origin
    try {
      origin = await getPosition()
    } catch (err) {
      const denied = err?.code === 1 || err?.message === 'unsupported'
      setState({ status: 'error', reason: denied ? 'permission' : 'position' })
      return
    }

    setState({ status: 'searching' })

    try {
      const { pharmacies, radius } = await findNearbyPharmacies(origin, {
        signal: controller.signal,
      })
      setState({ status: 'done', pharmacies, radius, origin })
    } catch (err) {
      if (err?.name === 'AbortError') return
      setState({ status: 'error', reason: 'network' })
    }
  }, [])

  useEffect(() => () => abortRef.current?.abort(), [])

  const busy = state.status === 'locating' || state.status === 'searching'

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-36">
      <header className="anim-rise mb-5">
        <h1 className="text-xl font-bold">{t('pharmacy.title')}</h1>
        <div className="anim-underline mt-1 h-0.5 w-12 rounded-full bg-primary/70" />
        <p className="mt-3 text-sm text-base-content/60">{t('pharmacy.subtitle')}</p>
      </header>

      <AnimatePresence mode="wait">
        {/* Idle — ask before touching location, never on mount. */}
        {state.status === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="card bg-base-100 border border-base-200 p-5 text-center"
          >
            <motion.div
              initial={{ scale: 0.6 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"
              aria-hidden="true"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.75"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 21s7-5.686 7-11a7 7 0 10-14 0c0 5.314 7 11 7 11z"
                />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
            </motion.div>
            <p className="text-sm text-base-content/70">{t('pharmacy.permissionBody')}</p>
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="btn btn-primary mt-4 min-h-[44px]"
              onClick={search}
            >
              {t('pharmacy.findButton')}
            </motion.button>
            <p className="mt-3 text-xs text-base-content/50">{t('pharmacy.privacyNote')}</p>
          </motion.div>
        )}

        {busy && (
          <motion.div
            key="busy"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-3"
          >
            <p className="text-center text-sm text-base-content/60">
              {state.status === 'locating' ? t('pharmacy.locating') : t('pharmacy.searching')}
            </p>
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton h-20 w-full rounded-2xl" />
            ))}
          </motion.div>
        )}

        {state.status === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <div role="alert" className="alert alert-warning text-sm">
              <span>{t(`pharmacy.error.${state.reason}`)}</span>
            </div>
            <button className="btn btn-ghost btn-block mt-3" onClick={search}>
              {t('pharmacy.retry')}
            </button>
          </motion.div>
        )}

        {state.status === 'done' && (
          <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {state.pharmacies.length === 0 ? (
              <>
                <EmptyState
                  title={t('pharmacy.emptyTitle')}
                  body={t('pharmacy.emptyBody')}
                  actionLabel={t('pharmacy.retry')}
                  onAction={search}
                />
              </>
            ) : (
              <>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs text-base-content/50">
                    {t('pharmacy.found', state.pharmacies.length)}
                  </p>
                  <button className="btn btn-ghost btn-xs tap" onClick={search}>
                    {t('pharmacy.refresh')}
                  </button>
                </div>

                <ul className="flex flex-col gap-2.5">
                  {state.pharmacies.map((pharmacy, index) => {
                    const expanded = expandedId === pharmacy.id
                    return (
                      <motion.li
                        key={pharmacy.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(index, 8) * 0.05 }}
                        className="card bg-base-100 border border-base-200 overflow-hidden"
                      >
                        <button
                          type="button"
                          className="w-full p-4 text-left tap"
                          onClick={() => setExpandedId(expanded ? null : pharmacy.id)}
                          aria-expanded={expanded}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-semibold truncate">
                                {pharmacy.name ?? t('pharmacy.unnamed')}
                              </p>
                              {pharmacy.address && (
                                <p className="mt-0.5 text-sm text-base-content/60 truncate">
                                  {pharmacy.address}
                                </p>
                              )}
                              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                {index === 0 && (
                                  <span className="badge badge-primary badge-sm">
                                    {t('pharmacy.nearest')}
                                  </span>
                                )}
                                {pharmacy.isOpen24 && (
                                  <span className="badge badge-success badge-sm">24/7</span>
                                )}
                                {pharmacy.openingHours && !pharmacy.isOpen24 && (
                                  <span className="badge badge-ghost badge-sm font-normal">
                                    {pharmacy.openingHours}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="font-mono text-sm font-semibold text-primary">
                                {formatDistance(pharmacy.distance)}
                              </p>
                              <p className="text-xs text-base-content/50">
                                {t('pharmacy.walk', walkingMinutes(pharmacy.distance))}
                              </p>
                            </div>
                          </div>
                        </button>

                        <AnimatePresence>
                          {expanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                              className="overflow-hidden border-t border-base-200"
                            >
                              <div className="p-4 pt-3">
                                <iframe
                                  title={pharmacy.name ?? t('pharmacy.unnamed')}
                                  src={mapEmbedUrl(pharmacy)}
                                  loading="lazy"
                                  referrerPolicy="no-referrer"
                                  className="h-40 w-full rounded-xl border border-base-200"
                                />
                                <div className="mt-3 flex gap-2">
                                  <a
                                    href={directionsUrl(pharmacy)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-primary btn-sm tap flex-1"
                                  >
                                    {t('pharmacy.directions')}
                                  </a>
                                  {pharmacy.phone && (
                                    <a
                                      href={`tel:${pharmacy.phone}`}
                                      className="btn btn-ghost btn-sm tap flex-1"
                                    >
                                      {t('pharmacy.call')}
                                    </a>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.li>
                    )
                  })}
                </ul>

                <p className="mt-4 text-center text-xs text-base-content/40">
                  {t('pharmacy.attribution')}
                </p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Nav />
    </div>
  )
}
