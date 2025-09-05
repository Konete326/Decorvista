import React, { createContext, useState, useContext, useEffect } from 'react';
import { consultationAPI } from '../services/api';
import { useAuth } from './AuthContext';

const ConsultationContext = createContext();

export const useConsultation = () => {
  const context = useContext(ConsultationContext);
  if (!context) {
    throw new Error('useConsultation must be used within ConsultationProvider');
  }
  return context;
};

export const ConsultationProvider = ({ children }) => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchConsultations();
    }
  }, [isAuthenticated]);

  const fetchConsultations = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const response = await consultationAPI.getAll();
      setConsultations(response.data.data);
    } catch (error) {
      console.error('Failed to fetch consultations:', error);
      // Don't retry immediately on rate limit errors
      if (error.response?.status === 429) {
        console.warn('Rate limit exceeded. Please wait before making more requests.');
      }
    } finally {
      setLoading(false);
    }
  };

  const bookConsultation = async (consultationData) => {
    try {
      setLoading(true);
      const response = await consultationAPI.create(consultationData);
      await fetchConsultations();
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  const updateConsultation = async (id, status) => {
    try {
      setLoading(true);
      const response = await consultationAPI.update(id, { status });
      await fetchConsultations();
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    consultations,
    loading,
    bookConsultation,
    updateConsultation,
    fetchConsultations
  };

  return <ConsultationContext.Provider value={value}>{children}</ConsultationContext.Provider>;
};
