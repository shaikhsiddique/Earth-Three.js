import * as THREE from "three";
import { OrbitControls } from 'jsm/controls/OrbitControls.js';

import getStarfield from "./src/getStarfield.js";
import { getFresnelMat } from "./src/getFresnelMat.js";

const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// Add fog for depth effect
scene.fog = new THREE.FogExp2(0x000000, 0.0005);

const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.z = 5;

// Configure renderer for shadows
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);
// THREE.ColorManagement.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

const earthGroup = new THREE.Group();
earthGroup.rotation.z = -23.4 * Math.PI / 180;
scene.add(earthGroup);


new OrbitControls(camera, renderer.domElement);
const detail = 12;
const loader = new THREE.TextureLoader();
const geometry = new THREE.IcosahedronGeometry(1, detail);
const material = new THREE.MeshPhongMaterial({
  map: loader.load("./textures/earthmap1k.jpg"),
  specularMap: loader.load("./textures/earthspec1k.jpg"),
  bumpMap: loader.load("./textures/earthbump1k.jpg"),
  bumpScale: 0.04,
});
// material.map.colorSpace = THREE.SRGBColorSpace;
const earthMesh = new THREE.Mesh(geometry, material);
earthMesh.castShadow = true;
earthMesh.receiveShadow = true;
earthGroup.add(earthMesh);

const lightsMat = new THREE.MeshBasicMaterial({
  map: loader.load("./textures/earthlights1k.jpg"),
  blending: THREE.AdditiveBlending,
});
const lightsMesh = new THREE.Mesh(geometry, lightsMat);
earthGroup.add(lightsMesh);

const cloudsMat = new THREE.MeshStandardMaterial({
  map: loader.load("./textures/earthcloudmap.jpg"),
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending,
  alphaMap: loader.load('./textures/earthcloudmaptrans.jpg'),
  // alphaTest: 0.3,
});
const cloudsMesh = new THREE.Mesh(geometry, cloudsMat);
cloudsMesh.scale.setScalar(1.003);
earthGroup.add(cloudsMesh);

const fresnelMat = getFresnelMat();
const glowMesh = new THREE.Mesh(geometry, fresnelMat);
glowMesh.scale.setScalar(1.01);
earthGroup.add(glowMesh);




// Create moon
const moonGroup = new THREE.Group();
const moonGeometry = new THREE.SphereGeometry(0.27, 32, 32);
const moonMaterial = new THREE.MeshPhongMaterial({
  map: loader.load("./textures/moonmap1k.jpg"),
  bumpMap: loader.load("./textures/moonbump1k.jpg"),
  bumpScale: 0.002,
  specular: new THREE.Color(0x333333),
  shininess: 2
});
const moon = new THREE.Mesh(moonGeometry, moonMaterial);
moon.castShadow = true;
moon.receiveShadow = true;
moonGroup.add(moon);

// Position moon in orbit with initial tilt
moonGroup.position.set(3, 0, 0);
moonGroup.rotation.x = Math.PI / 6; // Tilt the orbit plane
earthGroup.add(moonGroup);

// Add moon glow
const moonGlow = new THREE.PointLight(0x888888, 0.2, 5);
moon.add(moonGlow);









const stars = getStarfield({numStars: 5000});
scene.add(stars);

// Improved lighting setup
const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
sunLight.position.set(-2, 0.5, 1.5);
sunLight.castShadow = true;
// Configure shadow properties
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 50;
sunLight.shadow.camera.left = -10;
sunLight.shadow.camera.right = 10;
sunLight.shadow.camera.top = 10;
sunLight.shadow.camera.bottom = -10;
sunLight.shadow.bias = -0.0001;
scene.add(sunLight);

// Add subtle ambient light
const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

// Add point light for Earth's glow
const earthGlow = new THREE.PointLight(0x0077ff, 0.5, 10);
earthGlow.position.set(0, 0, 0);
scene.add(earthGlow);






function animate() {
  requestAnimationFrame(animate);

  
  earthMesh.rotation.y += 0.002;
  lightsMesh.rotation.y += 0.002;
  cloudsMesh.rotation.y += 0.0023;
  glowMesh.rotation.y += 0.002;
  
  
  moon.rotation.y += 0.01; 
  
  
  const orbitSpeed = 0.3;
  const orbitRadius = 3;
  const time = Date.now() * 0.001;
  
 
  moonGroup.position.x = Math.cos(time * orbitSpeed) * orbitRadius;
  moonGroup.position.z = Math.sin(time * orbitSpeed) * orbitRadius;
  
  // Update moon's lighting based on position
  const moonAngle = Math.atan2(moonGroup.position.z, moonGroup.position.x);
  const moonLightIntensity = Math.max(0, Math.cos(moonAngle));
  moonGlow.intensity = 0.2 * moonLightIntensity;
  
  stars.rotation.y -= 0.0002;
  renderer.render(scene, camera);
}

animate();

function handleWindowResize () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', handleWindowResize, false);