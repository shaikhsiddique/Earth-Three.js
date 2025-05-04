import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";
import getStarfield from "./src/getStarfield.js";
import { getFresnelMat } from "./src/getFresnelMat.js";

export default function initSolarSystem() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  scene.fog = new THREE.FogExp2(0x000000, 0.0005);

  const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
  camera.position.set(40, 5,40); 
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(w, h);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  document.body.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x000000, 1);
  scene.add(hemiLight);

  const pointLight = new THREE.PointLight(0xffffff, 2, 1000);
  pointLight.position.set(0, 0, 0);
  scene.add(pointLight);

  const loader = new THREE.TextureLoader();

  const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
  const sunMaterial = new THREE.MeshBasicMaterial({
    map: loader.load("./textures/sunmap.jpg"),
    emissive: 0xffff00,
    emissiveIntensity: 1,
  });
  const sun = new THREE.Mesh(sunGeometry, sunMaterial);
  scene.add(sun);

  const planets = [
    {
      name: "mercury",
      radius: 0.4,
      distance: 7,
      texture: "mercurymap.jpg",
      bump: "mercurybump.jpg",
      rotationSpeed: 0.004,
      revolutionSpeed: 0.04,
    },
    {
      name: "venus",
      radius: 0.9,
      distance: 10,
      texture: "venusmap.jpg",
      bump: "venusbump.jpg",
      rotationSpeed: 0.002,
      revolutionSpeed: 0.015,
    },
    {
      name: "earth",
      radius: 1,
      distance: 15,
      texture: "earthmap1k.jpg",
      bump: "earthbump1k.jpg",
      specular: "earthspec1k.jpg",
      rotationSpeed: 0.01,
      revolutionSpeed: 0.01,
    },
    {
      name: "mars",
      radius: 0.5,
      distance: 20,
      texture: "mars_1k_color.jpg",
      bump: "mars_1k_topo.jpg",
      rotationSpeed: 0.008,
      revolutionSpeed: 0.008,
    },
    {
      name: "jupiter",
      radius: 2.5,
      distance: 30,
      texture: "jupitermap.jpg",
      rotationSpeed: 0.02,
      revolutionSpeed: 0.002,
    },
    {
      name: "saturn",
      radius: 2,
      distance: 38,
      texture: "saturnmap.jpg",
      rotationSpeed: 0.018,
      revolutionSpeed: 0.0015,
    },
    {
      name: "uranus",
      radius: 1.5,
      distance: 45,
      texture: "uranusmap.jpg",
      rotationSpeed: 0.012,
      revolutionSpeed: 0.001,
    },
    {
      name: "neptune",
      radius: 1.4,
      distance: 50,
      texture: "neptunemap.jpg",
      rotationSpeed: 0.014,
      revolutionSpeed: 0.0008,
    },
  ];

  const planetMeshes = [];
  const planetGroups = [];

  planets.forEach((planet) => {
    const group = new THREE.Group();
    const geometry = new THREE.SphereGeometry(planet.radius, 32, 32);
    const materialParams = {
      map: loader.load(`./textures/${planet.texture}`),
      shininess: 5,
    };
    if (planet.bump) {
      materialParams.bumpMap = loader.load(`./textures/${planet.bump}`);
      materialParams.bumpScale = 0.05;
    }
    if (planet.specular) {
      materialParams.specularMap = loader.load(`./textures/${planet.specular}`);
      materialParams.specular = new THREE.Color("grey");
    }
    const material = new THREE.MeshPhongMaterial(materialParams);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = planet.distance;
    group.add(mesh);

    scene.add(group);
    planetMeshes.push({ mesh, ...planet });
    planetGroups.push(group);
  });

  const starfield = getStarfield();
  scene.add(starfield);

  function animate() {
    requestAnimationFrame(animate);
    planetMeshes.forEach((planet, index) => {
      planet.mesh.rotation.y += planet.rotationSpeed;
      const group = planetGroups[index];
      group.rotation.y += planet.revolutionSpeed;
    });
    controls.update();
    renderer.render(scene, camera);
  }

  animate();
}
