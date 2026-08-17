import {
  Component,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, RoundedBox, Sparkles, Text } from "@react-three/drei";
import * as THREE from "three";

/* ============================================================================
   Hero 3D — a procedural "developer laptop" with a live typing code screen,
   floating code tokens and a soft neon glow. Built entirely from primitives +
   canvas textures so it ships with zero external model/font/HDRI requests.
   ============================================================================ */

const FONT_URL = "/fonts/JetBrainsMono-Regular.woff";

/* ---------------------------------------------------------------- snippets */
const SNIPPETS: string[] = [
  [
    `import { Component, signal } from '@angular/core';`,
    ``,
    `@Component({`,
    `  selector: 'app-hero',`,
    `  template: \`<h1>{{ title() }}</h1>\`,`,
    `})`,
    `export class HeroComponent {`,
    `  title = signal('Anas Essam');`,
    `}`,
  ].join("\n"),
  [
    `const results$ = fromEvent(input, 'input')`,
    `  .pipe(`,
    `    debounceTime(300),`,
    `    distinctUntilChanged(),`,
    `    switchMap(q => api.search(q)),`,
    `    shareReplay({ bufferSize: 1 }),`,
    `  );`,
  ].join("\n"),
  [
    `export interface Portfolio {`,
    `  name: string;`,
    `  role: 'Angular Developer';`,
    `  focus: 'RTL · SSO · Design Systems';`,
    `  stack: string[]; // 16+ tools`,
    `}`,
  ].join("\n"),
];

const KEYWORDS = new Set([
  "import", "from", "export", "const", "let", "function", "return", "class",
  "interface", "type", "new", "extends", "implements", "async", "await", "if",
  "else", "of", "this", "true", "false", "null", "undefined",
]);

type Span = { text: string; color: string };

const COLORS = {
  comment: "#5f6b7a",
  string: "#9ee8a0",
  decorator: "#ffd479",
  number: "#ff9e64",
  keyword: "#c792ea",
  ident: "#7fdbff",
  plain: "#e7e3ec",
  dim: "#39424f",
};

function tokenize(line: string): Span[] {
  const spans: Span[] = [];
  const re =
    /(\/\/.*$)|('(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|"(?:[^"\\]|\\.)*")|(@[A-Za-z_][\w$]*)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)|(\s+)|(.)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    if (m[1]) spans.push({ text: m[1], color: COLORS.comment });
    else if (m[2]) spans.push({ text: m[2], color: COLORS.string });
    else if (m[3]) spans.push({ text: m[3], color: COLORS.decorator });
    else if (m[4]) spans.push({ text: m[4], color: COLORS.number });
    else if (m[5]) {
      const w = m[5];
      spans.push({
        text: w,
        color: KEYWORDS.has(w) ? COLORS.keyword : COLORS.ident,
      });
    } else spans.push({ text: m[0], color: COLORS.plain });
  }
  return spans;
}

/* ------------------------------------------------------ canvas texture util */
function makeTexture(
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D) => void
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  draw(ctx);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function makeGlowTexture(inner: string, outer: string): THREE.CanvasTexture {
  return makeTexture(256, 256, (ctx) => {
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, inner);
    g.addColorStop(0.4, outer);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
  });
}

/** roundRect with a manual fallback for older engines */
function rr(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, w, h, r);
    return;
  }
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/* ----------------------------------------------------- animated editor gfx */
interface FlatToken {
  start: number; // global char offset (newline counts as one char)
  end: number;
  span: Span;
  line: number;
}

function useEditorTexture(): THREE.CanvasTexture {
  const { texture, ctx } = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 820;
    canvas.height = 500;
    const ctx = canvas.getContext("2d")!;
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    return { texture, ctx };
  }, []);

  useEffect(() => {
    // Pre-tokenize each snippet into a flat, offset-addressed stream so the
    // typewriter can address every character globally.
    const flats = SNIPPETS.map((snip) => {
      const lines = snip.split("\n").map(tokenize);
      let offset = 0;
      const tokens: FlatToken[] = [];
      lines.forEach((spans, line) => {
        spans.forEach((span) => {
          tokens.push({ start: offset, end: offset + span.text.length, span, line });
          offset += span.text.length;
        });
        offset += 1; // the newline character
      });
      return { lines, tokens, total: offset };
    });

    const W = 820;
    const H = 500;
    const LINE_H = 44;
    const GUTTER = 64;
    const TOP = 96;
    const LEFT = 12;
    const FONT = '600 26px "JetBrains Mono", monospace';

    let snippetIdx = 0;
    let visible = 0;
    let hold = 0;
    let blink = true;
    let raf = 0;
    let last = 0;

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      // ~30 fps redraw + texture upload keeps the always-on animation cheap.
      if (now - last < 33) return;
      last = now;

      const flat = flats[snippetIdx];

      // ~30 chars/sec, 2.2s hold at the end of each snippet
      if (visible < flat.total) {
        visible += 1;
        hold = 0;
      } else if (hold > 66) {
        visible = 0;
        hold = 0;
        snippetIdx = (snippetIdx + 1) % flats.length;
      } else {
        hold += 1;
      }
      blink = Math.floor(now / 500) % 2 === 0;

      // background
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#0d1020");
      bg.addColorStop(1, "#090a12");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "rgba(194,164,255,0.05)";
      ctx.fillRect(0, 0, W, H);

      // window chrome
      ctx.fillStyle = "rgba(255,255,255,0.04)";
      ctx.fillRect(0, 0, W, 60);
      ctx.fillStyle = "#ff5f57";
      ctx.beginPath();
      ctx.arc(40, 30, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#febc2e";
      ctx.beginPath();
      ctx.arc(68, 30, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#28c840";
      ctx.beginPath();
      ctx.arc(96, 30, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(231,227,236,0.55)";
      ctx.font = '500 22px "JetBrains Mono", monospace';
      ctx.textBaseline = "middle";
      ctx.fillText("portfolio.ts — Angular 21", 128, 31);

      // gutter divider
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(LEFT + GUTTER - 20, 60);
      ctx.lineTo(LEFT + GUTTER - 20, H);
      ctx.stroke();

      // line numbers
      ctx.font = '500 22px "JetBrains Mono", monospace';
      ctx.fillStyle = COLORS.dim;
      flat.lines.forEach((_, i) => {
        ctx.fillText(String(i + 1), LEFT + 8, TOP + i * LINE_H);
      });

      // draw visible code per line
      ctx.font = FONT;
      const cursor = { line: 0, x: LEFT + GUTTER };
      flat.lines.forEach((_, lineIdx) => {
        let x = LEFT + GUTTER;
        const lineTokens = flat.tokens.filter((t) => t.line === lineIdx);
        lineTokens.forEach((tok) => {
          const shown = Math.max(0, Math.min(visible, tok.end) - tok.start);
          if (shown > 0) {
            ctx.fillStyle = tok.span.color;
            ctx.fillText(tok.span.text.slice(0, shown), x, TOP + lineIdx * LINE_H);
          }
          x += ctx.measureText(tok.span.text).width;
        });
      });

      // locate the cursor (char index `visible`)
      outer: for (let li = 0; li < flat.lines.length; li++) {
        let x = LEFT + GUTTER;
        for (const tok of flat.tokens) {
          if (tok.line !== li) continue;
          if (visible > tok.start && visible <= tok.end) {
            cursor.line = li;
            cursor.x =
              x + ctx.measureText(tok.span.text.slice(0, visible - tok.start)).width;
            break outer;
          }
          x += ctx.measureText(tok.span.text).width;
        }
        // cursor at the end of a line (just before newline)
        const lineEnd = flat.tokens
          .filter((t) => t.line === li)
          .reduce((m, t) => Math.max(m, t.end), 0);
        if (visible >= lineEnd) cursor.line = li;
      }

      if (blink) {
        ctx.fillStyle = "#c2a4ff";
        ctx.fillRect(cursor.x, TOP + cursor.line * LINE_H - 13, 3, 26);
      }

      texture.needsUpdate = true;
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [ctx, texture]);

  return texture;
}

/* ----------------------------------------------------- keyboard (static) ---- */
function useKeyboardTexture(): THREE.CanvasTexture {
  return useMemo(
    () =>
      makeTexture(640, 360, (ctx) => {
        const g = ctx.createLinearGradient(0, 0, 0, 360);
        g.addColorStop(0, "#14141c");
        g.addColorStop(1, "#0d0d13");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 640, 360);

        const drawKey = (x: number, y: number, w: number, h: number) => {
          const kg = ctx.createLinearGradient(x, y, x, y + h);
          kg.addColorStop(0, "#23232e");
          kg.addColorStop(1, "#16161d");
          ctx.fillStyle = kg;
          rr(ctx, x, y, w, h, 5);
          ctx.fill();
          ctx.strokeStyle = "rgba(255,255,255,0.05)";
          ctx.lineWidth = 1;
          ctx.stroke();
        };

        const rows = [
          { y: 24, keys: 13, w: 40, h: 28, gap: 6 },
          { y: 66, keys: 13, w: 40, h: 28, gap: 6 },
          { y: 108, keys: 13, w: 40, h: 28, gap: 6 },
          { y: 150, keys: 13, w: 40, h: 28, gap: 6 },
          { y: 192, keys: 10, w: 52, h: 28, gap: 6 },
        ];

        rows.forEach((row) => {
          const total = row.keys * row.w + (row.keys - 1) * row.gap;
          let x = (640 - total) / 2;
          for (let k = 0; k < row.keys; k++) {
            drawKey(x, row.y, row.w, row.h);
            x += row.w + row.gap;
          }
        });

        // spacebar + trackpad
        drawKey(215, 238, 210, 28);
        ctx.fillStyle = "rgba(194,164,255,0.10)";
        rr(ctx, 270, 290, 100, 42, 8);
        ctx.fill();
        ctx.strokeStyle = "rgba(194,164,255,0.35)";
        ctx.stroke();
      }),
    []
  );
}

/* ---------------------------------------------------------- floating tokens */
type TokenDef = {
  text: string;
  color: string;
  size: number;
  position: [number, number, number];
  rotation?: [number, number, number];
};

const TOKENS: TokenDef[] = [
  { text: "</>", color: "#ffffff", size: 0.34, position: [-2.25, 1.05, 0.3], rotation: [0, 0.3, -0.15] },
  { text: "{ }", color: "#c2a4ff", size: 0.3, position: [2.25, 0.9, 0.2], rotation: [0, -0.35, 0.1] },
  { text: "() => {}", color: "#f0a8ff", size: 0.2, position: [2.15, -1.05, 0.9], rotation: [0, -0.2, 0.05] },
  { text: "ngOnInit()", color: "#4ade80", size: 0.2, position: [-2.15, -0.95, 0.8], rotation: [0, 0.25, -0.05] },
  { text: "Observable", color: "#7dd3fc", size: 0.21, position: [-1.9, 2.1, -0.35], rotation: [0, 0.15, 0.12] },
  { text: "signal()", color: "#c2a4ff", size: 0.19, position: [1.9, 2.0, -0.3], rotation: [0, -0.18, -0.08] },
  { text: "RxJS", color: "#f472b6", size: 0.26, position: [0.35, 2.45, -0.15], rotation: [0, 0, 0] },
  { text: "TS", color: "#7dd3fc", size: 0.3, position: [2.3, 0.05, -0.4], rotation: [0, -0.5, 0.06] },
];

type CodeTextProps = {
  children: ReactNode;
  color: string;
  size: number;
  position?: ComponentProps<typeof Text>["position"];
  rotation?: ComponentProps<typeof Text>["rotation"];
  anchorX?: ComponentProps<typeof Text>["anchorX"];
  anchorY?: ComponentProps<typeof Text>["anchorY"];
};

function CodeText({
  children,
  color,
  size,
  position,
  rotation,
  anchorX = "center",
  anchorY = "middle",
}: CodeTextProps) {
  const ref = useRef<THREE.Mesh>(null);
  useEffect(() => {
    const mat = ref.current?.material as THREE.MeshBasicMaterial | undefined;
    if (mat) mat.toneMapped = false;
  }, []);
  return (
    <Text
      ref={ref}
      font={FONT_URL}
      color={color}
      fontSize={size}
      letterSpacing={0.02}
      position={position}
      rotation={rotation}
      anchorX={anchorX}
      anchorY={anchorY}
    >
      {children}
    </Text>
  );
}

function FloatingTokens({ mobile }: { mobile: boolean }) {
  const list = mobile ? TOKENS.slice(0, 3) : TOKENS;
  return (
    <group>
      {list.map((t, i) => (
        <Float
          key={t.text}
          speed={1.4 + i * 0.25}
          rotationIntensity={0.5}
          floatIntensity={1.6}
          floatingRange={[-0.15, 0.25]}
        >
          <CodeText
            color={t.color}
            size={t.size}
            position={t.position}
            rotation={t.rotation}
            anchorX="center"
            anchorY="middle"
          >
            {t.text}
          </CodeText>
        </Float>
      ))}
    </group>
  );
}

/* ---------------------------------------------------------------- laptop ---- */
function Laptop({
  screenTexture,
  keyboardTexture,
}: {
  screenTexture: THREE.CanvasTexture;
  keyboardTexture: THREE.CanvasTexture;
}) {
  const screenGlow = useMemo(
    () => makeGlowTexture("rgba(168,85,247,0.55)", "rgba(168,85,247,0.14)"),
    []
  );
  const lidLogo = useMemo(
    () => makeGlowTexture("rgba(255,255,255,0.9)", "rgba(194,164,255,0.2)"),
    []
  );

  return (
    <group>
      {/* soft glow behind the screen */}
      <mesh position={[0, 0.9, -1.7]}>
        <planeGeometry args={[7, 5]} />
        <meshBasicMaterial
          map={screenGlow}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* base */}
      <RoundedBox args={[3.5, 0.09, 2.35]} radius={0.035} smoothness={4} position={[0, -0.05, 0]}>
        <meshStandardMaterial color="#15151b" metalness={0.8} roughness={0.35} />
      </RoundedBox>

      {/* keyboard */}
      <mesh position={[0, 0.01, 0.08]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.2, 1.75]} />
        <meshBasicMaterial map={keyboardTexture} toneMapped={false} />
      </mesh>

      {/* front light bar */}
      <mesh position={[0, -0.02, 1.19]}>
        <planeGeometry args={[2.4, 0.03]} />
        <meshBasicMaterial color="#c2a4ff" toneMapped={false} />
      </mesh>

      {/* screen assembly */}
      <group position={[0, 1.06, -0.88]} rotation={[-0.24, 0, 0]}>
        <RoundedBox args={[3.5, 2.2, 0.07]} radius={0.045} smoothness={4}>
          <meshStandardMaterial color="#0c0c12" metalness={0.7} roughness={0.4} />
        </RoundedBox>
        {/* bezel */}
        <mesh position={[0, 0, 0.04]}>
          <planeGeometry args={[3.38, 2.08]} />
          <meshStandardMaterial color="#050508" metalness={0.5} roughness={0.5} />
        </mesh>
        {/* display */}
        <mesh position={[0, 0, 0.045]}>
          <planeGeometry args={[3.28, 2.0]} />
          <meshBasicMaterial map={screenTexture} toneMapped={false} />
        </mesh>
        {/* lid logo */}
        <mesh position={[0, -1.16, 0.09]} rotation={[Math.PI, 0, 0]}>
          <planeGeometry args={[0.16, 0.16]} />
          <meshBasicMaterial map={lidLogo} transparent depthWrite={false} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ scene --- */
function Rig({ children }: { children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    const { pointer } = state;
    if (!ref.current) return;
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, pointer.x * 0.28, 0.05);
    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, -pointer.y * 0.16, 0.05);
  });
  return <group ref={ref}>{children}</group>;
}

function Scene({ mobile }: { mobile: boolean }) {
  const screenTexture = useEditorTexture();
  const keyboardTexture = useKeyboardTexture();

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 5]} intensity={1.6} color="#ffffff" />
      <directionalLight position={[-5, 2, -3]} intensity={1.1} color="#a855f7" />
      <pointLight position={[3, 1, 3]} intensity={14} color="#f0a8ff" distance={12} decay={2} />

      <Rig>
        <group position={[0, -1.0, 0]}>
          <group rotation={[0.04, -0.35, 0]} scale={mobile ? 0.86 : 1}>
            <Float speed={1.1} rotationIntensity={0.18} floatIntensity={0.6} floatingRange={[-0.08, 0.08]}>
              <Laptop screenTexture={screenTexture} keyboardTexture={keyboardTexture} />
            </Float>
          </group>
          <FloatingTokens mobile={mobile} />
          <Sparkles
            count={mobile ? 24 : 70}
            scale={[8, 4.5, 4]}
            size={2.2}
            speed={0.32}
            opacity={0.5}
            color="#c2a4ff"
          />
        </group>
      </Rig>
    </>
  );
}

/* --------------------------------------------------------------- component -- */
function useIsMobile() {
  const [mobile, setMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 900
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 899px)");
    const onChange = () => setMobile(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return mobile;
}

class GLBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function Hero3D() {
  const mobile = useIsMobile();
  return (
    <GLBoundary>
      <Canvas
        dpr={[1, mobile ? 1.4 : 1.8]}
        camera={{ position: [0, 0.15, 6.4], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
      >
        <Scene mobile={mobile} />
      </Canvas>
    </GLBoundary>
  );
}
