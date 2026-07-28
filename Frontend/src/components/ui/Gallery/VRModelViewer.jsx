import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";

import Button from "../../ui/Button/Button.jsx";
import {
  getSnapTurnState,
  getXRHandedAxes,
  getXRMovementAxes,
} from "../../../utils/vrLocomotion.js";

const XR_MOVEMENT_SPEED = 2.2;
const XR_COLLISION_DISTANCE = 0.42;
const XR_SNAP_TURN_RADIANS = THREE.MathUtils.degToRad(30);

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
  annotations = [],
  item,
  modelSrc,
  onSubmitObservation,
  poster,
  title = "Modelo 3D",
  visible = false,
  onClose,
}) {
  const mountRef = useRef(null);
  const overlayRootRef = useRef(null);
  const rendererRef = useRef(null);
  const modelRef = useRef(null);
  const annotationGroupRef = useRef(null);
  const pendingMarkerRef = useRef(null);
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [isWebXRAvailable, setIsWebXRAvailable] = useState(false);
  const [xrSession, setXrSession] = useState(null);
  const [modelRevision, setModelRevision] = useState(0);
  const [pendingObservation, setPendingObservation] = useState(null);
  const [observationMessage, setObservationMessage] = useState("");
  const [isSubmittingObservation, setIsSubmittingObservation] = useState(false);

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
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.xr.enabled = true;
    rendererRef.current = renderer;
    mountNode.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 1.4, -0.01);
    controls.update();

    const ambientLight = new THREE.HemisphereLight(0xfff4e6, 0x35445c, 1.45);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffe2bd, 2.6);
    keyLight.position.set(4, 8, 6);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xb9d8ff, 1.15);
    fillLight.position.set(-5, 3, 2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.4);
    rimLight.position.set(1, 5, -6);
    scene.add(rimLight);

    const floorGrid = new THREE.GridHelper(20, 20, 0x777777, 0x333333);
    floorGrid.position.y = 0.01;
    scene.add(floorGrid);
    const annotationGroup = new THREE.Group();
    annotationGroup.name = "VRAnnotations";
    annotationGroupRef.current = annotationGroup;
    scene.add(annotationGroup);
    const collisionRaycaster = new THREE.Raycaster();
    const interactionRaycaster = new THREE.Raycaster();

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
    }

    function getModelHitFromRay(origin, direction, { floorOnly = false } = {}) {
      const model = modelRef.current;
      if (!model) return null;

      interactionRaycaster.set(origin, direction);
      const hits = interactionRaycaster.intersectObject(model, true);

      if (!floorOnly) return hits[0] || null;

      return (
        hits.find((hit) => {
          if (!hit.face) return false;
          const normal = hit.face.normal
            .clone()
            .transformDirection(hit.object.matrixWorld);
          return normal.y > 0.55;
        }) || null
      );
    }

    function createObservationFromHit(hit) {
      const model = modelRef.current;
      if (!model || !hit?.face) return;

      const modelPosition = model.worldToLocal(hit.point.clone());
      const worldNormal = hit.face.normal
        .clone()
        .transformDirection(hit.object.matrixWorld);
      const modelNormal = worldNormal
        .clone()
        .transformDirection(new THREE.Matrix4().copy(model.matrixWorld).invert());

      setPendingObservation({
        kind: "viewer3d-point",
        image: {
          id: item?.id,
          src: poster || null,
          title,
        },
        imageSrc: poster || null,
        viewerPoint: {
          modelNormal: {
            x: modelNormal.x,
            y: modelNormal.y,
            z: modelNormal.z,
          },
          modelPosition: {
            x: modelPosition.x,
            y: modelPosition.y,
            z: modelPosition.z,
          },
        },
      });
    }

    function teleportToHit(hit) {
      if (!hit) return;
      playerRig.position.x = hit.point.x;
      playerRig.position.z = hit.point.z;
      playerRig.position.y = hit.point.y;
    }

    const controllerCleanups = [0, 1].map((index) => {
      const controller = renderer.xr.getController(index);
      const rayLine = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(0, 0, -3),
        ]),
        new THREE.LineBasicMaterial({ color: 0xff4431 }),
      );
      controller.add(rayLine);
      playerRig.add(controller);

      const rayOrigin = new THREE.Vector3();
      const rayDirection = new THREE.Vector3();
      const pointFromController = (floorOnly) => {
        controller.getWorldPosition(rayOrigin);
        controller.getWorldDirection(rayDirection);
        rayDirection.multiplyScalar(-1).normalize();
        return getModelHitFromRay(rayOrigin, rayDirection, { floorOnly });
      };
      const handleSelect = () => teleportToHit(pointFromController(true));
      const handleSqueeze = () =>
        createObservationFromHit(pointFromController(false));

      controller.addEventListener("selectstart", handleSelect);
      controller.addEventListener("squeezestart", handleSqueeze);

      return () => {
        controller.removeEventListener("selectstart", handleSelect);
        controller.removeEventListener("squeezestart", handleSqueeze);
        rayLine.geometry.dispose();
        rayLine.material.dispose();
      };
    });

    function handleDoubleClick(event) {
      const rect = renderer.domElement.getBoundingClientRect();
      const pointer = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      interactionRaycaster.setFromCamera(pointer, camera);
      const model = modelRef.current;
      const hit = model
        ? interactionRaycaster.intersectObject(model, true)[0]
        : null;
      createObservationFromHit(hit);
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
        const origin = camera.getWorldPosition(new THREE.Vector3());
        collisionRaycaster.set(origin, movement.clone().normalize());
        collisionRaycaster.far = XR_COLLISION_DISTANCE;
        const blocked =
          modelRef.current &&
          collisionRaycaster.intersectObject(modelRef.current, true).length > 0;

        if (!blocked) {
          camera.position.add(movement);
          controls.target.add(movement);
        }
      }
    }

    const xrForward = new THREE.Vector3();
    const xrRight = new THREE.Vector3();
    const xrMovement = new THREE.Vector3();
    const worldUp = new THREE.Vector3(0, 1, 0);
    let snapTurnLatched = false;

    function updateXRControllerMovement(delta) {
      if (!renderer.xr.isPresenting) {
        return;
      }

      const session = renderer.xr.getSession();
      const sources = Array.from(session?.inputSources || []);
      const hasLeftController = sources.some(
        (source) => source?.handedness === "left" && source?.gamepad,
      );
      const { x, y } = hasLeftController
        ? getXRHandedAxes(sources, "left")
        : getXRMovementAxes(sources);

      if (x || y) {
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

        const movementStep = xrMovement
          .clone()
          .multiplyScalar(XR_MOVEMENT_SPEED * Math.min(delta, 0.05));
        const origin = xrCamera.getWorldPosition(new THREE.Vector3());
        collisionRaycaster.set(origin, movementStep.clone().normalize());
        collisionRaycaster.far = XR_COLLISION_DISTANCE;
        const blocked =
          modelRef.current &&
          collisionRaycaster.intersectObject(modelRef.current, true).length > 0;

        if (!blocked) playerRig.position.add(movementStep);
      }

      const rightAxes = getXRHandedAxes(sources, "right");
      const snapTurn = getSnapTurnState(rightAxes.x, snapTurnLatched);
      snapTurnLatched = snapTurn.latched;
      if (snapTurn.direction) {
        playerRig.rotateY(snapTurn.direction * XR_SNAP_TURN_RADIANS);
      }
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
    renderer.domElement.addEventListener("dblclick", handleDoubleClick);

    setStatus("loading");
    setErrorMessage("");
    checkVRSupport().catch(() => {
      setIsWebXRAvailable(false);
    });

    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.load(
      modelSrc,
      (gltf) => {
        if (disposed) {
          return;
        }

        const model = gltf.scene;
        frameModel(model);
        modelRef.current = model;
        scene.add(model);
        setStatus("loaded");
        setModelRevision((current) => current + 1);
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
      renderer.domElement.removeEventListener("dblclick", handleDoubleClick);
      controllerCleanups.forEach((cleanup) => cleanup());
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
      modelRef.current = null;
      annotationGroupRef.current = null;
    };
  }, [item?.id, modelSrc, poster, title, visible]);

  useEffect(() => {
    const group = annotationGroupRef.current;
    const model = modelRef.current;
    if (!group || !model) return;

    group.children.forEach((marker) => {
      marker.geometry?.dispose?.();
      marker.material?.dispose?.();
    });
    group.clear();
    annotations.forEach((comment) => {
      const point = comment?.selection?.viewerPoint?.modelPosition;
      if (![point?.x, point?.y, point?.z].every(Number.isFinite)) return;

      const position = model.localToWorld(
        new THREE.Vector3(point.x, point.y, point.z),
      );
      const marker = new THREE.Mesh(
        new THREE.SphereGeometry(0.075, 16, 12),
        new THREE.MeshStandardMaterial({
          color: 0xff4431,
          emissive: 0x66140c,
          emissiveIntensity: 0.7,
        }),
      );
      marker.position.copy(position);
      marker.userData.commentId = comment.id;
      group.add(marker);
    });
  }, [annotations, modelRevision]);

  useEffect(() => {
    pendingMarkerRef.current?.parent?.remove(pendingMarkerRef.current);
    pendingMarkerRef.current?.geometry?.dispose?.();
    pendingMarkerRef.current?.material?.dispose?.();
    pendingMarkerRef.current = null;

    const model = modelRef.current;
    const point = pendingObservation?.viewerPoint?.modelPosition;
    if (!model || ![point?.x, point?.y, point?.z].every(Number.isFinite)) return;

    const marker = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 16, 12),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xff4431,
        emissiveIntensity: 1,
      }),
    );
    marker.position.copy(
      model.localToWorld(new THREE.Vector3(point.x, point.y, point.z)),
    );
    annotationGroupRef.current?.add(marker);
    pendingMarkerRef.current = marker;
  }, [modelRevision, pendingObservation]);

  async function handleObservationSubmit() {
    const message = observationMessage.trim();
    if (!message || !pendingObservation || !onSubmitObservation) return;

    setIsSubmittingObservation(true);
    try {
      await onSubmitObservation({
        message,
        parentCommentId: null,
        selection: pendingObservation,
      });
      setObservationMessage("");
      setPendingObservation(null);
    } finally {
      setIsSubmittingObservation(false);
    }
  }

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
    "Apunta al piso y usa el gatillo para teletransportarte",
    "Usa el agarre lateral sobre una superficie para crear una observacion",
    "Usa el joystick derecho para girar en pasos de 30 grados",
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

          {pendingObservation ? (
            <div className="pointer-events-auto absolute inset-x-[16px] bottom-[16px] z-20 mx-auto flex max-w-[520px] flex-col gap-[8px] rounded-[12px] border border-white/15 bg-black/75 p-[12px] backdrop-blur-md">
              <label className="text-[13px] font-semibold" htmlFor="vr-observation">
                Nueva observación
              </label>
              <textarea
                id="vr-observation"
                value={observationMessage}
                onChange={(event) => setObservationMessage(event.target.value)}
                placeholder="Describe el ajuste necesario..."
                rows={2}
                className="resize-none rounded-[8px] border border-white/15 bg-white/10 px-[12px] py-[10px] text-[14px] text-white outline-none placeholder:text-white/45 focus:border-[#ff4431]"
              />
              <div className="flex justify-end gap-[8px]">
                <Button
                  theme="Primary"
                  type="Ghost"
                  size="S"
                  onClick={() => {
                    setPendingObservation(null);
                    setObservationMessage("");
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  theme="Primary"
                  type="Solid"
                  size="S"
                  disabled={!observationMessage.trim() || isSubmittingObservation}
                  onClick={handleObservationSubmit}
                >
                  {isSubmittingObservation ? "Guardando..." : "Guardar"}
                </Button>
              </div>
            </div>
          ) : null}
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
