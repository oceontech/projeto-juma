'use client'

import { useEffect } from 'react'

import { FIRST_TOUCH_COOKIE, LAST_TOUCH_COOKIE, TOUCH_MAX_AGE, touchFromLocation } from '../touch'

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${TOUCH_MAX_AGE}; Path=/; SameSite=Lax`
}

/** Guarda a origem da visita (UTM, gclid, referrer externo) para o lead herdar. */
export function TouchCapture() {
  useEffect(() => {
    const touch = touchFromLocation(window.location.href, document.referrer)
    if (!touch) return
    const value = JSON.stringify(touch)
    if (!document.cookie.includes(`${FIRST_TOUCH_COOKIE}=`)) setCookie(FIRST_TOUCH_COOKIE, value)
    setCookie(LAST_TOUCH_COOKIE, value)
  }, [])
  return null
}
