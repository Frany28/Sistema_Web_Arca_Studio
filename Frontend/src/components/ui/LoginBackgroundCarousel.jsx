import { useEffect, useState } from "react";

import fondoVariante2 from "../../assets/fondos/Property 1=Variant2.png";
import fondoNotificacion from "../../assets/fondos/Property 1=notificacion.png";
import fondoTextura from "../../assets/fondos/88c12dc848224c27f9236223c33f47621394518d.jpg";
import logoArca from "../../assets/logos/SIZE=200px.svg";

const fondoActualizarContrasena = new URL(
  "../../assets/fondos/Property 1=actualizar contrase\u00f1a.png",
  import.meta.url,
).href;

const fondoRestablecerContrasena = new URL(
  "../../assets/fondos/Property 1=restablecer contrase\u00f1a.png",
  import.meta.url,
).href;

const DEFAULT_IMAGES = [
  fondoVariante2,
  fondoNotificacion,
  fondoActualizarContrasena,
  fondoRestablecerContrasena,
  fondoTextura,
];

const SLIDE_INTERVAL_MS = 15000;

function LoginBackgroundCarousel({ images = DEFAULT_IMAGES }) {
  const validImages = images.filter(Boolean);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (validImages.length <= 1) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % validImages.length);
    }, SLIDE_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [validImages.length]);

  if (validImages.length === 0) {
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "#d9d4cc",
        }}
      />
    );
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: "#d9d4cc",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
        }}
      >
        {validImages.map((image, index) => {
          const isActive = index === activeIndex;

          return (
            <img
              key={image}
              src={image}
              alt=""
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
                opacity: isActive ? 1 : 0,
                transform: isActive ? "scale(1.04)" : "scale(1)",
                transition:
                  "opacity 2200ms ease-out, transform 2200ms ease-out",
              }}
            />
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, rgba(7, 16, 32, 0.12), rgba(7, 16, 32, 0.42))",
        }}
      />

      <img
        src={logoArca}
        alt="ARCA Studio"
        style={{
          position: "absolute",
          left: "50%",
          bottom: 24,
          zIndex: 2,
          width: "130.74px",
          height: "24px",
          transform: "translateX(-50%)",
          objectFit: "contain",
        }}
      />
    </div>
  );
}

export default LoginBackgroundCarousel;
