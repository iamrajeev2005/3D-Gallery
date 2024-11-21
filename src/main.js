import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js";
import { Reflector } from "https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/objects/Reflector.js";
import { Tween, Easing, update as updateTween } from "tween";

const images = ["1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg"];
const titles = ["one","two","three","four","five","six"]

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const textureLoader = new THREE.TextureLoader();

const rootNode = new THREE.Object3D();
scene.add(rootNode);

const leftArrowTexture = textureLoader.load("left.png");
const rightArrowTexture = textureLoader.load("right.png");

let count = 6;

for (let i = 0; i < count; i++) {
  const baseNode = new THREE.Object3D();
  const texture = textureLoader.load(images[i]);
  texture.colorSpace = THREE.SRGBColorSpace;
  baseNode.rotation.y = i * ((2 * Math.PI) / count);
  rootNode.add(baseNode);

  const border = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 2.2, 0.09),
    new THREE.MeshStandardMaterial({ color: "gray" })
  );
  border.name = `border_${i}`;
  border.position.z = -3.5;
  baseNode.add(border);

  const art = new THREE.Mesh(
    new THREE.BoxGeometry(3, 2, 0.1),
    new THREE.MeshStandardMaterial({ map: texture })
  );
  art.name = `art_${i}`;
  art.position.z = -3.5;
  baseNode.add(art);

  const left = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.3, 0.01),
    new THREE.MeshStandardMaterial({ map: leftArrowTexture, transparent: true })
  );
  left.name = `left`;
  left.userData = (i === count - 1 ) ? 0 : i + 1;
  left.position.set(-1.8, 0, -3.5);
  baseNode.add(left);

  const right = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.3, 0.01),
    new THREE.MeshStandardMaterial({
      map: rightArrowTexture,
      transparent: true,
    })
  );
  right.name = `right`;
  right.userData = (i === 0) ? count - 1 : i - 1;
  right.position.set(1.8, 0, -3.5);
  baseNode.add(right);
}

const spotLight = new THREE.SpotLight(0xffffff, 100, 10, 0.65, 1);
spotLight.position.set(0, 5, 0);
spotLight.target.position.set(0, 0.5, -5);
scene.add(spotLight);
scene.add(spotLight.target);

const mirror = new Reflector(new THREE.CircleGeometry(10), {
  color: 0x303030,
  textureHeight: window.innerHeight,
  textureWidth: window.innerWidth,
});
mirror.position.y = -1.1;
mirror.rotateX(-Math.PI / 2);
scene.add(mirror);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const rotateGallery = (direction, newIndex) => {
  const deltaY= direction * ((2 * Math.PI) / count);
  new Tween(rootNode.rotation)
  .to({y: rootNode.rotation.y + deltaY})
  .easing(Easing.Quadratic.InOut)
  .start()
  .onStart(() => {
    document.getElementById("title").style.opacity = 0
  })
  .onComplete(() => {
    document.getElementById("title").innerText = titles[newIndex]
    document.getElementById("title").style.opacity = 1
  })

};

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
window.addEventListener("click", (e) => {
  const raycaster = new THREE.Raycaster();

  const mouseNDC = new THREE.Vector2(
    (e.clientX / window.innerWidth) * 2 - 1,
    -(e.clientY / window.innerHeight) * 2 + 1
  );
  raycaster.setFromCamera(mouseNDC, camera);

  const intersections = raycaster.intersectObject(rootNode, true);
  if (intersections.length > 0) {
    const obj = intersections[0].object
    const newIndex = obj.userData
    if (obj.name === "left") {
      rotateGallery(-1,newIndex);
    }
    if (obj.name === "right") {
      rotateGallery(1, newIndex);
    }
  }
});

scene.add(camera);

function animate() {
updateTween()
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  mirror.getRenderTarget().setSize(window.innerWidth, window.innerHeight);
}
animate();


document.getElementById("title").innerText = titles[0]