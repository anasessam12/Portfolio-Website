import * as THREE from "three";

export function createAmbientParticles(scene: THREE.Scene) {
  const particleCount = 70;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  const velocities: { x: number; y: number; z: number; phase: number }[] = [];

  const colorPalette = [
    new THREE.Color("#c2a4ff"), // Accent violet
    new THREE.Color("#38bdf8"), // Electric sky blue
    new THREE.Color("#a855f7"), // Deep purple
    new THREE.Color("#f472b6"), // Neon pink
    new THREE.Color("#e0e7ff"), // Soft starlight
  ];

  for (let i = 0; i < particleCount; i++) {
    // Distribute around the desk and character area
    positions[i * 3 + 0] = (Math.random() - 0.5) * 22;
    positions[i * 3 + 1] = Math.random() * 18 + 2;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 16;

    const chosenColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    colors[i * 3 + 0] = chosenColor.r;
    colors[i * 3 + 1] = chosenColor.g;
    colors[i * 3 + 2] = chosenColor.b;

    sizes[i] = Math.random() * 12 + 6;

    velocities.push({
      x: (Math.random() - 0.5) * 0.008,
      y: (Math.random() - 0.5) * 0.006,
      z: (Math.random() - 0.5) * 0.008,
      phase: Math.random() * Math.PI * 2,
    });
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

  // Circular glowing particle texture
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
  gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
  gradient.addColorStop(0.3, "rgba(194, 164, 255, 0.8)");
  gradient.addColorStop(0.7, "rgba(56, 189, 248, 0.2)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  const particleTexture = new THREE.CanvasTexture(canvas);

  const material = new THREE.PointsMaterial({
    size: 0.35,
    vertexColors: true,
    map: particleTexture,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const particleSystem = new THREE.Points(geometry, material);
  scene.add(particleSystem);

  // Soft glowing contact floor disc under the desk/character
  const floorGeo = new THREE.PlaneGeometry(16, 16);
  const floorCanvas = document.createElement("canvas");
  floorCanvas.width = 256;
  floorCanvas.height = 256;
  const fCtx = floorCanvas.getContext("2d")!;
  const fGrad = fCtx.createRadialGradient(128, 128, 10, 128, 128, 120);
  fGrad.addColorStop(0, "rgba(194, 164, 255, 0.18)");
  fGrad.addColorStop(0.5, "rgba(80, 40, 140, 0.08)");
  fGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  fCtx.fillStyle = fGrad;
  fCtx.fillRect(0, 0, 256, 256);

  const floorTex = new THREE.CanvasTexture(floorCanvas);
  const floorMat = new THREE.MeshBasicMaterial({
    map: floorTex,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const floorDisc = new THREE.Mesh(floorGeo, floorMat);
  floorDisc.rotation.x = -Math.PI / 2;
  floorDisc.position.set(0, 3.3, 0);
  scene.add(floorDisc);

  return {
    update: (time: number, mouseX: number, mouseY: number) => {
      const posAttr = geometry.getAttribute("position") as THREE.BufferAttribute;
      const array = posAttr.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const vel = velocities[i];
        vel.phase += 0.015;

        // Gentle floating orbit motion
        array[i * 3 + 0] += vel.x + Math.sin(vel.phase + time) * 0.005 + mouseX * 0.01;
        array[i * 3 + 1] += vel.y + Math.cos(vel.phase * 0.8) * 0.004 - mouseY * 0.008;
        array[i * 3 + 2] += vel.z + Math.sin(vel.phase * 0.5) * 0.005;

        // Boundary wrap
        if (array[i * 3 + 0] > 14) array[i * 3 + 0] = -14;
        if (array[i * 3 + 0] < -14) array[i * 3 + 0] = 14;
        if (array[i * 3 + 1] > 20) array[i * 3 + 1] = 3;
        if (array[i * 3 + 1] < 3) array[i * 3 + 1] = 20;
        if (array[i * 3 + 2] > 10) array[i * 3 + 2] = -10;
        if (array[i * 3 + 2] < -10) array[i * 3 + 2] = 10;
      }

      posAttr.needsUpdate = true;
      floorDisc.rotation.z += 0.001;
    },
    dispose: () => {
      geometry.dispose();
      material.dispose();
      particleTexture.dispose();
      floorGeo.dispose();
      floorMat.dispose();
      floorTex.dispose();
      scene.remove(particleSystem);
      scene.remove(floorDisc);
    },
  };
}
