import * as THREE from "three";
import { DRACOLoader, GLTF, GLTFLoader } from "three-stdlib";
import { setCharTimeline, setAllTimeline } from "../../utils/GsapScroll";
import { decryptFile } from "./decrypt";

const setCharacter = (
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  screenTexture?: THREE.CanvasTexture
) => {
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/");
  loader.setDRACOLoader(dracoLoader);

  const loadCharacter = () => {
    return new Promise<GLTF | null>(async (resolve, reject) => {
      try {
        const encryptedBlob = await decryptFile(
          "/models/character.enc",
          "Character3D#@"
        );
        const blobUrl = URL.createObjectURL(new Blob([encryptedBlob]));

        let character: THREE.Object3D;
        loader.load(
          blobUrl,
          async (gltf) => {
            character = gltf.scene;

            // Traverse and enhance materials and mesh properties
            character.traverse((child: any) => {
              if (child.isMesh) {
                const mesh = child as THREE.Mesh;
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                mesh.frustumCulled = true;

                // Enhance materials for modern cyberpunk/developer aesthetic
                if (Array.isArray(mesh.material)) {
                  mesh.material.forEach((mat) => enhanceMaterial(mat, screenTexture));
                } else if (mesh.material) {
                  enhanceMaterial(mesh.material, screenTexture);
                }
              }
            });

            await renderer.compileAsync(character, camera, scene);
            resolve(gltf);
            setCharTimeline(character, camera);
            setAllTimeline();

            const footR = character.getObjectByName("footR");
            if (footR) footR.position.y = 3.36;
            const footL = character.getObjectByName("footL");
            if (footL) footL.position.y = 3.36;

            dracoLoader.dispose();
          },
          undefined,
          (error) => {
            console.error("Error loading GLTF model:", error);
            reject(error);
          }
        );
      } catch (err) {
        reject(err);
        console.error(err);
      }
    });
  };

  return { loadCharacter };
};

function enhanceMaterial(mat: THREE.Material, screenTexture?: THREE.CanvasTexture) {
  if (!mat) return;

  // Enhance Standard / Physical Materials
  if ((mat as any).isMeshStandardMaterial || (mat as any).isMeshPhysicalMaterial) {
    const stdMat = mat as THREE.MeshStandardMaterial;

    // Monitor screen material (Material.027)
    if (stdMat.name === "Material.027" && screenTexture) {
      stdMat.map = screenTexture;
      stdMat.emissiveMap = screenTexture;
      stdMat.emissive = new THREE.Color(0xffffff);
      stdMat.emissiveIntensity = 1.2;
      stdMat.roughness = 0.15;
      stdMat.metalness = 0.05;
      stdMat.toneMapped = true;
      stdMat.needsUpdate = true;
    }

    // Keyboard keys (Material.025)
    if (stdMat.name === "Material.025") {
      stdMat.emissive = new THREE.Color(0x38bdf8);
      stdMat.emissiveIntensity = 0.35;
      stdMat.roughness = 0.4;
      stdMat.metalness = 0.7;
    }

    // Laptop body (Material.024)
    if (stdMat.name === "Material.024") {
      stdMat.color = new THREE.Color(0x181326);
      stdMat.roughness = 0.3;
      stdMat.metalness = 0.85;
    }

    // Monitor Bezel (Material.028)
    if (stdMat.name === "Material.028") {
      stdMat.color = new THREE.Color(0x120e1e);
      stdMat.roughness = 0.25;
      stdMat.metalness = 0.9;
    }

    // Screen light mesh
    if (stdMat.name === "screenlight.001") {
      stdMat.emissive = new THREE.Color(0xc2a4ff);
      stdMat.emissiveIntensity = 1.5;
    }

    // Character shirt / hair / skin enhancements
    if (stdMat.name === "Material.030") { // Hair
      stdMat.roughness = 0.6;
      stdMat.metalness = 0.1;
    }
  }
}

export default setCharacter;
