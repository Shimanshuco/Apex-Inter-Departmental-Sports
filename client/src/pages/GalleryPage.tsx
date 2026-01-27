import { useState, useEffect } from "react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import axios from "axios";
import { API_ENDPOINTS } from "../config/api";

interface GalleryImage {
  _id: string;
  imageUrl: string;
  title: string;
  category: string;
  description?: string;
  createdAt: string;
}

const CATEGORY_OPTIONS = [
  "All",
  "Football",
  "Volleyball",
  "Basketball",
  "Kabaddi",
  "Badminton",
  "Chess",
  "Kho Kho",
  "Table Tennis",
  "Tug of War",
  "Cricket",
  "Athletics",
  "Events",
  "Celebrations",
  "Other",
];

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.GALLERY_LIST);
      setGalleryImages(response.data.gallery || []);
    } catch (error) {
      console.error("Failed to fetch gallery");
    } finally {
      setLoading(false);
    }
  };

  const filteredImages = selectedCategory === "All" 
    ? galleryImages 
    : galleryImages.filter(img => img.category === selectedCategory);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Navbar />
      
      {/* Header Section */}
      <div className="bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Photo Gallery
          </h1>
          <p className="text-slate-300 mt-1 text-sm sm:text-base">
            Relive the best moments from our sports events
          </p>
        </div>
      </div>

      {/* Filter Bar - Not sticky */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-nowrap sm:flex-wrap gap-2 overflow-x-auto scrollbar-hide pb-1">
            {CATEGORY_OPTIONS.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm whitespace-nowrap transition ${
                  selectedCategory === category
                    ? "bg-slate-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {loading ? (
          <div className="text-center py-12 sm:py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-200 border-t-slate-500 mx-auto"></div>
            <p className="mt-4 text-slate-500">Loading photos...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredImages.map((image) => (
              <div
                key={image._id}
                onClick={() => setSelectedImage(image)}
                className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden cursor-pointer hover:shadow-md transition-shadow group"
              >
                <div className="relative h-48 sm:h-56 overflow-hidden">
                  <img
                    src={image.imageUrl}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://placehold.co/600x400/475569/ffffff?text=${encodeURIComponent(image.category)}`;
                    }}
                  />
                  <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                    <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-slate-700/90 text-white text-xs font-medium rounded">
                      {image.category}
                    </span>
                  </div>
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="font-semibold text-slate-800 mb-1 text-sm sm:text-base">{image.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-400">{formatDate(image.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredImages.length === 0 && (
          <div className="text-center py-12 sm:py-16">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-slate-600 font-medium">No photos found in this category</p>
            <p className="text-slate-400 text-sm mt-1">Try selecting a different category</p>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-2 sm:p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-8 sm:-top-10 right-0 text-white text-2xl sm:text-3xl hover:text-slate-300 transition-colors"
              >
                ×
              </button>
              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.title}
                className="w-full rounded-xl max-h-[70vh] object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://placehold.co/800x600/475569/ffffff?text=${encodeURIComponent(selectedImage.category)}`;
                }}
              />
              <div className="mt-3 sm:mt-4 text-white">
                <h2 className="text-xl sm:text-2xl font-bold">{selectedImage.title}</h2>
                <p className="text-slate-300 text-sm sm:text-base">
                  {selectedImage.category} • {formatDate(selectedImage.createdAt)}
                </p>
                {selectedImage.description && (
                  <p className="text-slate-400 mt-1 sm:mt-2 text-sm sm:text-base">{selectedImage.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
