import { useEffect, useState } from "react";

import EmptyState from "../../../components/ui/EmptyState.jsx";
import GalleryImageCard from "../../../components/ui/Gallery/GalleryImageCard.jsx";
import ImageViewerModal from "../../../components/ui/Gallery/ImageViewerModal.jsx";
import Panorama360Viewer from "../../../components/ui/Gallery/Panorama360Viewer.jsx";
import VideoThumbnail from "../../../components/ui/Gallery/VideoThumbnail.jsx";
import VideoViewerModal from "../../../components/ui/Gallery/VideoViewerModal.jsx";

export default function ProjectRendersPanel({
  focusedCommentId,
  focusedImageId,
  panoramaGallery = [],
  projectId,
  renderGallery = [],
  videoGallery = [],
}) {
  const [activePanoramaId, setActivePanoramaId] = useState(panoramaGallery[0]?.id);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const activePanorama = panoramaGallery.find((item) => item.id === activePanoramaId) || panoramaGallery[0];

  useEffect(() => {
    if (!focusedImageId) return;
    const target = String(focusedImageId);
    const panorama = panoramaGallery.find((item) => [item.id, item.fileId, item.title].some((value) => String(value) === target));
    if (panorama) { setActivePanoramaId(panorama.id); return; }
    const image = renderGallery.find((item) => [item.id, item.fileId, item.title].some((value) => String(value) === target));
    if (image) { setSelectedImage(image); return; }
    const video = videoGallery.find((item) => [item.id, item.fileId, item.title].some((value) => String(value) === target));
    if (video) setSelectedVideo(video);
  }, [focusedImageId, panoramaGallery, renderGallery, videoGallery]);

  return (
    <div className="flex w-full flex-col gap-[24px]">
      {activePanorama ? (
        <>
          <Panorama360Viewer item={activePanorama} projectId={projectId} focusedCommentId={focusedCommentId} />
          {panoramaGallery.length > 1 ? <div className="grid grid-cols-3 gap-[12px] max-[768px]:grid-cols-1">{panoramaGallery.map((item) => <GalleryImageCard key={item.id} item={item} size="full" onClick={() => setActivePanoramaId(item.id)} />)}</div> : null}
        </>
      ) : (
        <EmptyState title="No se encontraron panorámicas 360" description="Aún no se han cargado panorámicas para este proyecto." size="M" showFeaturedIcon />
      )}

      {renderGallery.length ? <section><h2 className="mb-[12px] text-heading-4 text-[var(--color-text-300)]">Renders</h2><div className="grid grid-cols-3 gap-[12px] max-[768px]:grid-cols-1">{renderGallery.map((item) => <GalleryImageCard key={item.id} item={item} size="full" onClick={() => setSelectedImage(item)} />)}</div></section> : null}
      {videoGallery.length ? <section><h2 className="mb-[12px] text-heading-4 text-[var(--color-text-300)]">Videos</h2><div className="grid grid-cols-3 gap-[12px] max-[768px]:grid-cols-1">{videoGallery.map((item) => <VideoThumbnail key={item.id} item={item} onClick={() => setSelectedVideo(item)} />)}</div></section> : null}

      <ImageViewerModal visible={Boolean(selectedImage)} items={renderGallery} initialItem={selectedImage} projectId={projectId} focusedCommentId={focusedCommentId} onClose={() => setSelectedImage(null)} />
      <VideoViewerModal visible={Boolean(selectedVideo)} item={selectedVideo} projectId={projectId} onClose={() => setSelectedVideo(null)} />
    </div>
  );
}
