import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { clearCart } from '../store/slices/cartSlice';
import { orderAPI } from '../services/api';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { items: cart } = useSelector((state) => state.cart);
  
  // Check if this is a direct buy from product detail
  const { directBuy, product: directBuyProduct } = location.state || {};
  
  const getCartTotal = () => {
    if (directBuy && directBuyProduct) {
      return directBuyProduct.price * directBuyProduct.quantity;
    }
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };
  
  const getOrderItems = () => {
    if (directBuy && directBuyProduct) {
      return [{
        product: directBuyProduct,
        quantity: directBuyProduct.quantity,
        priceAt: directBuyProduct.price
      }];
    }
    return cart;
  };
  
  const { user } = useSelector((state) => state.auth);
  const consultations = []; // Remove consultation dependency for now
  const [loading, setLoading] = useState(false);
  const [selectedConsultations, setSelectedConsultations] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    paymentMethod: 'cash_on_delivery',
    notes: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare consultation bookings data
      const consultationBookings = selectedConsultations.map(consultation => ({
        designerId: consultation.designer._id,
        slot: consultation.slot,
        price: consultation.designer.hourlyRate
      }));

      const orderData = {
        items: getOrderItems().map(item => ({
          product: item.product._id || item.product.id,
          quantity: item.quantity,
          priceAt: item.priceAt || item.product.price
        })),
        shippingAddress: {
          name: formData.name,
          phone: formData.phone,
          street: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country
        },
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
        consultationBookings
      };

      const response = await orderAPI.create(orderData);
      
      // Clear cart after successful order (only if not direct buy)
      if (!directBuy) {
        dispatch(clearCart());
      }
      
      // Navigate to thank you page with order details
      navigate('/thank-you', {
        state: {
          orderId: response.data.data._id,
          orderTotal: total.toFixed(2)
        }
      });
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const productSubtotal = getCartTotal();
  const consultationSubtotal = selectedConsultations.reduce((sum, consultation) => 
    sum + consultation.designer.hourlyRate, 0);
  const subtotal = productSubtotal + consultationSubtotal;
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal + shipping;

  // Restrict admin from placing orders
  if (user?.role === 'admin') {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h1>
        <p className="text-gray-600 mb-4">Admins cannot place orders. Only users and designers can make purchases.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  if (!directBuy && cart.length === 0 && (!consultations || consultations.filter(c => c.status === 'pending').length === 0)) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
        <button
          onClick={() => navigate('/products')}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    name="address"
                    required
                    rows={3}
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Street address, apartment, suite, etc."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      name="state"
                      required
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    required
                    value={formData.zipCode}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <select
                    name="country"
                    required
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Australia">Australia</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash_on_delivery"
                    checked={formData.paymentMethod === 'cash_on_delivery'}
                    onChange={handleChange}
                    className="mr-3"
                  />
                  <span>Cash on Delivery</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank_transfer"
                    checked={formData.paymentMethod === 'bank_transfer'}
                    onChange={handleChange}
                    className="mr-3"
                  />
                  <span>Bank Transfer</span>
                </label>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Order Notes (Optional)</h2>
              <textarea
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Special instructions for delivery..."
              />
            </div>

            {consultations && consultations.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Your Consultation Bookings</h2>
                <div className="space-y-3">
                  {consultations
                    .filter(consultation => consultation.status === 'pending')
                    .map(consultation => (
                      <div key={consultation._id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedConsultations.some(c => c._id === consultation._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedConsultations([...selectedConsultations, consultation]);
                              } else {
                                setSelectedConsultations(selectedConsultations.filter(c => c._id !== consultation._id));
                              }
                            }}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          />
                          <div>
                            <h4 className="font-medium">Consultation with {consultation.designer?.user?.name}</h4>
                            <p className="text-gray-500 text-sm">
                              {new Date(consultation.slot.date).toLocaleDateString()} at {consultation.slot.from}
                            </p>
                          </div>
                        </div>
                        <span className="font-medium">${consultation.designer?.hourlyRate?.toFixed(2)}</span>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>
          </form>
        </div>

        <div>
          <div className="bg-white p-6 rounded-lg shadow sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-4">
              {getOrderItems().map(item => (
                <div key={item.product._id || item.product.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={item.product.images?.[0] || '/api/placeholder/60/60'}
                      alt={item.product.title}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div>
                      <h4 className="font-medium text-sm">{item.product.title}</h4>
                      <p className="text-gray-500 text-sm">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-medium">${(item.priceAt * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              
              {selectedConsultations.map((consultation, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-indigo-100 rounded flex items-center justify-center">
                      <span className="text-indigo-600 font-bold">D</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Consultation with {consultation.designer.user?.name}</h4>
                      <p className="text-gray-500 text-sm">
                        {new Date(consultation.slot.date).toLocaleDateString()} at {consultation.slot.from}
                      </p>
                    </div>
                  </div>
                  <span className="font-medium">${consultation.designer.hourlyRate.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
              </div>
              {shipping === 0 && (
                <p className="text-sm text-green-600">Free shipping on orders over $100!</p>
              )}
              <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
