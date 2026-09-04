


//---------------------------------------------------------------------------
//--------------------------------------------------------------------------------

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Box, Button, Card, Container, Group, Paper, PasswordInput, Progress,
  SimpleGrid, Skeleton, Stack, Switch, Text, Title,
} from "@mantine/core";
import { Clock, Download as DownloadIcon, File as FileIcon, Lock, ShieldCheck, X, AlertTriangle, Trash2 } from "lucide-react";

import { Illustration } from "../components/Illustration";
import { LinkExpiredCard } from "../components/download/LinkExpiredCard";
import { ConnectionLostCard } from "../components/download/ConnectionLostCard";
import { DownloadCompleteCard } from "../components/download/DownloadCompleteCard";

import { fetchFileMetadata, requestDownloadUrl, confirmDownload, ApiError } from "../lib/api";
import { downloadFile, type DownloadProgress } from "../lib/download/downloadEngine";
import { loadDownloadCheckpoint, clearDownloadCheckpoint } from "../lib/download/downloadResumeStore";
import { revealInstallPrompt } from "../lib/pwa";

interface FileMetadata {
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  isEncrypted: boolean;
  expiresAt: string;
  downloadCount: number;
  maxDownloads?: number | null;
  lockRemainingSeconds?: number;
}

type ErrorKind = "network" | "server" | "expired";
type DevEvent = { timestamp: string; message: string; level: "info" | "warn" | "error" };

const COMPLETED_DOWNLOAD_KEY = "sendly_v2_download_complete";
const lockoutKey = (token: string) => `sendly_v2_download_lockout_${token}`;

type CompletedDownload = { token: string; fileName: string; completedAt: number };
type LockoutState = { lockoutEndsAt: number; attemptsLeft: number };

function readCompletedDownload(token: string): CompletedDownload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(COMPLETED_DOWNLOAD_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as Partial<CompletedDownload>;
    if (saved.token !== token || typeof saved.completedAt !== "number") return null;
    if (Date.now() - saved.completedAt > 24 * 60 * 60 * 1000) {
      window.sessionStorage.removeItem(COMPLETED_DOWNLOAD_KEY);
      return null;
    }
    return {
      token: saved.token,
      fileName: typeof saved.fileName === "string" ? saved.fileName : "",
      completedAt: saved.completedAt,
    };
  } catch { return null; }
}

function readLockoutState(token: string): LockoutState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(lockoutKey(token));
    if (!raw) return null;
    const saved = JSON.parse(raw) as Partial<LockoutState>;
    if (typeof saved.lockoutEndsAt !== "number") return null;
    if (Date.now() >= saved.lockoutEndsAt) {
      window.sessionStorage.removeItem(lockoutKey(token));
      return null;
    }
    return {
      lockoutEndsAt: saved.lockoutEndsAt,
      attemptsLeft: typeof saved.attemptsLeft === "number" ? saved.attemptsLeft : 0,
    };
  } catch { return null; }
}

function classifyError(err: unknown): ErrorKind {
  const e = err as { response?: { status?: number }; code?: string; message?: string };
  const status = e?.response?.status;
  
  // 1. EXPLICIT CODE CHECK (The Missing Link)
  // This catches the ApiError directly before relying on regex
  if (e?.code === "MAX_DOWNLOADS" || e?.code === "MAX_DOWNLOADS_REACHED" || e?.code === "EXPIRED") {
    return "expired";
  }

  if (status === 404 || status === 410) return "expired";
  if (status && status >= 500) return "server";
  
  const msg = `${e?.message ?? ""} ${e?.code ?? ""}`;
  // Added max_download to the regex just in case
  if (/404|410|expired|not found|no such|max_download/i.test(msg)) return "expired";
  if (!status && /network|fetch|offline|connection|econn|enotfound|timeout/i.test(msg)) return "network";
  if (!status && typeof navigator !== "undefined" && !navigator.onLine) return "network";
  return "server";
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024, sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function formatSeconds(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function friendlyWrongPasswordMessage(left: number): string {
  if (left === 4) return "Hmm, that didn't match. Passwords here are case-sensitive, so it's worth a second look";
  if (left === 3) return "Still no luck. If the sender messaged you the password, copying it straight from their message usually does the trick";
  if (left === 2) return "That's three misses. Two tries left before the link locks for 10 minutes no rush, take a breath";
  if (left === 1) return "One try left. If this doesn't match, the link locks for 10 minutes to keep the file safe. When in doubt, ask the sender to re-send the password";
  return "Too many wrong guesses, so this link is resting for 10 minutes. The countdown shows when it wakes up — and a quick message to the sender will save you the wait";
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Text fz={10} c="dimmed" tt="uppercase" fw={600}>{label}</Text>
      <Text fz="sm" fw={500} mt={2}>{value}</Text>
    </div>
  );
}

export default function DownloadPageV2() {
  const { token } = useParams<{ token: string }>();

  const hashPassword = (() => {
    const h = typeof window !== "undefined" ? window.location.hash : "";
    return h && h.length > 1 ? decodeURIComponent(h.slice(1)) : "";
  })();
  const hashAutoFilled = hashPassword.length > 0;

  const [file, setFile] = useState<FileMetadata | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorKind, setErrorKind] = useState<ErrorKind | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [password, setPassword] = useState(hashPassword);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [paused, setPaused] = useState(false);
  const [complete, setComplete] = useState(false);
  const [dlProgress, setDlProgress] = useState<DownloadProgress | null>(null);
  const [dlSlow, setDlSlow] = useState(false);
  const [autoFilled] = useState(hashAutoFilled);
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const [inlineMessage, setInlineMessage] = useState("");
  // const [hasResumeCheckpoint, setHasResumeCheckpoint] = useState(false);
  // const [events, setEvents] = useState<DevEvent[]>([]);
    const [hasResumeCheckpoint, setHasResumeCheckpoint] = useState(false);
  const [preparationPhase, setPreparationPhase] = useState(false);
  const [dots, setDots] = useState("");
  // PACED TICKER: Buffers fast engine phases so words stay on screen for 1 sec each
  const [visiblePhase, setVisiblePhase] = useState<string>("preparing");
  const phaseQueueRef = useRef<string[]>([]);
  const [events, setEvents] = useState<DevEvent[]>([]);
  
  const [showDeveloperDetails, setShowDeveloperDetails] = useState(false);
  const dlStartRef = useRef(0);
  const controllerRef = useRef<AbortController | null>(null);

  const logDevEvent = useCallback((message: string, level: "info" | "warn" | "error" = "info") => {
    if (!import.meta.env.DEV) return;
    const now = new Date();
    const timestamp = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}.${now.getMilliseconds().toString().padStart(3, "0")}`;
    setEvents((prev) => [...prev.slice(-49), { timestamp, message, level }]);
  }, []);

  useEffect(() => {
    if (lockoutSeconds > 0) {
      const timer = setInterval(() => {
        setLockoutSeconds((s) => (s > 0 ? s - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [lockoutSeconds]);

  // useEffect(() => {
  //   const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
  //   if (downloading) window.addEventListener("beforeunload", h);
  //   return () => window.removeEventListener("beforeunload", h);
  // }, [downloading]);

    useEffect(() => {
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    if (downloading || preparationPhase) window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [downloading, preparationPhase]);

  // // Dots animation cycling (., .., ...) - Linter safe, no state set in else block
  // useEffect(() => {
  //   if (preparationPhase || downloading) {
  //     const timer = setInterval(() => {
  //       setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
  //     }, 400);
  //     return () => clearInterval(timer);
  //   }
  // }, [preparationPhase, downloading]);
  //   // Dots animation cycling (., .., ...) - Linter safe, no state set in else block
  // useEffect(() => {
  //   if (preparationPhase || downloading) {
  //     const timer = setInterval(() => {
  //       setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
  //     }, 400);
  //     return () => clearInterval(timer);
  //   }
  // }, [preparationPhase, downloading]);

  // useEffect(() => {
  //   if (!token) return;    // Dots animation cycling (., .., ...) - Linter safe, no state set in else block
  useEffect(() => {
    if (preparationPhase || downloading) {
      const timer = setInterval(() => {
        setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
      }, 400);
      return () => clearInterval(timer);
    }
  }, [preparationPhase, downloading]);

  // PACED TICKER EFFECT 1: Queues incoming phases (prevents spam buildup)
  useEffect(() => {
    const incoming: string | undefined = preparationPhase ? "preparing" : dlProgress?.phase;
    
     // If download is done or stopped, clear queue and snap to final state immediately
    if (!downloading && !preparationPhase) {
      phaseQueueRef.current = [];
      if (incoming) {
        // Defer to next tick to satisfy React 19 strict effect rules
        setTimeout(() => setVisiblePhase(incoming), 0);
      }
      return;
    }
    if (!incoming) return;

    const q = phaseQueueRef.current;
    // Only queue if it's not currently visible AND not already waiting in the queue
    if (visiblePhase !== incoming && !q.includes(incoming)) {
      q.push(incoming);
    }
  }, [preparationPhase, dlProgress, downloading, visiblePhase]);

  // PACED TICKER EFFECT 2: Drains the queue exactly once per second
  useEffect(() => {
    const ticker = setInterval(() => {
      const q = phaseQueueRef.current;
      if (q.length > 0) {
        const next = q.shift();
        if (next) setVisiblePhase(next);
      }
    }, 1000); // 1000ms = 1 full second per word. Change to 800 for slightly faster.
    return () => clearInterval(ticker);
  }, []);

  useEffect(() => {
    if (!token) return;

    const completedRecord = readCompletedDownload(token);
    if (completedRecord) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setComplete(true);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      logDevEvent("Reload detected after a completed download. Restoring complete card.");
      return;
    }

    const lockoutState = readLockoutState(token);
    if (lockoutState) {
      const remaining = Math.ceil((lockoutState.lockoutEndsAt - Date.now()) / 1000);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLockoutSeconds(remaining);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAttemptsLeft(0);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInlineMessage("Too many wrong tries. This link is taking a nap to protect the file.");
      logDevEvent(`Restored lockout state from sessionStorage. ${remaining}s remaining.`);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAttemptsLeft(5);
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    let cancelled = false;

    fetchFileMetadata(token)
      .then(async (data) => {
        if (cancelled) return;
        setFile(data);
        setErrorKind(null);
        setLoading(false);

        if (data.lockRemainingSeconds && data.lockRemainingSeconds > 0) {
          setLockoutSeconds(data.lockRemainingSeconds);
          setInlineMessage("Too many wrong tries on this device. This link is resting for a bit.");
          setAttemptsLeft(0);
        }
        const cp = await loadDownloadCheckpoint(token);
        setHasResumeCheckpoint(!!cp);
      })
      .catch((err) => {
        if (cancelled) return;
        setErrorKind(classifyError(err));
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [token, attempt, logDevEvent]);

  useEffect(() => {
    if (window.location.hash && window.location.hash.length > 1) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, []);

  useEffect(() => { if (complete) revealInstallPrompt(); }, [complete]);

  const retry = () => {
    setErrorKind(null);
    setAttempt((a) => a + 1);
    logDevEvent("User triggered manual retry.");
  };

  const downloadAgain = useCallback(() => {
    if (!token) return;
    window.sessionStorage.removeItem(COMPLETED_DOWNLOAD_KEY);
    setComplete(false);
    setDownloading(false);
    setDlProgress(null);
    setAttempt((a) => a + 1);
  }, [token]);

  // // Pauses the download but keeps IndexedDB intact for resuming
  // const handleStopDownload = useCallback(() => {
  //   if (controllerRef.current) {
  //     controllerRef.current.abort();
  //     controllerRef.current = null;
  //   }
  //   setDownloading(false);
  //   setPaused(true);
  //   setHasResumeCheckpoint(true);
  //   toast("Download paused... You can resume or discard.", { icon: "⏸️" });
  // }, []);

  // // Wipes IndexedDB and resets UI
  // const handleDiscard = useCallback(async () => {
  //   if (token) await clearDownloadCheckpoint(token);
  //   setHasResumeCheckpoint(false);
  //   setPaused(false);
  //   setDlProgress(null);
  //   toast.success("Download discarded and cleaned up.");
  // }, [token]);


    // Pauses the download but keeps IndexedDB intact for resuming
  const handleStopDownload = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
    }
    setDownloading(false);
    setPreparationPhase(false);
    setPaused(true);
    setHasResumeCheckpoint(true);
    setDots("");
    toast("Download paused. You can resume or discard.", { icon: "⏸️" });
  }, []);

  // Wipes IndexedDB and resets UI
  const handleDiscard = useCallback(async () => {
    if (token) await clearDownloadCheckpoint(token);
    setHasResumeCheckpoint(false);
    setPaused(false);
    setDlProgress(null);
    setPreparationPhase(false);
    setDots("");
    toast.success("Download discarded and cleaned up.");
  }, [token]);

    const handleDownload = async () => {
    if (!token || !file) return;
    if (lockoutSeconds > 0) return;
    if (file.isEncrypted && !password) { 
      setUnlockError("Enter the password first."); 
      return; 
    }
    if (!navigator.onLine) { 
      toast.error("You're offline. Check your internet and try again."); 
      return; 
    }

    logDevEvent("Download initiated. Starting preparation phase.");
    setDots("");
    setPreparationPhase(true);
    setDownloading(false);
    setDlProgress(null);
    setPaused(false);
    setUnlockError(null);
    dlStartRef.current = Date.now();

    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      logDevEvent("Requesting secure URL from backend...");
      const d = await requestDownloadUrl(token, file.isEncrypted ? password : undefined, file.originalName);
      logDevEvent("Backend verified. Received presigned S3 URL.");
      
      // Handoff to actual download engine
      setPreparationPhase(false);
      setDownloading(true);

      await downloadFile({
        token,
        presignedUrl: d.downloadUrl,
        fileName: d.originalName,
        fileSize: file.sizeBytes,
        mimeType: d.mimeType || file.mimeType,
        isEncrypted: d.isEncrypted,
        password: password || undefined,
        iv: d.iv,
        salt: d.salt,
        signal: controller.signal,
        onProgress: (p) => {
          setDlProgress(p);
          if (Date.now() - dlStartRef.current > 5000 && p.percent < 90) setDlSlow(true);
        },
      });

      // ONLY increment download count AFTER successful download
      await confirmDownload(token);

      window.sessionStorage.setItem(COMPLETED_DOWNLOAD_KEY, JSON.stringify({
        token, fileName: d.originalName, completedAt: Date.now(),
      }));
      
      window.sessionStorage.removeItem(lockoutKey(token));

      setComplete(true);
      setDownloading(false);
      setPaused(false);
      logDevEvent("Download flow finished successfully.");
      toast.success("File decrypted and saved");
      
      // CLEANUP: Wipe IndexedDB after successful download
      await clearDownloadCheckpoint(token);
      setHasResumeCheckpoint(false);

      try {
        const fresh = await fetchFileMetadata(token);
        setFile(fresh);
      } catch { 
        /* ignore refresh errors */ 
      }

    } catch (err) {
      if (controller.signal.aborted) {
        logDevEvent("Download stopped by user.", "warn");
      } else if (err instanceof ApiError) {
        if (err.code === "INVALID_PASSWORD") {
          const left = err.attemptsLeft ?? 0;
          const msg = friendlyWrongPasswordMessage(left);
          logDevEvent(`Backend rejected password. Attempts left: ${left}`, "error");
          setAttemptsLeft(left);
          setInlineMessage(msg);
          toast.error(`Incorrect password. ${left} attempt${left === 1 ? "" : "s"} remaining.`);
          
          window.sessionStorage.setItem(lockoutKey(token), JSON.stringify({
            lockoutEndsAt: 0, attemptsLeft: left,
          }));
        } else if (err.code === "TOO_MANY_ATTEMPTS" || err.code === "DOWNLOAD_LOCKED") {
          const lock = err.retryAfterSeconds ?? 600;
          const msg = "Too many wrong tries. This link is taking a nap to protect the file.";
          logDevEvent(`Penalty box triggered by backend. Lockout: ${lock}s`, "error");
          setLockoutSeconds(lock);
          setAttemptsLeft(0);
          setInlineMessage(msg);
          toast.error("Too many failed attempts. Locked for 10 minutes.");
          
          window.sessionStorage.setItem(lockoutKey(token), JSON.stringify({
            lockoutEndsAt: Date.now() + (lock * 1000), attemptsLeft: 0,
          }));
        } else if (err.code === "MAX_DOWNLOADS" || err.code === "MAX_DOWNLOADS_REACHED") {
          // FIX: Treat max downloads exactly like an expired link
          setErrorKind("expired");
          toast.error("This link has reached its download limit.");
        } else {
          logDevEvent(`API Error: ${err.code} - ${err.message}`, "error");
          toast.error(err.message);
        }
      } else {
        const errName = err instanceof Error ? err.name : "UnknownError";
        const errMsg = err instanceof Error ? err.message : String(err);
        logDevEvent(`Unexpected Error: [${errName}] ${errMsg}`, "error");
        toast.error(`Download failed: ${errMsg}`);
      }

      setDownloading(false);
      setPreparationPhase(false);
      setDots("");
      
      if (!controller.signal.aborted) {
        setDlProgress(null);
      }
    } finally {
      controllerRef.current = null;
    }
  };
  // const handleDownload = async () => {
  //   if (!token || !file) return;
  //   if (lockoutSeconds > 0) return;
  //   if (file.isEncrypted && !password) { setUnlockError("Enter the password first."); return; }
  //   if (!navigator.onLine) { toast.error("You're offline. Check your internet and try again."); return; }

  //   // logDevEvent("Download initiated. Requesting secure URL from backend...");
  //   // setDownloading(true);
  //   // setPaused(false);
  //   // setUnlockError(null);
  //   // dlStartRef.current = Date.now();

  //   // const controller = new AbortController();
  //   // controllerRef.current = controller;

  //   // try {
  //   //   const d = await requestDownloadUrl(token, file.isEncrypted ? password : undefined, file.originalName);
  //   //   logDevEvent("Backend verified. Received presigned S3 URL.");
  //       logDevEvent("Download initiated. Starting preparation phase.");
  //   setDots("");
  //   setPreparationPhase(true);
  //   setDownloading(false);
  //   setDlProgress(null);
  //   setPaused(false);
  //   setUnlockError(null);
  //   dlStartRef.current = Date.now();

  //   const controller = new AbortController();
  //   controllerRef.current = controller;

  //   try {
  //     logDevEvent("Requesting secure URL from backend...");
  //     const d = await requestDownloadUrl(token, file.isEncrypted ? password : undefined, file.originalName);
  //     logDevEvent("Backend verified. Received presigned S3 URL.");
      
  //     // Handoff to actual download engine
  //     setPreparationPhase(false);
  //     setDownloading(true);

  //     await downloadFile({
  //       token,
  //       presignedUrl: d.downloadUrl,
  //       fileName: d.originalName,
  //       fileSize: file.sizeBytes,
  //       mimeType: d.mimeType || file.mimeType,
  //       isEncrypted: d.isEncrypted,
  //       password: password || undefined,
  //       iv: d.iv,
  //       salt: d.salt,
  //       signal: controller.signal,
  //       onProgress: (p) => {
  //         setDlProgress(p);
  //         if (Date.now() - dlStartRef.current > 5000 && p.percent < 90) setDlSlow(true);
  //       },
  //     });

  //     // ONLY increment download count AFTER successful download
  //     await confirmDownload(token);

  //     window.sessionStorage.setItem(COMPLETED_DOWNLOAD_KEY, JSON.stringify({
  //       token, fileName: d.originalName, completedAt: Date.now(),
  //     }));
      
  //     window.sessionStorage.removeItem(lockoutKey(token));

  //     setComplete(true);
  //     setDownloading(false);
  //     setPaused(false);
  //     logDevEvent("Download flow finished successfully.");
  //     toast.success("File decrypted and saved");
      
  //     // CLEANUP: Wipe IndexedDB after successful download
  //     await clearDownloadCheckpoint(token);
  //     setHasResumeCheckpoint(false);

  //     try {
  //       const fresh = await fetchFileMetadata(token);
  //       setFile(fresh);
  // //     } catch { /* ignore refresh errors */ }

  // //   } catch (err) {
  // //     if (controller.signal.aborted) {
  // //       logDevEvent("Download stopped by user.", "warn");
  // //     } else if (err instanceof ApiError) {
  // //       if (err.code === "INVALID_PASSWORD") {
  // //         const left = err.attemptsLeft ?? 0;
  // //         const msg = friendlyWrongPasswordMessage(left);
  // //         logDevEvent(`Backend rejected password. Attempts left: ${left}`, "error");
  // //         setAttemptsLeft(left);
  // //         setInlineMessage(msg);
  // //         toast.error(`Incorrect password. ${left} attempt${left === 1 ? "" : "s"} remaining.`);
          
  // //         window.sessionStorage.setItem(lockoutKey(token), JSON.stringify({
  // //           lockoutEndsAt: 0, attemptsLeft: left,
  // //         }));
  // //       } else if (err.code === "TOO_MANY_ATTEMPTS" || err.code === "DOWNLOAD_LOCKED") {
  // //         const lock = err.retryAfterSeconds ?? 600;
  // //         const msg = "Too many wrong tries. This link is taking a nap to protect the file.";
  // //         logDevEvent(`Penalty box triggered by backend. Lockout: ${lock}s`, "error");
  // //         setLockoutSeconds(lock);
  // //         setAttemptsLeft(0);
  // //         setInlineMessage(msg);
  // //         toast.error("Too many failed attempts. Locked for 10 minutes.");
          
  // //         window.sessionStorage.setItem(lockoutKey(token), JSON.stringify({
  // //           lockoutEndsAt: Date.now() + (lock * 1000), attemptsLeft: 0,
  // //         }));
  // //     //   } else {
  // //     //     logDevEvent(`API Error: ${err.code} - ${err.message}`, "error");
  // //     //     toast.error(err.message);
  // //     //   }
  // //     // } else {
  // //     //   const errName = err instanceof Error ? err.name : "UnknownError";
  // //     //   const errMsg = err instanceof Error ? err.message : String(err);
  // //     //   logDevEvent(`Unexpected Error: [${errName}] ${errMsg}`, "error");
  // //     //   toast.error(`Download failed: ${errMsg || errName}`);
  // //     // }


  // //             } else if (err.code === "MAX_DOWNLOADS" || err.code === "MAX_DOWNLOADS_REACHED") {
  // //         // If the limit is hit during the download click, treat it as expired
  // //         setErrorKind("expired");
  // //         toast.error("This link has reached its download limit.");
  // //       } else {
  // //         const errName = err instanceof Error ? err.name : "UnknownError";
  // //         const errMsg = err instanceof Error ? err.message : String(err);
  // //         logDevEvent(`Unexpected Error: [${errName}] ${errMsg}`, "error");
  // //         toast.error(`Download failed: ${errMsg}`);
  // //       }
  // //     // setDownloading(false);
  // //     // // If it failed due to network/crypto error, we don't pause, we just let them try again
  // //     // if (!controller.signal.aborted) {
  // //     //   setDlProgress(null);
  // //     // }
  // //           setDownloading(false);
  // //     setPreparationPhase(false);
  // //     setDots("");
  // //     // If it failed due to network/crypto error, we don't pause, we just let them try again
  // //     if (!controller.signal.aborted) {
  // //       setDlProgress(null);
  // //     }
  // //   } finally {
  // //     controllerRef.current = null;
  // //   }
  // // };
  //     } catch (err) {
  //     if (controller.signal.aborted) {
  //       logDevEvent("Download stopped by user.", "warn");
  //     } else if (err instanceof ApiError) {
  //       if (err.code === "INVALID_PASSWORD") {
  //         const left = err.attemptsLeft ?? 0;
  //         const msg = friendlyWrongPasswordMessage(left);
  //         logDevEvent(`Backend rejected password. Attempts left: ${left}`, "error");
  //         setAttemptsLeft(left);
  //         setInlineMessage(msg);
  //         toast.error(`Incorrect password. ${left} attempt${left === 1 ? "" : "s"} remaining.`);
          
  //         window.sessionStorage.setItem(lockoutKey(token), JSON.stringify({
  //           lockoutEndsAt: 0, attemptsLeft: left,
  //         }));
  //       } else if (err.code === "TOO_MANY_ATTEMPTS" || err.code === "DOWNLOAD_LOCKED") {
  //         const lock = err.retryAfterSeconds ?? 600;
  //         const msg = "Too many wrong tries. This link is taking a nap to protect the file.";
  //         logDevEvent(`Penalty box triggered by backend. Lockout: ${lock}s`, "error");
  //         setLockoutSeconds(lock);
  //         setAttemptsLeft(0);
  //         setInlineMessage(msg);
  //         toast.error("Too many failed attempts. Locked for 10 minutes.");
          
  //         window.sessionStorage.setItem(lockoutKey(token), JSON.stringify({
  //           lockoutEndsAt: Date.now() + (lock * 1000), attemptsLeft: 0,
  //         }));
  //       } else if (err.code === "MAX_DOWNLOADS" || err.code === "MAX_DOWNLOADS_REACHED") {
  //         // FIX: Treat max downloads exactly like an expired link
  //         setErrorKind("expired");
  //         toast.error("This link has reached its download limit.");
  //       } else {
  //         logDevEvent(`API Error: ${err.code} - ${err.message}`, "error");
  //         toast.error(err.message);
  //       }
  //     } else {
  //       const errName = err instanceof Error ? err.name : "UnknownError";
  //       const errMsg = err instanceof Error ? err.message : String(err);
  //       logDevEvent(`Unexpected Error: [${errName}] ${errMsg}`, "error");
  //       toast.error(`Download failed: ${errMsg}`);
  //     }

  //     setDownloading(false);
  //     setPreparationPhase(false);
  //     setDots("");
      
  //     if (!controller.signal.aborted) {
  //       setDlProgress(null);
  //     }
  //   } finally {
  //     controllerRef.current = null;
  //   }

  const isMaxedOut = file?.maxDownloads !== null && file?.maxDownloads !== undefined && file.downloadCount >= file.maxDownloads;

  return (
    <Container size="md" py={{ base: "md", sm: "xl" }}>
      {import.meta.env.DEV && (
        <Paper withBorder p="xs" mb="md">
          <Group justify="space-between">
            <Text size="xs" c="dimmed">Sendly Download developer mode</Text>
            <Switch size="xs" label="Show technical details" checked={showDeveloperDetails} onChange={(e) => setShowDeveloperDetails(e.currentTarget.checked)} />
          </Group>
        </Paper>
      )}

        {/* 1. Loading State */}
      {loading && (
        <Card withBorder shadow="sm" radius="lg" p={{ base: "md", sm: "xl" }}>
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
            <Stack gap="md">
              <Skeleton height={160} radius="md" />
              <Group gap="sm" wrap="nowrap">
                <Skeleton height={40} width={40} radius="md" />
                <Stack gap={8} style={{ flex: 1 }}>
                  <Skeleton height={12} width="55%" />
                  <Skeleton height={10} width="35%" />
                </Stack>
              </Group>
            </Stack>
            <Stack gap="md">
              <Skeleton height={120} radius="md" />
              <Skeleton height={140} radius="md" />
            </Stack>
          </SimpleGrid>
        </Card>
      )}

      {/* 2. Error States (Network or Server) */}
      {!loading && errorKind === "network" && <ConnectionLostCard variant="network" onRetry={retry} />}
      {!loading && errorKind === "server" && <ConnectionLostCard variant="server" onRetry={retry} />}

      {/* 3. EXPIRED STATE: Shows for BOTH time expiry AND download limit reached */}
      {!loading && (errorKind === "expired" || isMaxedOut) && <LinkExpiredCard />}

      {/* 4. SUCCESS STATE: Download Complete */}
      {!loading && !errorKind && !isMaxedOut && complete && (
        <>
          <Card radius="lg" p={0} withBorder style={{ overflow: "hidden" }}>
            <DownloadCompleteCard />
          </Card>
          <Group justify="center" mt="md">
            <Button variant="subtle" size="xs" onClick={downloadAgain}>Download again</Button>
          </Group>
        </>
      )}

      {/* 5. ACTIVE STATE: The actual download form */}
      {!loading && !errorKind && !isMaxedOut && file && !complete && (
        <Card radius="lg" p={0} withBorder style={{ overflow: "hidden" }}>
          {/* ... keep all your existing form code here exactly as it was ... */}
          <Group p="md" gap="sm">
            <Paper w={40} h={40} radius="md" bg="var(--mantine-color-brand-light)" c="brand" style={{ display: "grid", placeItems: "center", flexShrink: 0 }}>
              <DownloadIcon size={20} />
            </Paper>
            <div>
              <Title order={3}>Download files</Title>
              <Text fz="xs" c="dimmed">Shared securely with Sendly</Text>
            </div>
          </Group>

          <Box p={{ base: "md", sm: "xl" }} style={{ borderTop: "1px solid var(--mantine-color-default-border)" }}>
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
              <Stack gap="md">
                <Illustration src="/illustrations/download.svg" alt="Downloading a file" maxWidth={220} />
                <Group gap="sm" wrap="nowrap">
                  <Paper w={40} h={40} radius="md" bg="var(--mantine-color-blue-light)" c="blue" style={{ display: "grid", placeItems: "center", flexShrink: 0 }}>
                    <FileIcon size={20} />
                  </Paper>
                  <div style={{ minWidth: 0 }}>
                    <Text fw={600} lineClamp={1}>{file.originalName}</Text>
                    <Text fz="xs" c="dimmed">{file.mimeType}</Text>
                  </div>
                </Group>
                <SimpleGrid cols={2}>
                  <Detail label="Size" value={formatFileSize(file.sizeBytes)} />
                  <Detail label="Expires" value={file.expiresAt?.split("T")[0] ?? ""} />
                  <Detail label="Encrypted" value={file.isEncrypted ? "Yes" : "No"} />
                  <Detail label="Downloads" value={String(file.downloadCount ?? 0)} />
                </SimpleGrid>
                {/* <Paper withBorder radius="md" p="md" bg="var(--mantine-color-gray-0)"> */}
                <Paper withBorder radius="md" p="md" bg="var(--mantine-color-gray-0)" visibleFrom="sm">
                  <Group gap={8} wrap="nowrap" align="flex-start">
                    <ShieldCheck size={14} style={{ color: "var(--mantine-color-brand-6)", flexShrink: 0, marginTop: 2 }} />
                    <Text fz="xs" c="dimmed">Locked on the sender's device. Deleted automatically after 1 day or 10 downloads.</Text>
                  </Group>
                </Paper>
              </Stack>

              <Stack gap="md">
                {isMaxedOut ? (
                  <Paper withBorder radius="md" p="md" bg="var(--mantine-color-red-light)">
                    <Group gap={8} mb="sm">
                      <AlertTriangle size={18} style={{ color: "var(--mantine-color-red-7)" }} />
                      <Text fz="sm" fw={700} c="red.7">Download limit reached</Text>
                    </Group>
                    <Text fz="xs" c="dimmed">
                      This file has been downloaded {file.maxDownloads} time{file.maxDownloads === 1 ? "" : "s"}, which is the maximum allowed by the sender. The link is now inactive.
                    </Text>
                  </Paper>
                ) : (
                  <Paper withBorder radius="md" p="md">
                    {file.isEncrypted ? (
                      <Stack gap="sm">
                        <Group gap={6}>
                          <Lock size={14} style={{ color: "var(--mantine-color-brand-6)" }} />
                          <Text fz="sm" fw={700}>This file is locked</Text>
                        </Group>
                        <Text fz="xs" c="dimmed">Enter the password the sender shared with you.</Text>
                        {autoFilled && !unlockError && <Text fz="xs" c="green">Password auto-filled from your link.</Text>}
                        <PasswordInput
                          label="Password" placeholder="Enter password to unlock"
                          value={password} error={unlockError ?? undefined}
                          onChange={(e) => { setPassword(e.currentTarget.value); setUnlockError(null); }}
                          disabled={lockoutSeconds > 0 || downloading}
                        />
                        {inlineMessage && <Text fz="xs" c={lockoutSeconds > 0 ? "red" : "orange"} fw={500}>{inlineMessage}</Text>}
                        {attemptsLeft < 5 && lockoutSeconds === 0 && <Text fz="xs" c="dimmed">{attemptsLeft} of 5 attempts remaining.</Text>}

                        {downloading ? (
                          <Button fullWidth size="md" color="brand" variant="light" leftSection={<X size={16} />} onClick={handleStopDownload}>
                            Stop Download ({Math.round(dlProgress?.percent ?? 0)}%)
                          </Button>
                        ) : paused || hasResumeCheckpoint ? (
                          <Group grow>
                            <Button fullWidth size="md" onClick={handleDownload} leftSection={<DownloadIcon size={16} />}>
                              Resume 
                            </Button>
                            <Button fullWidth size="md" variant="light" color="red" onClick={handleDiscard} leftSection={<Trash2 size={16} />}>
                              Discard 
                            </Button>
                          </Group>
                        ) : (
                          // <Button fullWidth size="md" onClick={handleDownload} disabled={lockoutSeconds > 0} leftSection={<Lock size={16} />}>
                          //   {lockoutSeconds > 0 ? `Locked (${formatSeconds(lockoutSeconds)})` : "Unlock and download"}
                          // </Button>
                                                    <Button fullWidth size="md" onClick={handleDownload} disabled={lockoutSeconds > 0 || preparationPhase} leftSection={<Lock size={16} />}>
                            {lockoutSeconds > 0 ? `Locked (${formatSeconds(lockoutSeconds)})` : (preparationPhase ? `Preparing${dots}` : "Unlock and download")}
                          </Button>
                        )}
                      </Stack>
                    ) : (
                      <Stack gap="md">
                        <Group gap={6}>
                          <DownloadIcon size={14} style={{ color: "var(--mantine-color-brand-6)" }} />
                          <Text fz="sm" fw={700}>Ready to download</Text>
                        </Group>
                        <Text fz="xs" c="dimmed">This file is not encrypted. Click below to download it directly to your device.</Text>

                        {downloading ? (
                          <Button fullWidth size="md" color="brand" variant="light" leftSection={<X size={16} />} onClick={handleStopDownload}>
                            Stop Download ({Math.round(dlProgress?.percent ?? 0)}%)
                          </Button>
                        ) : paused || hasResumeCheckpoint ? (
                          <Group grow>
                            <Button fullWidth size="md" onClick={handleDownload} leftSection={<DownloadIcon size={16} />}>
                              Resume
                            </Button>
                            <Button fullWidth size="md" variant="light" color="red" onClick={handleDiscard} leftSection={<Trash2 size={16} />}>
                              Discard
                            </Button>
                          </Group>
                        ) : (
                          // <Button fullWidth size="md" onClick={handleDownload} leftSection={<DownloadIcon size={16} />}>
                          //   Download
                          // </Button>
                                                    <Button fullWidth size="md" onClick={handleDownload} disabled={preparationPhase} leftSection={<DownloadIcon size={16} />}>
                            {preparationPhase ? `Preparing${dots}` : "Download"}
                          </Button>
                        )}
                      </Stack>
                    )}

                    {/* {downloading && dlProgress && (
                      <Box mt="md">
                        <Progress value={dlProgress.percent} size={6} radius="xl" color="var(--mantine-color-blue-6)" animated />
                        <Group justify="space-between" mt={4}>
                          <Text fz="xs" c="dimmed">
                            {dlProgress.phase === "downloading" ? (dlProgress.currentChunk ? `Part ${dlProgress.currentChunk}/${dlProgress.totalChunks}` : "Downloading...")
                              : dlProgress.phase === "decrypting" ? "Decrypting..."
                              : dlProgress.phase === "combining" ? "Combining parts..."
                              : dlProgress.phase === "saving" ? "Saving to device..." : "Starting..."}
                          </Text>
                          <Text fz="xs" c="dimmed">{formatFileSize(dlProgress.downloadedBytes)} / {formatFileSize(dlProgress.totalBytes)}</Text>
                        </Group>
                        {dlSlow && <Text fz="xs" c="dimmed" mt={4}>Large file or slow connection. Hang tight, it's working.</Text>}
                      </Box>
                    )} */}
                                        {/* {preparationPhase && (
                      <Box mt="md">
                        <Progress value={100} size={6} radius="xl" color="var(--mantine-color-blue-6)" animated />
                        <Text fz="xs" c="dimmed" mt={4}>Preparing download{dots}</Text>
                      </Box>
                    )}

                    {downloading && dlProgress && !preparationPhase && (
                      <Box mt="md">
                        <Progress value={dlProgress.percent} size={6} radius="xl" color="var(--mantine-color-blue-6)" animated />
                        <Group justify="space-between" mt={4}>
                          <Text fz="xs" c="dimmed">
                            {dlProgress.phase === "downloading" 
                              ? (dlProgress.currentChunk ? `Downloading part ${dlProgress.currentChunk} of ${dlProgress.totalChunks}` : "Downloading file")
                              : dlProgress.phase === "decrypting" ? "Decrypting with AES-GCM"
                              : dlProgress.phase === "combining" ? "Combining parts"
                              : dlProgress.phase === "saving" ? "Saving to device" 
                              : "Starting download"}{dots}
                          </Text>
                          <Text fz="xs" c="dimmed">{formatFileSize(dlProgress.downloadedBytes)} / {formatFileSize(dlProgress.totalBytes)}</Text>
                        </Group>
                        {dlSlow && <Text fz="xs" c="dimmed" mt={4}>Large file or slow connection. Hang tight, it's working.</Text>}
                      </Box>
                    )} */}

                                        {/* MOVING BAR: shows from the moment Download is clicked,
                        through backend check + lock check + checkpoint check,
                        until the FIRST real byte arrives. Never looks stuck. */}
                    {(preparationPhase || (downloading && (!dlProgress || dlProgress.percent === 0))) && (
                      <Box mt="md">
                        <Progress value={100} size={6} radius="xl" color="var(--mantine-color-blue-6)" animated />
                        <Text fz="xs" c="dimmed" mt={4}>
                          {preparationPhase ? "Checking link and preparing download" : "Connecting, waiting for first bytes"}{dots}
                        </Text>
                      </Box>
                    )}

                    {/* REAL BAR: only once actual bytes are moving. Users see
                        friendly words + % + bytes. "Part X of Y" stays in the
                        dev timeline only. */}
                    {downloading && dlProgress && dlProgress.percent > 0 && (
                      <Box mt="md">
                        <Progress value={dlProgress.percent} size={6} radius="xl" color="var(--mantine-color-blue-6)" animated />
                        <Group justify="space-between" mt={4}>
                          <Text fz="xs" c="dimmed">
                            {visiblePhase === "downloading" ? "Downloading"
                              : visiblePhase === "decrypting" ? "Decrypting with AES-GCM"
                              : visiblePhase === "combining" ? "Combining parts"
                              : visiblePhase === "saving" ? "Saving to device"
                              : visiblePhase === "preparing" ? "Checking link and preparing download"
                              : "Starting"}{dots}
                          </Text>
                          <Text fz="xs" c="dimmed">{formatFileSize(dlProgress.downloadedBytes)} / {formatFileSize(dlProgress.totalBytes)}</Text>
                        </Group>
                        {dlSlow && <Text fz="xs" c="dimmed" mt={4}>Large file or slow connection. Hang tight, it's working.</Text>}
                      </Box>
                    )}

                  </Paper>
                )}
{/* 
                <Paper withBorder radius="md" p="md">
                  <Text fz="xs" fw={700} tt="uppercase" c="dimmed" mb={6}>Good to know</Text> */}
                  <Paper withBorder radius="md" p="md" visibleFrom="sm">
           <Text fz="xs" fw={700} tt="uppercase" c="dimmed" mb={6}>Good to know</Text>
                  <Stack gap={8}>
                    {file.isEncrypted && (
                      <Group gap={8} wrap="nowrap" align="flex-start">
                        <Lock size={14} style={{ color: "var(--mantine-color-brand-6)", flexShrink: 0, marginTop: 2 }} />
                        <Text fz="xs" c="dimmed">The password never reaches us. Unlocking happens on your device.</Text>
                      </Group>
                    )}
                    <Group gap={8} wrap="nowrap" align="flex-start">
                      <Clock size={14} style={{ color: "var(--mantine-color-brand-6)", flexShrink: 0, marginTop: 2 }} />
                      <Text fz="xs" c="dimmed">The link dies after its expiry date or download count, whichever comes first.</Text>
                    </Group>
                    <Group gap={8} wrap="nowrap" align="flex-start">
                      <ShieldCheck size={14} style={{ color: "var(--mantine-color-brand-6)", flexShrink: 0, marginTop: 2 }} />
                      <Text fz="xs" c="dimmed">Nothing is saved on your device until the download finishes.</Text>
                    </Group>
                  </Stack>
                </Paper>
              </Stack>
            </SimpleGrid>
          </Box>
        </Card>
      )}

      {import.meta.env.DEV && showDeveloperDetails && events.length > 0 && (
        <Paper withBorder p="sm" mt="md" style={{ maxHeight: 280, overflowY: "auto" }}>
          <Text fz="xs" fw={700}>Developer timeline (Download Flow)</Text>
          {events.map((event, index) => (
            <Text size="xs" key={`${index}-${event.timestamp}-${event.message}`} c={event.level === "error" ? "red" : event.level === "warn" ? "orange" : "dimmed"}>
              {event.timestamp} — {event.message}
            </Text>
          ))}
        </Paper>
      )}
    </Container>
  );
}