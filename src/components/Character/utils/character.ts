import * as THREE from "three";
import { GLTF, GLTFLoader } from "three-stdlib";
import { setCharTimeline, setAllTimeline } from "../../utils/GsapScroll";
import { findHumanoidBones, type HumanoidBones } from "./bones";

const MODEL_URL = "/models/avatar.glb";

/** Tunable framing for the loaded humanoid so it fits the landing camera. */
const MODEL_SCALE = 6.4;
const MODEL_Y = 3.3;

export interface LoadedCharacter {
  gltf: GLTF;
  object: THREE.Object3D;
  bones: HumanoidBones;
  visor: THREE.Mesh | null;
}

const setCharacter = (
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera
) => {
  const loader = new GLTFLoader();

  const applyCyberpunkMaterials = (object: THREE.Object3D) => {
    object.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;

      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.frustumCulled = true;

      const materials = Array.isArray(mesh.material)
        ? mesh.material
        : mesh.material
        ? [mesh.material]
        : [];

      materials.forEach((mat) => {
        const stdMat = mat as THREE.MeshStandardMaterial;
        if (
          !(stdMat as any).isMeshStandardMaterial &&
          !(stdMat as any).isMeshPhysicalMaterial
        )
          return;

        const name = (stdMat.name || "").toLowerCase();

        if (name.includes("visor")) {
          // Glowing tactical visor — acts as the new "screen light" focal point.
          stdMat.color = new THREE.Color(0x0a0118);
          stdMat.emissive = new THREE.Color(0x38bdf8);
          stdMat.emissiveIntensity = 1.6;
          stdMat.roughness = 0.15;
          stdMat.metalness = 0.6;
        } else {
          // Suit/body — push toward a dark, neon-lit cyber palette.
          stdMat.envMapIntensity = 1.1;
          if (stdMat.metalness < 0.5) stdMat.metalness = 0.55;
          if (stdMat.roughness > 0.7) stdMat.roughness = 0.55;
        }
        stdMat.needsUpdate = true;
      });
    });
  };

  const findVisor = (object: THREE.Object3D): THREE.Mesh | null => {
    let visor: THREE.Mesh | null = null;
    object.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!visor && mesh.isMesh && mesh.name.toLowerCase().includes("visor")) {
        visor = mesh;
      }
    });
    return visor;
  };

  const loadCharacter = (): Promise<LoadedCharacter> => {
    return new Promise((resolve, reject) => {
      loader.load(
        MODEL_URL,
        async (gltf) => {
          try {
            const object = gltf.scene;

            applyCyberpunkMaterials(object);
            const visor = findVisor(object);

            // Scale & ground the humanoid to match the scene's world units.
            object.scale.setScalar(MODEL_SCALE);
            object.rotation.y = 0;

            // Compute bounds after scaling, then re-anchor so the feet sit on
            // MODEL_Y and the model is centered on the X/Z plane.
            const box = new THREE.Box3().setFromObject(object);
            const center = new THREE.Vector3();
            box.getCenter(center);
            object.position.set(
              -center.x,
              MODEL_Y - box.min.y,
              -center.z
            );

            const bones = findHumanoidBones(object);

            await renderer.compileAsync(object, camera, scene);
            scene.add(object);

            setCharTimeline(object, camera, bones, visor);
            setAllTimeline();

            resolve({ gltf, object, bones, visor });
          } catch (err) {
            reject(err);
          }
        },
        undefined,
        (error) => {
          console.error("Error loading GLTF model:", error);
          reject(error);
        }
      );
    });
  };

  return { loadCharacter };
};

export default setCharacter;
