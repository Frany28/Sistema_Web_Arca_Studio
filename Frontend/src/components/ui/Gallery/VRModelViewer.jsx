import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import * as THREE from "three";
import { StereoEffect } from "three/addons/effects/StereoEffect.js";

import Button from "../Button/Button.jsx";
import { ButtonGroup } from "../ButtonGroupItem/ButtonGroupItem.jsx";

function CloseIcon() {
  return <span aria-hidden="true" className="text-[20px] leading-none">×</span>;
}

function MotionIcon() {
  return <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true"><path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1m0-12.8-2.1 2.1m-8.6 8.6-2.1 2.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6"/></svg>;
}

function CardboardIcon() {
  return <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true"><path d="M3 9.5A2.5 2.5 0 0 1 5.5 7h13A2.5 2.5 0 0 1 21 9.5v7a1.5 1.5 0 0 1-1.5 1.5h-3.2a2 2 0 0 1-1.7-1l-1.1-1.8a1.75 1.75 0 0 0-3 0L9.4 17a2 2 0 0 1-1.7 1H4.5A1.5 1.5 0 0 1 3 16.5v-7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>;
}

function ImmersiveIcon() {
  return <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true"><path d="M8 4H4v4m12-4h4v4M8 20H4v-4m12 4h4v-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>;
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
    canvas.style.cursor = "grab";
    canvas.style.touchAction = "none";
    const onPointerDown = (event) => { dragging = true; canvas.style.cursor = "grabbing"; startX = event.clientX; startY = event.clientY; startYaw = yaw; startPitch = pitch; canvas.setPointerCapture(event.pointerId); };
    const onPointerMove = (event) => { if (!dragging) return; yaw = startYaw - (event.clientX - startX) * 0.08; pitch = THREE.MathUtils.clamp(startPitch + (event.clientY - startY) * 0.08, -85, 85); };
    const onPointerUp = () => { dragging = false; canvas.style.cursor = "grab"; };
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
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
      if (renderer.xr.isPresenting) {
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
    const permission = typeof window.DeviceOrientationEvent !== "undefined" && typeof window.DeviceOrientationEvent.requestPermission === "function"
      ? await window.DeviceOrientationEvent.requestPermission()
      : "granted";
    if (permission === "granted") setMotionEnabled(true);
  }, []);

  const toggleXR = useCallback(async () => {
    const renderer = rendererRef.current;
    if (!renderer || !navigator.xr) return;
    if (xrSession) { await xrSession.end(); return; }
    const session = await navigator.xr.requestSession("immersive-vr", { optionalFeatures: ["local-floor", "bounded-floor"] });
    session.addEventListener("end", () => setXrSession(null), { once: true });
    await renderer.xr.setSession(session);
    setXrSession(session);
  }, [xrSession]);

  if (!visible || typeof document === "undefined") return null;
  const vrControlItems = [
    { label: "Giroscopio", showText: false, icon: <MotionIcon />, "aria-label": "Activar giroscopio", "aria-pressed": motionEnabled },
    { label: "Cardboard", showText: false, icon: <CardboardIcon />, "aria-label": "Activar vista Cardboard", "aria-pressed": cardboard },
    { label: "WebXR", showText: false, icon: <ImmersiveIcon />, "aria-label": xrSession ? "Salir de WebXR" : "Entrar en WebXR", disabled: !xrAvailable, "aria-pressed": Boolean(xrSession) },
  ];
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
          <div className="pointer-events-auto absolute bottom-[12px] right-[12px] z-30" onPointerDown={(event) => event.stopPropagation()}>
            <ButtonGroup
              items={vrControlItems}
              persistSelection={false}
              onChange={(index) => {
                if (index === 0) requestMotion();
                if (index === 1) setCardboard((value) => !value);
                if (index === 2) toggleXR();
              }}
              className="border-white/15 bg-black/70 [&_button]:h-[44px] [&_button]:min-w-[56px] [&_button]:border-white/15 [&_button]:bg-black/70 [&_button]:px-[16px] [&_button]:text-white [&_button:hover]:!bg-white/15 [&_button:hover]:!text-white [&_button:focus-visible]:z-10 [&_button:focus-visible]:ring-2 [&_button:focus-visible]:ring-white"
            />
          </div>
          {status !== "loaded" ? <div className="pointer-events-auto absolute inset-0 z-20 flex items-center justify-center bg-black/55 backdrop-blur-md"><div className="w-[320px] text-center"><p className="mb-2 text-sm">{status === "error" ? "No se pudo cargar la panorámica VR" : "Cargando panorámica VR"}</p>{status !== "error" ? <div className="h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full bg-[#ff4431] transition-[width]" style={{ width: `${progress}%` }} /></div> : null}</div></div> : null}
          {status === "loaded" && !xrAvailable ? <p className="pointer-events-none absolute bottom-4 left-4 z-10 rounded-lg bg-black/55 px-3 py-2 text-xs text-white/75">Usa Giroscopio o Cardboard en móvil. WebXR depende del navegador y del visor.</p> : null}
        </main>
      </div>
    </div>, document.body,
  );
}
