import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import * as THREE from "three";
import { StereoEffect } from "three/addons/effects/StereoEffect.js";

import Button from "../Button/Button.jsx";

function CloseIcon() {
  return <span aria-hidden="true" className="text-[20px] leading-none">×</span>;
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

export default function VRModelViewer({ modelSrc, poster, title = "Panorámica 360", visible = false, onClose }) {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const cardboardRef = useRef(false);
  const motionEnabledRef = useRef(false);
  const [status, setStatus] = useState("loading");
  const [progress, setProgress] = useState(8);
  const [xrAvailable, setXrAvailable] = useState(false);
  const [xrSession, setXrSession] = useState(null);
  const [cardboard, setCardboard] = useState(false);
  const [motionEnabled, setMotionEnabled] = useState(false);

  useEffect(() => { cardboardRef.current = cardboard; }, [cardboard]);
  useEffect(() => { motionEnabledRef.current = motionEnabled; }, [motionEnabled]);

  useEffect(() => {
    if (!visible || !modelSrc || !mountRef.current) return undefined;
    const controller = new AbortController();
    const mount = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1100);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    const stereo = new StereoEffect(renderer);
    renderer.xr.enabled = true;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    mount.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;
    const geometry = new THREE.SphereGeometry(500, 64, 40);
    geometry.scale(-1, 1, 1);
    const material = new THREE.MeshBasicMaterial();
    scene.add(new THREE.Mesh(geometry, material));

    let yaw = 0;
    let pitch = 0;
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let startYaw = 0;
    let startPitch = 0;
    let orientation = null;
    const canvas = renderer.domElement;
    const onPointerDown = (event) => { dragging = true; startX = event.clientX; startY = event.clientY; startYaw = yaw; startPitch = pitch; canvas.setPointerCapture(event.pointerId); };
    const onPointerMove = (event) => { if (!dragging) return; yaw = startYaw - (event.clientX - startX) * 0.15; pitch = THREE.MathUtils.clamp(startPitch + (event.clientY - startY) * 0.15, -85, 85); };
    const onPointerUp = () => { dragging = false; };
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
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
    loadAuthenticatedTexture(modelSrc, controller.signal, (ratio) => ratio && setProgress(Math.max(8, Math.round(ratio * 98))))
      .then((texture) => { if (!controller.signal.aborted) { material.map = texture; material.needsUpdate = true; setProgress(100); setStatus("loaded"); } })
      .catch((error) => { if (error.name !== "AbortError") setStatus("error"); });

    const render = () => {
      if (!renderer.xr.isPresenting) {
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
    return () => {
      controller.abort();
      renderer.xr.getSession()?.end?.().catch(() => {});
      renderer.setAnimationLoop(null);
      observer.disconnect();
      window.removeEventListener("deviceorientation", onOrientation);
      geometry.dispose(); material.map?.dispose(); material.dispose(); renderer.dispose();
      rendererRef.current = null;
    };
  }, [modelSrc, visible]);

  const requestMotion = useCallback(async () => {
    const permission = typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function"
      ? await DeviceOrientationEvent.requestPermission()
      : "granted";
    if (permission === "granted") setMotionEnabled(true);
  }, []);

  const toggleXR = useCallback(async () => {
    const renderer = rendererRef.current;
    if (!renderer || !navigator.xr) return;
    if (xrSession) { await xrSession.end(); return; }
    const session = await navigator.xr.requestSession("immersive-vr", { optionalFeatures: ["local-floor"] });
    session.addEventListener("end", () => setXrSession(null), { once: true });
    await renderer.xr.setSession(session);
    setXrSession(session);
  }, [xrSession]);

  if (!visible || typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[80] bg-[#111] text-white">
      {poster ? <img src={poster} alt="" className="pointer-events-none absolute inset-0 size-full object-cover opacity-20 blur-[18px]" /> : null}
      <div className="relative flex h-dvh w-dvw flex-col">
        <header className="flex min-h-[64px] flex-wrap items-center justify-between gap-[10px] border-b border-white/10 bg-black/55 px-[16px] py-[8px] backdrop-blur-md">
          <div><p className="text-[14px] font-semibold">{title}</p><p className="text-[12px] text-white/62">Panorámica inmersiva VR</p></div>
          <div className="flex flex-wrap gap-[8px]">
            <Button theme="Primary" type={motionEnabled ? "Solid" : "Outline"} size="S" onClick={requestMotion}>Giroscopio</Button>
            <Button theme="Primary" type={cardboard ? "Solid" : "Outline"} size="S" onClick={() => setCardboard((value) => !value)}>Cardboard</Button>
            <Button theme="Primary" type="Solid" size="S" disabled={!xrAvailable} onClick={toggleXR}>{xrSession ? "Salir de VR" : "Entrar en VR"}</Button>
            <Button theme="Primary" type="Solid" size="S" showText={false} showLeftIcon iconLeft={<CloseIcon />} aria-label="Cerrar modo VR" onClick={onClose} />
          </div>
        </header>
        <main className="relative min-h-0 flex-1">
          <div ref={mountRef} className="absolute inset-0" />
          {status !== "loaded" ? <div className="absolute inset-0 flex items-center justify-center bg-black/55 backdrop-blur-md"><div className="w-[320px] text-center"><p className="mb-2 text-sm">{status === "error" ? "No se pudo cargar la panorámica VR" : "Cargando panorámica VR"}</p>{status !== "error" ? <div className="h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full bg-[#ff4431] transition-[width]" style={{ width: `${progress}%` }} /></div> : null}</div></div> : null}
          {status === "loaded" && !xrAvailable ? <p className="absolute bottom-4 left-4 rounded-lg bg-black/55 px-3 py-2 text-xs text-white/75">Usa Giroscopio o Cardboard en móvil. WebXR depende del navegador y del visor.</p> : null}
        </main>
      </div>
    </div>, document.body,
  );
}
