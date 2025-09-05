import React, { useState, useEffect } from 'react';
import { favoriteAPI } from '../services/api';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await favoriteAPI.getAll();
      setFavorites(response.data.data);
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (favoriteId) => {
    try {
      await favoriteAPI.remove(favoriteId);
      setFavorites(favorites.filter(fav => fav._id !== favoriteId));
    } catch (error) {
      alert('Failed to remove favorite');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Favorites</h1>
      
      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No favorites</h3>
          <p className="mt-1 text-gray-500">Get started by adding products or designers to your favorites.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map(favorite => (
            <div key={favorite._id} className="bg-white rounded-lg shadow overflow-hidden">
              {favorite.type === 'product' ? (
                <div className="group cursor-pointer">
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
                    <img
                      src={favorite.product?.images?.[0] || '/api/placeholder/300/300'}
                      alt={favorite.product?.title}
                      className="h-48 w-full object-cover group-hover:opacity-75"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900">{favorite.product?.title}</h3>
                    <p className="text-gray-500">${favorite.product?.price}</p>
                    <div className="mt-4 flex justify-between items-center">
                      <button
                        onClick={() => window.location.href = `/products/${favorite.product?._id}`}
                        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                      >
                        View Product
                      </button>
                      <button
                        onClick={() => handleRemoveFavorite(favorite._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="group cursor-pointer">
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
                    <div className="h-48 w-full flex items-center justify-center bg-indigo-100">
                      <span className="text-4xl font-bold text-indigo-600">
                        {favorite.designer?.user?.name?.charAt(0) || 'D'}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900">{favorite.designer?.user?.name}</h3>
                    <p className="text-gray-500">{favorite.designer?.professionalTitle}</p>
                    <div className="mt-4 flex justify-between items-center">
                      <button
                        onClick={() => window.location.href = `/designers/${favorite.designer?._id}`}
                        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                      >
                        View Profile
                      </button>
                      <button
                        onClick={() => handleRemoveFavorite(favorite._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
