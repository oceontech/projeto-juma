import re

with open(r'c:\projeto-juma\src\features\home\components\AminosanStory.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the AminosanStory export and modify CinematicVersion props
new_export = """export function AminosanStory() {
  const t = useTranslations('aminosanStory')
  const reduced = useReducedMotion()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const update = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return (
    <div className="w-full aminosan-wrapper">
      {reduced ? (
        <SimpleVersion key="simple" t={t} isMobile={isMobile} reduced={reduced} />
      ) : (
        <CinematicVersion key="cinematic" t={t} isMobile={isMobile} />
      )}
    </div>
  )
}"""

content = re.sub(r'export function AminosanStory\(\) \{.*?\n\}\n', new_export + '\n', content, flags=re.DOTALL)

# Replace CinematicVersion signature
content = re.sub(r'function CinematicVersion\(\{\s*t\s*\}\s*:\s*\{\s*t:\s*TFn\s*\}\)\s*\{', 'function CinematicVersion({ t, isMobile }: { t: TFn; isMobile: boolean }) {', content)

# Replace the refs in CinematicVersion
old_refs = """  const videoRef        = useRef<HTMLVideoElement>(null)
  const videoRevRef     = useRef<HTMLVideoElement>(null)"""

new_refs = """  const videoFwdDesktopRef = useRef<HTMLVideoElement>(null)
  const videoRevDesktopRef = useRef<HTMLVideoElement>(null)
  const videoFwdMobileRef  = useRef<HTMLVideoElement>(null)
  const videoRevMobileRef  = useRef<HTMLVideoElement>(null)"""

content = content.replace(old_refs, new_refs)

# Replace the useGSAP body up to the introTl
old_gsap_start = """  useGSAP(
    () => {
      const videoFwd = videoRef.current
      const videoRev = videoRevRef.current
      const stageTrigger = stageRef.current
      const stageInner = stageRef.current
      const oldImg = oldImgRef.current
      if (!videoFwd || !videoRev || !stageTrigger || !stageInner || !oldImg) return"""

new_gsap_start = """  useGSAP(
    () => {
      const videoFwd = isMobile ? videoFwdMobileRef.current : videoFwdDesktopRef.current
      const videoRev = isMobile ? videoRevMobileRef.current : videoRevDesktopRef.current
      const stageTrigger = stageRef.current
      const stageInner = stageRef.current
      const oldImg = oldImgRef.current
      if (!videoFwd || !videoRev || !stageTrigger || !stageInner || !oldImg) return"""

content = content.replace(old_gsap_start, new_gsap_start)

# Add lockScroll function
lock_scroll_fn = """      const lockScroll = (on: boolean) => {
        if (on) {
          lenisRef.current?.stop()
          const sw = window.innerWidth - document.documentElement.clientWidth
          if (sw > 0) document.body.style.paddingRight = `${sw}px`
          document.documentElement.style.overflow = 'hidden'
          document.body.style.overflow = 'hidden'
        } else {
          document.body.style.paddingRight = ''
          document.documentElement.style.overflow = ''
          document.body.style.overflow = ''
          lenisRef.current?.start()
          requestAnimationFrame(() => ScrollTrigger.refresh())
        }
      }"""

content = content.replace("      const preventDefault = (e: Event) => { e.preventDefault() }", "      const preventDefault = (e: Event) => { e.preventDefault() }\n\n" + lock_scroll_fn)

# Replace the phase and stGate logic
old_phase_logic = r"""      type Phase = 'act1' \| 'act3'
      let phase: Phase = 'act1'
      let isTransitioning = false
      let stGate: ScrollTrigger \| null = null

      const goToAct3 = async \(\) => \{
        if \(phase === 'act3' \|\| isTransitioning\) return
        isTransitioning = true
        phase = 'act3'
        const fwdDur = \(videoFwd\.duration > 0 && isFinite\(videoFwd\.duration\)\) \? videoFwd\.duration : 3;
        gsap\.set\(\[act1Ref\.current, oldCalloutRef\.current\], \{ autoAlpha: 1 \}\)
        gsap\.to\(titleChars, \{ x: 20, autoAlpha: 0, filter: 'blur\(10px\)', duration: fwdDur \* 0\.4, stagger: STAGGER\.char, ease: 'power1\.inOut' \}\)
        gsap\.to\(act1Items, \{ y: 14, autoAlpha: 0, duration: fwdDur \* 0\.4, stagger: 0\.05, ease: 'power1\.inOut' \}\)
        gsap\.to\(calloutLine, \{ scaleY: 0, duration: fwdDur \* 0\.3, ease: 'power1\.inOut' \}\)
        gsap\.to\(calloutLabel, \{ autoAlpha: 0, duration: fwdDur \* 0\.3, ease: 'power1\.inOut' \}\)
        gsap\.to\(scrimRef\.current, \{ autoAlpha: 0, duration: fwdDur \* 0\.8, ease: 'power1\.inOut' \}\)
        
        lockScroll\(\)
        
        gsap\.set\(videoFwd, \{ zIndex: 1, autoAlpha: 1 \}\)
        gsap\.set\(videoRev, \{ zIndex: 0, autoAlpha: 0 \}\)
        gsap\.set\(newImgRef\.current, \{ autoAlpha: 0 \}\)
        
        let videoStarted = false
        const handleFwdPlaying = \(\) => \{
          if \(videoStarted\) return;
          videoStarted = true;
          gsap\.to\(oldImg, \{ autoAlpha: 0, duration: 0\.2, overwrite: 'auto' \}\)
          showAct3UI\(fwdDur \* 0\.4\)
        \}
        videoFwd\.addEventListener\('playing', handleFwdPlaying\)
        videoFwd\.addEventListener\('timeupdate', handleFwdPlaying\)
        
        const success = await playForward\(\)
        
        videoFwd\.removeEventListener\('playing', handleFwdPlaying\)
        videoFwd\.removeEventListener\('timeupdate', handleFwdPlaying\)
        
        unlockScroll\(\)
        if \(phase !== 'act3'\) return.*?
        if \(stGate\) \{
          if \(phase === 'act3' && stGate\.progress < 0\.4\) void goToAct1\(\)
        \}
      \}

      const goToAct1 = async \(\) => \{.*?if \(stGate\) \{
          if \(phase === 'act1' && stGate\.progress > 0\.4\) void goToAct3\(\)
        \}
      \}

      stGate = ScrollTrigger\.create\(\{
        trigger: stageRef\.current,
        start: 'top top',
        end: '\+=700',
        pin: true,
        scrub: false,
        onUpdate: \(self\) => \{
          if \(self\.progress > 0\.4 && phase === 'act1'\) \{
            void goToAct3\(\)
          \} else if \(self\.progress < 0\.4 && phase === 'act3'\) \{
            void goToAct1\(\)
          \}
        \}
      \}\)"""

new_phase_logic = """      type Phase = 'act1' | 'act3'
      let phase: Phase = 'act1'
      let isTransitioning = false
      let isLocked = false
      const cooldownRef = { current: 0 }

      const release = () => {
        isLocked = false
        lockScroll(false)
      }

      const goToAct3 = async () => {
        if (phase === 'act3' || isTransitioning) return
        isTransitioning = true
        phase = 'act3'
        const fwdDur = (videoFwd.duration > 0 && isFinite(videoFwd.duration)) ? videoFwd.duration : 3;
        gsap.set([act1Ref.current, oldCalloutRef.current], { autoAlpha: 1 })
        gsap.to(titleChars, { x: 20, autoAlpha: 0, filter: 'blur(10px)', duration: fwdDur * 0.4, stagger: STAGGER.char, ease: 'power1.inOut' })
        gsap.to(act1Items, { y: 14, autoAlpha: 0, duration: fwdDur * 0.4, stagger: 0.05, ease: 'power1.inOut' })
        gsap.to(calloutLine, { scaleY: 0, duration: fwdDur * 0.3, ease: 'power1.inOut' })
        gsap.to(calloutLabel, { autoAlpha: 0, duration: fwdDur * 0.3, ease: 'power1.inOut' })
        gsap.to(scrimRef.current, { autoAlpha: 0, duration: fwdDur * 0.8, ease: 'power1.inOut' })
        
        gsap.set(videoFwd, { zIndex: 1, autoAlpha: 1 })
        gsap.set(videoRev, { zIndex: 0, autoAlpha: 0 })
        gsap.set(newImgRef.current, { autoAlpha: 0 })
        
        let videoStarted = false
        const handleFwdPlaying = () => {
          if (videoStarted) return;
          videoStarted = true;
          gsap.to(oldImg, { autoAlpha: 0, duration: 0.2, overwrite: 'auto' })
          showAct3UI(fwdDur * 0.4)
        }
        videoFwd.addEventListener('playing', handleFwdPlaying)
        videoFwd.addEventListener('timeupdate', handleFwdPlaying)
        
        const success = await playForward()
        
        videoFwd.removeEventListener('playing', handleFwdPlaying)
        videoFwd.removeEventListener('timeupdate', handleFwdPlaying)
        
        if (phase !== 'act3') return
        
        if (!success || !videoStarted) {
          gsap.killTweensOf(titleChars)
          gsap.killTweensOf(act1Items)
          gsap.killTweensOf([calloutLine, calloutLabel, scrimRef.current])
          
          gsap.to(titleChars, { autoAlpha: 0, duration: 0.4 })
          gsap.to(act1Items, { autoAlpha: 0, duration: 0.4 })
          gsap.to([calloutLine, calloutLabel, scrimRef.current], { autoAlpha: 0, duration: 0.4 })
          
          gsap.to(oldImg, { autoAlpha: 0, duration: 0.6 })
          gsap.to(newImgRef.current, { autoAlpha: 1, duration: 0.6 })
          showAct3UI(0.4)
        } else {
          gsap.set(oldImg, { autoAlpha: 0 })
          gsap.set(newImgRef.current, { autoAlpha: 1 })
        }
        try { videoRev.currentTime = 0 } catch(e) {}
        
        isTransitioning = false
        cooldownRef.current = performance.now() + 300
      }

      const goToAct1 = async () => {
        if (phase === 'act1' || isTransitioning) return
        isTransitioning = true
        phase = 'act1'
        const revDur = (videoRev.duration > 0 && isFinite(videoRev.duration)) ? videoRev.duration : 3;
        hideAct3UI(0)
        
        gsap.set(videoRev, { zIndex: 1, autoAlpha: 1 })
        gsap.set(videoFwd, { zIndex: 0, autoAlpha: 0 })
        
        let videoStarted = false
        const handleRevPlaying = () => {
          if (videoStarted) return;
          videoStarted = true;
          gsap.set(newImgRef.current, { autoAlpha: 0 })
          gsap.to(titleChars, { x: 0, autoAlpha: 1, filter: 'blur(0px)', duration: revDur * 0.4, stagger: STAGGER.char, ease: 'power1.inOut', delay: revDur * 0.5 })
          gsap.to(act1Items, { y: 0, autoAlpha: 1, duration: revDur * 0.4, stagger: 0.05, ease: 'power1.inOut', delay: revDur * 0.5 })
          gsap.to(calloutLine, { scaleY: 1, duration: revDur * 0.3, ease: 'power1.inOut', delay: revDur * 0.5 })
          gsap.to(calloutLabel, { autoAlpha: 1, duration: revDur * 0.3, ease: 'power1.inOut', delay: revDur * 0.5 })
          gsap.to(scrimRef.current, { autoAlpha: 1, duration: revDur * 0.8, ease: 'power1.inOut', delay: revDur * 0.2 })
        }
        videoRev.addEventListener('playing', handleRevPlaying)
        videoRev.addEventListener('timeupdate', handleRevPlaying)
        
        gsap.set([act1Ref.current, oldCalloutRef.current], { autoAlpha: 1 })
        
        const success = await playReverse()
        
        videoRev.removeEventListener('playing', handleRevPlaying)
        videoRev.removeEventListener('timeupdate', handleRevPlaying)
        
        if (phase !== 'act1') return
        
        if (!success || !videoStarted) {
          gsap.to(newImgRef.current, { autoAlpha: 0, duration: 0.6 })
          gsap.to(oldImg, { autoAlpha: 1, duration: 0.6 })
          gsap.to(titleChars, { x: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 0.4, stagger: STAGGER.char, ease: 'power1.inOut' })
          gsap.to(act1Items, { y: 0, autoAlpha: 1, duration: 0.4, stagger: 0.05, ease: 'power1.inOut' })
          gsap.to(calloutLine, { scaleY: 1, duration: 0.3, ease: 'power1.inOut' })
          gsap.to(calloutLabel, { autoAlpha: 1, duration: 0.3, ease: 'power1.inOut' })
          gsap.to(scrimRef.current, { autoAlpha: 1, duration: 0.8, ease: 'power1.inOut' })
        } else {
          gsap.set(newImgRef.current, { autoAlpha: 0 })
          gsap.set(oldImg, { autoAlpha: 1 })
        }
        
        gsap.set(videoRev, { autoAlpha: 0 })
        try { videoFwd.currentTime = 0 } catch(e) {}
        
        isTransitioning = false
        cooldownRef.current = performance.now() + 300
      }

      let stTop = ScrollTrigger.create({
        trigger: stageRef.current,
        start: 'top top',
        onEnter: () => {
          if (phase === 'act1' && !isLocked && !isTransitioning) {
            isLocked = true
            lockScroll(true)
          }
        }
      })

      let stBottom = ScrollTrigger.create({
        trigger: stageRef.current,
        start: 'bottom bottom',
        onEnterBack: () => {
          if (phase === 'act3' && !isLocked && !isTransitioning) {
            isLocked = true
            lockScroll(true)
          }
        }
      })

      const handleForward = () => {
        if (!isLocked) return
        if (phase === 'act1' && !isTransitioning && performance.now() > cooldownRef.current) {
          void goToAct3()
        }
      }

      const handleBackward = () => {
        if (!isLocked) return
        if (phase === 'act3' && !isTransitioning && performance.now() > cooldownRef.current) {
          void goToAct1()
        }
      }

      const onWheel = (e: WheelEvent) => {
        if (!isLocked) return
        if (e.deltaY > 0) {
          if (phase === 'act3' && !isTransitioning) { release(); return; }
        } else if (e.deltaY < 0) {
          if (phase === 'act1' && !isTransitioning) { release(); return; }
        }
        e.preventDefault()
        if (e.deltaY > 0) handleForward()
        else if (e.deltaY < 0) handleBackward()
      }

      const downKeys = ['ArrowDown', 'PageDown', ' ', 'Spacebar']
      const upKeys   = ['ArrowUp', 'PageUp']
      const onKey = (e: KeyboardEvent) => {
        if (!isLocked) return
        const down = downKeys.includes(e.key)
        const up   = upKeys.includes(e.key)
        if (!down && !up) return
        if (down && phase === 'act3' && !isTransitioning) { release(); return; }
        if (up && phase === 'act1' && !isTransitioning) { release(); return; }
        e.preventDefault()
        if (down) handleForward()
        else if (up) handleBackward()
      }

      let touchY = 0
      const onTouchStart = (e: TouchEvent) => {
        if (!isLocked) return
        touchY = e.touches[0].clientY
      }
      const onTouchMove = (e: TouchEvent) => {
        if (!isLocked) return
        e.preventDefault()
      }
      const onTouchEnd = (e: TouchEvent) => {
        if (!isLocked) return
        const endY = e.changedTouches[0] ? e.changedTouches[0].clientY : touchY
        const dy   = touchY - endY
        if (dy > 30) {
          if (phase === 'act3' && !isTransitioning) { release(); return; }
          handleForward()
        } else if (dy < -30) {
          if (phase === 'act1' && !isTransitioning) { release(); return; }
          handleBackward()
        }
      }

      window.addEventListener('wheel',      onWheel,     { passive: false })
      window.addEventListener('keydown',    onKey)
      window.addEventListener('touchstart', onTouchStart, { passive: true })
      window.addEventListener('touchmove',  onTouchMove,  { passive: false })
      window.addEventListener('touchend',   onTouchEnd,   { passive: true })
"""

content = re.sub(old_phase_logic, new_phase_logic, content, flags=re.DOTALL)


# Replace event listener cleanups
content = content.replace("stGate.kill()", "stTop.kill()\n        stBottom.kill()")
content = content.replace("window.removeEventListener('wheel', preventDefault)", """window.removeEventListener('wheel',      onWheel)
        window.removeEventListener('keydown',    onKey)
        window.removeEventListener('touchstart', onTouchStart)
        window.removeEventListener('touchmove',  onTouchMove)
        window.removeEventListener('touchend',   onTouchEnd)""")

# Replace the GSAP dependencies
content = content.replace("    { scope: root },", "    { dependencies: [isMobile], scope: root },")

# Replace the JSX for the videos and images
old_media = """        {/* z-0 — vídeo: frame 0 = frasco antigo, frame final = frasco novo */}
        <video
          ref={videoRef}
          muted playsInline preload="auto"
          poster="/heritage/desktop/morph-aminosan-1-antigo.png"
          aria-label={t('videoAlt')}
          className="absolute inset-0 z-0 h-full w-full object-cover"
        >
          <source src="/heritage/desktop/morph-aminosan.mp4" type="video/mp4" />
        </video>

        {/* z-0 — vídeo reverso: frame 0 = frasco novo, frame final = frasco antigo */}
        <video
          ref={videoRevRef}
          muted playsInline preload="auto"
          aria-hidden="true"
          className="absolute inset-0 z-0 h-full w-full object-cover opacity-0"
        >
          <source src="/heritage/desktop/morph-aminosan-reverse.mp4" type="video/mp4" />
        </video>

        {/* z-10 — foto estática do frasco antigo; some quando o morph começa */}
        <Image
          ref={oldImgRef}
          src="/heritage/desktop/morph-aminosan-1-antigo.png"
          alt={t('oldBottleAlt')}
          fill sizes="100vw"
          className="absolute inset-0 z-10 object-cover"
          priority
        />

        {/* z-10 — foto estática do frasco novo; aparece no final do vídeo para melhor resolução */}
        <Image
          ref={newImgRef}
          src="/heritage/desktop/morph-aminosan-2-novo.png"
          alt={t('newBottleAlt')}
          fill sizes="100vw"
          className="absolute inset-0 z-10 object-cover pointer-events-none"
          priority
        />"""

new_media = """        {/* Desktop Videos */}
        <video
          ref={isMobile ? null : videoFwdDesktopRef}
          muted playsInline preload="auto"
          poster="/heritage/desktop/morph-aminosan-1-antigo.png"
          aria-label={t('videoAlt')}
          className="absolute inset-0 z-0 h-full w-full object-cover hidden lg:block"
        >
          <source src="/heritage/desktop/morph-aminosan.mp4" type="video/mp4" />
        </video>
        <video
          ref={isMobile ? null : videoRevDesktopRef}
          muted playsInline preload="auto"
          aria-hidden="true"
          className="absolute inset-0 z-0 h-full w-full object-cover opacity-0 hidden lg:block"
        >
          <source src="/heritage/desktop/morph-aminosan-reverse.mp4" type="video/mp4" />
        </video>

        {/* Mobile Videos */}
        <video
          ref={isMobile ? videoFwdMobileRef : null}
          muted playsInline preload="auto"
          poster="/heritage/mobile/morph-aminosan-1-antigo.png"
          aria-label={t('videoAlt')}
          className="absolute inset-0 z-0 h-full w-full object-cover block lg:hidden"
        >
          <source src="/heritage/mobile/morph-aminosan.mp4" type="video/mp4" />
        </video>
        <video
          ref={isMobile ? videoRevMobileRef : null}
          muted playsInline preload="auto"
          aria-hidden="true"
          className="absolute inset-0 z-0 h-full w-full object-cover opacity-0 block lg:hidden"
        >
          <source src="/heritage/mobile/morph-aminosan-reverse.mp4" type="video/mp4" />
        </video>

        {/* z-10 — foto estática do frasco antigo */}
        <Image
          ref={oldImgRef}
          src={isMobile ? "/heritage/mobile/morph-aminosan-1-antigo.png" : "/heritage/desktop/morph-aminosan-1-antigo.png"}
          alt={t('oldBottleAlt')}
          fill sizes="100vw"
          className="absolute inset-0 z-10 object-cover"
          priority
        />

        {/* z-10 — foto estática do frasco novo */}
        <Image
          ref={newImgRef}
          src={isMobile ? "/heritage/mobile/morph-aminosan-2-novo.png" : "/heritage/desktop/morph-aminosan-2-novo.png"}
          alt={t('newBottleAlt')}
          fill sizes="100vw"
          className="absolute inset-0 z-10 object-cover pointer-events-none opacity-0"
          priority
        />"""

content = content.replace(old_media, new_media)

with open(r'c:\projeto-juma\src\features\home\components\AminosanStory.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
