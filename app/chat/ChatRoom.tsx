"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight } from "../components/icons";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "보이스피싱 당한 것 같아요",
  "전세보증금을 못 받고 있어요",
  "음주운전 단속에 걸렸어요",
  "개인회생을 알아보고 있어요",
  "대출 연체로 막막한데 어떻게 해야 하나요",
];

export default function ChatRoom({ initialQuery }: { initialQuery?: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [matchedSlug, setMatchedSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const initSentRef = useRef(false);

  useEffect(() => {
    if (initSentRef.current) return;
    const q = (initialQuery ?? params.get("q") ?? "").trim();
    if (q.length > 0) {
      initSentRef.current = true;
      void send(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setError(null);
    const next: Msg[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setLoading(true);

    const started = Date.now();
    // 실제 사람이 생각하고 답변하는 느낌의 최소 표시 시간
    //  - 첫 응답: 1500ms (인상적)
    //  - 후속 응답: 1100ms
    const minDelayMs = messages.length === 0 ? 1500 : 1100;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "응답 실패");
      }

      // 최소 딜레이 보장 — 응답이 빨라도 typing 인디케이터를 잠시 유지
      const elapsed = Date.now() - started;
      const remain = Math.max(0, minDelayMs - elapsed);
      if (remain > 0) {
        await new Promise((r) => setTimeout(r, remain));
      }

      setMatchedSlug(data.matched_category_slug ?? null);
      setMessages([...next, { role: "assistant", content: data.reply }]);
    } catch (e) {
      const elapsed = Date.now() - started;
      const remain = Math.max(0, 800 - elapsed);
      if (remain > 0) await new Promise((r) => setTimeout(r, remain));
      const msg = e instanceof Error ? e.message : "일시적인 오류입니다";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    void send(input);
  }

  function newChat() {
    setMessages([]);
    setMatchedSlug(null);
    setError(null);
    setInput("");
    router.replace("/chat");
  }

  return (
    <div className="chat-shell">
      <div className="chat-rail">
        <div>
          <div className="chat-rail-label">SESSION</div>
          <h2 className="chat-rail-title">AI 1차 상담</h2>
          <p className="chat-rail-desc">
            상황을 자유롭게 적어주세요. 카테고리·핵심 포인트·다음 액션을 정리해
            드립니다. 정확한 판단은 전문 상담이 필요합니다.
          </p>
        </div>
        <div className="chat-rail-actions">
          {matchedSlug && (
            <Link
              href={`/category/${matchedSlug}`}
              className="chat-rail-link"
            >
              <span>관련 분야 사례 보기</span>
              <ArrowRight size={14} />
            </Link>
          )}
          <Link href="/inquiry" className="chat-rail-link is-primary">
            <span>전문 상담 신청</span>
            <ArrowRight size={14} />
          </Link>
          <button type="button" className="chat-rail-link" onClick={newChat}>
            <span>새로운 대화</span>
          </button>
        </div>
      </div>

      <div className="chat-main">
        <div className="chat-thread" ref={scrollRef}>
          {messages.length === 0 && !loading && (
            <div className="chat-empty">
              <div className="chat-empty-eyebrow">MISO LEGAL · AI INTAKE</div>
              <h1 className="chat-empty-h">
                어떤 고민이 있으신가요?
              </h1>
              <p className="chat-empty-p">
                예: &quot;전세보증금을 못 받고 있어요&quot;,
                &quot;음주운전 단속에 걸렸어요&quot;
              </p>
              <div className="chat-empty-chips">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="chat-chip"
                    onClick={() => void send(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={`chat-msg chat-msg--${m.role}`}
            >
              <div className="chat-msg-label">
                {m.role === "user" ? "YOU" : "AI · MISO"}
              </div>
              <div className="chat-msg-body">
                {m.content.split("\n").map((line, j) => (
                  <p key={j}>{line}</p>
                ))}
              </div>
            </div>
          ))}

          {loading && (
            <div className="chat-msg chat-msg--assistant">
              <div className="chat-msg-label">AI · MISO</div>
              <div className="chat-msg-body">
                <span className="chat-typing" aria-label="답변 생성 중">
                  <span />
                  <span />
                  <span />
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="chat-msg chat-msg--error">
              <div className="chat-msg-label">ERROR</div>
              <div className="chat-msg-body">
                <p>{error}</p>
              </div>
            </div>
          )}
        </div>

        <form className="chat-input" onSubmit={onSubmit} role="search">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              messages.length === 0
                ? "어떤 고민이 있으신가요?"
                : "이어서 질문해 주세요"
            }
            aria-label="법률 고민 입력"
            rows={1}
            maxLength={2000}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send(input);
              }
            }}
            disabled={loading}
          />
          <button
            type="submit"
            className="chat-send"
            disabled={loading || !input.trim()}
            aria-label="답변 보기"
          >
            {loading ? "분석 중" : "답변 보기"}
            <ArrowRight size={16} />
          </button>
        </form>

        <p className="chat-fineprint">
          AI 1차 안내 · 직접 법률 자문 아님 · Shift+Enter 줄바꿈 · Enter 전송
        </p>
      </div>
    </div>
  );
}
