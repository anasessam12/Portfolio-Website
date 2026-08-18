import {
  Component,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { useProject } from "../context/ProjectContext";
import {
  FloatingTokens,
  LaptopModel,
  setLaptopAwake,
  setLaptopSnippet,
} from "./three/LaptopScene";
import "./styles/ScrollLaptop.css";

/* ============================================================================
   ScrollLaptop — one fixed WebGL layer that carries the 3D laptop across the
   whole page. Each section owns a keyframe (position / rotation / scale /
   opacity / code snippet); the laptop eases between them as that section
   travels through the middle of the viewport, so the model appears to fly from
   the hero into About, Services, Career and Contact while you scroll.
   ============================================================================ */

type Keyframe = {
  /** CSS selector for the section that owns this pose. */
  selector: string;
  /**
   * `[xFrac, y, z]` — x is a fraction of the visible width (-1 = left edge,
   * +1 = right edge) so the laptop keeps the same screen position on any
   * aspect ratio; y and z are plain world units.
   */
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  /** Layer opacity — content-heavy sections keep the laptop as a soft accent. */
  opacity: number;
  /** Which code snippet the screen types while this pose is active. */
  snippet: number;
  /** Floating code tokens are a hero-only flourish. */
  tokens?: number;
};

const KEYFRAMES: Keyframe[] = [
  {
    // Hero — parked in the right-hand column, front and centre.
    selector: ".landing-section",
    position: [0.47, -0.95, 0],
    rotation: [0.05, -0.38, 0],
    scale: 0.86,
    opacity: 1,
    snippet: 0,
    tokens: 1,
  },
  {
    // About — swings out to the right margin, dimmed behind the glass cards.
    selector: ".about-section",
    position: [0.62, -0.6, -0.8],
    rotation: [0.14, -0.62, -0.04],
    scale: 0.72,
    opacity: 0.5,
    snippet: 1,
    tokens: 0,
  },
  {
    // Services — crosses the page to the left and tilts the other way.
    selector: ".whatIDO",
    position: [-0.64, -0.5, -1.0],
    rotation: [0.13, 0.66, 0.05],
    scale: 0.68,
    opacity: 0.4,
    snippet: 2,
    tokens: 0,
  },
  {
    // Career — drifts back to the right and further away.
    selector: ".career-section",
    position: [0.68, -0.45, -1.4],
    rotation: [0.18, -0.72, -0.06],
    scale: 0.62,
    opacity: 0.34,
    snippet: 3,
    tokens: 0,
  },
  {
    // Work is a pinned, opaque rail — the laptop steps out of the way.
    selector: ".work-section",
    position: [-0.9, -1.1, -2.4],
    rotation: [0.22, 0.88, 0.08],
    scale: 0.55,
    opacity: 0,
    snippet: 3,
    tokens: 0,
  },
  {
    // Techstack runs its own WebGL scene — stay hidden.
    selector: ".techstack",
    position: [0, -1.7, -3.5],
    rotation: [0.28, 0.2, 0],
    scale: 0.45,
    opacity: 0,
    snippet: 4,
    tokens: 0,
  },
  {
    // Contact — comes home to the centre and opens back up.
    selector: ".contact-section",
    position: [0, -1.0, -0.6],
    rotation: [0.07, -0.08, 0],
    scale: 0.78,
    opacity: 0.5,
    snippet: 4,
    tokens: 0,
  },
];

const smoothstep = (t: number) => t * t * (3 - 2 * t);

/* ------------------------------------------------------------------- rig --- */
function LaptopRig() {
  const travel = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const tokensRef = useRef<THREE.Group>(null);

  // Live DOM handles for every keyframe section (re-resolved on layout changes).
  const nodes = useRef<(HTMLElement | null)[]>([]);
  const resolve = () => {
    nodes.current = KEYFRAMES.map(
      (k) => document.querySelector<HTMLElement>(k.selector) ?? null
    );
  };

  useEffect(() => {
    resolve();
    // Sections mount lazily (TechStack) and Work re-parents itself into a
    // ScrollTrigger pin-spacer — keep re-resolving until everything is found,
    // then stop polling.
    const id = window.setInterval(() => {
      resolve();
      if (nodes.current.every(Boolean)) window.clearInterval(id);
    }, 1000);
    window.addEventListener("resize", resolve);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("resize", resolve);
    };
  }, []);

  // mutable animation state
  const current = useRef({
    pos: new THREE.Vector3(...KEYFRAMES[0].position),
    rot: new THREE.Euler(...KEYFRAMES[0].rotation),
    scale: KEYFRAMES[0].scale,
    opacity: 0,
    tokens: 1,
  });
  const target = useMemo(
    () => ({
      pos: new THREE.Vector3(),
      rot: new THREE.Euler(),
      scale: 1,
      opacity: 1,
      tokens: 1,
    }),
    []
  );

  const lastScroll = useRef(
    typeof window !== "undefined" ? window.scrollY : 0
  );
  const velocity = useRef(0);
  const snippet = useRef(-1);
  const layer = useRef<HTMLElement | null>(null);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);

    /* ---------------------------------------------- where are we on the page */
    const centers: number[] = [];
    const viewportCenter = window.innerHeight / 2;
    nodes.current.forEach((el) => {
      if (!el) {
        centers.push(Number.NaN);
        return;
      }
      const rect = el.getBoundingClientRect();
      centers.push(rect.top + rect.height / 2);
    });

    // Skip sections that are not mounted (TechStack is desktop-only).
    const live = centers
      .map((c, i) => ({ c, i }))
      .filter((entry) => !Number.isNaN(entry.c));

    if (live.length) {
      let a = live[0].i;
      let b = live[0].i;
      let t = 0;

      if (viewportCenter <= live[0].c) {
        a = b = live[0].i;
      } else if (viewportCenter >= live[live.length - 1].c) {
        a = b = live[live.length - 1].i;
      } else {
        for (let k = 0; k < live.length - 1; k++) {
          if (viewportCenter >= live[k].c && viewportCenter < live[k + 1].c) {
            a = live[k].i;
            b = live[k + 1].i;
            const span = live[k + 1].c - live[k].c || 1;
            t = smoothstep(
              THREE.MathUtils.clamp((viewportCenter - live[k].c) / span, 0, 1)
            );
            break;
          }
        }
      }

      const from = KEYFRAMES[a];
      const to = KEYFRAMES[b];

      target.pos.set(
        THREE.MathUtils.lerp(from.position[0], to.position[0], t),
        THREE.MathUtils.lerp(from.position[1], to.position[1], t),
        THREE.MathUtils.lerp(from.position[2], to.position[2], t)
      );
      target.rot.set(
        THREE.MathUtils.lerp(from.rotation[0], to.rotation[0], t),
        THREE.MathUtils.lerp(from.rotation[1], to.rotation[1], t),
        THREE.MathUtils.lerp(from.rotation[2], to.rotation[2], t)
      );
      target.scale = THREE.MathUtils.lerp(from.scale, to.scale, t);
      target.opacity = THREE.MathUtils.lerp(from.opacity, to.opacity, t);
      target.tokens = THREE.MathUtils.lerp(from.tokens ?? 0, to.tokens ?? 0, t);

      const wanted = t < 0.5 ? from.snippet : to.snippet;
      if (wanted !== snippet.current) {
        snippet.current = wanted;
        setLaptopSnippet(wanted);
      }
    }

    /* ------------------------------------------------------ scroll reactions */
    const scrollY = window.scrollY;
    const dScroll = scrollY - lastScroll.current;
    lastScroll.current = scrollY;
    velocity.current = THREE.MathUtils.damp(
      velocity.current,
      THREE.MathUtils.clamp(dScroll, -140, 140),
      6,
      dt
    );

    /* ------------------------------------------------------------- easing in */
    const cur = current.current;
    const rate = 3.2;
    cur.pos.set(
      THREE.MathUtils.damp(cur.pos.x, target.pos.x, rate, dt),
      THREE.MathUtils.damp(cur.pos.y, target.pos.y, rate, dt),
      THREE.MathUtils.damp(cur.pos.z, target.pos.z, rate, dt)
    );
    cur.rot.set(
      THREE.MathUtils.damp(cur.rot.x, target.rot.x, rate, dt),
      THREE.MathUtils.damp(cur.rot.y, target.rot.y, rate, dt),
      THREE.MathUtils.damp(cur.rot.z, target.rot.z, rate, dt)
    );
    cur.scale = THREE.MathUtils.damp(cur.scale, target.scale, rate, dt);
    cur.opacity = THREE.MathUtils.damp(cur.opacity, target.opacity, 4, dt);
    cur.tokens = THREE.MathUtils.damp(cur.tokens, target.tokens, 4, dt);

    if (travel.current) {
      // x is stored as a fraction of the visible width — resolve it against
      // the live camera so the pose holds on every aspect ratio.
      const cam = state.camera as THREE.PerspectiveCamera;
      const distance = Math.max(0.1, cam.position.z - cur.pos.z);
      const halfHeight = Math.tan((cam.fov * Math.PI) / 360) * distance;
      const halfWidth = halfHeight * cam.aspect;

      // pointer parallax keeps it alive when the page is still
      const px = state.pointer.x * 0.22;
      const py = state.pointer.y * 0.14;
      travel.current.position.set(
        cur.pos.x * halfWidth + px,
        cur.pos.y + py,
        cur.pos.z
      );
      travel.current.scale.setScalar(cur.scale);
    }

    if (spin.current) {
      // base pose + a little yaw/roll driven by how fast you are scrolling
      spin.current.rotation.set(
        cur.rot.x - state.pointer.y * 0.06 + velocity.current * 0.0009,
        cur.rot.y + state.pointer.x * 0.12 + velocity.current * 0.0016,
        cur.rot.z - velocity.current * 0.0011
      );
    }

    if (tokensRef.current) {
      tokensRef.current.visible = cur.tokens > 0.02;
      tokensRef.current.scale.setScalar(0.6 + cur.tokens * 0.4);
      const mat = tokensRef.current;
      mat.traverse((child) => {
        const mesh = child as THREE.Mesh;
        const m = mesh.material as THREE.Material | undefined;
        if (m && "opacity" in m) {
          m.transparent = true;
          (m as THREE.MeshBasicMaterial).opacity = cur.tokens;
        }
      });
    }

    /* -------------------------------------------------- fade the whole layer */
    layer.current ??= document.querySelector<HTMLElement>(".scroll-laptop");
    if (layer.current) {
      const o = cur.opacity;
      layer.current.style.opacity = o.toFixed(3);
      layer.current.style.visibility = o < 0.01 ? "hidden" : "visible";
    }
    setLaptopAwake(cur.opacity > 0.02);
  });

  return (
    <group ref={travel}>
      <group ref={spin}>
        <LaptopModel />
      </group>
      <group ref={tokensRef}>
        <FloatingTokens mobile={false} />
      </group>
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 5]} intensity={1.6} color="#ffffff" />
      <directionalLight position={[-5, 2, -3]} intensity={1.1} color="#a855f7" />
      <pointLight
        position={[3, 1, 3]}
        intensity={14}
        color="#f0a8ff"
        distance={12}
        decay={2}
      />
      <LaptopRig />
      <Sparkles
        count={46}
        scale={[11, 6, 5]}
        size={2.2}
        speed={0.3}
        opacity={0.4}
        color="#c2a4ff"
      />
    </>
  );
}

/* --------------------------------------------------------------- component -- */
class GLBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function useEnabled() {
  const query = "(min-width: 1025px) and (prefers-reduced-motion: no-preference)";
  const [enabled, setEnabled] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setEnabled(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return enabled;
}

export default function ScrollLaptop() {
  const enabled = useEnabled();
  const { activeProjectSlug } = useProject();
  // A project case-study overlay covers the page — stop rendering behind it.
  const hidden = Boolean(activeProjectSlug);

  if (!enabled) return null;

  return (
    <GLBoundary>
      <div
        className={`scroll-laptop ${hidden ? "scroll-laptop-off" : ""}`}
        aria-hidden="true"
      >
        <Canvas
          dpr={[1, 1.7]}
          frameloop={hidden ? "never" : "always"}
          camera={{ position: [0, 0.15, 6.4], fov: 42 }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          style={{ background: "transparent" }}
        >
          <Scene />
        </Canvas>
      </div>
    </GLBoundary>
  );
}
