import * as THREE from "three";

// Compatibility element: it preserves the approved <model-viewer> UI contract
// while rendering an equirectangular panorama instead of a GLB.
class PanoramaModelViewerElement extends HTMLElement {
  static get observedAttributes() { return ["src"]; }

  constructor() {
    super();
    this.loaded = false;
    this.yaw = 0;
    this.pitch = 0;
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `<style>:host{display:block;position:relative;overflow:hidden}canvas{display:block;width:100%;height:100%;touch-action:none}.slots{position:absolute;inset:0;pointer-events:none}</style><div class="stage"></div><div class="slots"></div>`;
  }

  connectedCallback() {
    if (this.renderer) return;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(55, 1, 0.1, 1100);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    this.shadowRoot.querySelector(".stage").append(this.renderer.domElement);
    this.geometry = new THREE.SphereGeometry(500, 64, 40);
    this.geometry.scale(-1, 1, 1);
    this.material = new THREE.MeshBasicMaterial();
    this.scene.add(new THREE.Mesh(this.geometry, this.material));
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this);
    this.installControls();
    this.animate();
    if (this.getAttribute("src")) this.loadTexture();
  }

  disconnectedCallback() {
    cancelAnimationFrame(this.frame);
    this.resizeObserver?.disconnect();
    this.texture?.dispose();
    this.geometry?.dispose();
    this.material?.dispose();
    this.renderer?.dispose();
  }

  attributeChangedCallback(name, previous, next) {
    if (name === "src" && previous !== next && this.renderer) this.loadTexture();
  }

  installControls() {
    const canvas = this.renderer.domElement;
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let startYaw = 0;
    let startPitch = 0;
    canvas.addEventListener("pointerdown", (event) => {
      dragging = true;
      startX = event.clientX; startY = event.clientY;
      startYaw = this.yaw; startPitch = this.pitch;
      canvas.setPointerCapture(event.pointerId);
    });
    canvas.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      this.yaw = startYaw - (event.clientX - startX) * 0.15;
      this.pitch = THREE.MathUtils.clamp(startPitch + (event.clientY - startY) * 0.15, -85, 85);
    });
    canvas.addEventListener("pointerup", () => { dragging = false; });
    canvas.addEventListener("wheel", (event) => {
      event.preventDefault();
      this.camera.fov = THREE.MathUtils.clamp(this.camera.fov + event.deltaY * 0.03, 25, 90);
      this.camera.updateProjectionMatrix();
    }, { passive: false });
  }

  loadTexture() {
    const src = this.getAttribute("src");
    if (!src) return;
    this.loaded = false;
    this.dispatchEvent(new CustomEvent("progress", { detail: { totalProgress: 0.08 } }));
    new THREE.TextureLoader().load(src, (texture) => {
      this.texture?.dispose();
      this.texture = texture;
      texture.colorSpace = THREE.SRGBColorSpace;
      this.material.map = texture;
      this.material.needsUpdate = true;
      this.loaded = true;
      this.dispatchEvent(new CustomEvent("progress", { detail: { totalProgress: 1 } }));
      this.dispatchEvent(new Event("load"));
    }, (event) => {
      if (event.total) this.dispatchEvent(new CustomEvent("progress", { detail: { totalProgress: event.loaded / event.total } }));
    }, () => this.dispatchEvent(new Event("error")));
  }

  resize() {
    const width = this.clientWidth;
    const height = this.clientHeight;
    if (!width || !height) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  animate = () => {
    const yaw = THREE.MathUtils.degToRad(this.yaw);
    const pitch = THREE.MathUtils.degToRad(this.pitch);
    this.camera.lookAt(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch));
    this.renderer.render(this.scene, this.camera);
    this.frame = requestAnimationFrame(this.animate);
  };
}

if (!customElements.get("model-viewer")) customElements.define("model-viewer", PanoramaModelViewerElement);
