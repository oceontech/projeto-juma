/**
 * Portões do véu de carregamento.
 *
 * O véu cobre a tela, mostra a marca, deixa a página nova montar por trás e só
 * sai quando o trabalho pesado assentou. Quem faz esse trabalho e quem anima a
 * entrada da página precisa saber em que ponto da sequência o véu está, sem
 * context nem re-render. Por isso os portões são promises rearmáveis de módulo.
 *
 *   covered   a página nova já montou atrás do véu opaco. Componentes pesados
 *             (SplitText em massa, WebGL, amostragem de imagem) esperam este
 *             portão antes de começar: rodar durante a montagem da marca a
 *             travaria.
 *   prepared  registro de trabalho pesado. O véu só sai depois que tudo assenta.
 *   booted    o véu começou a sair. Animações de entrada esperam este portão para
 *             começar junto com a cortina, e não atrás do véu.
 *
 * Uso típico num componente pesado:
 *     useEffect(() => { prepareAfterCovered(() => montarCenaPesada()) }, [])
 * Entrada de hero: `onPageEntrance(() => tl.play())` (já espera `whenBooted`).
 */

type Gate = { promise: Promise<void>; open: () => void; isOpen: () => boolean }

function createGate(): Gate {
  let resolve!: () => void
  let opened = false
  const promise = new Promise<void>((r) => {
    resolve = r
  })
  return {
    promise,
    open: () => {
      if (opened) return
      opened = true
      resolve()
    },
    isOpen: () => opened,
  }
}

/** Abre tudo sozinho depois disto: rede ruim ou véu quebrado nunca prendem o site. */
const SAFETY_MS = 8000

let covered = createGate()
let booted = createGate()
let registry: Promise<unknown>[] = []
let safetyTimer: ReturnType<typeof setTimeout> | undefined

function armSafety() {
  if (typeof window === 'undefined') return
  clearTimeout(safetyTimer)
  safetyTimer = setTimeout(() => {
    covered.open()
    booted.open()
  }, SAFETY_MS)
}
armSafety()

/** A página nova montou atrás do véu opaco. */
export function markCovered() {
  covered.open()
}
export function whenCovered(): Promise<void> {
  return covered.promise
}

/** O véu começou a sair. Também abre `covered`, para ninguém ficar preso. */
export function markBooted() {
  covered.open()
  booted.open()
  clearTimeout(safetyTimer)
}
export function whenBooted(): Promise<void> {
  return booted.promise
}
export function isBooted(): boolean {
  return booted.isOpen()
}

/**
 * Rearma os portões e zera os registros. Vai ANTES de trocar a rota, para que a
 * página nova se registre nos portões novos.
 *
 * Quem já esperava um portão ainda fechado não fica pendurado: o portão antigo
 * abre junto com o novo.
 */
export function holdBoot() {
  const oldCovered = covered
  const oldBooted = booted
  covered = createGate()
  booted = createGate()
  covered.promise.then(oldCovered.open)
  booted.promise.then(oldBooted.open)
  registry = []
  armSafety()
}

/** Registra trabalho pesado: o véu só sai depois que ele assentar. */
export function prepare<T>(work: Promise<T>): Promise<T> {
  registry.push(work)
  return work
}

/** Atalho: começa `work` só quando a página está coberta e o registra como preparo. */
export function prepareAfterCovered<T>(work: () => T | Promise<T>): Promise<T> {
  return prepare(covered.promise.then(work))
}

/**
 * Espera todo o trabalho registrado assentar (sucesso ou falha). Trabalho
 * registrado enquanto se espera também entra na conta. Com teto de `capMs`.
 */
export async function whenPrepared(capMs = 4000): Promise<void> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const cap = new Promise<void>((resolve) => {
    timer = setTimeout(resolve, capMs)
  })
  const settle = async () => {
    let seen = -1
    while (seen !== registry.length) {
      seen = registry.length
      await Promise.allSettled(registry.slice())
    }
  }
  await Promise.race([settle(), cap])
  clearTimeout(timer)
}
