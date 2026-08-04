import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import * as THREE from "three";
import { StereoEffect } from "three/addons/effects/StereoEffect.js";
import { getSnapTurnState, getXRHandedAxes } from "../../../utils/vrLocomotion.js";
import { getPanoramaDirection, getPanoramaOrientation } from "../../../utils/panoramaCoordinates.js";

import Button from "../Button/Button.jsx";

function CloseIcon() {
  return <span aria-hidden="true" className="text-[20px] leading-none">×</span>;
}

function createMarkerTexture(number) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  context.fillStyle = "#ff4431";
  context.beginPath();
  context.arc(64, 64, 48, 0, Math.PI * 2);
  context.fill();
  context.lineWidth = 8;
  context.strokeStyle = "#ffffff";
  context.stroke();
  context.fillStyle = "#ffffff";
  context.font = "600 44px Inter, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(String(number || "•"), 64, 66);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createObservationPanel(annotation) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 420;
  const context = canvas.getContext("2d");
  context.fillStyle = "rgba(15, 15, 15, 0.94)";
  context.roundRect(12, 12, 1000, 396, 32);
  context.fill();
  context.strokeStyle = "rgba(255,255,255,0.22)";
  context.lineWidth = 4;
  context.stroke();
  const author = annotation?.name || annotation?.author?.name || annotation?.authorName || "Usuario";
  const content = String(annotation?.content || annotation?.message || "Sin contenido").slice(0, 150);
  const initials = author.trim().split(/\s+/).filter(Boolean).map((part) => part[0]).slice(0, 2).join("").toUpperCase() || "U";
  context.fillStyle = "#2a2929";
  context.beginPath();
  context.arc(88, 92, 42, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#ffffff";
  context.font = "600 28px Inter, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(initials, 88, 94);
  context.textAlign = "left";
  context.textBaseline = "alphabetic";
  context.font = "400 40px Inter, sans-serif";
  context.fillText(author.slice(0, 38), 150, 106);
  context.fillStyle = "rgba(255,255,255,0.82)";
  context.font = "32px Inter, sans-serif";
  const words = content.split(/\s+/);
  let line = "";
  let y = 190;
  for (const word of words) {
    const next = `${line} ${word}`.trim();
    if (context.measureText(next).width > 900) {
      context.fillText(line, 58, y);
      line = word;
      y += 48;
      if (y > 350) break;
    } else line = next;
  }
  if (y <= 350) context.fillText(line, 58, y);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const avatarSrc = annotation?.avatarSrc;
  if (avatarSrc) {
    fetch(avatarSrc, { credentials: "include" })
      .then((response) => {
        if (!response.ok) throw new Error("AVATAR_UNAVAILABLE");
        return response.blob();
      })
      .then((blob) => createImageBitmap(blob))
      .then((bitmap) => {
        if (texture.userData.cancelled) {
          bitmap.close?.();
          return;
        }
        context.save();
        context.beginPath();
        context.arc(88, 92, 42, 0, Math.PI * 2);
        context.clip();
        context.drawImage(bitmap, 46, 50, 84, 84);
        context.restore();
        bitmap.close?.();
        texture.needsUpdate = true;
      })
      .catch(() => {});
  }
  return texture;
}

async function loadAuthenticatedTexture(source, signal, onProgress) {
  const response = await fetch(source, { credentials: "include", signal });
  if (!response.ok) throw new Error("No se pudo cargar la panorámica en modo VR.");
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
      onProgress(total ? received / total : 0);
    }
  } else chunks.push(new Uint8Array(await response.arrayBuffer()));
  const url = URL.createObjectURL(new Blob(chunks, { type: response.headers.get("content-type") || "image/jpeg" }));
  try {
    const texture = await new THREE.TextureLoader().loadAsync(url);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function VRModelViewer({
  annotations = [],
  initialSession = null,
  mode = "fallback",
  modelSrc,
  poster,
  notice = "",
  title = "Panorámica 360",
  visible = false,
  onClose,
  onImmersiveEnd,
}) {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const cardboardRef = useRef(false);
  const motionEnabledRef = useRef(false);
  const immersiveEndRef = useRef(onImmersiveEnd);
  const [status, setStatus] = useState("loading");
  const [progress, setProgress] = useState(8);
  const [xrAvailable, setXrAvailable] = useState(false);
  const [xrSession, setXrSession] = useState(null);
  const [cardboard, setCardboard] = useState(false);
  const [motionEnabled, setMotionEnabled] = useState(false);
  const [sessionNotice, setSessionNotice] = useState("");

  useEffect(() => { cardboardRef.current = cardboard; }, [cardboard]);
  useEffect(() => { motionEnabledRef.current = motionEnabled; }, [motionEnabled]);
  useEffect(() => { immersiveEndRef.current = onImmersiveEnd; }, [onImmersiveEnd]);

  useEffect(() => {
    if (!visible || !modelSrc || !mountRef.current) return undefined;
    setStatus("loading");
    setProgress(0);
    const controller = new AbortController();
    const mount = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1100);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    const stereo = new StereoEffect(renderer);
    renderer.xr.enabled = true;
    renderer.xr.setReferenceSpaceType("local-floor");
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    mount.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;
    const geometry = new THREE.SphereGeometry(500, 64, 40);
    geometry.scale(-1, 1, 1);
    const material = new THREE.MeshBasicMaterial();
    const world = new THREE.Group();
    world.add(new THREE.Mesh(geometry, material));
    scene.add(world);
    scene.add(camera);

    const markerSprites = [];
    const markerTextures = [];
    annotations.forEach((annotation, index) => {
      const orientation = getPanoramaOrientation(annotation);
      if (!orientation) return;
      const texture = createMarkerTexture(annotation.pointNumber || annotation.selection?.pointNumber || index + 1);
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthTest: false }));
      const direction = getPanoramaDirection(orientation.yaw, orientation.pitch, 480);
      sprite.position.set(direction.x, direction.y, direction.z);
      sprite.scale.set(18, 18, 1);
      sprite.userData.annotation = annotation;
      world.add(sprite);
      markerSprites.push(sprite);
      markerTextures.push(texture);
    });

    const panelMaterial = new THREE.SpriteMaterial({ transparent: true, visible: false, depthTest: false });
    const observationPanel = new THREE.Sprite(panelMaterial);
    observationPanel.position.set(0, -0.2, -1.6);
    observationPanel.scale.set(1.8, 0.74, 1);
    camera.add(observationPanel);

    let yaw = 0;
    let pitch = 0;
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let startYaw = 0;
    let startPitch = 0;
    let orientation = null;
    let snapTurnLatched = false;
    const canvas = renderer.domElement;
    canvas.style.cursor = "grab";
    canvas.style.touchAction = "none";
    const onPointerDown = (event) => { dragging = true; canvas.style.cursor = "grabbing"; startX = event.clientX; startY = event.clientY; startYaw = yaw; startPitch = pitch; canvas.setPointerCapture(event.pointerId); };
    const onPointerMove = (event) => { if (!dragging) return; yaw = startYaw - (event.clientX - startX) * 0.08; pitch = THREE.MathUtils.clamp(startPitch + (event.clientY - startY) * 0.08, -85, 85); };
    const onPointerUp = () => { dragging = false; canvas.style.cursor = "grab"; };
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);

    const raycaster = new THREE.Raycaster();
    const controllerCleanups = [];
    const xrControllers = [];
    let hoveredAnnotationId = null;
    for (let index = 0; index < 2; index += 1) {
      const xrController = renderer.xr.getController(index);
      xrControllers.push(xrController);
      const rayGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -500),
      ]);
      const rayMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.72 });
      xrController.add(new THREE.Line(rayGeometry, rayMaterial));
      scene.add(xrController);
      controllerCleanups.push(() => {
        rayGeometry.dispose();
        rayMaterial.dispose();
      });
    }
    const onOrientation = (event) => { orientation = event; };
    window.addEventListener("deviceorientation", onOrientation);
    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      stereo.setSize(width, height);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();
    const textureReady = loadAuthenticatedTexture(
      modelSrc,
      controller.signal,
      (ratio) => ratio && setProgress(Math.max(8, Math.round(ratio * 98))),
    )
      .then((texture) => {
        if (controller.signal.aborted) {
          texture.dispose();
          return false;
        }
        material.map = texture;
        material.needsUpdate = true;
        renderer.render(scene, camera);
        setProgress(100);
        setStatus("loaded");
        return true;
      })
      .catch((error) => {
        if (error.name !== "AbortError") setStatus("error");
        return false;
      });

    const render = () => {
      if (renderer.xr.isPresenting) {
        let hoveredAnnotation = null;
        for (const xrController of xrControllers) {
          const rotation = new THREE.Matrix4().extractRotation(xrController.matrixWorld);
          raycaster.ray.origin.setFromMatrixPosition(xrController.matrixWorld);
          raycaster.ray.direction.set(0, 0, -1).applyMatrix4(rotation).normalize();
          const hit = raycaster.intersectObjects(markerSprites, false)[0];
          if (hit?.object?.userData?.annotation) {
            hoveredAnnotation = hit.object.userData.annotation;
            break;
          }
        }
        const nextHoveredId = hoveredAnnotation ? String(hoveredAnnotation.id) : null;
        if (nextHoveredId !== hoveredAnnotationId) {
          hoveredAnnotationId = nextHoveredId;
          if (panelMaterial.map) {
            panelMaterial.map.userData.cancelled = true;
            panelMaterial.map.dispose();
            panelMaterial.map = null;
          }
          panelMaterial.visible = Boolean(hoveredAnnotation);
          if (hoveredAnnotation) panelMaterial.map = createObservationPanel(hoveredAnnotation);
          panelMaterial.needsUpdate = true;
        }
        const axes = getXRHandedAxes(renderer.xr.getSession()?.inputSources, "right");
        const snap = getSnapTurnState(axes.x, snapTurnLatched);
        snapTurnLatched = snap.latched;
        if (snap.direction) world.rotation.y += THREE.MathUtils.degToRad(30 * snap.direction);
        renderer.render(scene, camera);
      } else {
        if (orientation && motionEnabledRef.current) {
          const alpha = THREE.MathUtils.degToRad(orientation.alpha || 0);
          const beta = THREE.MathUtils.degToRad(orientation.beta || 0);
          const gamma = THREE.MathUtils.degToRad(orientation.gamma || 0);
          camera.quaternion.setFromEuler(new THREE.Euler(beta, alpha, -gamma, "YXZ"));
        } else {
          const y = THREE.MathUtils.degToRad(yaw);
          const p = THREE.MathUtils.degToRad(pitch);
          camera.lookAt(Math.sin(y) * Math.cos(p), Math.sin(p), -Math.cos(y) * Math.cos(p));
        }
        if (cardboardRef.current) stereo.render(scene, camera);
        else renderer.render(scene, camera);
      }
    };
    renderer.setAnimationLoop(render);
    navigator.xr?.isSessionSupported?.("immersive-vr").then(setXrAvailable).catch(() => setXrAvailable(false));
    let sessionEndHandler;
    if (mode === "immersive" && initialSession) {
      sessionEndHandler = () => {
        setXrSession(null);
        immersiveEndRef.current?.();
      };
      initialSession.addEventListener("end", sessionEndHandler, { once: true });
      textureReady
        .then((ready) => {
          if (!ready || controller.signal.aborted) throw new Error("PANORAMA_NOT_READY");
          return renderer.xr.setSession(initialSession);
        })
        .then(() => setXrSession(initialSession))
        .catch(() => {
          initialSession.end?.().catch(() => {});
          immersiveEndRef.current?.();
        });
    }
    return () => {
      controller.abort();
      if (sessionEndHandler) initialSession?.removeEventListener("end", sessionEndHandler);
      renderer.xr.getSession()?.end?.().catch(() => {});
      renderer.setAnimationLoop(null);
      observer.disconnect();
      window.removeEventListener("deviceorientation", onOrientation);
      controllerCleanups.forEach((cleanup) => cleanup());
      markerTextures.forEach((texture) => texture.dispose());
      if (panelMaterial.map) panelMaterial.map.userData.cancelled = true;
      panelMaterial.map?.dispose();
      panelMaterial.dispose();
      geometry.dispose(); material.map?.dispose(); material.dispose(); renderer.dispose();
      rendererRef.current = null;
    };
  }, [initialSession, mode, modelSrc, visible]);

  const requestMotion = useCallback(async () => {
    const permission = typeof window.DeviceOrientationEvent !== "undefined" && typeof window.DeviceOrientationEvent.requestPermission === "function"
      ? await window.DeviceOrientationEvent.requestPermission()
      : "granted";
    if (permission === "granted") setMotionEnabled(true);
  }, []);

  const toggleXR = useCallback(async () => {
    const renderer = rendererRef.current;
    if (!renderer || !navigator.xr) return;
    try {
      setSessionNotice("");
      if (xrSession) { await xrSession.end(); return; }
      const session = await navigator.xr.requestSession("immersive-vr", { optionalFeatures: ["local-floor", "bounded-floor"] });
      session.addEventListener("end", () => setXrSession(null), { once: true });
      await renderer.xr.setSession(session);
      setXrSession(session);
    } catch {
      setSessionNotice("No se pudo iniciar el modo VR. Puedes continuar con el visor disponible.");
    }
  }, [xrSession]);

  if (!visible || typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[100] bg-[#111] text-white">
      {poster ? <img src={poster} alt="" className="pointer-events-none absolute inset-0 size-full object-cover opacity-20 blur-[18px]" /> : null}
      <div className="relative flex h-dvh w-dvw flex-col">
        <header className="pointer-events-auto relative z-40 flex min-h-[64px] flex-wrap items-center justify-between gap-[10px] border-b border-white/10 bg-black/55 px-[16px] py-[8px] backdrop-blur-md">
          <div><p className="text-[14px] font-semibold">{title}</p><p className="text-[12px] text-white/62">Panorámica inmersiva VR</p></div>
          <div className="flex flex-wrap items-center gap-[8px]" onPointerDown={(event) => event.stopPropagation()}>
            <Button theme="Primary" type="Solid" size="S" showText={false} showLeftIcon iconLeft={<CloseIcon />} aria-label="Cerrar modo VR" onClick={onClose} />
          </div>
        </header>
        <main className="relative min-h-0 flex-1 overflow-hidden">
          <div ref={mountRef} className="absolute inset-0 z-0" />
          {status !== "loaded" ? <div className="pointer-events-auto absolute inset-0 z-20 flex items-center justify-center bg-black/55 backdrop-blur-md"><div className="w-[320px] text-center"><p className="mb-2 text-sm">{status === "error" ? "No se pudo cargar la panorámica VR" : "Cargando panorámica VR"}</p>{status !== "error" ? <div className="h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full bg-[#ff4431] transition-[width]" style={{ width: `${progress}%` }} /></div> : null}</div></div> : null}
          {notice || sessionNotice ? <p role="status" className="pointer-events-none absolute left-1/2 top-[12px] z-30 max-w-[min(520px,calc(100%-32px))] -translate-x-1/2 rounded-lg bg-black/75 px-4 py-3 text-center text-xs text-white">{notice || sessionNotice}</p> : null}
          {status === "loaded" && !xrAvailable ? <p className="pointer-events-none absolute bottom-4 left-4 z-10 rounded-lg bg-black/55 px-3 py-2 text-xs text-white/75">Usa Giroscopio o Cardboard en móvil. El modo VR depende del navegador y del visor.</p> : null}
        </main>
      </div>
    </div>, document.body,
  );
}
