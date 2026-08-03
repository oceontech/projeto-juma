'use client'

// Calculadora de ganho por cultura — removida de circulação em 2026-08-03 (dados de
// ganho/hectare ainda não confirmados no briefing). Componente preservado aqui,
// pronto para ser reimportado e renderizado dentro de CulturePage.tsx quando os
// dados estiverem corretos.

import { useState, useCallback, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { DropdownMenu } from '@/components/ui/dropdown-menu'
import type { CultureData } from './CulturePage'

export function CultureCalculator({ culture }: { culture: CultureData }) {
  const tPage = useTranslations('culturePage')
  const initialPrecoStr = culture.name === 'Café' ? '128000' : '10000'
  const initialProdutividadeStr = culture.name === 'Café' ? '3000' : '6000'

  const [produto, setProduto] = useState(culture.calcProducts[0].id)
  const [areaStr, setAreaStr] = useState('5000')
  const [precoStr, setPrecoStr] = useState(initialPrecoStr)
  const [produtividadeStr, setProdutividadeStr] = useState(initialProdutividadeStr)

  const selectedProduct = culture.calcProducts.find((p) => p.id === produto) ?? culture.calcProducts[0]

  const validArea = useMemo(() => {
    const num = Number(areaStr) / 100
    return isNaN(num) ? 0 : num
  }, [areaStr])

  const validPreco = useMemo(() => {
    const num = Number(precoStr) / 100
    return isNaN(num) ? 0 : num
  }, [precoStr])

  const validProdutividade = useMemo(() => {
    const num = Number(produtividadeStr) / 100
    return isNaN(num) ? 0 : num
  }, [produtividadeStr])

  const sacasExtras = Math.round(validArea * selectedProduct.gainPerHa)
  const receitaExtra = sacasExtras * validPreco

  const fmt = useCallback((n: number) => new Intl.NumberFormat('pt-BR').format(n), [])

  const areaDisplay = validArea.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const precoDisplay = tPage('calcCurrency') + ' ' + validPreco.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const produtividadeDisplay = validProdutividade.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const handleAreaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '')
    setAreaStr(digits)
  }

  const handlePrecoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '')
    setPrecoStr(digits)
  }

  const handleProdutividadeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '')
    setProdutividadeStr(digits)
  }

  return (
    <div
      className="grid md:grid-cols-[1.05fr_1fr] bg-white border border-black/10 rounded-[24px] overflow-hidden"
      style={{ boxShadow: '0 1px 2px rgba(20,30,20,.04), 0 12px 32px -18px rgba(20,30,20,.18)' }}
    >
      {/* Form */}
      <div className="p-[clamp(28px,3vw,48px)]">
        <div className="flex flex-col gap-2 mb-[18px]">
          <label className="text-[12px] text-[#5A5A57] font-semibold uppercase tracking-[0.05em]">
            {tPage('calcProductLabel')}
          </label>
          <DropdownMenu
            className="w-full"
            triggerClassName="w-full h-[50px] px-4 rounded-[12px] border border-black/10 bg-white text-[16px] text-[#1A1A1A] font-medium"
            menuClassName="w-full"
            options={culture.calcProducts.map((p) => ({
              label: p.label,
              active: produto === p.id,
              onClick: () => setProduto(p.id)
            }))}
          >
            {culture.calcProducts.find(p => p.id === produto)?.label || tPage('calcSelect')}
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-2 gap-3.5 mb-[18px]">
          <div className="flex flex-col gap-2">
            <label className="text-[12px] text-[#5A5A57] font-semibold uppercase tracking-[0.05em]">
              {tPage('calcAreaLabel')}
            </label>
            <input
              type="text"
              value={areaDisplay}
              onChange={handleAreaChange}
              className="h-[50px] px-4 rounded-[12px] border border-black/10 bg-white text-[16px] text-[#1A1A1A] font-[inherit] outline-none focus:border-[#004B26] transition-colors"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[12px] text-[#5A5A57] font-semibold uppercase tracking-[0.05em]">
              {tPage('calcPriceLabel')}
            </label>
            <input
              type="text"
              value={precoDisplay}
              onChange={handlePrecoChange}
              className="h-[50px] px-4 rounded-[12px] border border-black/10 bg-white text-[16px] text-[#1A1A1A] font-[inherit] outline-none focus:border-[#004B26] transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 mb-3">
          <label className="text-[12px] text-[#5A5A57] font-semibold uppercase tracking-[0.05em]">
            {tPage('calcYieldLabel')}
          </label>
          <input
            type="text"
            value={produtividadeDisplay}
            onChange={handleProdutividadeChange}
            className="h-[50px] px-4 rounded-[12px] border border-black/10 bg-white text-[16px] text-[#1A1A1A] font-[inherit] outline-none focus:border-[#004B26] transition-colors"
          />
        </div>
        <p className="text-[12px] text-[#7C7C78] leading-[1.4] m-0">
          {tPage('calcFormLede')}
        </p>
      </div>

      {/* Result panel */}
      <div
        className="relative flex flex-col justify-between p-[clamp(28px,3vw,48px)] text-white overflow-hidden"
        style={{ backgroundColor: '#004B26' }}
      >
        <div
          className="absolute pointer-events-none"
          style={{
            inset: '-40% -10% auto auto',
            width: '80%',
            height: '80%',
            background: 'radial-gradient(circle, rgba(240,226,122,.16), transparent 70%)',
          }}
        />
        <div className="relative">
          <div className="text-[12px] font-semibold uppercase tracking-[0.16em] text-white/60 mb-3">
            {tPage('calcExtraBags')}
          </div>
          <div
            className="text-[#F0E27A] leading-[1.0] font-[740] tracking-[-0.035em]"
            style={{ fontSize: 'clamp(48px,5.2vw,84px)', fontFeatureSettings: '"tnum"' }}
          >
            {fmt(sacasExtras)}
            <small className="text-[0.4em] font-semibold text-white/55 ml-2">{tPage('calcBagsUnit')}</small>
          </div>
          <div className="text-[15px] text-white/78 mt-2">
            {tPage.rich('calcGainAverage', { gain: selectedProduct.gainPerHa, strong: (chunks) => <strong className="text-white">{chunks}</strong> })}
          </div>

          <hr className="border-none border-t border-white/[0.18] my-7" />

          <div className="text-[12px] font-semibold uppercase tracking-[0.16em] text-white/60 mb-3">
            {tPage('calcExtraRev')}
          </div>
          <div
            className="text-white leading-[1.0] font-[740] tracking-[-0.035em]"
            style={{ fontSize: 'clamp(32px,3.6vw,56px)', fontFeatureSettings: '"tnum"' }}
          >
            {tPage('calcCurrency')} {fmt(receitaExtra)}
          </div>
          <div className="text-[15px] text-white/78 mt-2">
            {tPage('calcBasePrice')}
          </div>
        </div>

        <div className="relative text-[12px] text-white/50 mt-8 pt-6 border-t border-white/[0.12]">
          {tPage('calcDisclaimer')}
        </div>
      </div>
    </div>
  )
}
