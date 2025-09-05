import React, { useState, useEffect } from 'react';
import { galleryAPI } from '../services/api';

const Gallery = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState('');
  const [allTags, setAllTags] = useState([]);

  useEffect(() => {
    fetchGalleryItems();
  }, [selectedTag]);

  const fetchGalleryItems = async () => {
    try {
      setLoading(true);
      const params = selectedTag ? { tags: selectedTag } : {};
      const response = await galleryAPI.getAll(params);
      setGalleryItems(response.data.data);
      
      // Extract unique tags
      const tags = new Set();
      response.data.data.forEach(item => {
        item.tags?.forEach(tag => tags.add(tag));
      });
      setAllTags(Array.from(tags));
    } catch (error) {
      console.error('Failed to fetch gallery items:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Inspiration Gallery</h1>
      
      {/* Tag Filter */}
      {allTags.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTag('')}
            className={`px-4 py-2 rounded-full ${
              selectedTag === '' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-2 rounded-full ${
                selectedTag === tag 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Gallery Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : galleryItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No gallery items found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryItems.map(item => (
            <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={item.images?.[0] || '/api/placeholder/600/400'}
                  alt={item.title}
                  className="w-full h-64 object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                {item.designer && (
                  <p className="text-sm text-indigo-600 mb-2">
                    By {item.designer.user?.name || 'Designer'}
                  </p>
                )}
                {item.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Gallery;
