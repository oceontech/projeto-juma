import re

with open(r'c:\projeto-juma\src\features\home\components\AminosanStory.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_logic = r"""      type Phase = 'act1' \| 'act3'
      let phase: Phase = 'act1'
      let isTransitioning = false
      let isLocked = false
      const cooldownRef = \{ current: 0 \}

      const release = \(\) => \{.*?window\.addEventListener\('touchend',   onTouchEnd,   \{ passive: true \}\)"""

new_logic = """      type Phase = 'act1' | 'act3'
      let phase: Phase = 'act1'
      let direction: 'forward' | 'backward' | null = null
      let isLocked = false
      let animFrame: number | null = null
      const cooldownRef = { current: 0 }

      const release = () => {
        isLocked = false
        lockScroll(false)
      }

      const syncVideos = (source: HTMLVideoElement, target: HTMLVideoElement) => {
        const sourceDur = (source.duration > 0 && isFinite(source.duration)) ? source.duration : 3;
        const targetDur = (target.duration > 0 && isFinite(target.duration)) ? target.duration : 3;
        const progress = source.currentTime / sourceDur;
        try { target.currentTime = targetDur - (progress * targetDur) } catch(e) {}
      }

      const stopPlayback = () => {
        if (animFrame) cancelAnimationFrame(animFrame)
        direction = null
        if (phase === 'act3') {
           gsap.set(videoFwd, { autoAlpha: 1 })
           gsap.set(videoRev, { autoAlpha: 0 })
           gsap.set(newImgRef.current, { autoAlpha: 1 })
           gsap.set(oldImg, { autoAlpha: 0 })
           try { videoRev.currentTime = 0 } catch(e) {}
        } else {
           gsap.set(videoFwd, { autoAlpha: 0 })
           gsap.set(videoRev, { autoAlpha: 1 })
           gsap.set(newImgRef.current, { autoAlpha: 0 })
           gsap.set(oldImg, { autoAlpha: 1 })
           try { videoFwd.currentTime = 0 } catch(e) {}
        }
        cooldownRef.current = performance.now() + 300
      }

      const tick = () => {
        if (!direction) return
        if (direction === 'forward') {
          if (videoFwd.currentTime >= ((videoFwd.duration > 0 && isFinite(videoFwd.duration)) ? videoFwd.duration : 3) - 0.1) {
            videoFwd.pause()
            phase = 'act3'
            stopPlayback()
            return
          }
        } else {
          if (videoRev.currentTime >= ((videoRev.duration > 0 && isFinite(videoRev.duration)) ? videoRev.duration : 3) - 0.1) {
            videoRev.pause()
            phase = 'act1'
            stopPlayback()
            return
          }
        }
        animFrame = requestAnimationFrame(tick)
      }

      const startPlayback = (dir: 'forward' | 'backward') => {
        if (animFrame) cancelAnimationFrame(animFrame)
        const oldDir = direction
        direction = dir
        
        const fwdDur = (videoFwd.duration > 0 && isFinite(videoFwd.duration)) ? videoFwd.duration : 3;
        
        if (dir === 'forward') {
          if (oldDir === 'backward' || phase === 'act1') {
            syncVideos(videoRev, videoFwd)
            videoRev.pause()
          }
          gsap.set(videoFwd, { zIndex: 1, autoAlpha: 1 })
          gsap.set(videoRev, { zIndex: 0, autoAlpha: 0 })
          gsap.set(oldImg, { autoAlpha: 0 })
          gsap.set(newImgRef.current, { autoAlpha: 0 })
          
          videoFwd.play().catch(() => {})
          
          gsap.to(titleChars, { x: 20, autoAlpha: 0, filter: 'blur(10px)', duration: fwdDur * 0.4, stagger: STAGGER.char, ease: 'power1.inOut', overwrite: 'auto' })
          gsap.to(act1Items, { y: 14, autoAlpha: 0, duration: fwdDur * 0.4, stagger: 0.05, ease: 'power1.inOut', overwrite: 'auto' })
          gsap.to(calloutLine, { scaleY: 0, duration: fwdDur * 0.3, ease: 'power1.inOut', overwrite: 'auto' })
          gsap.to(calloutLabel, { autoAlpha: 0, duration: fwdDur * 0.3, ease: 'power1.inOut', overwrite: 'auto' })
          gsap.to(scrimRef.current, { autoAlpha: 0, duration: fwdDur * 0.8, ease: 'power1.inOut', overwrite: 'auto' })
          
          showAct3UI(fwdDur * 0.4)
          
        } else {
          if (oldDir === 'forward' || phase === 'act3') {
            syncVideos(videoFwd, videoRev)
            videoFwd.pause()
          }
          gsap.set(videoRev, { zIndex: 1, autoAlpha: 1 })
          gsap.set(videoFwd, { zIndex: 0, autoAlpha: 0 })
          gsap.set(oldImg, { autoAlpha: 0 })
          gsap.set(newImgRef.current, { autoAlpha: 0 })
          
          videoRev.play().catch(() => {})
          
          hideAct3UI(0)
          
          gsap.to(titleChars, { x: 0, autoAlpha: 1, filter: 'blur(0px)', duration: fwdDur * 0.4, stagger: STAGGER.char, ease: 'power1.inOut', overwrite: 'auto' })
          gsap.to(act1Items, { y: 0, autoAlpha: 1, duration: fwdDur * 0.4, stagger: 0.05, ease: 'power1.inOut', overwrite: 'auto' })
          gsap.to(calloutLine, { scaleY: 1, duration: fwdDur * 0.3, ease: 'power1.inOut', overwrite: 'auto' })
          gsap.to(calloutLabel, { autoAlpha: 1, duration: fwdDur * 0.3, ease: 'power1.inOut', overwrite: 'auto' })
          gsap.to(scrimRef.current, { autoAlpha: 1, duration: fwdDur * 0.8, ease: 'power1.inOut', overwrite: 'auto' })
        }
        
        animFrame = requestAnimationFrame(tick)
      }

      let stTop = ScrollTrigger.create({
        trigger: stageRef.current,
        start: 'top top',
        onEnter: () => {
          if (phase === 'act1' && !isLocked && direction !== 'forward') {
            isLocked = true
            lockScroll(true)
          }
        }
      })

      let stBottom = ScrollTrigger.create({
        trigger: stageRef.current,
        start: 'bottom bottom',
        onEnterBack: () => {
          if (phase === 'act3' && !isLocked && direction !== 'backward') {
            isLocked = true
            lockScroll(true)
          }
        }
      })

      const handleForward = () => {
        if (!isLocked) return
        if (direction === 'backward') {
          startPlayback('forward')
        } else if (phase === 'act1' && direction !== 'forward' && performance.now() > cooldownRef.current) {
          startPlayback('forward')
        }
      }

      const handleBackward = () => {
        if (!isLocked) return
        if (direction === 'forward') {
          startPlayback('backward')
        } else if (phase === 'act3' && direction !== 'backward' && performance.now() > cooldownRef.current) {
          startPlayback('backward')
        }
      }

      const onWheel = (e: WheelEvent) => {
        if (!isLocked) return
        if (e.deltaY > 0) {
          if (phase === 'act3' && direction !== 'backward') { release(); return; }
        } else if (e.deltaY < 0) {
          if (phase === 'act1' && direction !== 'forward') { release(); return; }
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
        if (down && phase === 'act3' && direction !== 'backward') { release(); return; }
        if (up && phase === 'act1' && direction !== 'forward') { release(); return; }
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
          if (phase === 'act3' && direction !== 'backward') { release(); return; }
          handleForward()
        } else if (dy < -30) {
          if (phase === 'act1' && direction !== 'forward') { release(); return; }
          handleBackward()
        }
      }

      window.addEventListener('wheel',      onWheel,     { passive: false })
      window.addEventListener('keydown',    onKey)
      window.addEventListener('touchstart', onTouchStart, { passive: true })
      window.addEventListener('touchmove',  onTouchMove,  { passive: false })
      window.addEventListener('touchend',   onTouchEnd,   { passive: true })"""

content = re.sub(old_logic, new_logic, content, flags=re.DOTALL)

with open(r'c:\projeto-juma\src\features\home\components\AminosanStory.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
