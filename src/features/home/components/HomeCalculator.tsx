'use client'

import { useState, useMemo } from 'react'
import { Container } from '@/components/layout/Container'

type Culture = { id: string; label: string }
type Product = { id: string; label: string; gainPerHa: number; unit: string }

const CULTURES: Culture[] = [
  { id: 'soja', label: 'Soja' },
  { id: 'milho', label: 'Milho' },
  { id: 'cafe', label: 'Café' },
  { id: 'cana', label: 'Cana-de-açúcar' },
  { id: 'citros', label: 'Citros' },
  { id: 'tomate', label: 'Tomate' },
]

const PRODUCTS: Product[] = [
  { id: 'aminosan',     label: 'Aminosan',         gainPerHa: 14,   unit: 'sc/ha' },
  { id: 'acorda-ultra', label: 'Acorda Ultra',     gainPerHa: 13.4, unit: 'sc/ha' },
  { id: 'acorda-cana',  label: 'Acorda Cana',      gainPerHa: 6.87, unit: 't/ha'  },
  { id: 'revigophos',   label: 'RevigoPhos Amino', gainPerHa: 8,    unit: 'sc/ha' },
  { id: 'fitofert',     label: 'Fitofert',         gainPerHa: 7,    unit: 'sc/ha' },
  { id: 'supermix',     label: 'Supermix',         gainPerHa: 9.5,  unit: 'sc/ha' },
]

function fmt(n: number): string {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function fmtR(n: number): string {
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export function HomeCalculator() {
  const [cultura, setCultura] = useState('soja')
  const [produtoId, setProdutoId] = useState('aminosan')
  const [area, setArea] = useState(500)
  const [preco, setPreco] = useState(135)

  const produto = useMemo(() => PRODUCTS.find((p) => p.id === produtoId) ?? PRODUCTS[0], [produtoId])
  const sacasExtras = useMemo(() => Math.round(area * produto.gainPerHa), [area, produto])
  const receitaExtra = useMemo(() => sacasExtras * preco, [sacasExtras, preco])

  return (
    <section
      id="calc"
      style={{ backgroundColor: '#F2F6F2', paddingBlock: 'clamp(80px,8vw,120px)' }}
    >
      <Container>
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <span
              className="inline-flex items-center gap-2 text-[13px] font-medium tracking-[0.08em] uppercase border rounded-full px-4 py-2 mb-5"
              style={{ borderColor: 'rgba(0,0,0,.15)', color: '#004B26' }}
            >
              <span className="w-[6px] h-[6px] rounded-full bg-[#004B26] inline-block" />
              Calcule seu ganho
            </span>
            <h2
              className="font-black text-[clamp(32px,4vw,52px)] leading-[1.05] tracking-[-0.02em]"
              style={{ color: '#0F1A0A' }}
            >
              Quanto a Juma pode<br />render no seu campo?
            </h2>
          </div>
          <p className="max-w-[40ch] text-[17px] leading-[1.6]" style={{ color: '#3d4d35' }}>
            Simule em segundos o ganho potencial em sacas e receita extra com base em dados médios de campo.
          </p>
        </div>

        {/* Grade formulário + resultado */}
        <div className="grid lg:grid-cols-[1fr_400px] gap-4">
          {/* Formulário */}
          <div
            className="rounded-[24px] p-8 flex flex-col gap-6"
            style={{ backgroundColor: '#fff', border: '1px solid rgba(0,0,0,.07)' }}
          >
            <div className="grid sm:grid-cols-2 gap-5">
              {/* Cultura */}
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-semibold tracking-[0.05em] uppercase" style={{ color: '#3d4d35' }}>
                  Cultura
                </label>
                <select
                  value={cultura}
                  onChange={(e) => setCultura(e.target.value)}
                  className="w-full rounded-[12px] px-4 py-3 text-[15px] font-medium outline-none appearance-none"
                  style={{ backgroundColor: '#F2F6F2', border: '1.5px solid #DDE6C8', color: '#0F1A0A' }}
                >
                  {CULTURES.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Produto */}
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-semibold tracking-[0.05em] uppercase" style={{ color: '#3d4d35' }}>
                  Produto Juma
                </label>
                <select
                  value={produtoId}
                  onChange={(e) => setProdutoId(e.target.value)}
                  className="w-full rounded-[12px] px-4 py-3 text-[15px] font-medium outline-none appearance-none"
                  style={{ backgroundColor: '#F2F6F2', border: '1.5px solid #DDE6C8', color: '#0F1A0A' }}
                >
                  {PRODUCTS.map((p) => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              {/* Área */}
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-semibold tracking-[0.05em] uppercase" style={{ color: '#3d4d35' }}>
                  Área (ha)
                </label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={area}
                  onChange={(e) => setArea(Math.max(1, Number(e.target.value)))}
                  className="w-full rounded-[12px] px-4 py-3 text-[15px] font-medium outline-none"
                  style={{ backgroundColor: '#F2F6F2', border: '1.5px solid #DDE6C8', color: '#0F1A0A' }}
                />
              </div>

              {/* Preço */}
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-semibold tracking-[0.05em] uppercase" style={{ color: '#3d4d35' }}>
                  Preço da saca (R$)
                </label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={preco}
                  onChange={(e) => setPreco(Math.max(1, Number(e.target.value)))}
                  className="w-full rounded-[12px] px-4 py-3 text-[15px] font-medium outline-none"
                  style={{ backgroundColor: '#F2F6F2', border: '1.5px solid #DDE6C8', color: '#0F1A0A' }}
                />
              </div>
            </div>

            <p className="text-[13px] leading-[1.6]" style={{ color: '#7a8f6e' }}>
              Os valores são estimativas. Para um plano sob medida para a sua fazenda, fale com um técnico Juma.
            </p>
          </div>

          {/* Painel resultado */}
          <div
            className="rounded-[24px] p-8 flex flex-col justify-between relative overflow-hidden"
            style={{ backgroundColor: '#004B26' }}
          >
            {/* Decoração radial */}
            <div
              className="absolute -top-20 -right-20 w-[280px] h-[280px] rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(240,226,122,.12) 0%, transparent 70%)' }}
            />

            <div className="relative z-10 flex flex-col gap-8">
              {/* Sacas extras */}
              <div>
                <p className="text-[12px] font-semibold tracking-[0.08em] uppercase mb-3" style={{ color: 'rgba(255,255,255,.55)' }}>
                  Sacas extras estimadas
                </p>
                <div
                  className="font-black leading-none tracking-[-0.03em]"
                  style={{ fontSize: 'clamp(52px,6vw,80px)', color: '#F0E27A' }}
                >
                  {fmt(sacasExtras)}
                  <span className="text-[0.36em] font-bold ml-2 align-baseline" style={{ color: 'rgba(240,226,122,.55)' }}>
                    {produto.unit}
                  </span>
                </div>
                <p className="text-[13px] mt-2" style={{ color: 'rgba(255,255,255,.55)' }}>
                  Ganho médio de +{produto.gainPerHa.toLocaleString('pt-BR')} {produto.unit} com {produto.label} · projetado para {fmt(area)} ha.
                </p>
              </div>

              <hr style={{ borderColor: 'rgba(255,255,255,.12)' }} />

              {/* Receita extra */}
              <div>
                <p className="text-[12px] font-semibold tracking-[0.08em] uppercase mb-3" style={{ color: 'rgba(255,255,255,.55)' }}>
                  Receita extra estimada
                </p>
                <div className="font-black leading-none text-white tracking-[-0.02em]" style={{ fontSize: 'clamp(28px,3vw,40px)' }}>
                  {fmtR(receitaExtra)}
                </div>
                <p className="text-[13px] mt-2" style={{ color: 'rgba(255,255,255,.55)' }}>
                  Com base no preço médio da saca informado.
                </p>
              </div>
            </div>

            <p className="relative z-10 text-[12px] leading-[1.55] mt-6" style={{ color: 'rgba(255,255,255,.38)' }}>
              Estimativa baseada em dados médios de campo. Resultados reais variam conforme cultivar, manejo, solo e clima.
            </p>
          </div>
        </div>
      </Container>
    </section>
  )
}
