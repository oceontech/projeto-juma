'use client'

import { CheckCircle2 } from 'lucide-react'

import React, { useRef, useState, useEffect } from 'react'
import { motion, useAnimate } from 'motion/react'
import { gsap, SplitText } from '@/features/animation/gsap'
import { DUR, EASE, STAGGER } from '@/features/animation/motion'
import { useReducedMotion } from '@/features/animation/useReducedMotion'
import { useGSAP } from '@/features/animation/gsap'
import { Container } from '@/components/layout/Container'
import { useTranslations } from 'next-intl'

const TESTIMONIALS = [0, 1, 2]

type TestimonialData = {
  text: string;
  badge: string;
  initials: string;
  name: string;
  location: string;
  image?: string;
};

export function HomeTestimonials() {
  const t = useTranslations('homeTestimonials');
  const reduced = useReducedMotion()
  const ref = useRef<HTMLElement>(null)

  useGSAP(() => {
    if (reduced || !ref.current) return
    
    const header = ref.current.querySelector<HTMLElement>('[data-header]')
    let split: SplitText | null = null;
    if (header) {
      const kicker = header.querySelector<HTMLElement>('[data-kicker]')
      const title = header.querySelector<HTMLElement>('[data-title]')
      const line = header.querySelector<HTMLElement>('[data-gline]')

      split = title ? new SplitText(title, { type: 'chars,words' }) : null

      if (kicker) gsap.set(kicker, { y: 14, opacity: 0 })
      if (split) gsap.set(split.chars, { x: 20, opacity: 0, filter: 'blur(10px)' })
      if (line) gsap.set(line, { scaleX: 0, opacity: 0, transformOrigin: 'left center' })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: header,
          start: 'top 85%',
          end: 'bottom 15%',
          toggleActions: 'play reverse play reverse',
        },
        defaults: { ease: EASE.reveal }
      })
      if (kicker) tl.to(kicker, { y: 0, opacity: 1, duration: DUR.sub })
      if (split) tl.to(split.chars, { x: 0, opacity: 1, filter: 'blur(0px)', duration: DUR.title, stagger: STAGGER.char }, '-=0.4')
      if (line) tl.to(line, { scaleX: 1, opacity: 1, duration: DUR.sub }, '-=0.4')
    }
    
    return () => split?.revert()
  }, { scope: ref })

  const unsplashImages = [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=100&h=100&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?fit=crop&w=100&h=100&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?fit=crop&w=100&h=100&q=80"
  ];

  const testimonialsData: TestimonialData[] = TESTIMONIALS.map(i => ({
    text: t(`testimonials.${i}.text` as any),
    badge: t(`testimonials.${i}.badge` as any),
    initials: t(`testimonials.${i}.initials` as any),
    name: t(`testimonials.${i}.name` as any),
    location: t(`testimonials.${i}.location` as any),
    image: unsplashImages[i]
  }));

  return (
    <section
      ref={ref}
      style={{ backgroundColor: '#F2F6F2', paddingBlock: 'clamp(80px,8vw,120px)' }}
    >
      <Container>
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div data-header>
            <div className="mb-8" data-kicker>
              <span className="inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.08em] uppercase rounded-full px-4 py-2 border border-[#004B26]/20 bg-[#004B26]/5 text-[#004B26]">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-[#004B26]" />
                {t('kicker')}
              </span>
            </div>
            <h2
              data-title
              className="font-black uppercase leading-[1.05] tracking-tight"
              style={{ color: '#0F1A0A', fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}
            >
              <span dangerouslySetInnerHTML={{ __html: t('titlePart1') }} /><span className="text-[#004B26] text-highlight inline-block">{t('titleHighlight')}</span>
            </h2>
            <span data-gline aria-hidden className="mt-8 block h-[3px] w-12 rounded-full bg-[#004B26]" />
          </div>
          <p className="max-w-[38ch] text-[17px] leading-[1.6]" style={{ color: '#3d4d35' }}>
            {t('desc')}
          </p>
        </div>

        {/* Cards */}
        <div 
          className="flex justify-center gap-6 overflow-hidden h-[500px] md:h-[600px] lg:h-[700px]" 
          style={{ maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)' }}
        >
          <TestimonialsColumn testimonials={testimonialsData} duration={25} className="w-full md:w-1/2 lg:w-1/3" />
          <TestimonialsColumn testimonials={testimonialsData} duration={35} className="hidden md:block md:w-1/2 lg:w-1/3" />
          <TestimonialsColumn testimonials={testimonialsData} duration={45} className="hidden lg:block lg:w-1/3" />
        </div>
      </Container>
    </section>
  )
}

export const TestimonialsColumn = (props: {
  className?: string;
  testimonials: TestimonialData[];
  duration?: number;
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [scope, animate] = useAnimate();
  const controlsRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scope.current) return;
    controlsRef.current = animate(scope.current, { translateY: ["0%", "-50%"] }, {
      duration: props.duration || 10,
      repeat: Infinity,
      ease: "linear",
    });
    return () => controlsRef.current?.stop();
  }, [animate, scope, props.duration]);

  useEffect(() => {
    if (hoveredIdx !== null) {
      controlsRef.current?.pause();
    } else {
      controlsRef.current?.play();
    }
  }, [hoveredIdx]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setHoveredIdx(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const items = [...props.testimonials, ...props.testimonials, ...props.testimonials];

  return (
    <div className={props.className} ref={containerRef}>
      <div
        ref={scope}
        className="flex flex-col gap-6 pb-6"
      >
        {items.map((item, idx) => {
          const isHovered = hoveredIdx === idx;
          const isAnyHovered = hoveredIdx !== null;
          
          return (
            <article
              key={idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              onClick={() => {
                if (hoveredIdx === idx) setHoveredIdx(null);
                else setHoveredIdx(idx);
              }}
              className={`rounded-[24px] p-7 flex flex-col gap-3 w-full shrink-0 transition-all duration-500 cursor-pointer ${
                isHovered 
                  ? 'scale-[1.03] shadow-2xl z-10 opacity-100' 
                  : isAnyHovered 
                    ? 'scale-[0.98] opacity-50 shadow-sm z-0' 
                    : 'scale-100 opacity-100 hover:scale-[1.02]'
              }`}
              style={{ backgroundColor: '#fff', border: '1px solid rgba(0,0,0,.07)' }}
            >
              <div
                className="text-[80px] leading-none font-black select-none"
                style={{ color: '#DDE6C8', lineHeight: 0.5 }}
                aria-hidden
              >
                "
              </div>
              <span
                className="absolute -top-4 right-8 inline-block text-[12px] font-bold tracking-[0.06em] uppercase rounded-full px-3 py-1.5 w-fit"
                style={{ backgroundColor: '#E8EFE2', color: '#004B26' }}
              >
                {item.badge}
              </span>
              <p className="text-[16px] leading-[1.65] flex-1 p-0 m-0 mb-6" style={{ color: '#1a2a12' }}>
                {item.text}
              </p>
              <div className="flex items-center gap-3 pt-2" style={{ borderTop: '1px solid rgba(0,0,0,.06)' }}>
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-[14px]"
                    style={{ backgroundColor: '#004B26', color: '#F0E27A' }}
                  >
                    {item.initials}
                  </div>
                )}
                <div>
                  <div className="text-[14px] text-subtitle font-bold" style={{ color: '#0F1A0A' }}>{item.name}</div>
                  <div className="text-[12px]" style={{ color: '#7a8f6e' }}>{item.location}</div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
