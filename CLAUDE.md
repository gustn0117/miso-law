# CLAUDE.md — Frontend Design Excellence

> 이 파일은 Claude Code가 본 프로젝트에서 **production-grade, distinctive, memorable**한 UI를 만들도록 강제하기 위한 규칙서입니다.
> **모든 코드 작성 전 이 파일 전체를 읽고, 위배되는 출력은 즉시 폐기 후 재작성할 것.**

---

## 🎯 0. 핵심 철학

이 프로젝트의 결과물은 다음을 만족해야 합니다:

1. **Distinctive** — 다른 곳에서 본 듯한 디자인은 실패. 본 적 없는 디자인이어야 함.
2. **Intentional** — 모든 픽셀에 이유가 있어야 함. "그냥 그렇게 했다"는 금지.
3. **Production-grade** — 데모/프로토타입 수준이 아닌, 실제 배포 가능한 품질.
4. **Cohesive** — 하나의 명확한 미적 방향(aesthetic direction)이 전체를 관통.
5. **Memorable** — 이 사이트를 본 사람이 "그 사이트 기억나"라고 말할 수 있어야 함.

**Generic은 죄악이다. Bold하되 의도적이어야 한다.**

---

## 🛑 1. 절대 금지 — "AI Slop" 패턴

다음은 즉시 폐기 사유입니다. 예외 없음.

### 1-1. 식상한 폰트
- ❌ `Inter`, `Roboto`, `Arial`, `Helvetica`, `system-ui`, `sans-serif` (단독 사용)
- ❌ "안전한 선택"이라는 이유로 `Space Grotesk` 자동 선택
- ✅ **반드시** 아래 "타이포그래피" 섹션에서 골라 쓰거나, 더 distinctive한 것 선택

### 1-2. 식상한 컬러
- ❌ **보라색 그라데이션** (특히 흰 배경 위의 purple-to-pink)
- ❌ `#6366F1`, `#8B5CF6`, `#A855F7` 계열 무지성 사용
- ❌ Tailwind 기본 팔레트 그대로 사용 (`bg-blue-500`, `text-gray-700` 등)
- ❌ 의미 없는 글래스모피즘 (backdrop-blur + 반투명 흰색)
- ✅ 프로젝트 전용 CSS variable로 정의된 팔레트만 사용

### 1-3. 식상한 레이아웃
- ❌ 중앙 정렬된 hero + 3개 카드 그리드 + footer 패턴
- ❌ 모든 섹션이 같은 패딩/마진으로 균등하게 쌓이는 구조
- ❌ "Features" 섹션에 아이콘 + 제목 + 설명 3컬럼 그리드
- ❌ 그라데이션 배경에 흰 텍스트로 된 CTA 박스
- ✅ 비대칭, 오버랩, 그리드 파괴, 의외의 정렬 적극 활용

### 1-4. 식상한 컴포넌트
- ❌ shadcn/ui 기본값 그대로 사용 (특히 Card, Button)
- ❌ Lucide 아이콘만으로 모든 시각 요소 처리
- ❌ rounded-lg + shadow-md + border 조합 무지성 반복
- ✅ shadcn은 **베이스**로만 쓰고 반드시 프로젝트 정체성에 맞게 재스타일링

### 1-5. 게으른 작업
- ❌ "lorem ipsum" 더미 텍스트
- ❌ placeholder 이미지 (회색 박스) 그대로 두기
- ❌ TODO 주석 남기고 끝내기
- ❌ console.log 남기기
- ❌ `// styling here` 같은 빈 자리 표시

---

## 🧠 2. 코드 작성 전 — Design Thinking (필수)

**한 줄도 코드 쓰기 전에**, 다음을 명시적으로 결정하고 선언할 것:

```markdown
## Design Decision Log

**Aesthetic Direction**: [한 줄로 — 예: "1970년대 스위스 타이포그래피 + 모던 모노크롬"]

**Tone Extreme**: [다음 중 택1, 절대 중간 X]
- brutally minimal / maximalist chaos
- retro-futuristic / organic-natural
- luxury-refined / playful-toy
- editorial-magazine / brutalist-raw
- art-deco-geometric / industrial-utilitarian
- soft-pastel / 또는 본인이 정의한 새 방향

**The One Memorable Thing**:
[이 사이트를 본 사람이 친구에게 설명할 한 가지. 예: "스크롤하면 타이포그래피가 살아 움직이는 사이트"]

**Typography Pair**:
- Display: [폰트명 + 이유]
- Body: [폰트명 + 이유]

**Color System**:
- Dominant: [HEX + 면적 70%]
- Secondary: [HEX + 면적 20%]
- Accent (sharp): [HEX + 면적 10% 미만, 강한 대비]
- Background: [HEX]
- Foreground: [HEX]

**Motion Philosophy**: [한 줄]

**What It's NOT**: [3가지 — 이 디자인이 절대 아닌 것을 명시]
```

이 로그 없이 코드를 시작하지 말 것. 사용자가 명시적 디자인 방향을 안 줬다면 **위 항목을 먼저 제안하고 승인받을 것.**

---

## ✍️ 3. 타이포그래피 시스템

### 3-1. 폰트 선택 (Google Fonts 기준)

**Display / Heading 후보:**
- **Serif**: Fraunces, Instrument Serif, Cormorant, Playfair Display, Reckless, Tobias, Editorial New, Newsreader
- **Sans (distinctive)**: Bricolage Grotesque, PP Neue Montreal, Söhne, Druk, Migra, Sequel Sans, Neue Haas Grotesk
- **Mono**: JetBrains Mono, Berkeley Mono, IBM Plex Mono, Geist Mono
- **Display weird**: Monument Extended, Migra Italic, PP Editorial New, Climate Crisis

**Body 후보:**
- Newsreader, Sohne, Geist, IBM Plex Sans, Söhne, Inter Tight (단, Inter는 금지)
- 한국어: **Pretendard** (필수), Spoqa Han Sans, Noto Sans KR
- 한국어 세리프: Nanum Myeongjo, Noto Serif KR

**규칙:**
- Display + Body 2-폰트 페어링이 기본. 3개 이상은 모노 추가까지만.
- 한영 혼용 시 한글 폰트는 Pretendard fallback 필수 명시
- Display 폰트는 반드시 **시각적 캐릭터**가 있어야 함 (특이한 a, g, R 등)

### 3-2. 타입 스케일

기본 modular scale 1.25 또는 1.333 (perfect fourth) 사용. 단순 1.5배 점프 금지.

```css
/* 예시 — 프로젝트에 맞게 조정 */
--text-xs:   0.75rem;   /* 12px */
--text-sm:   0.875rem;  /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg:   1.25rem;   /* 20px */
--text-xl:   1.563rem;  /* 25px */
--text-2xl:  1.953rem;  /* 31px */
--text-3xl:  2.441rem;  /* 39px */
--text-4xl:  3.052rem;  /* 49px */
--text-5xl:  3.815rem;  /* 61px */
--text-6xl:  4.768rem;  /* 76px */
--text-hero: clamp(4rem, 12vw, 12rem);  /* 진짜 큰 타이틀 */
```

### 3-3. 타이포그래피 디테일 (반드시 적용)

- **Letter-spacing**: 큰 제목(60px+)은 `-0.02em` ~ `-0.04em` (tight)
- **Line-height**: 본문 1.5~1.7, 제목 0.95~1.1
- **Optical sizing**: variable font 사용 시 `font-optical-sizing: auto`
- **Font-feature-settings**: `"ss01", "ss02", "cv11"` 등 stylistic alternates 활용
- **Ligatures**: `font-variant-ligatures: contextual common-ligatures`
- **숫자**: tabular nums 필요한 곳은 `font-variant-numeric: tabular-nums`

### 3-4. 텍스트 처리

- 큰 헤드라인은 줄바꿈 의도적으로 — `text-wrap: balance` 또는 `<br>` 직접
- 본문은 `text-wrap: pretty` 사용
- 측정 가독성: 본문 한 줄 길이 `max-width: 65ch` 가이드

---

## 🎨 4. 컬러 시스템

### 4-1. 팔레트 구성 원칙

- **Dominant + Sharp Accent** 구조. 균등 분포 금지.
- 60-30-10 법칙: 주색 60%, 보조 30%, 강조 10%
- **무채색 + 강한 액센트 1색** 조합이 가장 안전하고 강력함

### 4-2. CSS Variables 필수

모든 색은 `:root`에 변수로 정의. Tailwind도 변수 기반으로:

```css
:root {
  /* Base */
  --color-bg: 12 12 14;           /* RGB 공백 구분 — Tailwind opacity 호환 */
  --color-fg: 240 240 235;
  --color-fg-muted: 160 160 155;

  /* Brand */
  --color-accent: 255 90 31;      /* 강한 단일 액센트 */
  --color-accent-fg: 12 12 14;

  /* Surface */
  --color-surface-1: 20 20 23;
  --color-surface-2: 28 28 32;

  /* Semantic */
  --color-success: 34 197 94;
  --color-warning: 250 204 21;
  --color-danger: 239 68 68;

  /* Border */
  --color-border: 38 38 42;
  --color-border-strong: 60 60 65;
}
```

### 4-3. 다크모드

- 다크 우선 디자인일 경우 `:root` 자체를 다크로
- 라이트/다크 둘 다 지원 시 `[data-theme="dark"]` 또는 `prefers-color-scheme` 사용
- 다크모드는 절대 `bg-black + text-white`로 끝내지 말 것 — 미묘한 색조 차이로 깊이 표현

### 4-4. 컬러 디테일

- 흰색은 `#FFFFFF`보다 `#FAFAF7`, `#F7F5F0` 같은 off-white
- 검정은 `#000000`보다 `#0A0A0C`, `#111114` 같은 near-black
- 그림자에 검정 대신 **dominant 색의 어두운 톤** 사용

---

## 📐 5. 레이아웃 & 스페이싱

### 5-1. 레이아웃 원칙

다음 중 최소 하나는 반드시 적용:

- ✅ **비대칭 그리드** — 12col이지만 4-7-1 같은 변칙 배치
- ✅ **요소 오버랩** — z-index와 negative margin 활용
- ✅ **거대한 타이포** — viewport 폭의 80%+ 차지하는 제목
- ✅ **그리드 파괴 요소** — 한 섹션에서 grid를 의도적으로 벗어나는 요소
- ✅ **대각선 흐름** — 시선을 좌상→우하 또는 그 반대로 유도
- ✅ **극단적 negative space** — 화면의 70%가 비어있는 hero
- ✅ **edge-to-edge 요소** — viewport 끝까지 닿는 텍스트/이미지

### 5-2. 스페이싱 스케일

```css
--space-1:  0.25rem;
--space-2:  0.5rem;
--space-3:  0.75rem;
--space-4:  1rem;
--space-6:  1.5rem;
--space-8:  2rem;
--space-12: 3rem;
--space-16: 4rem;
--space-24: 6rem;
--space-32: 8rem;
--space-48: 12rem;
--space-64: 16rem;
```

섹션 간 여백은 `--space-32` 이상 적극 사용. 답답한 레이아웃 금지.

### 5-3. 컨테이너

- `max-width: 1440px` 같은 단일 컨테이너만 쓰지 말 것
- 여러 컨테이너 폭을 정의: `narrow (640px)`, `default (1200px)`, `wide (1440px)`, `full (100%)`
- 같은 페이지 내에서 섹션마다 폭이 달라야 리듬이 생김

---

## 🎬 6. 모션 & 애니메이션

### 6-1. 라이브러리 선택

- **React 프로젝트**: `motion` (구 Framer Motion) 사용
- **순수 HTML/CSS**: CSS animation + `View Transitions API` 활용
- **스크롤 트리거**: `Intersection Observer` 또는 `motion`의 `useInView`

### 6-2. 모션 원칙

- **High-impact moments**: 산발적 micro-interaction보다 페이지 진입 시 staggered reveal 한 번에 집중
- **Easing**: `ease-out`, `cubic-bezier(0.16, 1, 0.3, 1)` (slick), `cubic-bezier(0.65, 0, 0.35, 1)` (in-out) 등 의도적 선택. `ease` 기본값 금지.
- **Duration**:
  - Micro (hover, focus): 150-250ms
  - Standard (modal, drawer): 300-500ms
  - Dramatic (hero reveal): 800-1500ms
- **Stagger**: 리스트 reveal 시 `delay: index * 0.05` 같은 staggering 필수

### 6-3. 의외성 만들기

- 호버 시 단순 색 변경 X → 텍스트 글리치, 마스크 reveal, 위치 미세 시프트
- 스크롤 시 단순 fade-in X → 단어별 reveal, 마스크 와이프, 패럴랙스
- 커서 자체 커스터마이징 (블렌딩 모드, 따라오는 dot 등)

### 6-4. 접근성

- `@media (prefers-reduced-motion: reduce)` 반드시 처리
- 모든 애니메이션에 reduced-motion fallback 제공

---

## 🌫️ 7. 디테일 & 분위기 (Atmosphere)

다음 중 **최소 3개**를 의도적으로 적용:

### 7-1. 배경 처리
- **Gradient mesh**: SVG 또는 CSS conic-gradient로 부드러운 다색 메시
- **Noise texture**: SVG `<feTurbulence>` 또는 텍스처 이미지로 그레인 오버레이
- **Geometric pattern**: 반복 패턴 (격자, 점, 사선)을 SVG로
- **Soft blur shapes**: 거대한 blur된 색 원들 (responsibly)

### 7-2. 보더 & 디바이더
- 단순 1px line 금지
- 이중선, 점선, 두꺼운 단색 라인, 그라데이션 보더 등 다양화
- 한 페이지에서 보더 스타일은 1-2종으로 통일

### 7-3. 그림자
- Tailwind 기본 `shadow-md` 사용 금지
- 멀티 레이어 그림자로 깊이 표현:
  ```css
  box-shadow:
    0 1px 2px rgb(0 0 0 / 0.04),
    0 4px 12px rgb(0 0 0 / 0.06),
    0 24px 48px rgb(0 0 0 / 0.08);
  ```
- 컬러 그림자 (액센트 색의 저채도 버전) 활용

### 7-4. 마이크로 디테일
- 숫자 카운터, 시계, 변하는 텍스트
- 페이지 모서리 라벨/번호 (잡지스러운 디테일)
- 의미 있는 캡션, 메타데이터 노출
- 커스텀 셀렉션 컬러 (`::selection`)
- 커스텀 스크롤바 (`::-webkit-scrollbar`)

---

## 🧩 8. 컴포넌트 작성 규칙

### 8-1. shadcn/ui 사용 시
- **반드시** `components/ui/`의 기본값을 프로젝트 토큰으로 재정의
- `button.tsx`, `card.tsx` 등의 variant를 프로젝트 디자인에 맞게 확장
- 기본 rounded, shadow, padding 값 그대로 두지 말 것

### 8-2. 컴포넌트 구조
```
components/
├── ui/              # shadcn 베이스 (재스타일링됨)
├── primitives/      # 프로젝트 고유 원시 컴포넌트
│   ├── Typography.tsx
│   ├── Container.tsx
│   └── Section.tsx
├── blocks/          # 페이지 섹션 단위
│   ├── Hero.tsx
│   ├── FeatureList.tsx
│   └── ...
└── decorations/     # 장식적 요소 (커서, noise, gradients)
```

### 8-3. variant 작성

`cva` (class-variance-authority) 적극 활용. variant 없는 컴포넌트 금지:

```tsx
const button = cva("...", {
  variants: {
    intent: { primary: "...", ghost: "...", critical: "..." },
    size: { sm: "...", md: "...", lg: "...", hero: "..." },
    shape: { rect: "...", pill: "...", square: "..." }
  }
});
```

---

## 💻 9. 코드 품질 기준

### 9-1. TypeScript
- `strict: true` 유지
- `any` 금지 — `unknown` 사용 후 narrow
- props는 반드시 명시적 타입 또는 interface
- variant는 `VariantProps<typeof ...>` 추출 사용

### 9-2. 네이밍
- 컴포넌트: PascalCase
- 훅: useCamelCase
- 유틸: camelCase
- CSS 클래스: kebab-case 또는 Tailwind만
- 의미 없는 이름 금지 (`Component1`, `helper`, `data2`)

### 9-3. 파일 구조
- 한 파일 한 컴포넌트 원칙 (단, 작은 sub-component는 같은 파일 허용)
- 200줄 넘으면 분리 고려
- import 순서: 외부 → 절대경로 → 상대경로 → 스타일

### 9-4. 성능
- 이미지는 `next/image` (Next.js) 또는 `loading="lazy"`
- 폰트는 `font-display: swap` + preload
- 큰 컴포넌트는 `dynamic import`
- 애니메이션은 `transform`, `opacity`만 — layout 트리거 금지

---

## 📱 10. 반응형

### 10-1. 브레이크포인트
모바일 우선. 단, **모바일이 데스크탑의 단순 축소판이 되지 말 것.**

```
sm:  640px   /* 작은 태블릿 */
md:  768px   /* 태블릿 */
lg:  1024px  /* 작은 데스크탑 */
xl:  1280px  /* 데스크탑 */
2xl: 1536px  /* 대형 디스플레이 */
```

### 10-2. 모바일 디자인 원칙
- 데스크탑에서 화려한 효과가 모바일에서도 작동해야 — 아니면 모바일 전용 대체 디자인
- 타이포그래피 스케일은 `clamp()`로 유동적
- 터치 타겟 최소 44x44px
- 가로 스크롤 금지 (의도적 horizontal scroll 섹션 제외)

---

## ♿ 11. 접근성

- 색 대비 WCAG AA 최소 (4.5:1 본문, 3:1 큰 글씨)
- 모든 인터랙티브 요소에 키보드 포커스 visible — 단, 기본 outline 그대로 두지 말고 디자인된 focus ring
- 시맨틱 HTML — `<div>` 남발 금지
- `alt` 텍스트 모든 의미 있는 이미지에
- `aria-label` 아이콘 버튼에 필수
- `prefers-reduced-motion` 처리

---

## 🔁 12. 작업 워크플로우

### 새 페이지/컴포넌트 작업 시

1. **Design Decision Log 작성** (위 2번 섹션) — 사용자에게 공유 후 승인
2. **레퍼런스 명시** — "Awwwards X 사이트 분위기 + 잡지 Y의 타이포그래피" 식
3. **HTML/구조 먼저** — 의미 있는 마크업
4. **스타일링** — 토큰 → 컴포넌트 → 페이지 순서
5. **모션 추가** — 가장 마지막. 구조와 스타일이 완성된 후
6. **디테일 패스** — noise, 그림자, 마이크로 인터랙션, 커스텀 셀렉션 등
7. **반응형 검증** — sm, md, lg, xl 각각 실제 확인
8. **접근성 패스** — 키보드 네비게이션, 색 대비, alt 텍스트

### 디자인 리뷰 셀프 체크리스트

작업 완료 전 다음 질문에 답할 수 있어야 함:

- [ ] 이 디자인을 한 단어로 설명할 수 있는가?
- [ ] 다른 어떤 사이트와도 다른가?
- [ ] 식상한 폰트/색/레이아웃을 썼는가? (썼다면 다시.)
- [ ] "The One Memorable Thing"이 실제로 구현되었는가?
- [ ] 모든 요소가 의도적인가? "왜 이 위치/크기/색?"에 답할 수 있는가?
- [ ] 모바일에서도 디자인 정체성이 유지되는가?
- [ ] 정적 스크린샷만 봐도 분위기가 전달되는가?
- [ ] 접근성 기본은 갖췄는가?

---

## 🎨 13. 영감 소스 (참고용)

작업 시 참고할 만한 사이트들 (모방 X, 영감만):

- **Awwwards** — 수상작 갤러리
- **Godly** — 큐레이션된 사이트들
- **SiteInspire** — 카테고리별 검색
- **Land-book** — 랜딩페이지 전문
- **httpster** — 키치하고 distinctive한 사이트들
- **Fonts in Use** — 타이포그래피 케이스 스터디
- **Cosmos.so** — 비주얼 무드보드

---

## 🚫 14. 최종 금지사항 요약

다음 출력 시 즉시 폐기:

1. Inter 폰트 사용
2. 보라색 그라데이션
3. `rounded-lg shadow-md border` 무지성 카드
4. 중앙 정렬 hero + 3 column features 패턴
5. Tailwind 기본 색상 클래스 그대로 사용
6. shadcn/ui 디폴트 스타일 그대로 사용
7. Lorem ipsum 또는 placeholder 그대로 제출
8. Design Decision Log 없이 시작
9. 첫 시도에서 "안전한 선택"으로 수렴
10. 모바일 = 데스크탑 축소판

---

## 💬 15. 사용자 (현수) 컨텍스트

- HS WEB (HARAM) 에이전시 대표 개발자
- 디자인 퀄리티에 대한 기준이 높음 — "적당히"는 불합격
- 학술/세련된 톤 선호, 마케팅 톤 지양
- 추측보다 근거 / 레퍼런스 기반 결정 선호
- 한국어 소통, 한영 혼용 디자인 자주 필요 (Pretendard 필수)
- 클라이언트 작업이 많음 — 클라이언트별 정체성 차별화 중요

---

## 🔥 16. 최종 원칙

> **"Generic is a failure mode. Bold and intentional is the only acceptable state."**
>
> 안전한 선택은 잊어라. 이 프로젝트의 결과물은 **Awwwards SOTD를 받을 수 있는 수준**을 목표로 한다.
> 평범함을 출력하느니 사용자에게 "이렇게 가도 될까요?"라고 묻는 편이 낫다.

---

_이 파일은 살아있는 문서. 프로젝트 정체성이 정해지면 1-2번 섹션을 구체화하여 업데이트할 것._
