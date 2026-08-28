interface GalleryGridProps {
  images?: string[];
}

// TODO: Replace placeholder images with actual event photos
const PLACEHOLDER_IMAGES = [
  "/images/gallery-1.jpg",
  "/images/gallery-2.jpg",
  "/images/gallery-3.jpg",
  "/images/gallery-4.jpg",
  "/images/gallery-5.jpg",
  "/images/gallery-6.jpg",
  "/images/gallery-7.jpg",
  "/images/gallery-8.jpg",
];

export default function GalleryGrid({ images }: GalleryGridProps) {
  const displayImages = images || PLACEHOLDER_IMAGES;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Gallery</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {displayImages.map((image, index) => (
          <div
            key={index}
            className="aspect-square rounded-lg overflow-hidden bg-muted"
          >
            {/* TODO: Replace with actual event gallery images */}
            <img
              src={image}
              alt={`Gallery image ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
