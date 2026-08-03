import * as THREE from "three";

// Compatibility element: it preserves the approved <model-viewer> UI contract
// while rendering an equirectangular panorama instead of a GLB.
class PanoramaModelViewerElement extends HTMLElement {
  static get observedAttributes() { return ["src", "navigation-mode", "quality-preset"]; }

  constructor() {
    super();
    this.loaded = false;
    this.yaw = 0;
    this.pitch = 0;
    this.isDragging = false;
    this.orientation = null;
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `<style>:host{display:block;position:relative;overflow:hidden}canvas{display:block;width:100%;height:100%;touch-action:none;cursor:grab}canvas:active{cursor:grabbing}.slots{position:absolute;inset:0;pointer-events:none}</style><div class="stage"></div><div class="slots"></div>`;
  }

  connectedCallback() {
    if (this.renderer) return;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(55, 1, 0.1, 1100);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.applyQuality();
    this.shadowRoot.querySelector(".stage").append(this.renderer.domElement);
    this.geometry = new THREE.SphereGeometry(500, 64, 40);
    this.geometry.scale(-1, 1, 1);
    this.material = new THREE.MeshBasicMaterial();
    this.scene.add(new THREE.Mesh(this.geometry, this.material));
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this);
    this.installControls();
    this.installOrientation();
    this.animate();
    if (this.getAttribute("src")) this.loadTexture();
  }

  disconnectedCallback() {
    cancelAnimationFrame(this.frame);
    this.loadController?.abort();
    this.resizeObserver?.disconnect();
    window.removeEventListener("deviceorientation", this.handleOrientation);
    this.texture?.dispose();
    this.geometry?.dispose();
    this.material?.dispose();
    this.renderer?.dispose();
  }

  attributeChangedCallback(name, previous, next) {
    if (name === "src" && previous !== next && this.renderer) this.loadTexture();
    if (name === "quality-preset" && previous !== next && this.renderer) this.applyQuality();
    if (name === "navigation-mode" && previous !== next && this.renderer) this.applyNavigationMode();
  }

  get navigationMode() { return this.getAttribute("navigation-mode") || "drag"; }

  get qualityPreset() { return this.getAttribute("quality-preset") || "auto"; }

  applyQuality() {
    if (!this.renderer) return;
    const ratio = devicePixelRatio || 1;
    const limit = this.qualityPreset === "hd" ? 2 : this.qualityPreset === "saver" ? 1 : 1.5;
    this.renderer.setPixelRatio(Math.min(ratio, limit));
    if (this.texture) {
      const maximum = this.renderer.capabilities.getMaxAnisotropy();
      this.texture.anisotropy = this.qualityPreset === "hd"
        ? maximum
        : this.qualityPreset === "saver" ? 1 : Math.min(maximum, 4);
      this.texture.needsUpdate = true;
    }
    this.resize();
  }

  applyNavigationMode() {
    this.velocityYaw = 0;
    this.velocityPitch = 0;
    if (this.navigationMode === "gyroscope") this.requestOrientationAccess();
  }

  installOrientation() {
    this.handleOrientation = (event) => {
      if (this.navigationMode !== "gyroscope" || event.alpha == null) return;
      this.orientation = {
        yaw: event.alpha,
        pitch: THREE.MathUtils.clamp((event.beta ?? 90) - 90, -85, 85),
      };
    };
    window.addEventListener("deviceorientation", this.handleOrientation, { passive: true });
    this.applyNavigationMode();
  }

  async requestOrientationAccess() {
    try {
      if (typeof window.DeviceOrientationEvent?.requestPermission === "function") {
        await window.DeviceOrientationEvent.requestPermission();
      }
    } catch {
      // iOS requires the permission request to originate in a user gesture.
    }
  }

  installControls() {
    const canvas = this.renderer.domElement;
    const pointers = new Map();
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let startYaw = 0;
    let startPitch = 0;
    let lastX = 0;
    let lastY = 0;
    let lastTime = 0;
    let pinchDistance = 0;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    canvas.addEventListener("pointerdown", (event) => {
      if (this.navigationMode === "gyroscope") {
        this.requestOrientationAccess();
        return;
      }
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      dragging = true;
      this.isDragging = true;
      startX = event.clientX; startY = event.clientY;
      startYaw = this.yaw; startPitch = this.pitch;
      lastX = event.clientX; lastY = event.clientY; lastTime = performance.now();
      this.velocityYaw = 0; this.velocityPitch = 0;
      if (pointers.size === 2) {
        const [left, right] = [...pointers.values()];
        pinchDistance = Math.hypot(right.x - left.x, right.y - left.y);
      }
      canvas.setPointerCapture(event.pointerId);
    });
    canvas.addEventListener("pointermove", (event) => {
      if (!pointers.has(event.pointerId)) return;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (pointers.size === 2) {
        const [left, right] = [...pointers.values()];
        const nextDistance = Math.hypot(right.x - left.x, right.y - left.y);
        if (pinchDistance) {
          this.camera.fov = THREE.MathUtils.clamp(this.camera.fov - (nextDistance - pinchDistance) * 0.08, 15, 90);
          this.camera.updateProjectionMatrix();
        }
        pinchDistance = nextDistance;
        return;
      }
      if (!dragging) return;
      this.yaw = startYaw - (event.clientX - startX) * 0.15;
      this.pitch = THREE.MathUtils.clamp(startPitch + (event.clientY - startY) * 0.15, -85, 85);
      const now = performance.now();
      const elapsed = Math.max(now - lastTime, 1);
      this.velocityYaw = -(event.clientX - lastX) * 0.15 * (16 / elapsed);
      this.velocityPitch = (event.clientY - lastY) * 0.15 * (16 / elapsed);
      lastX = event.clientX; lastY = event.clientY; lastTime = now;
    });
    const release = (event) => {
      pointers.delete(event.pointerId);
      pinchDistance = 0;
      if (pointers.size === 0) dragging = false;
      this.isDragging = pointers.size > 0;
      if (reducedMotion) { this.velocityYaw = 0; this.velocityPitch = 0; }
    };
    canvas.addEventListener("pointerup", release);
    canvas.addEventListener("pointercancel", release);
    canvas.addEventListener("wheel", (event) => {
      event.preventDefault();
      this.camera.fov = THREE.MathUtils.clamp(this.camera.fov + event.deltaY * 0.03, 15, 90);
      this.camera.updateProjectionMatrix();
    }, { passive: false });
    canvas.addEventListener("dblclick", () => {
      this.camera.fov = this.camera.fov > 45 ? 28 : 70;
      this.camera.updateProjectionMatrix();
    });
  }

  async loadTexture() {
    const src = this.getAttribute("src");
    if (!src) return;
    this.loadController?.abort();
    const controller = new AbortController();
    this.loadController = controller;
    this.loaded = false;
    this.dispatchEvent(new CustomEvent("progress", { detail: { totalProgress: 0 } }));
    try {
      const response = await fetch(src, {
        credentials: "include",
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`Panorama request failed: ${response.status}`);
      const total = Number(response.headers.get("content-length")) || 0;
      const reader = response.body?.getReader();
      const chunks = [];
      let received = 0;
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          received += value.byteLength;
          // Downloading occupies 90% of the bar. The remaining 10% represents
          // image decoding and the first GPU render, which happen afterwards.
          const ratio = total > 0 ? Math.min((received / total) * 0.9, 0.9) : 0;
          this.dispatchEvent(new CustomEvent("progress", { detail: { totalProgress: ratio } }));
        }
      } else {
        chunks.push(new Uint8Array(await response.arrayBuffer()));
      }
      if (controller.signal.aborted) return;
      this.dispatchEvent(new CustomEvent("progress", { detail: { totalProgress: 0.92 } }));
      const blobUrl = URL.createObjectURL(new Blob(chunks, {
        type: response.headers.get("content-type") || "image/jpeg",
      }));
      const texture = await new THREE.TextureLoader().loadAsync(blobUrl);
      URL.revokeObjectURL(blobUrl);
      if (controller.signal.aborted) {
        texture.dispose();
        return;
      }
      this.dispatchEvent(new CustomEvent("progress", { detail: { totalProgress: 0.96 } }));
      this.texture?.dispose();
      this.texture = texture;
      texture.colorSpace = THREE.SRGBColorSpace;
      this.applyQuality();
      this.material.map = texture;
      this.material.needsUpdate = true;
      this.renderer.render(this.scene, this.camera);
      await new Promise((resolve) => requestAnimationFrame(resolve));
      if (controller.signal.aborted) return;
      this.loaded = true;
      this.dispatchEvent(new CustomEvent("progress", { detail: { totalProgress: 1 } }));
      this.dispatchEvent(new Event("load"));
    } catch (error) {
      if (error?.name !== "AbortError") this.dispatchEvent(new Event("error"));
    }
  }

  resize() {
    const width = this.clientWidth;
    const height = this.clientHeight;
    if (!width || !height) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  positionAndNormalFromPoint(clientX, clientY) {
    const bounds = this.getBoundingClientRect();
    const pointer = new THREE.Vector2(
      (clientX / bounds.width) * 2 - 1,
      -(clientY / bounds.height) * 2 + 1,
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer, this.camera);
    const direction = raycaster.ray.direction.clone().normalize();
    const position = direction.clone().multiplyScalar(500);
    return { position, normal: direction.clone().multiplyScalar(-1) };
  }

  updateHotspot() {}

  getCameraOrbit() {
    return { theta: THREE.MathUtils.degToRad(this.yaw), phi: THREE.MathUtils.degToRad(90 - this.pitch), radius: 1 };
  }

  getCameraTarget() { return { x: 0, y: 0, z: 0 }; }

  animate = () => {
    if (this.navigationMode === "gyroscope" && this.orientation) {
      this.yaw = this.orientation.yaw;
      this.pitch = this.orientation.pitch;
    } else if (this.navigationMode === "autorotate" && !this.isDragging) {
      this.yaw += matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 0.035;
    }
    if (Math.abs(this.velocityYaw || 0) > 0.01 || Math.abs(this.velocityPitch || 0) > 0.01) {
      this.yaw += this.velocityYaw || 0;
      this.pitch = THREE.MathUtils.clamp(this.pitch + (this.velocityPitch || 0), -85, 85);
      this.velocityYaw *= 0.92;
      this.velocityPitch *= 0.92;
    }
    const yaw = THREE.MathUtils.degToRad(this.yaw);
    const pitch = THREE.MathUtils.degToRad(this.pitch);
    this.camera.lookAt(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch));
    this.renderer.render(this.scene, this.camera);
    this.frame = requestAnimationFrame(this.animate);
  };
}

if (!customElements.get("model-viewer")) customElements.define("model-viewer", PanoramaModelViewerElement);
