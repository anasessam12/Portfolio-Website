import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import setCharacter from "./utils/character";
import setLighting from "./utils/lighting";
import { useLoading } from "../../context/LoadingProvider";
import handleResize from "./utils/resizeUtils";
import {
  handleMouseMove,
  handleTouchEnd,
  handleHeadRotation,
  handleTouchMove,
} from "./utils/mouseUtils";
import setAnimations from "./utils/animationUtils";
import { setProgress } from "../Loading";
import { ScreenTextureController } from "./utils/screenTexture";
import { createAmbientParticles } from "./utils/particles";

const Scene = () => {
  const canvasDiv = useRef<HTMLDivElement | null>(null);
  const hoverDivRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef(new THREE.Scene());
  const { setLoading } = useLoading();

  const [character, setChar] = useState<THREE.Object3D | null>(null);

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

      let headBone: THREE.Object3D | null = null;
      let screenLight: any | null = null;
      let mixer: THREE.AnimationMixer;

      const clock = new THREE.Clock();

      // Setup dynamic animated screen texture and particles
      const screenTextureCtrl = new ScreenTextureController();
      const particlesCtrl = createAmbientParticles(scene);
      const light = setLighting(scene);

      const progress = setProgress((value) => setLoading(value));
      const { loadCharacter } = setCharacter(
        renderer,
        scene,
        camera,
        screenTextureCtrl.texture
      );

      let animFrameId: number;

      loadCharacter()
        .then((gltf) => {
          if (gltf) {
            const animations = setAnimations(gltf);
            if (hoverDivRef.current) {
              animations.hover(gltf, hoverDivRef.current);
            }
            mixer = animations.mixer;
            const charScene = gltf.scene;
            setChar(charScene);
            scene.add(charScene);
            headBone = charScene.getObjectByName("spine006") || null;
            screenLight = charScene.getObjectByName("screenlight") || null;

            progress.loaded().then(() => {
              setTimeout(() => {
                light.turnOnLights();
                animations.startIntro();
              }, 2500);
            });

            window.addEventListener("resize", () =>
              handleResize(renderer, camera, canvasDiv, charScene)
            );
          } else {
            progress.loaded();
          }
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

      // Interactive click feedback
      const onCanvasClick = () => {
        if (!screenLight) return;
        if (screenLight.material) {
          screenLight.material.emissiveIntensity = 4.0;
          setTimeout(() => {
            if (screenLight && screenLight.material) {
              screenLight.material.emissiveIntensity = 1.5;
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

      const animate = () => {
        animFrameId = requestAnimationFrame(animate);
        const delta = clock.getDelta();
        const elapsed = clock.getElapsedTime();

        // Update animated code screen texture & particle galaxy
        screenTextureCtrl.update(delta);
        particlesCtrl.update(elapsed, mouse.x, mouse.y);

        // Smooth subtle 3D scene tilt / parallax when at top
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

        if (headBone) {
          handleHeadRotation(
            headBone,
            mouse.x,
            mouse.y,
            interpolation.x,
            interpolation.y,
            THREE.MathUtils.lerp
          );
          light.setPointLight(screenLight);
        }

        if (mixer) {
          mixer.update(delta);
        }

        renderer.render(scene, camera);
      };

      animate();

      return () => {
        cancelAnimationFrame(animFrameId);
        window.clearTimeout(debounce);
        scene.clear();
        screenTextureCtrl.dispose();
        particlesCtrl.dispose();
        renderer.dispose();

        window.removeEventListener("resize", () =>
          handleResize(renderer, camera, canvasDiv, character!)
        );
        if (canvasDiv.current && renderer.domElement.parentNode === canvasDiv.current) {
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
