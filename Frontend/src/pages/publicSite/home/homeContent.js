import constructionHeroAsset from "../../../assets/home/arca-construction-worker-v2.png";
import homeHeroAsset from "../../../assets/home/arca-home-hero.png";
import interiorDesignHeroAsset from "../../../assets/home/arca-interior-design-hero.png";
import statementVideoMp4Asset from "../../../assets/home/arca-statement-bg.mp4";
import statementVideoWebmAsset from "../../../assets/home/arca-statement-bg.webm";
import statementPosterAsset from "../../../assets/home/arca-statement-poster.webp";

const HOME_IMAGE_PANELS = Object.freeze([
  {
    image: homeHeroAsset,
    imageAlt: "Instalaciones industriales de ARCA Studio junto al mar",
    title: "Arquitectura",
  },
  {
    image: constructionHeroAsset,
    imageAlt: "Trabajador de ARCA Studio preparando una estructura metálica",
    title: "Construcción",
  },
  {
    image: interiorDesignHeroAsset,
    imageAlt: "Sala interior diseñada por ARCA Studio con iluminación ambiental",
    title: "Interiorismo",
  },
]);

const HOME_PRELOAD_IMAGES = Object.freeze(
  HOME_IMAGE_PANELS.map(({ image }) => image),
);

const HOME_STATEMENT = Object.freeze({
  mp4Source: statementVideoMp4Asset,
  phrase: "Piénsalo y lo hacemos realidad.",
  poster: statementPosterAsset,
  webmSource: statementVideoWebmAsset,
});

export { HOME_IMAGE_PANELS, HOME_PRELOAD_IMAGES, HOME_STATEMENT };
