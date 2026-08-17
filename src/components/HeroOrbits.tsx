import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * HeroOrbits — a lightweight 3D backdrop for the hero section.
 *
 * Renders three tilted wireframe "orbit" rings with small glowing satellites
 * travelling along them, slowly spinning behind the character model.
 * The whole system gently follows the mouse for a parallax feel.
 * Rendering pauses automatically when the hero scrolls out of view.
 */

type RingSpec = {
  radius: number;
  tube: number;
  color: string;
  opacity: number;
  tilt: [number, number, number];
  spin: number;
  orbColor: string;
  orbSize: number;
  orbSpeed: number;
  orbPhase: number;
};

const RINGS: RingSpec[] = [
  {
    radius: 2.15,
    tube: 0.011,
    color: "#c2a4ff",
    opacity: 0.6,
    tilt: [1.18, 0.18, 0.1],
    spin: 0.1,
    orbColor: "#fb8dff",
    orbSize: 0.05,
    orbSpeed: 0.55,
    orbPhase: 0,
  },
  {
    radius: 2.75,
    tube: 0.007,
    color: "#7d5fff",
    opacity: 0.34,
    tilt: [1.36, -0.24, -0.14],
    spin: -0.07,
    orbColor: "#c2a4ff",
    orbSize: 0.038,
    orbSpeed: 0.34,
    orbPhase: 2.2,
  },
  {
    radius: 1.68,
    tube: 0.007,
    color: "#ffffff",
    opacity: 0.26,
    tilt: [1.02, 0.4, 0.32],
    spin: 0.14,
    orbColor: "#ffffff",
    orbSize: 0.03,
    orbSpeed: 0.8,
    orbPhase: 4.1,
  },
];

const Ring = ({ spec }: { spec: RingSpec }) => {
  const ringRef = useRef<THREE.Group>(null);
  const orbRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += spec.spin * 0.016;
    }
    if (orbRef.current) {
      const a = state.clock.elapsedTime * spec.orbSpeed + spec.orbPhase;
      orbRef.current.position.set(
        Math.cos(a) * spec.radius,
        Math.sin(a) * spec.radius,
        0
      );
    }
  });

  return (
    <group rotation={spec.tilt}>
      <group ref={ringRef}>
        <mesh>
          <torusGeometry args={[spec.radius, spec.tube, 8, 160]} />
          <meshBasicMaterial
            color={spec.color}
            transparent
            opacity={spec.opacity}
          />
        </mesh>
      </group>
      <mesh ref={orbRef}>
        <sphereGeometry args={[spec.orbSize, 16, 16]} />
        <meshBasicMaterial color={spec.orbColor} />
      </mesh>
    </group>
  );
};

const OrbitSystem = () => {
  const group = useRef<THREE.Group>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    // Shrink the system on narrow canvases so the rings stay composed
    // instead of spilling off-screen on portrait phones.
    const aspect = state.size.width / state.size.height;
    const targetScale = THREE.MathUtils.clamp(aspect / 1.15, 0.52, 1);
    g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x, targetScale, 0.1));

    g.rotation.y = THREE.MathUtils.lerp(
      g.rotation.y,
      mouse.current.x * 0.22,
      0.035
    );
    g.rotation.x = THREE.MathUtils.lerp(
      g.rotation.x,
      -mouse.current.y * 0.1,
      0.035
    );
  });

  return (
    <group ref={group} position={[0, -0.55, 0]}>
      {RINGS.map((spec, i) => (
        <Ring key={i} spec={spec} />
      ))}
    </group>
  );
};

const HeroOrbits = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);

  // Pause the render loop once the hero has scrolled away.
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="hero-orbits" ref={wrapperRef} aria-hidden="true">
      <div className="hero-orbits-inner">
        <Canvas
          frameloop={active ? "always" : "never"}
          dpr={[1, 1.75]}
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: "high-performance",
          }}
          camera={{ fov: 32, position: [0, 1.1, 7] }}
        >
          <OrbitSystem />
        </Canvas>
      </div>
    </div>
  );
};

export default HeroOrbits;
