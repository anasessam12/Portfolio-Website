import * as THREE from "three";
import { RGBELoader } from "three-stdlib";
import { gsap } from "gsap";

const setLighting = (scene: THREE.Scene) => {
  // Key Directional Light (Front-Right Soft Purple)
  const directionalLight = new THREE.DirectionalLight(0xd4b8ff, 0);
  directionalLight.position.set(4, 14, 10);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 60;
  directionalLight.shadow.bias = -0.0005;
  scene.add(directionalLight);

  // Cyber Backlight / Rim Light (Intense Cyan/Violet)
  const rimLight = new THREE.DirectionalLight(0x38bdf8, 0);
  rimLight.position.set(-6, 12, -8);
  scene.add(rimLight);

  // Soft Front Fill Light (Balanced studio warmth)
  const fillLight = new THREE.DirectionalLight(0xffeedd, 0);
  fillLight.position.set(-3, 6, 8);
  scene.add(fillLight);

  // Accent point light near the character's head/visor (replaces the old
  // monitor screen glow; provides a cyan neon uplight on the face).
  const pointLight = new THREE.PointLight(0x818cf8, 0, 80, 2.5);
  pointLight.position.set(0, 11.8, 4.5);
  scene.add(pointLight);

  // Neon underglow at the character's feet (replaces the old keyboard glow).
  const underglow = new THREE.PointLight(0xa855f7, 0, 20, 2);
  underglow.position.set(0, 4.0, 3.5);
  scene.add(underglow);

  // HDR Environment Mapping
  new RGBELoader()
    .setPath("/models/")
    .load("char_enviorment.hdr", function (texture) {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = texture;
      scene.environmentIntensity = 0;
      scene.environmentRotation.set(5.76, 85.85, 1);
    });

  const duration = 2.2;
  const ease = "power2.inOut";

  function turnOnLights() {
    gsap.to(scene, {
      environmentIntensity: 0.85,
      duration: duration,
      ease: ease,
    });
    gsap.to(directionalLight, {
      intensity: 1.8,
      duration: duration,
      ease: ease,
    });
    gsap.to(rimLight, {
      intensity: 2.2,
      duration: duration,
      ease: ease,
    });
    gsap.to(fillLight, {
      intensity: 0.9,
      duration: duration,
      ease: ease,
    });
    gsap.to(pointLight, {
      intensity: 1.2,
      duration: duration,
      ease: ease,
    });
    gsap.to(underglow, {
      intensity: 1.6,
      duration: duration,
      ease: ease,
    });
    gsap.to(".character-rim", {
      y: "55%",
      opacity: 1,
      delay: 0.2,
      duration: 2,
    });
  }

  return { turnOnLights };
};

export default setLighting;
