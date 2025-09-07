import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { galleryAPI } from '../services/api';

// Simple loading component
const Loader = () => (
  <div className="flex justify-center items-center min-h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>
);

// Error component
const ErrorMessage = ({ message, onRetry }) => (
  <div className="text-center p-8">
    <p className="text-red-600 mb-4">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
      >
        Try Again
      </button>
    )}
  </div>
);

const Gallery = () => {
  // State for gallery items and UI
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTag, setSelectedTag] = useState('');
  const [allTags, setAllTags] = useState([]);
  const [savedItems, setSavedItems] = useState(new Set());
  const [likedImages, setLikedImages] = useState(new Set());
  const [likeCounts, setLikeCounts] = useState({});
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Get user from Redux store and navigation
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  // Fetch gallery items
  const fetchGalleryItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = selectedTag ? { tags: selectedTag } : {};
      const response = await galleryAPI.getAll(params);
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      const items = response.data.data || [];
      setGalleryItems(items);
      
      // Extract unique tags
      const tags = new Set();
      items.forEach(item => {
        if (item?.tags?.length) {
          item.tags.forEach(tag => tag && tags.add(tag));
        }
      });
      setAllTags(Array.from(tags));
      
    } catch (err) {
      console.error('Failed to fetch gallery items:', err);
      setError(err.message || 'Failed to load gallery items');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchGalleryItems();
  }, [selectedTag]);

  // Handle tag filter
  const handleTagClick = (tag) => {
    setSelectedTag(tag === selectedTag ? '' : tag);
  };

  useEffect(() => {
    // Load saved items and liked images
    try {
      const saved = localStorage.getItem('savedGalleryItems');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSavedItems(new Set(Array.isArray(parsed) ? parsed : []));
      }
      
      const liked = localStorage.getItem('likedImages');
      if (liked) {
        const parsedLiked = JSON.parse(liked);
        setLikedImages(new Set(Array.isArray(parsedLiked) ? parsedLiked : []));
      }
      
      const counts = localStorage.getItem('likeCounts');
      if (counts) {
        const parsedCounts = JSON.parse(counts);
        setLikeCounts(parsedCounts || {});
      }
    } catch (error) {
      console.error('Error loading saved items:', error);
    }
  }, []);

  const toggleSave = (itemId, e) => {
    if (e) e.stopPropagation();
    
    // Check if user is authenticated
    if (!user) {
      navigate('/login');
      return;
    }
    
    setSavedItems(prevSavedItems => {
      const newSavedItems = new Set(prevSavedItems);
      
      if (newSavedItems.has(itemId)) {
        newSavedItems.delete(itemId);
      } else {
        newSavedItems.add(itemId);
      }
      
      // Save to localStorage
      try {
        localStorage.setItem('savedGalleryItems', JSON.stringify(Array.from(newSavedItems)));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
      
      return newSavedItems;
    });
  };

  const toggleLike = (itemId, imageUrl) => {
    // Check if user is authenticated
    if (!user) {
      navigate('/login');
      return;
    }
    
    const likeKey = `${itemId}-${imageUrl}`;
    
    setLikedImages(prevLiked => {
      const newLiked = new Set(prevLiked);
      const isCurrentlyLiked = newLiked.has(likeKey);
      
      if (isCurrentlyLiked) {
        newLiked.delete(likeKey);
      } else {
        newLiked.add(likeKey);
      }
      
      // Update like counts
      setLikeCounts(prevCounts => {
        const newCounts = { ...prevCounts };
        const currentCount = newCounts[likeKey] || 0;
        
        if (isCurrentlyLiked) {
          newCounts[likeKey] = Math.max(0, currentCount - 1);
        } else {
          newCounts[likeKey] = currentCount + 1;
        }
        
        // Save to localStorage
        try {
          localStorage.setItem('likeCounts', JSON.stringify(newCounts));
        } catch (error) {
          console.error('Error saving like counts:', error);
        }
        
        return newCounts;
      });
      
      // Save liked images to localStorage
      try {
        localStorage.setItem('likedImages', JSON.stringify(Array.from(newLiked)));
      } catch (error) {
        console.error('Error saving liked images:', error);
      }
      
      return newLiked;
    });
  };

  const openPreview = (item, imageIndex) => {
    setSelectedItem(item);
    setSelectedImage(item.images[imageIndex]);
    setCurrentImageIndex(imageIndex);
    setShowPreviewModal(true);
  };

  const closePreview = () => {
    setShowPreviewModal(false);
    setSelectedItem(null);
    setSelectedImage(null);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (selectedItem && currentImageIndex < selectedItem.images.length - 1) {
      const newIndex = currentImageIndex + 1;
      setCurrentImageIndex(newIndex);
      setSelectedImage(selectedItem.images[newIndex]);
    }
  };

  const prevImage = () => {
    if (selectedItem && currentImageIndex > 0) {
      const newIndex = currentImageIndex - 1;
      setCurrentImageIndex(newIndex);
      setSelectedImage(selectedItem.images[newIndex]);
    }
  };




  // Loading state
  if (loading) {
    return <Loader />;
  }

  // Error state
  if (error) {
    return <ErrorMessage message={error} onRetry={fetchGalleryItems} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">Design Gallery</h1>
        {isAdmin && (
          <button 
            onClick={() => navigate('/admin/add-gallery')}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
          >
            Add New Design
          </button>
        )}
      </div>

      {/* Tags Filter */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSelectedTag('')}
            className={`px-3 py-1 rounded-full text-sm ${
              !selectedTag ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedTag === tag ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Gallery Grid */}
      {galleryItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {galleryItems.map(item => (
            <div key={item._id} className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden">
              <div className="relative overflow-hidden bg-gray-50">
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={item.images?.[0] || '/api/placeholder/600/400'}
                    alt={item.title}
                    className="w-full h-48 object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
                    onClick={() => openPreview(item, 0)}
                  />
                </div>
              
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              
                {/* Action buttons */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <div className="flex space-x-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(item._id, item.images[0]);
                      }}
                      className={`p-4 rounded-full backdrop-blur-md transition-all duration-300 transform hover:scale-125 active:scale-95 shadow-xl ${
                        likedImages.has(`${item._id}-${item.images[0]}`) 
                          ? 'bg-red-500 text-white shadow-lg' 
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                      title={likedImages.has(`${item._id}-${item.images[0]}`) ? 'Unlike' : 'Like'}
                    >
                      <svg 
                        className={`w-6 h-6 transition-all duration-200 ${
                          likedImages.has(`${item._id}-${item.images[0]}`) ? 'animate-pulse' : ''
                        }`} 
                        fill={likedImages.has(`${item._id}-${item.images[0]}`) ? 'currentColor' : 'none'} 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSave(item._id, e);
                      }}
                      className={`p-4 rounded-full backdrop-blur-md transition-all duration-300 transform hover:scale-125 active:scale-95 shadow-xl ${
                        savedItems.has(item._id) 
                          ? 'bg-blue-500 text-white shadow-lg' 
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                      title={savedItems.has(item._id) ? 'Remove from saved' : 'Save for later'}
                    >
                      <svg 
                        className="w-6 h-6" 
                        fill={savedItems.has(item._id) ? 'currentColor' : 'none'} 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={savedItems.has(item._id) ? 0 : 2}
                          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" 
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => openPreview(item, 0)}
                      className="p-4 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-all duration-300 transform hover:scale-125 shadow-xl border border-white/30"
                      title="View details"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Like count badge */}
                {likeCounts[`${item._id}-${item.images[0]}`] > 0 && (
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-sm font-bold flex items-center shadow-xl backdrop-blur-sm border border-white/20 transform transition-all duration-300 hover:scale-110">
                    <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {likeCounts[`${item._id}-${item.images[0]}`]}
                  </div>
                )}
                
                {/* Multiple images indicator */}
                {item.images?.length > 1 && (
                  <div className="absolute bottom-3 right-3 bg-black/70 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-xl backdrop-blur-sm border border-white/10 flex items-center">
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    +{item.images.length - 1}
                  </div>
                )}
              </div>
              
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors duration-300 line-clamp-1">
                      {item.title}
                    </h3>
                    <div className="flex items-center mt-1">
                      <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                        {new Date(item.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm my-3 line-clamp-2 leading-relaxed">
                  {item.description || 'No description available'}
                </p>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  {item.designer ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                          <span className="text-sm font-semibold text-white">
                            {item.designer.user?.name?.charAt(0) || 'D'}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.designer.user?.name || 'Designer'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {item.designer.specialization || 'Interior Designer'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No designer</div>
                  )}
                  
                  <div className="flex items-center space-x-2 mt-3">
                    <span className="flex items-center text-sm text-gray-500">
                      <svg className="w-4 h-4 mr-1 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 13.07 2 10.999 2 8.5c0-3.5 2.5-6 5.5-6 1.5 0 2.5.5 3.5 1.5 1-1 2-1.5 3.5-1.5 3 0 5.5 2.5 5.5 6 0 2.5-2.045 4.57-3.885 5.82a22.05 22.05 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
                      </svg>
                      {likeCounts[`${item._id}-${item.images[0]}`] || 0}
                    </span>
                    <span className="text-gray-300">•</span>
                    <button 
                      onClick={() => openPreview(item, 0)}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      View
                    </button>
                  </div>
                </div>
                
                {item.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {item.tags.slice(0, 3).map(tag => (
                      <span 
                        key={tag} 
                        className="px-2.5 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTag(tag);
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                    {item.tags.length > 3 && (
                      <span className="px-2.5 py-1 bg-gray-50 text-gray-400 text-xs font-medium rounded-full">
                        +{item.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No gallery items found</p>
          {selectedTag && (
            <button
              onClick={() => setSelectedTag('')}
              className="mt-2 text-indigo-600 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Image Preview Modal */}
      {showPreviewModal && selectedImage && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4" onClick={closePreview}>
          <div className="relative w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {/* Close button */}
            <button
              onClick={closePreview}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Navigation arrows */}
            {selectedItem.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  disabled={currentImageIndex === 0}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-3 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextImage}
                  disabled={currentImageIndex === selectedItem.images.length - 1}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-3 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Main image */}
            <div className="relative">
              <img
                src={selectedImage}
                alt={selectedItem.title}
                className="w-full max-w-6xl max-h-[90vh] object-contain mx-auto rounded-lg shadow-2xl"
              />
              
              {/* Like button overlay */}
              <button
                onClick={() => toggleLike(selectedItem._id, selectedImage)}
                className={`absolute bottom-4 right-4 p-4 rounded-full backdrop-blur-sm transition-all duration-300 transform hover:scale-110 active:scale-95 ${
                  likedImages.has(`${selectedItem._id}-${selectedImage}`) 
                    ? 'bg-red-500 text-white shadow-lg' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <svg 
                  className={`w-8 h-8 transition-all duration-200 ${
                    likedImages.has(`${selectedItem._id}-${selectedImage}`) ? 'animate-pulse' : ''
                  }`} 
                  fill={likedImages.has(`${selectedItem._id}-${selectedImage}`) ? 'currentColor' : 'none'} 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>

            {/* Image info */}
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 backdrop-blur-sm text-white p-4 rounded-lg max-w-md">
              <h3 className="text-xl font-bold mb-2">{selectedItem.title}</h3>
              {selectedItem.description && (
                <p className="text-sm mb-2 opacity-90">{selectedItem.description}</p>
              )}
              {selectedItem.designer && (
                <p className="text-sm text-blue-300 mb-2">
                  By {selectedItem.designer.user?.name || 'Designer'}
                </p>
              )}
              {selectedItem.images.length > 1 && (
                <p className="text-xs opacity-75">
                  Image {currentImageIndex + 1} of {selectedItem.images.length}
                </p>
              )}
              {likeCounts[`${selectedItem._id}-${selectedImage}`] > 0 && (
                <div className="flex items-center mt-2">
                  <svg className="w-4 h-4 text-red-400 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span className="text-sm">{likeCounts[`${selectedItem._id}-${selectedImage}`]} likes</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
