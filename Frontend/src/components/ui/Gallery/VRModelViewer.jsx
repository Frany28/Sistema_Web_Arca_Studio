import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import Button from "../../ui/Button/Button.jsx";
import { getXRMovementAxes } from "../../../utils/vrLocomotion.js";

const XR_MOVEMENT_SPEED = 2.2;

function CloseIcon({ className }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M5 5L15 15M15 5L5 15"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function getErrorMessage(error) {
  return error?.message || "No se pudo cargar el modelo en modo VR.";
}

export default function VRModelViewer({
  modelSrc,
  poster,
  title = "Modelo 3D",
  visible = false,
  onClose,
}) {
  const mountRef = useRef(null);
  const overlayRootRef = useRef(null);
  const rendererRef = useRef(null);
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [isWebXRAvailable, setIsWebXRAvailable] = useState(false);
  const [xrSession, setXrSession] = useState(null);

  useEffect(() => {
    if (!visible || !modelSrc || !mountRef.current) {
      return undefined;
    }

    let disposed = false;
    const pressedKeys = new Set();
    const mountNode = mountRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x161616);

    const camera = new THREE.PerspectiveCamera(
      70,
      mountNode.clientWidth / Math.max(mountNode.clientHeight, 1),
      0.05,
      500,
    );
    camera.position.set(0, 1.6, 0);
    const playerRig = new THREE.Group();
    playerRig.name = "XRPlayerRig";
    playerRig.add(camera);
    scene.add(playerRig);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(mountNode.clientWidth, mountNode.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.xr.enabled = true;
    rendererRef.current = renderer;
    mountNode.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 1.4, -0.01);
    controls.update();

    const ambientLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(4, 8, 6);
    scene.add(keyLight);

    const floorGrid = new THREE.GridHelper(20, 20, 0x777777, 0x333333);
    floorGrid.position.y = 0.01;
    scene.add(floorGrid);

    async function checkVRSupport() {
      const available = Boolean(
        navigator.xr && (await navigator.xr.isSessionSupported("immersive-vr")),
      );

      if (disposed) {
        return;
      }

      setIsWebXRAvailable(available);
    }

    function frameModel(model) {
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const maxDimension = Math.max(size.x, size.y, size.z, 1);
      const scale = maxDimension > 30 ? 30 / maxDimension : 1;

      model.scale.multiplyScalar(scale);

      const scaledBox = new THREE.Box3().setFromObject(model);
      const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
      const scaledMin = scaledBox.min;

      model.position.sub(
        new THREE.Vector3(scaledCenter.x, scaledMin.y, scaledCenter.z),
      );

      const framedBox = new THREE.Box3().setFromObject(model);
      const framedSize = framedBox.getSize(new THREE.Vector3());
      const cameraZ = Math.max(0.8, Math.min(framedSize.z * 0.12, 2.2));

      camera.position.set(
        0,
        Math.min(Math.max(framedSize.y * 0.32, 1.35), 1.8),
        cameraZ,
      );
      controls.target.set(0, camera.position.y, cameraZ - 0.01);
      controls.update();

      return center;
    }

    function handleResize() {
      if (!mountNode.clientWidth || !mountNode.clientHeight) {
        return;
      }

      camera.aspect = mountNode.clientWidth / mountNode.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountNode.clientWidth, mountNode.clientHeight);
    }

    function handleKeyDown(event) {
      pressedKeys.add(event.code);
    }

    function handleKeyUp(event) {
      pressedKeys.delete(event.code);
    }

    function updateKeyboardMovement(delta) {
      if (renderer.xr.isPresenting) {
        return;
      }

      const speed = 2.2 * delta;
      const forward = new THREE.Vector3();
      camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();

      const right = new THREE.Vector3()
        .crossVectors(forward, camera.up)
        .normalize();
      const movement = new THREE.Vector3();

      if (pressedKeys.has("KeyW") || pressedKeys.has("ArrowUp")) {
        movement.add(forward);
      }

      if (pressedKeys.has("KeyS") || pressedKeys.has("ArrowDown")) {
        movement.sub(forward);
      }

      if (pressedKeys.has("KeyD") || pressedKeys.has("ArrowRight")) {
        movement.add(right);
      }

      if (pressedKeys.has("KeyA") || pressedKeys.has("ArrowLeft")) {
        movement.sub(right);
      }

      if (movement.lengthSq() > 0) {
        movement.normalize().multiplyScalar(speed);
        camera.position.add(movement);
        controls.target.add(movement);
      }
    }

    const xrForward = new THREE.Vector3();
    const xrRight = new THREE.Vector3();
    const xrMovement = new THREE.Vector3();
    const worldUp = new THREE.Vector3(0, 1, 0);

    function updateXRControllerMovement(delta) {
      if (!renderer.xr.isPresenting) {
        return;
      }

      const session = renderer.xr.getSession();
      const { x, y } = getXRMovementAxes(session?.inputSources);

      if (!x && !y) {
        return;
      }

      const xrCamera = renderer.xr.getCamera(camera);
      xrCamera.getWorldDirection(xrForward);
      xrForward.y = 0;

      if (xrForward.lengthSq() < 0.0001) {
        xrForward.set(0, 0, -1);
      } else {
        xrForward.normalize();
      }

      xrRight.crossVectors(xrForward, worldUp).normalize();
      xrMovement
        .set(0, 0, 0)
        .addScaledVector(xrRight, x)
        .addScaledVector(xrForward, -y);

      if (xrMovement.lengthSq() > 1) {
        xrMovement.normalize();
      }

      playerRig.position.addScaledVector(
        xrMovement,
        XR_MOVEMENT_SPEED * Math.min(delta, 0.05),
      );
    }

    const clock = new THREE.Clock();

    renderer.setAnimationLoop(() => {
      const delta = clock.getDelta();
      updateKeyboardMovement(delta);
      updateXRControllerMovement(delta);
      controls.update();
      renderer.render(scene, camera);
    });

    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    setStatus("loading");
    setErrorMessage("");
    checkVRSupport().catch(() => {
      setIsWebXRAvailable(false);
    });

    const loader = new GLTFLoader();
    loader.load(
      modelSrc,
      (gltf) => {
        if (disposed) {
          return;
        }

        const model = gltf.scene;
        frameModel(model);
        scene.add(model);
        setStatus("loaded");
      },
      undefined,
      (error) => {
        if (disposed) {
          return;
        }

        setStatus("error");
        setErrorMessage(getErrorMessage(error));
      },
    );

    return () => {
      disposed = true;
      renderer.xr.getSession()?.end?.().catch(() => {});
      setXrSession(null);
      rendererRef.current = null;
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      renderer.setAnimationLoop(null);
      controls.dispose();
      renderer.dispose();

      scene.traverse((object) => {
        object.geometry?.dispose?.();

        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material].filter(Boolean);
        materials.forEach((material) => {
          Object.values(material).forEach((value) => {
            value?.isTexture && value.dispose?.();
          });
          material.dispose?.();
        });
      });

      mountNode.replaceChildren();
    };
  }, [modelSrc, visible]);

  async function handleToggleVRSession() {
    const renderer = rendererRef.current;

    if (!renderer || !navigator.xr) {
      setErrorMessage("Este navegador no permite iniciar modo VR.");
      setStatus("error");
      return;
    }

    if (xrSession) {
      await xrSession.end();
      return;
    }

    try {
      const sessionOptions = {
        optionalFeatures: [
          "local-floor",
          "bounded-floor",
          "hand-tracking",
          "dom-overlay",
        ],
      };

      if (overlayRootRef.current) {
        sessionOptions.domOverlay = { root: overlayRootRef.current };
      }

      const session = await navigator.xr.requestSession(
        "immersive-vr",
        sessionOptions,
      );

      session.addEventListener(
        "end",
        () => {
          setXrSession(null);
        },
        { once: true },
      );

      await renderer.xr.setSession(session);
      setXrSession(session);
    } catch {
      setErrorMessage("No se pudo iniciar el modo VR en este dispositivo.");
      setStatus("error");
    }
  }

  if (!visible || typeof document === "undefined") {
    return null;
  }

  const usageItems = [
    "Colocate el visor y selecciona Entrar en VR",
    "Explora el modelo moviendo la vista de forma natural",
    "Utiliza los controles del visor para desplazarte dentro del espacio",
    "En computador, usa WASD o las flechas para moverte por la escena",
  ];

  return createPortal(
    <div
      ref={overlayRootRef}
      className={clsx(
        "vr-dom-overlay fixed inset-0 z-[80] bg-[#111] text-white",
        xrSession && "vr-dom-overlay-active",
      )}
    >
      <div className="vr-screen-ui">
        {poster ? (
          <img
            src={poster}
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20 blur-[18px]"
            aria-hidden="true"
          />
        ) : null}

        <div className="relative flex h-dvh w-dvw flex-col">
          <header className="flex min-h-[64px] items-center justify-between gap-[16px] border-b border-white/10 bg-black/55 px-[16px] backdrop-blur-md">
          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold leading-[18px]">
              {title}
            </p>
            <p className="text-[12px] leading-[16px] text-white/62">
              Prototipo VR WebXR
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-[10px]">
            <Button
              theme="Primary"
              type="Solid"
              size="S"
              showLeftIcon={false}
              showRightIcon={false}
              disabled={!isWebXRAvailable}
              onClick={handleToggleVRSession}
              className="min-w-[132px]"
            >
              {xrSession ? "Salir de VR" : "Entrar en VR"}
            </Button>
            <Button
              theme="Primary"
              type="Solid"
              size="S"
              showText={false}
              showLeftIcon
              showRightIcon={false}
              iconLeft={<CloseIcon className="size-5" />}
              aria-label="Cerrar modo VR"
              onClick={onClose}
              className="size-10"
            />
          </div>
          </header>

          <main className="relative min-h-0 flex-1">
            <div ref={mountRef} className="absolute inset-0" />

          <div
            className={clsx(
              "pointer-events-none absolute left-[16px] top-[16px] max-w-[360px] rounded-[8px] border border-white/10 bg-black/58 p-[12px] text-[12px] leading-[16px] text-white/74 backdrop-blur-md",
              status === "loaded" && "opacity-80",
            )}
          >
            {status === "loading" ? (
              <p>Cargando modelo para VR...</p>
            ) : status === "error" ? (
              <p>{errorMessage}</p>
            ) : (
              <ul className="list-disc space-y-[2px] pl-[16px]">
                {usageItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}

            {!isWebXRAvailable ? (
              <p className="mt-[6px] text-white/52">
                Para usar VR necesitas abrir esta vista desde un visor o
                navegador compatible.
              </p>
            ) : null}
          </div>
          </main>
        </div>
      </div>

      {xrSession ? (
        <div className="vr-exit-control fixed right-[16px] top-[16px] z-[90]">
          <Button
            theme="Primary"
            type="Solid"
            size="S"
            showText={false}
            showLeftIcon
            showRightIcon={false}
            iconLeft={<CloseIcon className="size-5" />}
            aria-label="Salir del modo VR"
            onClick={handleToggleVRSession}
            className="size-10 rounded-full bg-black/70 backdrop-blur-md"
          />
        </div>
      ) : null}
    </div>,
    document.body,
  );
}
