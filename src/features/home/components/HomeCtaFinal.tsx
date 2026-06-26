import { Container } from '@/components/layout/Container'

export function HomeCtaFinal() {
  return (
    <section
      id="whatsapp"
      style={{ backgroundColor: '#004B26', paddingBlock: 'clamp(80px,8vw,120px)' }}
    >
      <Container>
        <div className="flex flex-col items-center text-center gap-8">
          <span
            className="inline-flex items-center gap-2 text-[13px] font-medium tracking-[0.08em] uppercase border rounded-full px-4 py-2"
            style={{ borderColor: 'rgba(255,255,255,.20)', color: 'rgba(255,255,255,.70)' }}
          >
            <span className="w-[6px] h-[6px] rounded-full bg-[#F0E27A] inline-block" />
            Próximo passo
          </span>

          <h2
            className="font-black text-[clamp(40px,6vw,80px)] leading-[1.02] tracking-[-0.025em] text-white max-w-[14ch]"
          >
            Juntos{' '}
            <em
              className="not-italic"
              style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 400, color: '#F0E27A' }}
            >
              alimentamos
            </em>
            <br />o mundo.
          </h2>

          <p className="text-[18px] leading-[1.6] max-w-[44ch]" style={{ color: 'rgba(255,255,255,.65)' }}>
            Fale com a Juma e descubra a solução certa para a sua cultura, sua região e seu manejo.
          </p>

          <a
            href="https://wa.me/5519999648186"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 font-bold text-[16px] rounded-full px-8 py-4 transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#F0E27A', color: '#1A1A1A' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M21 11.5a8.4 8.4 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.4 8.4 0 01-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.4 8.4 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
            </svg>
            Falar no WhatsApp · (19) 99964-8186
          </a>
        </div>
      </Container>
    </section>
  )
}
