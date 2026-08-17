import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

/**
 * AboutVisual — the 3D canvas inside the About section's "holographic core"
 * card (the card shell itself is rendered statically in About.tsx).
 *
 * Two nested wireframe icosahedrons breathe and spin around a bright core,
 * wrapped in an orbit ring and a particle shell. The scene tilts toward the
 * cursor while hovering the card, and pauses when scrolled out of view.
 */

const PARTICLE_COUNT = 42;
const SHELL_RADIUS = 1.52;

const CoreSystem = () => {
  const group = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Mesh>(null);
  const shell = useRef<THREE.Points>(null);
  const ring = useRef<THREE.Mesh>(null);

  const particles = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Even-ish scatter over a sphere shell.
      const theta = Math.acos(2 * Math.random() - 1);
      const phi = Math.random() * Math.PI * 2;
      positions[i * 3] = SHELL_RADIUS * Math.sin(theta) * Math.cos(phi);
      positions[i * 3 + 1] = SHELL_RADIUS * Math.cos(theta);
      positions[i * 3 + 2] = SHELL_RADIUS * Math.sin(theta) * Math.sin(phi);
    }
    return positions;
  }, []);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;

    // Cursor parallax (pointer is normalized over this small canvas).
    g.rotation.y = THREE.MathUtils.lerp(
      g.rotation.y,
      state.pointer.x * 0.5,
      0.06
    );
    g.rotation.x = THREE.MathUtils.lerp(
      g.rotation.x,
      -state.pointer.y * 0.35,
      0.06
    );

    if (inner.current) {
      inner.current.rotation.y += delta * 0.5;
      inner.current.rotation.z -= delta * 0.22;
      // Breathing pulse.
      const s = 1 + Math.sin(state.clock.elapsedTime * 1.8) * 0.07;
      inner.current.scale.setScalar(s);
    }
    if (shell.current) {
      shell.current.rotation.y -= delta * 0.12;
      shell.current.rotation.x += delta * 0.05;
    }
    if (ring.current) {
      ring.current.rotation.z += delta * 0.35;
    }
  });

  return (
    <group ref={group} scale={0.92}>
      {/* Outer cage */}
      <mesh>
        <icosahedronGeometry args={[1.08, 0]} />
        <meshBasicMaterial color="#8a63ff" wireframe transparent opacity={0.5} />
      </mesh>
      {/* Inner breathing cage */}
      <mesh ref={inner}>
        <icosahedronGeometry args={[0.6, 1]} />
        <meshBasicMaterial color="#fb8dff" wireframe transparent opacity={0.75} />
      </mesh>
      {/* Bright core */}
      <mesh>
        <sphereGeometry args={[0.15, 24, 24]} />
        <meshBasicMaterial color="#f4ecff" />
      </mesh>
      {/* Halo ring */}
      <mesh ref={ring} rotation={[Math.PI / 2.15, 0.3, 0]}>
        <torusGeometry args={[1.34, 0.006, 8, 128]} />
        <meshBasicMaterial color="#c2a4ff" transparent opacity={0.4} />
      </mesh>
      {/* Particle shell */}
      <points ref={shell}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particles, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#d7c2ff"
          size={0.045}
          sizeAttenuation
          transparent
          opacity={0.85}
        />
      </points>
    </group>
  );
};

const AboutVisual = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);

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
    <div className="about-visual-canvas" ref={wrapperRef}>
      <Canvas
        frameloop={active ? "always" : "never"}
        dpr={[1, 1.75]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
        camera={{ fov: 40, position: [0, 0, 4.4] }}
      >
        <Float speed={1.6} rotationIntensity={0.35} floatIntensity={0.9}>
          <CoreSystem />
        </Float>
      </Canvas>
    </div>
  );
};

export default AboutVisual;
