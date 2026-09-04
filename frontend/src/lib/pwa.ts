// // // export interface BeforeInstallPromptEvent extends Event {
// // //   readonly platforms: string[];
// // //   readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
// // //   prompt(): Promise<void>;
// // // }

// // // let deferred: BeforeInstallPromptEvent | null = null;
// // // const listeners = new Set<() => void>();
// // // const emit = () => listeners.forEach((l) => l());

// // // export function isIOSBrowser(): boolean {
// // //   const ua = navigator.userAgent;
// // //   return (
// // //     /iphone|ipad|ipod/i.test(ua) ||
// // //     (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
// // //   );
// // // }

// // // const w = window as unknown as { __sendlyPwaBound?: boolean };
// // // if (!w.__sendlyPwaBound) {
// // //   w.__sendlyPwaBound = true;

// // //   window.addEventListener("beforeinstallprompt", (e: Event) => {
// // //     e.preventDefault();
// // //     console.log("[PWA] beforeinstallprompt captured and stored");
// // //     deferred = e as BeforeInstallPromptEvent;
// // //   });

// // //   window.addEventListener("appinstalled", () => {
// // //     console.log("[PWA] App installed");
// // //     deferred = null;
// // //     emit();
// // //   });
// // // }

// // // export function hasInstallPrompt(): boolean {
// // //   return deferred !== null;
// // // }

// // // export function subscribePwa(fn: () => void): () => void {
// // //   listeners.add(fn);
// // //   return () => { listeners.delete(fn); };
// // // }

// // // // Reveal after a successful upload/download.
// // // // On iOS there is no native event, so we reveal the hint card instead.
// // // export function revealInstallPrompt(): void {
// // //   if (deferred || isIOSBrowser()) {
// // //     console.log("[PWA] Revealing install card (success moment)");
// // //     emit();
// // //   }
// // // }

// // // export async function consumeInstallPrompt(): Promise<"accepted" | "dismissed" | null> {
// // //   if (!deferred) return null;
// // //   const d = deferred;
// // //   deferred = null;
// // //   await d.prompt();
// // //   const choice = await d.userChoice;
// // //   emit();
// // //   return choice.outcome;
// // // }


// // export interface BeforeInstallPromptEvent extends Event {
// //   readonly platforms: string[];
// //   readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
// //   prompt(): Promise<void>;
// // }

// // let deferred: BeforeInstallPromptEvent | null = null;
// // const listeners = new Set<() => void>();
// // const emit = () => listeners.forEach((l) => l());

// // export function isIOSBrowser(): boolean {
// //   const ua = navigator.userAgent;
// //   return (
// //     /iphone|ipad|ipod/i.test(ua) ||
// //     (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
// //   );
// // }

// // export function isMobileBrowser(): boolean {
// //   return /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);
// // }

// // export function isPwaInstalled(): boolean {
// //   return (
// //     window.matchMedia?.("(display-mode: standalone)").matches === true ||
// //     (navigator as Navigator & { standalone?: boolean }).standalone === true
// //   );
// // }

// // const w = window as unknown as { __sendlyPwaBound?: boolean };
// // if (!w.__sendlyPwaBound) {
// //   w.__sendlyPwaBound = true;

// //   window.addEventListener("beforeinstallprompt", (e: Event) => {
// //     e.preventDefault();
// //     console.log("[PWA] beforeinstallprompt captured and stored");
// //     deferred = e as BeforeInstallPromptEvent;
// //   });

// //   window.addEventListener("appinstalled", () => {
// //     console.log("[PWA] App installed");
// //     deferred = null;
// //     emit();
// //   });
// // }

// // export function hasInstallPrompt(): boolean {
// //   return deferred !== null;
// // }

// // export function subscribePwa(fn: () => void): () => void {
// //   listeners.add(fn);
// //   // beforeinstallprompt can fire before React finishes mounting.
// //   // Notify immediately so a stored event is not missed by the UI.
// //   fn();
// //   return () => { listeners.delete(fn); };
// // }

// // // Reveal after a successful upload/download.
// // // On iOS there is no native event, so we reveal the hint card instead.
// // export function revealInstallPrompt(): void {
// //   if (!isPwaInstalled() && (deferred || isIOSBrowser() || isMobileBrowser())) {
// //     console.log("[PWA] Revealing install card (success moment)");
// //     emit();
// //   }
// // }

// // export async function consumeInstallPrompt(): Promise<"accepted" | "dismissed" | null> {
// //   if (!deferred) return null;
// //   const d = deferred;
// //   deferred = null;
// //   await d.prompt();
// //   const choice = await d.userChoice;
// //   emit();
// //   return choice.outcome;
// // }

// export interface BeforeInstallPromptEvent extends Event {
//   readonly platforms: string[];
//   readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
//   prompt(): Promise<void>;
// }

// let deferred: BeforeInstallPromptEvent | null = null;
// const listeners = new Set<() => void>();
// const emit = () => listeners.forEach((l) => l());

// export function isIOSBrowser(): boolean {
//   const ua = navigator.userAgent;
//   return (
//     /iphone|ipad|ipod/i.test(ua) ||
//     (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
//   );
// }

// export function isMobileBrowser(): boolean {
//   return /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);
// }

// export function isSmallScreen(): boolean {
//   return window.matchMedia?.("(max-width: 767px)").matches === true;
// }

// export function isPwaInstalled(): boolean {
//   return (
//     window.matchMedia?.("(display-mode: standalone)").matches === true ||
//     (navigator as Navigator & { standalone?: boolean }).standalone === true
//   );
// }

// const w = window as unknown as { __sendlyPwaBound?: boolean };
// if (!w.__sendlyPwaBound) {
//   w.__sendlyPwaBound = true;

//   window.addEventListener("beforeinstallprompt", (e: Event) => {
//     e.preventDefault();
//     console.log("[PWA] beforeinstallprompt captured and stored");
//     deferred = e as BeforeInstallPromptEvent;
//     emit();
//   });

//   window.addEventListener("appinstalled", () => {
//     console.log("[PWA] App installed");
//     deferred = null;
//     emit();
//   });
// }

// export function hasInstallPrompt(): boolean {
//   return deferred !== null;
// }

// export function subscribePwa(fn: () => void): () => void {
//   listeners.add(fn);
//   // beforeinstallprompt can fire before React finishes mounting.
//   // Notify immediately so a stored event is not missed by the UI.
//   fn();
//   return () => { listeners.delete(fn); };
// }

// // Reveal after a successful upload/download.
// // On iOS there is no native event, so we reveal the hint card instead.
// export function revealInstallPrompt(): void {
//   if (!isPwaInstalled() && (deferred || isIOSBrowser() || isMobileBrowser())) {
//     console.log("[PWA] Revealing install card (success moment)");
//     emit();
//   }
// }

// export async function consumeInstallPrompt(): Promise<"accepted" | "dismissed" | null> {
//   if (!deferred) return null;
//   const d = deferred;
//   deferred = null;
//   await d.prompt();
//   const choice = await d.userChoice;
//   emit();
//   return choice.outcome;
// }



export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt(): Promise<void>;
}

let deferred: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

// Track if prompt was shown in this session
let promptShownThisSession = false;

export function isIOSBrowser(): boolean {
  const ua = navigator.userAgent;
  return (
    /iphone|ipad|ipod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export function isMobileBrowser(): boolean {
  return /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);
}

export function isSmallScreen(): boolean {
  return window.matchMedia?.("(max-width: 767px)").matches === true;
}

export function isPwaInstalled(): boolean {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches === true ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

const w = window as unknown as { __sendlyPwaBound?: boolean };
if (!w.__sendlyPwaBound) {
  w.__sendlyPwaBound = true;

  window.addEventListener("beforeinstallprompt", (e: Event) => {
    e.preventDefault();
    console.log("[PWA] beforeinstallprompt captured and stored");
    deferred = e as BeforeInstallPromptEvent;
    emit();
  });

  window.addEventListener("appinstalled", () => {
    console.log("[PWA] App installed");
    deferred = null;
    promptShownThisSession = false;
    emit();
  });
}

export function hasInstallPrompt(): boolean {
  return deferred !== null;
}

export function subscribePwa(fn: () => void): () => void {
  listeners.add(fn);
  // beforeinstallprompt can fire before React finishes mounting.
  // Notify immediately so a stored event is not missed by the UI.
  fn();
  return () => { listeners.delete(fn); };
}

// Reveal after a successful upload/download.
// Only show once per session
export function revealInstallPrompt(): void {
  if (!isPwaInstalled() && !promptShownThisSession && (deferred || isIOSBrowser() || isMobileBrowser())) {
    console.log("[PWA] Revealing install card (success moment)");
    promptShownThisSession = true;
    emit();
  }
}

export async function consumeInstallPrompt(): Promise<"accepted" | "dismissed" | null> {
  if (!deferred) return null;
  const d = deferred;
  deferred = null;
  promptShownThisSession = false;
  await d.prompt();
  const choice = await d.userChoice;
  emit();
  return choice.outcome;
}