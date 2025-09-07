import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const failedEntityCache = new Set();

const MyActivity = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('likes');
  const [loading, setLoading] = useState(true);
  const [likedItems, setLikedItems] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [adminStats, setAdminStats] = useState({
    totalLikes: 0,
    totalSaves: 0,
    totalReviews: 0,
    totalUsers: 0
  });
  const [userAnalytics, setUserAnalytics] = useState({
    topUsers: [],
    recentActivity: [],
    engagementMetrics: {}
  });
  
  const isAdmin = user?.role === 'admin';

  // Initialize tab based on user role
  useEffect(() => {
    if (isAdmin && activeTab === 'likes') {
      setActiveTab('stats');
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      if (activeTab === 'stats') {
        loadAdminStats();
      } else if (activeTab === 'analytics') {
        loadUserAnalytics();
      }
    } else {
      loadUserActivity();
      loadSavedItems();
    }
  }, [isAdmin, activeTab]);

  const loadAdminStats = async () => {
    try {
      setLoading(true);
      
      // Get all reviews first
      const reviewsResponse = await axios.get(`${API_URL}/reviews`);
      const allReviews = reviewsResponse.data?.data || [];
      
      // Get all users for proper count
      const usersResponse = await axios.get(`${API_URL}/users/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const allUsers = usersResponse.data?.data || usersResponse.data || [];
      
      // Get gallery items for likes calculation
      const galleryResponse = await axios.get(`${API_URL}/gallery`);
      const galleryItems = galleryResponse.data?.data || [];
      
      // Calculate platform-wide engagement metrics
      let totalLikes = 0;
      let totalSaves = 0;
      
      try {
        // Get likes from database if available, fallback to localStorage
        const likesResponse = await axios.get(`${API_URL}/analytics/likes`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        totalLikes = likesResponse.data?.totalLikes || 0;
      } catch (err) {
        // Fallback to localStorage calculation
        const likeCounts = localStorage.getItem('likeCounts');
        if (likeCounts) {
          const counts = JSON.parse(likeCounts);
          totalLikes = Object.values(counts).reduce((sum, count) => sum + count, 0);
        }
      }
      
      try {
        // Get saves from database if available, fallback to localStorage
        const savesResponse = await axios.get(`${API_URL}/analytics/saves`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        totalSaves = savesResponse.data?.totalSaves || 0;
      } catch (err) {
        // Fallback to localStorage calculation
        const savedProducts = localStorage.getItem('savedProducts');
        const savedDesigners = localStorage.getItem('savedDesigners');
        const savedGalleryItems = localStorage.getItem('savedGalleryItems');
        
        if (savedProducts) totalSaves += JSON.parse(savedProducts).length;
        if (savedDesigners) totalSaves += JSON.parse(savedDesigners).length;
        if (savedGalleryItems) totalSaves += JSON.parse(savedGalleryItems).length;
      }
      
      setAdminStats({
        totalLikes,
        totalSaves,
        totalReviews: allReviews.length,
        totalUsers: allUsers.length
      });
      
    } catch (error) {
      console.error('Error loading admin stats:', error);
      // Set fallback data on error
      setAdminStats({
        totalLikes: 0,
        totalSaves: 0,
        totalReviews: 0,
        totalUsers: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUserAnalytics = async () => {
    try {
      setLoading(true);
      
      // Get all users with proper population
      const usersResponse = await axios.get(`${API_URL}/users/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const allUsers = usersResponse.data?.data || usersResponse.data || [];
      
      // Create user lookup map
      const userMap = {};
      allUsers.forEach(user => {
        userMap[user._id] = {
          name: user.name || user.username || 'Unknown User',
          email: user.email,
          role: user.role,
          profileImage: user.profileImage || user.avatar
        };
      });
      
      // Get all reviews with populated user data
      const reviewsResponse = await axios.get(`${API_URL}/reviews`);
      const allReviews = reviewsResponse.data?.data || reviewsResponse.data || [];
      
      // Get user profiles for additional data
      let userProfiles = [];
      try {
        const profilesResponse = await axios.get(`${API_URL}/user-profiles`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        userProfiles = profilesResponse.data?.data || profilesResponse.data || [];
      } catch (err) {
        console.log('Could not fetch user profiles:', err.message);
      }
      
      // Create profile lookup map
      const profileMap = {};
      userProfiles.forEach(profile => {
        profileMap[profile.user?._id || profile.user] = {
          profileImage: profile.profileImage,
          phone: profile.phone,
          bio: profile.bio
        };
      });
      
      // Calculate user engagement metrics
      const userEngagement = {};
      allReviews.forEach(review => {
        const userId = review.user?._id || review.user;
        if (userId && typeof userId === 'string') {
          if (!userEngagement[userId]) {
            const userData = userMap[userId];
            const profileData = profileMap[userId];
            userEngagement[userId] = {
              reviewCount: 0,
              avgRating: 0,
              totalRating: 0,
              userName: userData?.name || review.user?.name || 'Unknown User',
              userEmail: userData?.email || '',
              userRole: userData?.role || 'user',
              profileImage: profileData?.profileImage || userData?.profileImage || null
            };
          }
          userEngagement[userId].reviewCount++;
          userEngagement[userId].totalRating += (review.rating || 0);
          userEngagement[userId].avgRating = userEngagement[userId].totalRating / userEngagement[userId].reviewCount;
        }
      });
      
      // Get top users by engagement
      const topUsers = Object.values(userEngagement)
        .filter(user => user.reviewCount > 0)
        .sort((a, b) => b.reviewCount - a.reviewCount)
        .slice(0, 10);
      
      // Get recent activity (last 10 reviews) with proper user data
      const recentActivity = allReviews
        .filter(review => review.user && review.rating)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10)
        .map(review => {
          const userId = review.user?._id || review.user;
          const userData = userMap[userId];
          const profileData = profileMap[userId];
          
          return {
            id: review._id,
            userName: userData?.name || review.user?.name || 'Unknown User',
            userImage: profileData?.profileImage || userData?.profileImage || null,
            targetName: review.targetName || review.target?.name || 'Unknown Target',
            rating: review.rating || 0,
            createdAt: review.createdAt,
            type: review.targetType || 'unknown',
            comment: review.comment || review.review || ''
          };
        });
      
      const validEngagementUsers = Object.values(userEngagement).filter(user => user.reviewCount > 0);
      
      setUserAnalytics({
        topUsers,
        recentActivity,
        engagementMetrics: {
          totalActiveUsers: validEngagementUsers.length,
          avgReviewsPerUser: validEngagementUsers.length > 0 
            ? validEngagementUsers.reduce((sum, user) => sum + user.reviewCount, 0) / validEngagementUsers.length 
            : 0,
          avgRatingAcrossUsers: validEngagementUsers.length > 0 
            ? validEngagementUsers.reduce((sum, user) => sum + user.avgRating, 0) / validEngagementUsers.length 
            : 0
        }
      });
      
    } catch (error) {
      console.error('Error loading user analytics:', error);
      setUserAnalytics({
        topUsers: [],
        recentActivity: [],
        engagementMetrics: {
          totalActiveUsers: 0,
          avgReviewsPerUser: 0,
          avgRatingAcrossUsers: 0
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUserActivity = async () => {
    try {
      setLoading(true);
      
      // Load liked items with proper error handling
      const likedGallery = localStorage.getItem('likedImages');
      const likeCounts = localStorage.getItem('likeCounts');
      
      if (likedGallery && likeCounts) {
        try {
          const liked = JSON.parse(likedGallery);
          const counts = JSON.parse(likeCounts);
          
          const galleryResponse = await axios.get(`${API_URL}/gallery`);
          const galleryItems = galleryResponse.data?.data || [];
          
          const likedItemsData = liked.map(imageKey => {
            const [itemId, ...imageUrlParts] = imageKey.split('-');
            const imageUrl = imageUrlParts.join('-');
            
            const galleryItem = galleryItems.find(item => item._id === itemId);
            
            let fullImageUrl;
            if (imageUrl.startsWith('http')) {
              fullImageUrl = imageUrl;
            } else {
              let cleanImageUrl = imageUrl;
              cleanImageUrl = cleanImageUrl.replace(/^\/uploads\//, '').replace(/^uploads\//, '');
              const baseURL = API_URL.replace('/api', '');
              fullImageUrl = `${baseURL}/uploads/${cleanImageUrl}`;
            }
                
            return {
              id: itemId,
              title: galleryItem?.title || 'Gallery Image',
              description: galleryItem?.description || '',
              tags: galleryItem?.tags || [],
              imageUrl: fullImageUrl,
              likes: counts[imageKey] || 0
            };
          });
          
          setLikedItems(likedItemsData);
        } catch (parseError) {
          console.error('Error parsing liked items:', parseError);
          setLikedItems([]);
        }
      } else {
        setLikedItems([]);
      }
      
      await fetchUserReviews();
      
    } catch (error) {
      console.error('Error loading user activity:', error);
      setLikedItems([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedItems = async () => {
    try {
      const savedProducts = localStorage.getItem('savedProducts');
      const savedDesigners = localStorage.getItem('savedDesigners');
      const savedGalleryItems = localStorage.getItem('savedGalleryItems');
      
      let allSavedItems = [];
      
      // Load saved products with error handling
      if (savedProducts) {
        try {
          const productIds = JSON.parse(savedProducts);
          const validProductIds = [];
          
          for (const productId of productIds) {
            try {
              const response = await axios.get(`${API_URL}/products/${productId}`);
              const product = response.data?.data;
              if (product) {
                allSavedItems.push({
                  id: product._id,
                  type: 'product',
                  title: product.name,
                  description: product.description,
                  price: product.price,
                  category: product.category,
                  imageUrl: product.images?.[0],
                  link: `/products/${product._id}`
                });
                validProductIds.push(productId);
              }
            } catch (error) {
              if (error.response?.status === 404) {
                console.log(`Product ${productId} no longer exists, removing from saved items`);
              } else {
                validProductIds.push(productId);
                console.error('Error fetching saved product:', error);
              }
            }
          }
          
          if (validProductIds.length !== productIds.length) {
            localStorage.setItem('savedProducts', JSON.stringify(validProductIds));
          }
        } catch (error) {
          console.error('Error parsing saved products:', error);
        }
      }
      
      if (savedDesigners) {
        try {
          const designerIds = JSON.parse(savedDesigners);
          const validDesignerIds = [];
          
          for (const designerId of designerIds) {
            try {
              const response = await axios.get(`${API_URL}/users/${designerId}`);
              const designer = response.data?.data;
              if (designer) {
                allSavedItems.push({
                  id: designer._id,
                  type: 'designer',
                  title: designer.name,
                  description: designer.bio || designer.specialization,
                  location: designer.location,
                  imageUrl: designer.avatarUrl || designer.profileImage,
                  link: `/designers/${designer._id}`
                });
                validDesignerIds.push(designerId);
              }
            } catch (error) {
              if (error.response?.status === 404) {
                console.log(`Designer ${designerId} no longer exists, removing from saved items`);
              } else {
                validDesignerIds.push(designerId);
                console.error('Error fetching saved designer:', error);
              }
            }
          }
          
          if (validDesignerIds.length !== designerIds.length) {
            localStorage.setItem('savedDesigners', JSON.stringify(validDesignerIds));
          }
        } catch (error) {
          console.error('Error parsing saved designers:', error);
        }
      }
      
      if (savedGalleryItems) {
        try {
          const galleryItemIds = JSON.parse(savedGalleryItems);
          const validGalleryIds = [];
          
          const galleryResponse = await axios.get(`${API_URL}/gallery`);
          const galleryItems = galleryResponse.data?.data || [];
          
          for (const itemId of galleryItemIds) {
            const galleryItem = galleryItems.find(item => item._id === itemId);
            if (galleryItem) {
              allSavedItems.push({
                id: galleryItem._id,
                type: 'gallery',
                title: galleryItem.title,
                description: galleryItem.description,
                tags: galleryItem.tags,
                imageUrl: galleryItem.images?.[0],
                link: `/gallery`
              });
              validGalleryIds.push(itemId);
            } else {
              console.log(`Gallery item ${itemId} no longer exists, removing from saved items`);
            }
          }
          
          if (validGalleryIds.length !== galleryItemIds.length) {
            localStorage.setItem('savedGalleryItems', JSON.stringify(validGalleryIds));
          }
        } catch (error) {
          console.error('Error fetching saved gallery items:', error);
        }
      }
      
      setSavedItems(allSavedItems);
    } catch (error) {
      console.error('Error loading saved items:', error);
      setSavedItems([]);
    }
  };

  const toggleSaveItem = (itemId, itemType) => {
    let storageKey;
    if (itemType === 'product') {
      storageKey = 'savedProducts';
    } else if (itemType === 'designer') {
      storageKey = 'savedDesigners';
    } else if (itemType === 'gallery') {
      storageKey = 'savedGalleryItems';
    }
    
    const currentSaved = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    let updatedSaved;
    if (currentSaved.includes(itemId)) {
      updatedSaved = currentSaved.filter(id => id !== itemId);
    } else {
      updatedSaved = [...currentSaved, itemId];
    }
    
    localStorage.setItem(storageKey, JSON.stringify(updatedSaved));
    loadSavedItems(); // Refresh saved items
  };

  const isItemSaved = (itemId, itemType) => {
    let storageKey;
    if (itemType === 'product') {
      storageKey = 'savedProducts';
    } else if (itemType === 'designer') {
      storageKey = 'savedDesigners';
    } else if (itemType === 'gallery') {
      storageKey = 'savedGalleryItems';
    }
    
    const currentSaved = JSON.parse(localStorage.getItem(storageKey) || '[]');
    return currentSaved.includes(itemId);
  };

  const fetchUserReviews = async () => {
    if (!user?._id) {
      setReviews([]);
      return;
    }
    
    try {
      const response = await axios.get(`${API_URL}/reviews/user/${user._id}`);
      const userReviews = response.data?.data || [];
      
      const reviewsWithDetails = await Promise.all(
        userReviews.map(async (review) => {
          const cacheKey = `${review.targetType}-${review.target}`;
          
          if (failedEntityCache.has(cacheKey)) {
            return {
              ...review,
              targetName: `${review.targetType === 'designer' || review.targetType === 'Designer' ? 'Designer' : 'Product'} (Unavailable)`,
              targetImage: null
            };
          }
          
          try {
            let targetResponse;
            if (review.targetType === 'designer' || review.targetType === 'Designer') {
              targetResponse = await axios.get(`${API_URL}/users/${review.target}`);
            } else {
              targetResponse = await axios.get(`${API_URL}/products/${review.target}`);
            }
            
            const targetData = targetResponse.data?.data;
            if (!targetData) {
              failedEntityCache.add(cacheKey);
              return {
                ...review,
                targetName: `${review.targetType === 'designer' || review.targetType === 'Designer' ? 'Designer' : 'Product'} (Unavailable)`,
                targetImage: null
              };
            }
            
            return {
              ...review,
              targetName: targetData.name || targetData.title || 'Unknown',
              targetImage: targetData.profileImage || targetData.images?.[0] || null
            };
          } catch (error) {
            // Silently handle 404s and other errors
            failedEntityCache.add(cacheKey);
            return {
              ...review,
              targetName: `${review.targetType === 'designer' || review.targetType === 'Designer' ? 'Designer' : 'Product'} (Unavailable)`,
              targetImage: null
            };
          }
        })
      );
      
      setReviews(reviewsWithDetails);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    }
  };

  const tabs = isAdmin ? [
    { id: 'stats', name: 'Platform Statistics', icon: 'chart' },
    { id: 'analytics', name: 'User Analytics', icon: 'analytics' }
  ] : [
    { id: 'likes', name: 'My Liked Items', icon: 'heart' },
    { id: 'saves', name: 'Saved Items', icon: 'bookmark' },
    { id: 'reviews', name: 'My Reviews', icon: 'star' }
  ];


  const getIcon = (iconName) => {
    switch (iconName) {
      case 'heart':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      case 'chart':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'analytics':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'bookmark':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        );
      case 'star':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading your activity...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {isAdmin ? 'Admin Analytics' : 'My Activity'}
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {isAdmin 
                ? 'Monitor platform statistics, user engagement, and overall system metrics'
                : 'Track your likes, saves, reviews, and all your interactions on DecorVista'
              }
            </p>
          </div>

          <div className="flex justify-center mb-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-xl border border-white/20">
              <div className="flex space-x-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg transform scale-105'
                        : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                    }`}
                  >
                    {getIcon(tab.icon)}
                    <span>{tab.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isAdmin && activeTab === 'stats' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Platform Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Total Likes</p>
                      <p className="text-3xl font-bold">{adminStats.totalLikes}</p>
                    </div>
                    <div className="bg-blue-400 rounded-full p-3">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">Total Saves</p>
                      <p className="text-3xl font-bold">{adminStats.totalSaves}</p>
                    </div>
                    <div className="bg-green-400 rounded-full p-3">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-100 text-sm font-medium">Total Reviews</p>
                      <p className="text-3xl font-bold">{adminStats.totalReviews}</p>
                    </div>
                    <div className="bg-yellow-400 rounded-full p-3">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Active Users</p>
                      <p className="text-3xl font-bold">{adminStats.totalUsers}</p>
                    </div>
                    <div className="bg-purple-400 rounded-full p-3">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isAdmin && activeTab === 'analytics' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">User Analytics</h2>
              
              {/* Engagement Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-indigo-100 text-sm font-medium">Active Users</p>
                      <p className="text-3xl font-bold">{userAnalytics.engagementMetrics.totalActiveUsers || 0}</p>
                    </div>
                    <div className="bg-indigo-400 rounded-full p-3">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-100 text-sm font-medium">Avg Reviews/User</p>
                      <p className="text-3xl font-bold">{(userAnalytics.engagementMetrics.avgReviewsPerUser || 0).toFixed(1)}</p>
                    </div>
                    <div className="bg-emerald-400 rounded-full p-3">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-amber-100 text-sm font-medium">Avg Rating</p>
                      <p className="text-3xl font-bold">{(userAnalytics.engagementMetrics.avgRatingAcrossUsers || 0).toFixed(1)}</p>
                    </div>
                    <div className="bg-amber-400 rounded-full p-3">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Users */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Active Users</h3>
                  <div className="space-y-3">
                    {userAnalytics.topUsers.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No user data available</p>
                    ) : (
                      userAnalytics.topUsers.map((user, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              {user.profileImage ? (
                                <img
                                  src={user.profileImage.startsWith('http') 
                                    ? user.profileImage 
                                    : `${API_URL.replace('/api', '')}/uploads/${user.profileImage.replace(/^\/uploads\//, '').replace(/^uploads\//, '')}`
                                  }
                                  alt={user.userName}
                                  className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div className={`w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm ${user.profileImage ? 'hidden' : 'flex'}`}>
                                {user.userName.charAt(0).toUpperCase()}
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                {index + 1}
                              </div>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user.userName}</p>
                              <p className="text-sm text-gray-500">{user.reviewCount} reviews • {user.userRole}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-1">
                              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                              </svg>
                              <span className="text-sm font-medium text-gray-900">{user.avgRating.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {userAnalytics.recentActivity.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No recent activity</p>
                    ) : (
                      userAnalytics.recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="relative">
                            {activity.userImage ? (
                              <img
                                src={activity.userImage.startsWith('http') 
                                  ? activity.userImage 
                                  : `${API_URL.replace('/api', '')}/uploads/${activity.userImage.replace(/^\/uploads\//, '').replace(/^uploads\//, '')}`
                                }
                                alt={activity.userName}
                                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className={`w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm ${activity.userImage ? 'hidden' : 'flex'}`}>
                              {activity.userName.charAt(0).toUpperCase()}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                              </svg>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{activity.userName}</p>
                            <p className="text-sm text-gray-500 truncate">Reviewed {activity.targetName}</p>
                            {activity.comment && (
                              <p className="text-xs text-gray-400 truncate mt-1 italic">"{activity.comment}"</p>
                            )}
                            <div className="flex items-center space-x-2 mt-1">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <svg key={i} className={`w-3 h-3 ${i < activity.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                  </svg>
                                ))}
                              </div>
                              <span className="text-xs text-gray-400">{new Date(activity.createdAt).toLocaleDateString()}</span>
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">{activity.type}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {!isAdmin && activeTab === 'likes' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">My Liked Items</h2>
              {likedItems.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No liked items yet</h3>
                  <p className="text-gray-600 mb-6">Start exploring and like items you love!</p>
                  <Link
                    to="/gallery"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Explore Gallery
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {likedItems.map((item, index) => (
                    <Link 
                      key={index} 
                      to={`/gallery`}
                      className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 block"
                    >
                      <div className="relative">
                        <img
                          src={item.imageUrl ? (item.imageUrl.startsWith('http') ? item.imageUrl : `${API_URL.replace('/api', '')}/uploads/${item.imageUrl.replace(/^\/uploads\//, '').replace(/^uploads\//, '')}`) : '/api/placeholder/300/200'}
                          alt={item.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center shadow-lg">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.4 0 00-6.364 0z" />
                          </svg>
                          {item.likes}
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                        {item.description && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                        )}
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {item.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {!isAdmin && activeTab === 'saves' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Saved Items</h2>
              {savedItems.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No saved items yet</h3>
                  <p className="text-gray-600 mb-6">Save products and designers for later viewing!</p>
                  <div className="flex gap-4 justify-center">
                    <Link
                      to="/products"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      Browse Products
                    </Link>
                    <Link
                      to="/designers"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Find Designers
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {savedItems.map((item) => (
                    <div key={`${item.type}-${item.id}`} className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                      <div className="relative">
                        <Link to={item.link}>
                          <img
                            src={item.imageUrl ? (item.imageUrl.startsWith('http') ? item.imageUrl : `${API_URL.replace('/api', '')}/uploads/${item.imageUrl.replace(/^\/uploads\//, '').replace(/^uploads\//, '')}`) : '/api/placeholder/300/200'}
                            alt={item.title}
                            className="w-full h-48 object-cover group-hover:opacity-90 transition-opacity"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </div>
                          </div>
                        </Link>
                        <button
                          onClick={() => toggleSaveItem(item.id, item.type)}
                          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-300 transform hover:scale-110"
                        >
                          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                        </button>
                        <div className="absolute top-3 left-3 px-2 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-bold rounded-full">
                          {item.type === 'product' ? 'Product' : item.type === 'designer' ? 'Designer' : 'Gallery'}
                        </div>
                      </div>
                      <div className="p-4">
                        <Link to={item.link}>
                          <h3 className="font-semibold text-gray-900 mb-2 hover:text-indigo-600 transition-colors">{item.title}</h3>
                        </Link>
                        {item.description && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                        )}
                        <div className="flex items-center justify-between">
                          {item.type === 'product' ? (
                            <div className="flex items-center justify-between w-full">
                              <span className="text-xs text-gray-500">{item.category}</span>
                              <span className="text-lg font-bold text-indigo-600">${item.price}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500">{item.location || 'Designer'}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!isAdmin && activeTab === 'reviews' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">My Reviews</h2>
              {reviews.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
                  <p className="text-gray-600">Share your experience with designers and products!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review._id} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-r from-yellow-400 to-orange-500">
                            {review.targetImage ? (
                              <img
                                src={review.targetImage.startsWith('http') ? review.targetImage : `${API_URL.replace('/api', '')}/uploads/${review.targetImage.replace(/^\/uploads\//, '').replace(/^uploads\//, '')}`}
                                alt={review.targetName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <svg 
                              className={`w-6 h-6 text-white ${review.targetImage ? 'hidden' : 'block'}`} 
                              fill="currentColor" 
                              viewBox="0 0 24 24"
                              style={{ display: review.targetImage ? 'none' : 'block' }}
                            >
                              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{review.targetName}</h3>
                            <p className="text-sm text-gray-600">{(review.targetType === 'designer' || review.targetType === 'Designer') ? 'Designer' : 'Product'} • {new Date(review.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, index) => (
                              <svg
                                key={index}
                                className={`w-5 h-5 ${index < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {review.rating}/5
                          </span>
                        </div>
                      </div>
                      
                      {review.comment && (
                        <p className="text-gray-700 mb-4 leading-relaxed">
                          "{review.comment}"
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          review.rating >= 4 
                            ? 'bg-green-100 text-green-800' 
                            : review.rating >= 3 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {review.rating >= 4 ? 'Positive' : review.rating >= 3 ? 'Neutral' : 'Negative'}
                        </span>
                        
                        {review.targetName && !review.targetName.includes('Unavailable') && review.targetId ? (
                          <Link
                            to={(review.targetType === 'Designer' || review.targetType === 'designer') ? `/designers/${review.targetId}` : `/products/${review.targetId}`}
                            className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium text-sm transition-colors"
                          >
                            View {(review.targetType === 'Designer' || review.targetType === 'designer') ? 'Designer' : 'Product'}
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </Link>
                        ) : (
                          <span className="inline-flex items-center text-gray-400 font-medium text-sm">
                            {(review.targetType === 'Designer' || review.targetType === 'designer') ? 'Designer' : 'Product'} Unavailable
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default MyActivity;
