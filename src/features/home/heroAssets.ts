/**
 * Recursos críticos do hero da home: pôster decodificado e buffer do vídeo.
 *
 * A home abre com vídeo e pôster em tela cheia, e a jornada só faz sentido
 * depois de tudo decodificado. O `HeroJornada` registra esta promessa em
 * `prepare()` para o véu de carregamento só sair quando ela assentar. É espera
 * de rede e decodificação fora da main thread, então pode começar já no mount.
 */
export async function preloadHeroAssets(): Promise<void> {
  if (typeof window === 'undefined') return

  const isMobile = window.innerWidth < 1024
  const poster = isMobile
    ? '/hero/mobile/journey-poster.webp'
    : '/hero/desktop/journey-poster.webp'

  const posterReady = new Promise<void>((resolve) => {
    const img = new Image()
    img.src = poster
    if (typeof img.decode === 'function') {
      img.decode().then(resolve, () => resolve())
    } else if (img.complete) {
      resolve()
    } else {
      img.onload = () => resolve()
      img.onerror = () => resolve()
    }
  })

  const videoReady = new Promise<void>((resolve) => {
    const video = document.querySelector<HTMLVideoElement>(
      `video[data-hero-video="${isMobile ? 'mobile' : 'desktop'}"]`,
    )
    if (!video || video.readyState >= 2) return resolve()
    if (video.preload !== 'auto') {
      video.preload = 'auto'
      video.load()
    }
    const onReady = () => {
      video.removeEventListener('loadeddata', onReady)
      video.removeEventListener('canplay', onReady)
      resolve()
    }
    video.addEventListener('loadeddata', onReady)
    video.addEventListener('canplay', onReady)
    setTimeout(resolve, 1000)
  })

  await Promise.allSettled([posterReady, videoReady])
}
