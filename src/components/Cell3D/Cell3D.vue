<template>
  <div>
    <div
      ref="sceneContainer"
      class="scene-container"
    />
  </div>
</template>
  
<script lang="ts">
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import modelFile from './assets/animalcellCOLOR.glb';
import { markRaw } from 'vue';  

export default {
    name: 'Cell3D',
    data() {
    return {
      model: null,
      scene: null,
      camera: null,
      renderer: null,
      controls: null,
      raycaster: null,
      mouse: null,
      highlightedMesh: null,
      originalMaterials: new Map()
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.initScene();
      this.loadModel();
      this.animate = this.animate.bind(this);
      this.animate();
    });
  },
  beforeUnmount() {
    cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', this.onWindowResize);
    if (this.controls) {
      this.controls.dispose();
    }
  },
  methods: {
    initScene() {
      console.log('Initializing scene');
      const container = this.$refs.sceneContainer;
      const width = container.clientWidth;
      const height = container.clientHeight;

      console.log(`Container dimensions: ${width}x${height}`);

      if (width === 0 || height === 0) {
        console.error('Container has invalid dimensions');
        return;
      }

      this.scene = markRaw(new THREE.Scene());
      this.camera = markRaw(new THREE.PerspectiveCamera(60, width / height, 0.1, 1000));
      this.renderer = markRaw(new THREE.WebGLRenderer({ antialias: true }));
      this.renderer.setSize(width, height);
      container.appendChild(this.renderer.domElement);
      console.log('SCENE', this.scene)
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      this.scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(0, 10, 10);
      this.scene.add(directionalLight);

      // Initialize OrbitControls
      this.controls = markRaw(new OrbitControls(this.camera, this.renderer.domElement));
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.25;
      this.controls.screenSpacePanning = false;
      this.controls.maxPolarAngle = Math.PI / 2;

      // Initialize Raycaster and mouse
      this.raycaster = new THREE.Raycaster();
      this.mouse = new THREE.Vector2();

      window.addEventListener('resize', this.onWindowResize);
      this.renderer.domElement.addEventListener('mousemove', this.onMouseMove);
      console.log('Scene initialized');
    },
    loadModel() {
      console.log('Starting to load the model');
      const loader = new GLTFLoader();

      loader.load(
        modelFile,
        (gltf) => {
          console.log('Model loaded successfully, adding to scene');
          this.model = markRaw(gltf.scene);
          this.scene.add(this.model);

          console.log('Calculating model dimensions');
          const box = new THREE.Box3().setFromObject(this.model);
          const size = box.getSize(new THREE.Vector3()).length();
          const center = box.getCenter(new THREE.Vector3());

          console.log('Scaling model');
          const scale = 2 / size;
          this.model.scale.set(scale, scale, scale);

          console.log('Positioning camera');
          this.camera.position.copy(center).add(new THREE.Vector3(1, 2, size * 0.2));
          this.camera.lookAt(center);

          // Store original materials
          this.model.traverse((child) => {
            if (child.isMesh) {
              this.originalMaterials.set(child, child.material);
            }
          });

          console.log('Model setup complete, it should now be visible');
          this.renderer.render(this.scene, this.camera);
        },
        (xhr) => {
          console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        (error) => {
          console.error('An error occurred while loading the model:', error);
        }
      );
    },
    animate() {
      if (!this.renderer) return;
      
      this.animationId = requestAnimationFrame(this.animate);
      // Removed rotation
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    },
    onWindowResize() {
      if (!this.camera || !this.renderer) return;

      const container = this.$refs.sceneContainer;
      const width = container.clientWidth;
      const height = container.clientHeight;

      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    },
    onMouseMove(event) {
      event.preventDefault();

      const rect = this.renderer.domElement.getBoundingClientRect();
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);

      if (this.model) {
        const intersects = this.raycaster.intersectObject(this.model, true);

        if (intersects.length > 0) {
          const intersectedObject = intersects[0].object;

          if (this.highlightedMesh !== intersectedObject) {
            if (this.highlightedMesh) {
              this.highlightedMesh.material = this.originalMaterials.get(this.highlightedMesh);
            }

            this.highlightedMesh = intersectedObject;
            if (this.highlightedMesh.material) {
              const highlightMaterial = this.highlightedMesh.material.clone();
              highlightMaterial.emissive.setHex(0x555555);
              highlightMaterial.emissiveIntensity = 0.5;
              this.highlightedMesh.material = highlightMaterial;
            }
          }
        } else {
          if (this.highlightedMesh) {
            this.highlightedMesh.material = this.originalMaterials.get(this.highlightedMesh);
            this.highlightedMesh = null;
          }
        }
      }
    }
  }
}
</script>
  
<style scoped>
  .scene-container {
  width: 100%;
  height: 900px;
  background-color: #f0f0f0;
}
</style>
  