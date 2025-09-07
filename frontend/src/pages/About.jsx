import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-300/20 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-black mb-6">
            About DecorVista
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
            Transforming spaces, connecting dreams with reality through innovative interior design solutions.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-black mb-8">
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Our Mission
                </span>
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                DecorVista is more than just an interior design platform – it's a revolution in how people transform their living spaces. We bridge the gap between homeowners' dreams and professional designers' expertise.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Our platform empowers users to discover inspiration, connect with talented designers, and shop premium products all in one seamless experience.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl">
                  <div className="text-3xl font-bold text-indigo-600 mb-2">500+</div>
                  <div className="text-gray-600">Expert Designers</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl">
                  <div className="text-3xl font-bold text-purple-600 mb-2">10K+</div>
                  <div className="text-gray-600">Happy Customers</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-8 shadow-2xl">
                <div className="bg-white rounded-2xl p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">What We Offer</h3>
                  <ul className="space-y-4">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-indigo-600 rounded-full mr-3"></span>
                      <span className="text-gray-600">Professional Designer Network</span>
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-purple-600 rounded-full mr-3"></span>
                      <span className="text-gray-600">Premium Product Catalog</span>
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-pink-600 rounded-full mr-3"></span>
                      <span className="text-gray-600">Inspiration Gallery</span>
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-orange-600 rounded-full mr-3"></span>
                      <span className="text-gray-600">Consultation Booking</span>
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-yellow-600 rounded-full mr-3"></span>
                      <span className="text-gray-600">Seamless Shopping Experience</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Platform Features
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover the powerful features that make DecorVista the ultimate interior design platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-gradient-to-r from-indigo-500 to-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Designer Network</h3>
              <p className="text-gray-600">Connect with verified professional interior designers from around the world.</p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Premium Products</h3>
              <p className="text-gray-600">Shop from our curated collection of high-quality furniture and decor items.</p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-gradient-to-r from-orange-500 to-yellow-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Inspiration Gallery</h3>
              <p className="text-gray-600">Browse thousands of stunning room designs and get inspired for your projects.</p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-gradient-to-r from-green-500 to-teal-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Easy Booking</h3>
              <p className="text-gray-600">Schedule consultations with designers at your convenience through our platform.</p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-gradient-to-r from-red-500 to-pink-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Favorites & Reviews</h3>
              <p className="text-gray-600">Save your favorite designs and share honest reviews with the community.</p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Secure & Reliable</h3>
              <p className="text-gray-600">Your data and transactions are protected with enterprise-grade security.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="mb-8 flex justify-center">
              <img 
                src="/uploads/logo.png" 
                alt="DecorVista Logo" 
                className="h-16 w-auto filter brightness-0 invert"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              Meet the Developer
            </h2>
            <p className="text-xl text-indigo-100 max-w-3xl mx-auto">
              The creative mind behind DecorVista's innovative platform
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/20">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-4xl font-black text-white shadow-2xl">
                    S
                  </div>
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-3xl md:text-4xl font-black mb-4">
                    <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                      Sameer
                    </span>
                  </h3>
                  <p className="text-xl text-indigo-100 mb-6">
                    Full-Stack Developer & Platform Architect
                  </p>
                  <p className="text-lg text-indigo-200 leading-relaxed mb-6">
                    Passionate about creating innovative digital solutions that bridge the gap between technology and user experience. 
                    With expertise in modern web technologies, Sameer has crafted DecorVista to be a comprehensive platform that 
                    revolutionizes the interior design industry.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/20 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-yellow-300">MERN</div>
                      <div className="text-sm text-indigo-200">Stack</div>
                    </div>
                    <div className="bg-white/20 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-yellow-300">React</div>
                      <div className="text-sm text-indigo-200">Frontend</div>
                    </div>
                    <div className="bg-white/20 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-yellow-300">Node.js</div>
                      <div className="text-sm text-indigo-200">Backend</div>
                    </div>
                    <div className="bg-white/20 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-yellow-300">MongoDB</div>
                      <div className="text-sm text-indigo-200">Database</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Achievements */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white/20 rounded-2xl p-6 mb-4">
                <div className="text-3xl font-bold text-yellow-300 mb-2">50+</div>
                <div className="text-indigo-200">API Endpoints</div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white/20 rounded-2xl p-6 mb-4">
                <div className="text-3xl font-bold text-yellow-300 mb-2">15+</div>
                <div className="text-indigo-200">Database Models</div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white/20 rounded-2xl p-6 mb-4">
                <div className="text-3xl font-bold text-yellow-300 mb-2">100%</div>
                <div className="text-indigo-200">Responsive Design</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Frequently Asked Questions
              </span>
            </h2>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4">How does DecorVista work?</h3>
              <p className="text-gray-600 leading-relaxed">
                DecorVista connects homeowners with professional interior designers through our platform. You can browse our gallery for inspiration, 
                book consultations with designers, and shop for premium products all in one place.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Are the designers verified?</h3>
              <p className="text-gray-600 leading-relaxed">
                Yes, all designers on our platform go through a thorough verification process. We check their credentials, portfolio, 
                and professional experience to ensure you get the best service.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4">What payment methods do you accept?</h3>
              <p className="text-gray-600 leading-relaxed">
                We accept various payment methods including credit cards, bank transfers, and cash on delivery for product purchases. 
                Consultation fees can be paid securely through our platform.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Can I return products if I'm not satisfied?</h3>
              <p className="text-gray-600 leading-relaxed">
                Yes, we have a flexible return policy. You can return products within 30 days of delivery if they don't meet your expectations. 
                Please check our return policy for detailed terms and conditions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            Ready to Transform Your Space?
          </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join thousands of homeowners who have already transformed their spaces with DecorVista
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link 
              to="/designers" 
              className="inline-flex items-center px-8 py-4 bg-white text-indigo-600 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
            >
              <span className="mr-2">🎨</span>
              Find Designers
            </Link>
            <Link 
              to="/products" 
              className="inline-flex items-center px-8 py-4 bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white rounded-2xl font-bold text-lg hover:bg-white/30 transition-all duration-300 transform hover:scale-105"
            >
              <span className="mr-2">🛍️</span>
              Shop Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
