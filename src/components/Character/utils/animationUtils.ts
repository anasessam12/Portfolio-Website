import * as THREE from "three";
import { GLTF } from "three-stdlib";
import type { HumanoidBones } from "./bones";

/**
 * Lightweight animation setup for a generic rigged humanoid.
 *
 * The previous model shipped desk-specific clips (typing, blink, eyebrow raise);
 * those don't exist on a new rig, so we only:
 *   - play the model's idle clip (with safe fallbacks), and
 *   - re-apply the mouse-driven head pose every frame so it wins over the clip.
 */
const IDLE_CLIP_NAMES = ["Idle", "idle", "Idle_A", "Standing", "standing", "TPose"];

const findClip = (gltf: GLTF, names: string[]): THREE.AnimationClip | null => {
  if (!gltf.animations || gltf.animations.length === 0) return null;
  for (const name of names) {
    const clip = THREE.AnimationClip.findByName(gltf.animations, name);
    if (clip) return clip;
  }
  return gltf.animations[0];
};

const setAnimations = (gltf: GLTF, bones: HumanoidBones) => {
  const character = gltf.scene;
  const mixer = new THREE.AnimationMixer(character);

  const idleClip = findClip(gltf, IDLE_CLIP_NAMES);
  let idleAction: THREE.AnimationAction | null = null;
  if (idleClip) {
    idleAction = mixer.clipAction(idleClip);
    idleAction.play();
  } else {
    console.warn("No idle animation found in GLTF file.");
  }

  // Snapshot of the bind-pose head rotation so we can layer mouse look on top.
  const headBaseRotation = bones.head
    ? bones.head.rotation.clone()
    : new THREE.Euler();

  function startIntro() {
    if (idleAction) {
      idleAction.reset().fadeIn(0.8).play();
    }
  }

  /**
   * Re-applies head look on top of the idle clip. Call AFTER mixer.update().
   * Returns the desired head local rotation (x, y) in radians.
   */
  function applyHeadLook(rotX: number, rotY: number) {
    if (!bones.head) return;
    bones.head.rotation.x = headBaseRotation.x + rotX;
    bones.head.rotation.y = headBaseRotation.y + rotY;
  }

  return { mixer, startIntro, hover: () => () => {}, applyHeadLook };
};

export default setAnimations;
