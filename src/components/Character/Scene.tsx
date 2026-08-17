import { useEffect, useRef } from "react";
import * as THREE from "three";
import setCharacter from "./utils/character";
import setLighting from "./utils/lighting";
import { useLoading } from "../../context/LoadingProvider";
import handleResize from "./utils/resizeUtils";
import {
  handleMouseMove,
  handleTouchEnd,
  handleTouchMove,
} from "./utils/mouseUtils";
import setAnimations from "./utils/animationUtils";
import { setProgress } from "../Loading";
import { createAmbientParticles } from "./utils/particles";
import type { HumanoidBones } from "./utils/bones";

const Scene = () => {
  const canvasDiv = useRef<HTMLDivElement | null>(null);
  const hoverDivRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef(new THREE.Scene());
  const { setLoading } = useLoading();

  useEffect(() => {
    if (canvasDiv.current) {
      const rect = canvasDiv.current.getBoundingClientRect();
      const container = { width: rect.width, height: rect.height };
      const aspect = container.width / container.height;
      const scene = sceneRef.current;

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
      renderer.setSize(container.width, container.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      canvasDiv.current.appendChild(renderer.domElement);

      const camera = new THREE.PerspectiveCamera(14.5, aspect, 0.1, 1000);
      camera.position.z = 10;
      camera.position.set(0, 13.1, 24.7);
      camera.zoom = 1.1;
      camera.updateProjectionMatrix();

      let mixer: THREE.AnimationMixer;
      let bones: HumanoidBones | null = null;
      let applyHeadLook:
        | ((rotX: number, rotY: number) => void)
        | null = null;
      let visor: THREE.Mesh | null = null;
      let charScene: THREE.Object3D | null = null;

      const clock = new THREE.Clock();

      // Ambient animated particles and cyberpunk studio lighting.
      const particlesCtrl = createAmbientParticles(scene);
      const light = setLighting(scene);

      const progress = setProgress((value) => setLoading(value));
      const { loadCharacter } = setCharacter(renderer, scene, camera);

      let animFrameId: number;

      loadCharacter()
        .then((loaded) => {
          charScene = loaded.object;
          bones = loaded.bones;
          visor = loaded.visor;

          const animations = setAnimations(loaded.gltf, bones);
          // (Hover interactions were model-specific eyebrow controls; the new
          // humanoid keeps click/visor feedback instead.)
          void hoverDivRef;
          mixer = animations.mixer;
          applyHeadLook = animations.applyHeadLook;

          progress.loaded().then(() => {
            setTimeout(() => {
              light.turnOnLights();
              animations.startIntro();
            }, 1500);
          });

          window.addEventListener("resize", () =>
            handleResize(renderer, camera, canvasDiv, charScene!)
          );
        })
        .catch((err) => {
          console.error("Character failed to load:", err);
          progress.loaded();
        });

      let mouse = { x: 0, y: 0 };
      let interpolation = { x: 0.1, y: 0.2 };

      const onMouseMove = (event: MouseEvent) => {
        handleMouseMove(event, (x, y) => {
          mouse.x = x;
          mouse.y = y;
        });
      };

      let debounce: number | undefined;
      const onTouchStart = (event: TouchEvent) => {
        const element = event.target as HTMLElement;
        debounce = window.setTimeout(() => {
          element?.addEventListener("touchmove", (e: TouchEvent) =>
            handleTouchMove(e, (x, y) => {
              mouse.x = x;
              mouse.y = y;
            })
          );
        }, 200);
      };

      const onTouchEnd = () => {
        handleTouchEnd((x, y, interpolationX, interpolationY) => {
          mouse = { x, y };
          interpolation = { x: interpolationX, y: interpolationY };
        });
      };

      // Interactive click feedback: pulse the visor glow.
      const onCanvasClick = () => {
        if (!visor) return;
        const mat = visor.material as THREE.MeshStandardMaterial;
        if (mat?.emissive) {
          const base = 1.6;
          mat.emissiveIntensity = 4.5;
          setTimeout(() => {
            if (visor) {
              (visor.material as THREE.MeshStandardMaterial).emissiveIntensity =
                base;
            }
          }, 300);
        }
      };

      document.addEventListener("mousemove", onMouseMove);
      const landingDiv = document.getElementById("landingDiv");
      if (landingDiv) {
        landingDiv.addEventListener("touchstart", onTouchStart);
        landingDiv.addEventListener("touchend", onTouchEnd);
        landingDiv.addEventListener("click", onCanvasClick);
      }

      // Local head-look target (mirrors mouseUtils.handleHeadRotation math,
      // but applied via applyHeadLook so it composes over the idle clip).
      const targetHeadRot = { x: 0, y: 0 };
      const currentHeadRot = { x: 0, y: 0 };

      const updateHeadLook = () => {
        if (!applyHeadLook) return;
        if (window.scrollY < 200) {
          const maxRotation = Math.PI / 6;
          targetHeadRot.y = mouse.x * maxRotation;
          const minRotationX = -0.3;
          const maxRotationX = 0.4;
          if (mouse.y > minRotationX) {
            if (mouse.y < maxRotationX) {
              targetHeadRot.x = -mouse.y - 0.5 * maxRotation;
            } else {
              targetHeadRot.x = -maxRotationX - 0.5 * maxRotation;
            }
          } else {
            targetHeadRot.x = -minRotationX - 0.5 * maxRotation;
          }
        } else if (window.innerWidth > 1024) {
          targetHeadRot.x = -0.4;
          targetHeadRot.y = -0.3;
        }

        currentHeadRot.x = THREE.MathUtils.lerp(
          currentHeadRot.x,
          targetHeadRot.x,
          interpolation.x
        );
        currentHeadRot.y = THREE.MathUtils.lerp(
          currentHeadRot.y,
          targetHeadRot.y,
          interpolation.y
        );
        applyHeadLook(currentHeadRot.x, currentHeadRot.y);
      };

      const animate = () => {
        animFrameId = requestAnimationFrame(animate);
        const delta = clock.getDelta();
        const elapsed = clock.getElapsedTime();

        // Update animated particle galaxy.
        particlesCtrl.update(elapsed, mouse.x, mouse.y);

        // Smooth subtle 3D scene tilt / parallax when at top.
        if (window.scrollY < 400) {
          scene.rotation.y = THREE.MathUtils.lerp(
            scene.rotation.y,
            mouse.x * 0.05,
            0.04
          );
          scene.rotation.x = THREE.MathUtils.lerp(
            scene.rotation.x,
            -mouse.y * 0.025,
            0.04
          );
        }

        if (mixer) {
          mixer.update(delta);
        }
        // Apply AFTER mixer.update so mouse look wins over the idle clip.
        updateHeadLook();

        renderer.render(scene, camera);
      };

      animate();

      return () => {
        cancelAnimationFrame(animFrameId);
        window.clearTimeout(debounce);
        scene.clear();
        particlesCtrl.dispose();
        renderer.dispose();

        window.removeEventListener("resize", () =>
          handleResize(renderer, camera, canvasDiv, charScene!)
        );
        if (
          canvasDiv.current &&
          renderer.domElement.parentNode === canvasDiv.current
        ) {
          canvasDiv.current.removeChild(renderer.domElement);
        }
        document.removeEventListener("mousemove", onMouseMove);
        if (landingDiv) {
          landingDiv.removeEventListener("touchstart", onTouchStart);
          landingDiv.removeEventListener("touchend", onTouchEnd);
          landingDiv.removeEventListener("click", onCanvasClick);
        }
      };
    }
  }, []);

  return (
    <>
      <div className="character-container">
        <div className="character-model" ref={canvasDiv}>
          <div className="character-rim"></div>
          <div className="character-hover" ref={hoverDivRef}></div>
        </div>
      </div>
    </>
  );
};

export default Scene;
