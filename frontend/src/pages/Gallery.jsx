import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { galleryAPI, uploadAPI } from '../services/api';

const Gallery = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState('');
  const [allTags, setAllTags] = useState([]);
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';

  // Modal state for creating a gallery item
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', tagsText: '' });
  const [imageFiles, setImageFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

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

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return alert('Title is required');
    if (imageFiles.length === 0) return alert('Please select at least one image');
    try {
      setSubmitting(true);
      // Upload images first
      const uploadRes = await uploadAPI.multiple(Array.from(imageFiles));
      const uploaded = uploadRes?.data?.data || [];
      // Normalize to URL array (supports both string and object forms)
      const imageUrls = uploaded.map((item) => (typeof item === 'string' ? item : (item.url || item.image))).filter(Boolean);

      const tags = form.tagsText
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      await galleryAPI.create({
        title: form.title.trim(),
        description: form.description.trim(),
        images: imageUrls,
        tags
      });

      // Reset and refresh
      setShowCreateModal(false);
      setForm({ title: '', description: '', tagsText: '' });
      setImageFiles([]);
      fetchGalleryItems();
    } catch (err) {
      console.error('Failed to create gallery item:', err);
      alert(err?.response?.data?.message || 'Failed to create gallery item');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Inspiration Gallery</h1>
      {isAdmin && (
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Add to Gallery
          </button>
        </div>
      )}
      
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

      {/* Create Gallery Item Modal */}
      {isAdmin && showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add Gallery Item</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={form.tagsText}
                  onChange={(e) => setForm({ ...form, tagsText: e.target.value })}
                  placeholder="modern, living room, cozy"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setImageFiles(e.target.files)}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">You can select multiple images.</p>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
