import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

import Button from "../../ui/Button/Button.jsx";
import {
  getSnapTurnState,
  getXRHandedAxes,
  getXRMovementAxes,
} from "../../../utils/vrLocomotion.js";
import {
  ARCHITECTURAL_PROFILES,
  DEFAULT_ARCHITECTURAL_SETTINGS,
  enhanceThreeArchitecturalMaterials,
} from "../../../utils/architecturalRendering.js";

const XR_MOVEMENT_SPEED = 2.2;
const XR_COLLISION_DISTANCE = 0.42;
const XR_SNAP_TURN_RADIANS = THREE.MathUtils.degToRad(30);
const ARCHITECTURAL_EYE_HEIGHT = 1.65;
const MINIMUM_EYE_HEIGHT = 1.2;
const MAXIMUM_EYE_HEIGHT = 2.2;
const EYE_HEIGHT_STEP = 0.1;

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
  renderSettings = DEFAULT_ARCHITECTURAL_SETTINGS,
  title = "Modelo 3D",
  visible = false,
  onClose,
}) {
  const mountRef = useRef(null);
  const overlayRootRef = useRef(null);
  const rendererRef = useRef(null);
  const modelRef = useRef(null);
  const resetViewRef = useRef(null);
  const adjustEyeHeightRef = useRef(null);
  const collisionEnabledRef = useRef(true);
  const eyeHeightRef = useRef(ARCHITECTURAL_EYE_HEIGHT);
  const locomotionModeRef = useRef("walk");
  const annotationGroupRef = useRef(null);
  const pendingMarkerRef = useRef(null);
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [isWebXRAvailable, setIsWebXRAvailable] = useState(false);
  const [xrSession, setXrSession] = useState(null);
  const [collisionEnabled, setCollisionEnabled] = useState(true);
  const [eyeHeight, setEyeHeight] = useState(ARCHITECTURAL_EYE_HEIGHT);
  const [locomotionMode, setLocomotionMode] = useState("walk");
  const [modelRevision, setModelRevision] = useState(0);
  const [pendingObservation, setPendingObservation] = useState(null);
  const [observationMessage, setObservationMessage] = useState("");
  const [isSubmittingObservation, setIsSubmittingObservation] = useState(false);

  useEffect(() => {
    collisionEnabledRef.current = collisionEnabled;
  }, [collisionEnabled]);

  useEffect(() => {
    eyeHeightRef.current = eyeHeight;
  }, [eyeHeight]);

  useEffect(() => {
    locomotionModeRef.current = locomotionMode;
  }, [locomotionMode]);

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
    const activeProfile =
      ARCHITECTURAL_PROFILES[renderSettings.profile] ||
      ARCHITECTURAL_PROFILES.exterior;
    renderer.toneMappingExposure = Number(renderSettings.exposure) || 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.xr.enabled = true;
    rendererRef.current = renderer;
    mountNode.appendChild(renderer.domElement);

    const environmentGenerator = new THREE.PMREMGenerator(renderer);
    const environmentTarget = environmentGenerator.fromScene(
      new RoomEnvironment(),
      0.04,
    );
    scene.environment = environmentTarget.texture;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 1.4, -0.01);
    controls.update();

    const ambientLight = new THREE.HemisphereLight(...activeProfile.hemisphere);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(
      renderSettings.profile === "night" ? 0x9fb9e8 : 0xffd8ad,
      Math.max(0.5, Number(renderSettings.shadowIntensity) || 1.5) * 2,
    );
    keyLight.position.set(5, 9, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.bias = -0.00015;
    keyLight.shadow.normalBias = 0.035;
    keyLight.shadow.camera.near = 0.1;
    keyLight.shadow.camera.far = 80;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xb9d8ff, 0.78);
    fillLight.position.set(-5, 3, 2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xfff4df, 1.05);
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

    function isMovementBlocked(origin, direction, { bypass = false } = {}) {
      const model = modelRef.current;

      if (!collisionEnabledRef.current || bypass || !model) {
        return false;
      }

      collisionRaycaster.set(origin, direction);
      collisionRaycaster.far = XR_COLLISION_DISTANCE;

      return collisionRaycaster.intersectObject(model, true).some((hit) => {
        const materials = Array.isArray(hit.object.material)
          ? hit.object.material
          : [hit.object.material].filter(Boolean);

        return materials.some(
          (material) =>
            material.visible !== false &&
            (!material.transparent || material.opacity >= 0.35),
        );
      });
    }

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
      const shadowExtent = Math.max(framedSize.x, framedSize.z, 8) * 0.58;
      keyLight.target.position.set(0, framedSize.y * 0.28, 0);
      scene.add(keyLight.target);
      keyLight.shadow.camera.left = -shadowExtent;
      keyLight.shadow.camera.right = shadowExtent;
      keyLight.shadow.camera.top = shadowExtent;
      keyLight.shadow.camera.bottom = -shadowExtent;
      keyLight.shadow.camera.updateProjectionMatrix();
      const resolvedEyeHeight = eyeHeightRef.current;
      const exteriorDistance = Math.max(
        Math.min(framedSize.z * 0.18, 5),
        1.4,
      );
      const cameraZ = framedBox.max.z + exteriorDistance;

      camera.position.set(0, resolvedEyeHeight, cameraZ);
      playerRig.position.set(0, 0, 0);
      playerRig.rotation.set(0, 0, 0);
      controls.target.set(0, resolvedEyeHeight, 0);
      controls.update();

      resetViewRef.current = () => {
        camera.position.set(0, eyeHeightRef.current, cameraZ);
        playerRig.position.set(0, 0, 0);
        playerRig.rotation.set(0, 0, 0);
        controls.target.set(0, eyeHeightRef.current, 0);
        controls.update();
      };

      adjustEyeHeightRef.current = (nextHeight) => {
        const clampedHeight = THREE.MathUtils.clamp(
          nextHeight,
          MINIMUM_EYE_HEIGHT,
          MAXIMUM_EYE_HEIGHT,
        );
        const difference = clampedHeight - eyeHeightRef.current;
        eyeHeightRef.current = clampedHeight;

        if (renderer.xr.isPresenting) {
          playerRig.position.y += difference;
        } else {
          camera.position.y += difference;
          controls.target.y += difference;
          controls.update();
        }

        setEyeHeight(clampedHeight);
      };
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
      if (event.code === "KeyC" && !event.repeat) {
        setCollisionEnabled((current) => !current);
        return;
      }

      if (event.code === "KeyR" && !event.repeat) {
        resetViewRef.current?.();
        return;
      }

      if (event.code === "KeyV" && !event.repeat) {
        setLocomotionMode((current) => {
          const nextMode = current === "walk" ? "fly" : "walk";
          locomotionModeRef.current = nextMode;
          return nextMode;
        });
        return;
      }

      if (event.code === "Escape" && renderer.xr.getSession()) {
        renderer.xr.getSession().end().catch(() => {});
        return;
      }

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
      if (locomotionModeRef.current === "walk") {
        forward.y = 0;
      }
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

      if (locomotionModeRef.current === "fly") {
        if (pressedKeys.has("KeyE") || pressedKeys.has("Space")) {
          movement.y += 1;
        }

        if (pressedKeys.has("KeyQ")) {
          movement.y -= 1;
        }
      }

      if (movement.lengthSq() > 0) {
        movement.normalize().multiplyScalar(speed);
        const origin = camera.getWorldPosition(new THREE.Vector3());
        const bypassCollision =
          pressedKeys.has("ShiftLeft") || pressedKeys.has("ShiftRight");
        const blocked = isMovementBlocked(
          origin,
          movement.clone().normalize(),
          { bypass: bypassCollision },
        );

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
      const rightAxes = getXRHandedAxes(sources, "right");

      if (x || y || (locomotionModeRef.current === "fly" && rightAxes.y)) {
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

        if (locomotionModeRef.current === "fly") {
          xrMovement.addScaledVector(worldUp, -rightAxes.y);
        }

        if (xrMovement.lengthSq() > 1) {
          xrMovement.normalize();
        }

        const movementStep = xrMovement
          .clone()
          .multiplyScalar(XR_MOVEMENT_SPEED * Math.min(delta, 0.05));
        const origin = xrCamera.getWorldPosition(new THREE.Vector3());
        const blocked = isMovementBlocked(
          origin,
          movementStep.clone().normalize(),
        );

        if (!blocked) playerRig.position.add(movementStep);
      }

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
        const maximumAnisotropy = Math.min(
          renderer.capabilities.getMaxAnisotropy(),
          8,
        );
        enhanceThreeArchitecturalMaterials(model, {
          materialOverrides: renderSettings.materialOverrides,
          maximumAnisotropy,
          profile: renderSettings.profile,
        });

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
      resetViewRef.current = null;
      adjustEyeHeightRef.current = null;
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      renderer.domElement.removeEventListener("dblclick", handleDoubleClick);
      controllerCleanups.forEach((cleanup) => cleanup());
      renderer.setAnimationLoop(null);
      controls.dispose();
      environmentTarget.dispose();
      environmentGenerator.dispose();
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
  }, [item?.id, modelSrc, poster, renderSettings, title, visible]);

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
    "Pulsa V para alternar entre Recorrido y Vuelo; en Vuelo usa Q/E para bajar o subir",
    "Pulsa R para volver a la vista exterior y C para activar o desactivar colisiones",
    "Mantén Shift mientras caminas para atravesar un bloqueo",
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
          <header className="flex min-h-[64px] flex-wrap items-center justify-between gap-[10px] border-b border-white/10 bg-black/55 px-[16px] py-[8px] backdrop-blur-md">
          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold leading-[18px]">
              {title}
            </p>
            <p className="text-[12px] leading-[16px] text-white/62">
              Recorrido arquitectónico VR
            </p>
          </div>

          <div className="flex max-w-full shrink-0 flex-wrap items-center justify-end gap-[8px]">
            <Button
              theme="Primary"
              type={locomotionMode === "walk" ? "Solid" : "Outline"}
              size="S"
              showLeftIcon={false}
              showRightIcon={false}
              onClick={() =>
                setLocomotionMode((current) => {
                  const nextMode = current === "walk" ? "fly" : "walk";
                  locomotionModeRef.current = nextMode;
                  return nextMode;
                })
              }
            >
              {locomotionMode === "walk" ? "Recorrido" : "Vuelo"}
            </Button>
            <div
              className="flex items-center overflow-hidden rounded-[8px] border border-white/15 bg-black/35"
              aria-label="Altura de la vista"
            >
              <button
                type="button"
                className="flex size-8 cursor-pointer items-center justify-center text-[16px] text-white/80 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#ff4431]"
                aria-label="Bajar altura de la vista"
                onClick={() =>
                  adjustEyeHeightRef.current?.(eyeHeight - EYE_HEIGHT_STEP)
                }
              >
                −
              </button>
              <button
                type="button"
                className="h-8 min-w-[72px] cursor-pointer border-x border-white/15 px-[8px] text-[12px] font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#ff4431]"
                title="Restablecer altura arquitectónica"
                onClick={() =>
                  adjustEyeHeightRef.current?.(ARCHITECTURAL_EYE_HEIGHT)
                }
              >
                {eyeHeight.toFixed(2)} m
              </button>
              <button
                type="button"
                className="flex size-8 cursor-pointer items-center justify-center text-[16px] text-white/80 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#ff4431]"
                aria-label="Subir altura de la vista"
                onClick={() =>
                  adjustEyeHeightRef.current?.(eyeHeight + EYE_HEIGHT_STEP)
                }
              >
                +
              </button>
            </div>
            <Button
              theme="Primary"
              type="Ghost"
              size="S"
              showLeftIcon={false}
              showRightIcon={false}
              onClick={() => resetViewRef.current?.()}
            >
              Vista exterior
            </Button>
            <Button
              theme="Primary"
              type={collisionEnabled ? "Outline" : "Solid"}
              size="S"
              showLeftIcon={false}
              showRightIcon={false}
              onClick={() => setCollisionEnabled((current) => !current)}
            >
              {collisionEnabled ? "Colisiones activas" : "Paso libre"}
            </Button>
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
                  showLeftIcon={false}
                  showRightIcon={false}
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
                  showLeftIcon={false}
                  showRightIcon={false}
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
