import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Home = () => {
  const [stats, setStats] = useState({
    designersCount: 0,
    usersCount: 0,
    productsCount: 0,
    galleryImages: 0
  });
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchReviews();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/stats`);
      const statsData = response.data?.data;
      
      setStats({
        designersCount: statsData?.users?.designers || 0,
        usersCount: statsData?.users?.homeowners || 0,
        productsCount: statsData?.products || 0,
        galleryImages: statsData?.gallery?.images || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Fallback to individual API calls if stats endpoint fails
      try {
        const [designersRes, usersRes, productsRes] = await Promise.all([
          axios.get(`${API_URL}/users?role=designer`),
          axios.get(`${API_URL}/users?role=homeowner`),
          axios.get(`${API_URL}/products`)
        ]);
        
        setStats({
          designersCount: designersRes.data?.meta?.totalItems || designersRes.data?.data?.length || 0,
          usersCount: usersRes.data?.meta?.totalItems || usersRes.data?.data?.length || 0,
          productsCount: productsRes.data?.meta?.totalItems || productsRes.data?.data?.length || 0,
          galleryImages: 0 // Fallback when individual APIs don't provide gallery data
        });
      } catch (fallbackError) {
        console.error('Error fetching fallback stats:', fallbackError);
      }
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${API_URL}/reviews?limit=10&populate=author`);
      const allReviews = response.data?.data || [];
      
      // Filter and sort to get top 3 highest rated reviews (4-5 stars)
      const topReviews = allReviews
        .filter(review => review.rating >= 4 && review.comment && review.comment.trim().length > 0)
        .sort((a, b) => {
          // Sort by rating first (highest first), then by comment length (longer first)
          if (b.rating !== a.rating) {
            return b.rating - a.rating;
          }
          return (b.comment?.length || 0) - (a.comment?.length || 0);
        })
        .slice(0, 3);
      
      setReviews(topReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-gradient-to-r from-pink-400 to-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          {/* Logo in hero section */}
          <div className="mb-8 flex justify-center">
            <img 
              src="/uploads/logo.png" 
              alt="DecorVista Logo" 
              className="h-20 w-auto filter drop-shadow-2xl"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight">
            <span className="bg-gradient-to-r from-yellow-300 via-pink-300 to-blue-300 bg-clip-text text-transparent animate-pulse">
              Transform Your Space
            </span>
            <br />
            <span className="text-white">
              Into Dreams
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto text-blue-100 leading-relaxed">
            Connect with world-class interior designers, discover premium products, and create spaces that inspire.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link to="/designers" className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
              <span className="mr-2">🎨</span>
              Find Designers
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
            </Link>
            <Link to="/products" className="group relative inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
              <span className="mr-2">🛍️</span>
              Shop Products
            </Link>
            <Link to="/gallery" className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl font-bold text-lg text-black hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
              <span className="mr-2">🖼️</span>
              Gallery
            </Link>
          </div>
          
          {/* Stats */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-yellow-300 mb-2">
                {loading ? '...' : `${stats.designersCount}+`}
              </div>
              <div className="text-blue-200">Expert Designers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-pink-300 mb-2">
                {loading ? '...' : `${stats.usersCount}+`}
              </div>
              <div className="text-blue-200">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-purple-300 mb-2">
                {loading ? '...' : `${stats.productsCount}+`}
              </div>
              <div className="text-blue-200">Products</div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
                Why Choose DecorVista
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of interior design with our innovative platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Expert Designers</h3>
                <p className="text-gray-600 leading-relaxed">Connect with verified professional interior designers who match your style and budget. Get personalized consultations and bring your vision to life.</p>
                <div className="mt-6">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                    ⭐ {stats.designersCount > 0 ? '4.9/5 Rating' : 'Expert Verified'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Premium Products</h3>
                <p className="text-gray-600 leading-relaxed">Shop from our carefully curated collection of premium furniture and decor items. Quality guaranteed with fast shipping worldwide.</p>
                <div className="mt-6">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    🚚 Free Shipping
                  </span>
                </div>
              </div>
            </div>
            
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-yellow-600 rounded-3xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="bg-gradient-to-r from-orange-500 to-yellow-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Inspiration Gallery</h3>
                <p className="text-gray-600 leading-relaxed">Browse thousands of stunning room designs and get inspired for your next project. Save favorites and share with designers.</p>
                <div className="mt-6">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                    📸 {loading ? 'Loading...' : stats.galleryImages > 0 ? `${stats.galleryImages}+ Photos` : 'Gallery Ready'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-900/20 to-pink-900/20"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              <span className="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                What Our Clients Say
              </span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading ? (
              // Loading placeholders
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 animate-pulse">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gray-600 rounded-full mr-4"></div>
                    <div>
                      <div className="h-4 bg-gray-600 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-gray-600 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-gray-600 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-600 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-600 rounded w-20"></div>
                </div>
              ))
            ) : reviews.length > 0 ? (
              reviews.slice(0, 3).map((review, index) => {
                const gradients = [
                  'from-purple-500 to-pink-500',
                  'from-blue-500 to-cyan-500',
                  'from-orange-500 to-yellow-500'
                ];
                const authorInitial = review.author?.name?.charAt(0)?.toUpperCase() || 'U';
                const stars = '⭐'.repeat(review.rating);
                const avatarUrl = review.author?.avatarUrl;
                
                return (
                  <div key={review._id || index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                    <div className="flex items-center mb-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mr-4 overflow-hidden ${!avatarUrl ? `bg-gradient-to-r ${gradients[index % 3]}` : ''}`}>
                        {avatarUrl ? (
                          <img 
                            src={avatarUrl} 
                            alt={review.author?.name || 'User'} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className={`w-full h-full bg-gradient-to-r ${gradients[index % 3]} flex items-center justify-center ${avatarUrl ? 'hidden' : ''}`}
                        >
                          {authorInitial}
                        </div>
                      </div>
                      <div>
                        <div className="font-semibold">{review.author?.name || 'Anonymous User'}</div>
                        <div className="text-gray-300 text-sm">
                          {review.author?.role === 'designer' ? 'Designer' : 
                           review.author?.role === 'homeowner' ? 'Homeowner' : 'User'}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-200 mb-4">
                      "{review.comment || 'Great experience with DecorVista!'}"
                    </p>
                    <div className="flex text-yellow-400">
                      {stars}
                    </div>
                  </div>
                );
              })
            ) : (
              // Fallback testimonials if no reviews
              <>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                      D
                    </div>
                    <div>
                      <div className="font-semibold">DecorVista Team</div>
                      <div className="text-gray-300 text-sm">Platform</div>
                    </div>
                  </div>
                  <p className="text-gray-200 mb-4">"Welcome to DecorVista! We're excited to help you transform your space with our amazing designers and products."</p>
                  <div className="flex text-yellow-400">
                    ⭐⭐⭐⭐⭐
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                      T
                    </div>
                    <div>
                      <div className="font-semibold">The Community</div>
                      <div className="text-gray-300 text-sm">Users & Designers</div>
                    </div>
                  </div>
                  <p className="text-gray-200 mb-4">"Join our growing community of homeowners and professional designers creating beautiful spaces together."</p>
                  <div className="flex text-yellow-400">
                    ⭐⭐⭐⭐⭐
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                      S
                    </div>
                    <div>
                      <div className="font-semibold">Start Today</div>
                      <div className="text-gray-300 text-sm">Your Journey</div>
                    </div>
                  </div>
                  <p className="text-gray-200 mb-4">"Ready to get started? Browse our designers, explore products, and begin your interior design journey today!"</p>
                  <div className="flex text-yellow-400">
                    ⭐⭐⭐⭐⭐
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-300/20 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
            Ready to Transform Your Home?
          </h2>
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto">
            Join thousands of homeowners who have created their dream spaces with DecorVista.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link to="/register" className="group relative inline-flex items-center px-10 py-5 bg-white text-purple-600 rounded-2xl font-bold text-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
              <span className="mr-2">🚀</span>
              Get Started Today
              <div className="absolute inset-0 bg-white rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
            </Link>
            <Link to="/contact" className="group relative inline-flex items-center px-10 py-5 bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white rounded-2xl font-bold text-xl hover:bg-white/30 transition-all duration-300 transform hover:scale-105">
              <span className="mr-2">💬</span>
              Contact Us
            </Link>
          </div>
          
          <div className="mt-16 flex flex-wrap justify-center items-center gap-8 opacity-80">
            <div className="text-white/80 text-sm">Trusted by:</div>
            <div className="flex items-center space-x-8">
              <div className="bg-white/20 px-4 py-2 rounded-lg text-white font-semibold">Forbes</div>
              <div className="bg-white/20 px-4 py-2 rounded-lg text-white font-semibold">Elle Decor</div>
              <div className="bg-white/20 px-4 py-2 rounded-lg text-white font-semibold">House Beautiful</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
