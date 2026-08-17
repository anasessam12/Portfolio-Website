import * as THREE from "three";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { setCharTimeline, setAllTimeline } from "../../utils/GsapScroll";
import { findHumanoidBones } from "./bones";

export default function handleResize(
  renderer: THREE.WebGLRenderer,
  camera: THREE.PerspectiveCamera,
  canvasDiv: React.RefObject<HTMLDivElement>,
  character: THREE.Object3D
) {
  if (!canvasDiv.current) return;
  let canvas3d = canvasDiv.current.getBoundingClientRect();
  const width = canvas3d.width;
  const height = canvas3d.height;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  const workTrigger = ScrollTrigger.getById("work");
  ScrollTrigger.getAll().forEach((trigger) => {
    if (trigger != workTrigger) {
      trigger.kill();
    }
  });
  // Re-derive bones on resize so scroll timelines can re-target the look bone.
  const bones = findHumanoidBones(character);
  let visor: THREE.Mesh | null = null;
  character.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!visor && mesh.isMesh && mesh.name.toLowerCase().includes("visor")) {
      visor = mesh;
    }
  });
  setCharTimeline(character, camera, bones, visor);
  setAllTimeline();
}
