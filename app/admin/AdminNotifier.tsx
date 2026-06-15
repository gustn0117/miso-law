"use client";

import { useEffect, useRef, useState } from "react";

type Toast = {
  uid: string;
  id: number;
  name: string;
  phone: string;
  category_slug: string | null;
  created_at: string;
};

type PollItem = Omit<Toast, "uid">;

const POLL_MS = 10_000;
const TOAST_VISIBLE_MS = 8_000;

/** 두 톤 짧은 ding 비프음 — 의존 0 (Web Audio API) */
function playDing() {
  try {
    type AudioCtx = typeof AudioContext;
    const W = window as unknown as { webkitAudioContext?: AudioCtx };
    const Ctor = window.AudioContext || W.webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();
    const now = ctx.currentTime;
    const notes: [number, number, number][] = [
      [880, 0, 0.16],
      [660, 0.16, 0.22],
    ];
    for (const [freq, start, dur] of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now + start);
      gain.gain.exponentialRampToValueAtTime(0.18, now + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
      osc.start(now + start);
      osc.stop(now + start + dur);
    }
    setTimeout(() => ctx.close().catch(() => {}), 600);
  } catch {
    // 사용자 인터랙션 전이면 AudioContext 차단됨 — silently skip
  }
}

function maybeBrowserNotify(item: PollItem) {
  if (typeof window === "undefined") return;
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  try {
    new Notification("신규 상담 접수", {
      body: `${item.name}님 (${item.phone})`,
      tag: `inquiry-${item.id}`,
      icon: "/favicon.ico",
    });
  } catch {}
}

export default function AdminNotifier({
  initialLatestId,
}: {
  initialLatestId: number;
}) {
  const lastSeenRef = useRef<number>(initialLatestId);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(
    "default",
  );

  // 마운트 시 Notification 권한 상태 확인
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission);
  }, []);

  async function requestPermission() {
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
  }

  function dismissToast(uid: string) {
    setToasts((arr) => arr.filter((t) => t.uid !== uid));
  }

  // 폴링
  useEffect(() => {
    let cancelled = false;
    let pollTimer: ReturnType<typeof setTimeout> | null = null;

    async function poll() {
      if (cancelled) return;
      try {
        const res = await fetch(
          `/api/admin/inquiries/poll?since=${lastSeenRef.current}`,
          { cache: "no-store" },
        );
        if (res.ok) {
          const data = (await res.json()) as {
            ok: boolean;
            items: PollItem[];
            latestId: number;
          };
          if (data.ok && Array.isArray(data.items) && data.items.length > 0) {
            // 새 inquiry — 사운드 + 토스트 + 브라우저 알림
            playDing();
            const ts = Date.now();
            const newToasts: Toast[] = data.items.map((i, idx) => ({
              ...i,
              uid: `${ts}-${i.id}-${idx}`,
            }));
            setToasts((prev) => [...newToasts, ...prev].slice(0, 8));
            for (const i of data.items) maybeBrowserNotify(i);
            // 자동 dismiss
            for (const t of newToasts) {
              setTimeout(() => dismissToast(t.uid), TOAST_VISIBLE_MS);
            }
          }
          lastSeenRef.current = data.latestId;
        }
      } catch {
        // 네트워크 오류 — 다음 폴링에서 재시도
      } finally {
        if (!cancelled) {
          pollTimer = setTimeout(poll, POLL_MS);
        }
      }
    }

    pollTimer = setTimeout(poll, POLL_MS);
    return () => {
      cancelled = true;
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, []);

  return (
    <>
      {/* 권한 요청 배너 — default 상태일 때만 */}
      {permission === "default" && (
        <div className="admin-notify-banner" role="status">
          <span>
            새 상담 접수 시 브라우저 알림으로 즉시 받으시려면 알림 권한을 허용해
            주세요.
          </span>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={requestPermission}
          >
            알림 허용
          </button>
        </div>
      )}

      {/* 토스트 stack */}
      {toasts.length > 0 && (
        <div className="admin-toast-stack" role="region" aria-live="polite">
          {toasts.map((t) => (
            <a
              key={t.uid}
              href="#tab-inquiries"
              className="admin-toast"
              onClick={(e) => {
                e.preventDefault();
                dismissToast(t.uid);
                // 상담 신청 탭으로 스크롤
                if (typeof window !== "undefined") {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
            >
              <div className="admin-toast-head">
                <span className="admin-toast-tag">신규 상담</span>
                <span className="admin-toast-id">#{t.id}</span>
                <button
                  type="button"
                  aria-label="알림 닫기"
                  className="admin-toast-close"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dismissToast(t.uid);
                  }}
                >
                  ×
                </button>
              </div>
              <div className="admin-toast-body">
                <strong>{t.name}</strong>
                <span>{t.phone}</span>
                {t.category_slug && (
                  <span className="admin-toast-cat">{t.category_slug}</span>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </>
  );
}
