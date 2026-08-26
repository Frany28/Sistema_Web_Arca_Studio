import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import * as THREE from "three";
import {
  getSnapTurnState,
  getXRHandedAxes,
  getXRRayPointHitDistance,
} from "../../../utils/vrLocomotion.js";
import { getPanoramaDirection, getPanoramaOrientation } from "../../../utils/panoramaCoordinates.js";
import { getVrSupportStatus } from "../../../hooks/useVrViewerLaunch.js";

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
  const scale = 4;
  const width = 210;
  const padding = 12;
  const avatarSize = 24;
  const author = annotation?.name || annotation?.author?.name || annotation?.authorName || "Usuario";
  const content = String(annotation?.content || annotation?.message || "Sin contenido");
  const replyCount = Math.max(0, Number(annotation?.replyCount) || 0);
  const measureCanvas = document.createElement("canvas");
  const measureContext = measureCanvas.getContext("2d");
  measureContext.font = "500 14px Inter, sans-serif";
  const maxTextWidth = width - padding * 2;
  const words = content.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = `${line} ${word}`.trim();
    if (line && measureContext.measureText(next).width > maxTextWidth) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  const visibleLines = (lines.length ? lines : ["Sin contenido"]).slice(0, 4);
  const messageHeight = visibleLines.length * 17;
  const replyRowHeight = replyCount > 0 ? 25 : 0;
  const height = padding + avatarSize + 8 + messageHeight + (replyRowHeight ? 8 + replyRowHeight : 0) + padding;
  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = height * scale;
  const context = canvas.getContext("2d");
  context.scale(scale, scale);
  context.fillStyle = "#0b0b0c";
  context.beginPath();
  context.roundRect(0.5, 0.5, width - 1, height - 1, [12, 12, 12, 0]);
  context.fill();
  context.strokeStyle = "#606060";
  context.lineWidth = 1;
  context.stroke();
  const initials = author.trim().split(/\s+/).filter(Boolean).map((part) => part[0]).slice(0, 2).join("").toUpperCase() || "U";
  context.fillStyle = "#2a2929";
  context.beginPath();
  context.arc(padding + avatarSize / 2, padding + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#ffffff";
  context.font = "600 10px Inter, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(initials, padding + avatarSize / 2, padding + avatarSize / 2 + 0.5);
  context.textAlign = "left";
  context.textBaseline = "alphabetic";
  context.fillStyle = "#a0a0a0";
  context.font = "400 12px Inter, sans-serif";
  context.fillText(author.slice(0, 30), padding + avatarSize + 8, padding + 16);
  context.fillStyle = "#a0a0a0";
  context.font = "500 14px Inter, sans-serif";
  let textY = padding + avatarSize + 8 + 14;
  visibleLines.forEach((messageLine) => {
    context.fillText(messageLine, padding, textY);
    textY += 17;
  });
  if (replyCount > 0) {
    context.fillStyle = "#a0a0a0";
    context.font = "500 14px Inter, sans-serif";
    context.fillText(
      `${replyCount} ${replyCount === 1 ? "respuesta" : "respuestas"}`,
      padding,
      textY + 8,
    );
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.userData.aspectRatio = width / height;
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
        context.arc(padding + avatarSize / 2, padding + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
        context.clip();
        context.drawImage(bitmap, padding, padding, avatarSize, avatarSize);
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
  const annotationsRef = useRef(annotations);
  const immersiveEndRef = useRef(onImmersiveEnd);
  const [status, setStatus] = useState("loading");
  const [progress, setProgress] = useState(8);
  const [xrAvailable, setXrAvailable] = useState(false);
  const [sessionNotice, setSessionNotice] = useState("");

  useEffect(() => { immersiveEndRef.current = onImmersiveEnd; }, [onImmersiveEnd]);
  useEffect(() => { annotationsRef.current = annotations; }, [annotations]);

  useEffect(() => {
    if (!visible || !modelSrc || !mountRef.current) return undefined;
    setStatus("loading");
    setProgress(0);
    const controller = new AbortController();
    const mount = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1100);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.xr.enabled = true;
    renderer.xr.setReferenceSpaceType("local-floor");
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    mount.replaceChildren(renderer.domElement);
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
      sprite.scale.set(24, 24, 1);
      sprite.userData.annotation = annotation;
      world.add(sprite);
      markerSprites.push(sprite);
      markerTextures.push(texture);
    });

    const panelMaterial = new THREE.SpriteMaterial({ transparent: true, visible: false, depthTest: false });
    const observationPanel = new THREE.Sprite(panelMaterial);
    observationPanel.center.set(0, 0);
    observationPanel.renderOrder = 1000;
    world.add(observationPanel);

    let yaw = 0;
    let pitch = 0;
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let startYaw = 0;
    let startPitch = 0;
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

    const controllerCleanups = [];
    const xrControllers = [];
    const controllerRotation = new THREE.Matrix4();
    const controllerOrigin = new THREE.Vector3();
    const controllerDirection = new THREE.Vector3();
    const markerWorldPosition = new THREE.Vector3();
    let hoveredAnnotationSignature = null;
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
    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();
    loadAuthenticatedTexture(
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
        if (error.name !== "AbortError") {
          setStatus("error");
          setSessionNotice("No se pudo cargar la panorámica VR.");
          if (mode === "immersive") initialSession?.end?.().catch(() => {});
        }
        return false;
      });

    const render = () => {
      if (renderer.xr.isPresenting) {
        scene.updateMatrixWorld(true);
        let hoveredAnnotation = null;
        let hoveredMarker = null;
        let closestHitDistance = Number.POSITIVE_INFINITY;
        for (const xrController of xrControllers) {
          controllerRotation.extractRotation(xrController.matrixWorld);
          controllerOrigin.setFromMatrixPosition(xrController.matrixWorld);
          controllerDirection.set(0, 0, -1).applyMatrix4(controllerRotation).normalize();
          for (const marker of markerSprites) {
            marker.getWorldPosition(markerWorldPosition);
            const distanceAlongRay = getXRRayPointHitDistance({
              direction: controllerDirection,
              origin: controllerOrigin,
              point: markerWorldPosition,
            });
            if (distanceAlongRay == null || distanceAlongRay >= closestHitDistance) continue;
            closestHitDistance = distanceAlongRay;
            hoveredMarker = marker;
            const hitAnnotation = marker.userData.annotation;
            hoveredAnnotation = annotationsRef.current.find(
              (annotation) => String(annotation.id) === String(hitAnnotation.id),
            ) || hitAnnotation;
          }
        }
        const nextHoveredSignature = hoveredAnnotation
          ? `${hoveredAnnotation.id}:${hoveredAnnotation.replyCount || 0}:${hoveredAnnotation.message || hoveredAnnotation.content || ""}`
          : null;
        if (nextHoveredSignature !== hoveredAnnotationSignature) {
          hoveredAnnotationSignature = nextHoveredSignature;
          if (panelMaterial.map) {
            panelMaterial.map.userData.cancelled = true;
            panelMaterial.map.dispose();
            panelMaterial.map = null;
          }
          panelMaterial.visible = Boolean(hoveredAnnotation);
          if (hoveredAnnotation && hoveredMarker) {
            panelMaterial.map = createObservationPanel(hoveredAnnotation);
            observationPanel.position.copy(hoveredMarker.position).multiplyScalar(0.96);
            const panelWidth = 118;
            observationPanel.scale.set(
              panelWidth,
              panelWidth / panelMaterial.map.userData.aspectRatio,
              1,
            );
          }
          panelMaterial.needsUpdate = true;
        }
        const axes = getXRHandedAxes(renderer.xr.getSession()?.inputSources, "right");
        const snap = getSnapTurnState(axes.x, snapTurnLatched);
        snapTurnLatched = snap.latched;
        if (snap.direction) world.rotation.y += THREE.MathUtils.degToRad(30 * snap.direction);
        renderer.render(scene, camera);
      } else {
        const y = THREE.MathUtils.degToRad(yaw);
        const p = THREE.MathUtils.degToRad(pitch);
        camera.lookAt(Math.sin(y) * Math.cos(p), Math.sin(p), -Math.cos(y) * Math.cos(p));
        renderer.render(scene, camera);
      }
    };
    renderer.setAnimationLoop(render);
    getVrSupportStatus(navigator.xr, navigator)
      .then((support) => setXrAvailable(support === "supported"))
      .catch(() => setXrAvailable(false));
    let sessionEndHandler;
    if (mode === "immersive" && initialSession) {
      sessionEndHandler = () => {
        immersiveEndRef.current?.();
      };
      initialSession.addEventListener("end", sessionEndHandler, { once: true });
      renderer.xr.setSession(initialSession)
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
      controllerCleanups.forEach((cleanup) => cleanup());
      markerTextures.forEach((texture) => texture.dispose());
      if (panelMaterial.map) panelMaterial.map.userData.cancelled = true;
      panelMaterial.map?.dispose();
      panelMaterial.dispose();
      geometry.dispose(); material.map?.dispose(); material.dispose(); renderer.dispose();
    };
  // Annotation refreshes must not recreate the WebGL renderer or abort an active
  // immersive session. The annotations present when the viewer opens are enough
  // to build its marker sprites; a later refresh will be reflected next launch.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSession, mode, modelSrc, visible]);

  if (!visible || typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[100] bg-[#111] text-white">
      {poster ? <img src={poster} alt="" className="pointer-events-none absolute inset-0 size-full object-cover opacity-20 blur-[18px]" /> : null}
      <div className="relative flex h-dvh w-dvw flex-col">
        <header className="pointer-events-auto relative z-40 flex min-h-[64px] flex-wrap items-center justify-between gap-[10px] border-b border-white/10 bg-black/55 px-[16px] py-[8px] backdrop-blur-md">
          <div><p className="text-[14px] font-semibold">{title}</p><p className="text-[12px] text-white/62">Panorámica inmersiva VR</p></div>
          <div className="flex flex-wrap items-center gap-[8px]" onPointerDown={(event) => event.stopPropagation()}>
            <Button theme="Primary" type="Solid" size="S" showText={false} showLeftIcon iconLeft={<CloseIcon />} aria-label="Cerrar modo VR" tooltip={false} onClick={onClose} />
          </div>
        </header>
        <main className="relative min-h-0 flex-1 overflow-hidden">
          <div ref={mountRef} className="absolute inset-0 z-0" />
          {status !== "loaded" ? <div className="pointer-events-auto absolute inset-0 z-20 flex items-center justify-center bg-black/55 backdrop-blur-md"><div className="w-[320px] text-center"><p className="mb-2 text-sm">{status === "error" ? "No se pudo cargar la panorámica VR" : "Cargando panorámica VR"}</p>{status !== "error" ? <div className="h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full bg-[#ff4431] transition-[width]" style={{ width: `${progress}%` }} /></div> : null}</div></div> : null}
          {notice || sessionNotice ? <p role="status" className="pointer-events-none absolute left-1/2 top-[12px] z-30 max-w-[min(520px,calc(100%-32px))] -translate-x-1/2 rounded-lg bg-black/75 px-4 py-3 text-center text-xs text-white">{notice || sessionNotice}</p> : null}
          {status === "loaded" && !xrAvailable ? <p className="pointer-events-none absolute bottom-4 left-4 z-10 rounded-lg bg-black/55 px-3 py-2 text-xs text-white/75">Arrastra la imagen para explorar la panorámica en una sola vista.</p> : null}
        </main>
      </div>
    </div>, document.body,
  );
}
