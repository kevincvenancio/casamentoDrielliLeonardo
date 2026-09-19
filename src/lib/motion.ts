/**
 * Motor de rolagem do site.
 *
 * Um unico `requestAnimationFrame` para a pagina inteira, em vez de um por
 * componente. Todo elemento registrado entra numa lista; a cada frame o motor
 * primeiro LE o rect de todos e so depois ESCREVE os estilos. Ler e escrever
 * intercalado forcaria o navegador a recalcular o layout a cada elemento
 * (layout thrashing) -- e isso, num celular modesto, e a diferenca entre
 * rolar liso e rolar aos trancos.
 *
 * O que sai daqui e sempre uma variavel CSS (`--p`, `--enter`). A animacao em
 * si e feita pelo CSS, com `transform` e `opacity`, que a GPU compoe sozinha
 * sem repintar nada.
 *
 * Nada aqui roda no servidor: todos os pontos de entrada sao chamados de
 * dentro de `useEffect`.
 */

export type SceneMode =
  /** 0 quando o topo do elemento toca a base da tela, 1 quando a base dele
   *  passa pelo topo. E o progresso de "atravessar a tela" -- parallax. */
  | "through"
  /** 0 quando o elemento entra na tela, 1 quando termina de entrar. Bom para
   *  quem so precisa saber "o quanto ja apareceu". */
  | "enter"
  /** Progresso dentro de um trecho alto com filho `position: sticky`:
   *  0 quando o topo encosta no topo da tela, 1 quando o fim do trecho
   *  chega la. E o "scrub" das cenas fixas. */
  | "pin";

type Entry = {
  el: HTMLElement;
  mode: SceneMode;
  /** Elemento onde as variaveis sao escritas (por padrao, o proprio `el`). */
  target: HTMLElement;
  onProgress?: (p: number) => void;
  /** Fora da tela nao ha o que atualizar: o observer liga e desliga isto. */
  visible: boolean;
  /** Ultimo valor escrito, para nao mexer no DOM sem necessidade. */
  last: number;
};

const entries = new Set<Entry>();
let frame = 0;
let observer: IntersectionObserver | null = null;
let viewportH = 0;

function clamp01(v: number) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function progressFor(entry: Entry, rect: DOMRect): number {
  const vh = viewportH;

  if (entry.mode === "pin") {
    // O trecho e mais alto que a tela; a distancia util e o que sobra.
    const travel = rect.height - vh;
    if (travel <= 0) return rect.top <= 0 ? 1 : 0;
    return clamp01(-rect.top / travel);
  }

  if (entry.mode === "enter") {
    // Entrou 0% quando o topo esta na base da tela; 100% quando o elemento
    // subiu a propria altura (ou 60% da tela, para blocos muito altos).
    const span = Math.min(rect.height, vh * 0.6);
    return clamp01((vh - rect.top) / (vh * 0.35 + span));
  }

  // "through": a travessia completa, da base ao topo.
  return clamp01((vh - rect.top) / (vh + rect.height));
}

function tick() {
  frame = 0;

  const active: Entry[] = [];
  const values: number[] = [];

  // Fase 1 -- somente leitura.
  for (const entry of entries) {
    if (!entry.visible) continue;
    active.push(entry);
    values.push(progressFor(entry, entry.el.getBoundingClientRect()));
  }

  // Fase 2 -- somente escrita.
  for (let i = 0; i < active.length; i++) {
    const entry = active[i];
    const p = values[i];
    // Tres casas bastam para o olho e evitam escrever no DOM a cada frame
    // quando o dedo mal se moveu.
    const rounded = Math.round(p * 1000) / 1000;
    if (rounded === entry.last) continue;
    entry.last = rounded;
    entry.target.style.setProperty("--p", String(rounded));
    entry.target.style.setProperty("--enter", String(rounded));
    entry.onProgress?.(rounded);
  }
}

function schedule() {
  if (frame) return;
  frame = requestAnimationFrame(tick);
}

function ensureObserver() {
  if (observer || typeof IntersectionObserver === "undefined") return observer;
  observer = new IntersectionObserver(
    (records) => {
      for (const record of records) {
        for (const entry of entries) {
          if (entry.el !== record.target) continue;
          entry.visible = record.isIntersecting;
          // Ao sair da tela, esquece o ultimo valor: quando voltar, a cena
          // reescreve a variavel mesmo que o numero coincida.
          if (!record.isIntersecting) entry.last = -1;
        }
      }
      schedule();
    },
    // A margem liga a cena um pouco antes de ela aparecer, para o primeiro
    // frame visivel ja estar na posicao certa.
    { rootMargin: "20% 0px 20% 0px" },
  );
  return observer;
}

let listening = false;

function startListening() {
  if (listening) return;
  listening = true;
  viewportH = window.innerHeight;
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", onResize, { passive: true });
  window.addEventListener("orientationchange", onResize, { passive: true });
}

function stopListening() {
  if (!listening) return;
  listening = false;
  window.removeEventListener("scroll", schedule);
  window.removeEventListener("resize", onResize);
  window.removeEventListener("orientationchange", onResize);
}

function onResize() {
  viewportH = window.innerHeight;
  for (const entry of entries) entry.last = -1;
  schedule();
}

/**
 * Registra um elemento. Devolve a funcao de limpeza para o `useEffect`.
 */
export function observeScene(
  el: HTMLElement,
  mode: SceneMode,
  options: { target?: HTMLElement; onProgress?: (p: number) => void } = {},
): () => void {
  const entry: Entry = {
    el,
    mode,
    target: options.target ?? el,
    onProgress: options.onProgress,
    visible: true, // ate o observer dizer o contrario, assume que precisa pintar
    last: -1,
  };

  entries.add(entry);
  startListening();
  ensureObserver()?.observe(el);
  schedule();

  return () => {
    entries.delete(entry);
    // Outra cena pode estar usando o mesmo elemento (raro, mas possivel):
    // so paramos de observar quando ninguem mais o referencia.
    let stillUsed = false;
    for (const other of entries) {
      if (other.el === el) {
        stillUsed = true;
        break;
      }
    }
    if (!stillUsed) observer?.unobserve(el);
    if (entries.size === 0) {
      stopListening();
      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    }
  };
}

/* ==========================================================================
   Revelacao por entrada na tela
   ==========================================================================
   Um observer so para a pagina inteira, compartilhado por todos os
   `[data-reveal]` e `[data-split]`. Cada elemento e revelado uma vez e
   entao esquecido -- nada fica rodando depois que o bloco ja apareceu.
   ========================================================================== */

let revealObserver: IntersectionObserver | null = null;

function ensureRevealObserver() {
  if (revealObserver || typeof IntersectionObserver === "undefined") {
    return revealObserver;
  }
  revealObserver = new IntersectionObserver(
    (records) => {
      for (const record of records) {
        if (!record.isIntersecting) continue;
        record.target.classList.add("is-in");
        revealObserver?.unobserve(record.target);
      }
    },
    // A margem negativa faz o bloco revelar so depois de entrar de verdade,
    // sob o olhar de quem rola. Mas ela nao pode ser grande: um bloco que ja
    // nasce logo acima da dobra -- os botoes do hero, por exemplo -- nunca
    // cruzaria uma linha alta e ficaria invisivel para sempre.
    { rootMargin: "0px 0px -6% 0px", threshold: 0.01 },
  );
  return revealObserver;
}

export function observeReveal(el: Element): () => void {
  const obs = ensureRevealObserver();
  if (!obs) {
    // Sem IntersectionObserver (navegador muito antigo): mostra tudo.
    el.classList.add("is-in");
    return () => {};
  }
  obs.observe(el);
  return () => obs.unobserve(el);
}

/**
 * Aparelho modesto? Vale a mesma regra que o script inline do layout usa.
 * Exportado para os componentes que precisam decidir em JS (quantidade de
 * camadas, por exemplo) e nao so em CSS.
 */
export function isLiteDevice(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.dataset.lite === "1";
}
