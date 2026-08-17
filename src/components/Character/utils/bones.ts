import * as THREE from "three";

/**
 * Bone-name candidates for rig-agnostic bone look-up.
 * Supports standard glTF/Ready Player Me humanoid names as well as the
 * Mixamo naming convention used by models exported from Mixamo / three.js examples.
 */
const BONE_CANDIDATES: Record<string, string[]> = {
  head: ["Head", "mixamorigHead", "head", "spine006"],
  neck: ["Neck", "mixamorigNeck", "neck", "spine005"],
  hips: ["Hips", "mixamorigHips", "hips"],
  spine: ["Spine", "Spine1", "Spine2", "mixamorigSpine", "mixamorigSpine1", "mixamorigSpine2"],
};

/** Case-insensitive object lookup by name. */
export function findObjectByName(
  root: THREE.Object3D,
  names: string[]
): THREE.Object3D | null {
  const lower = names.map((n) => n.toLowerCase());
  let found: THREE.Object3D | null = null;
  root.traverse((obj) => {
    if (!found && obj.name && lower.includes(obj.name.toLowerCase())) {
      found = obj;
    }
  });
  return found;
}

/** Find a bone by semantic role (head / neck / hips / spine). */
export function findBone(
  root: THREE.Object3D,
  role: keyof typeof BONE_CANDIDATES
): THREE.Object3D | null {
  return findObjectByName(root, BONE_CANDIDATES[role]);
}

export interface HumanoidBones {
  head: THREE.Object3D | null;
  neck: THREE.Object3D | null;
  hips: THREE.Object3D | null;
  spine: THREE.Object3D | null;
}

export function findHumanoidBones(root: THREE.Object3D): HumanoidBones {
  return {
    head: findBone(root, "head"),
    neck: findBone(root, "neck"),
    hips: findBone(root, "hips"),
    spine: findBone(root, "spine"),
  };
}
