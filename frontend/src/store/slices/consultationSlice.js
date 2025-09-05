import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Async thunks
export const fetchConsultations = createAsyncThunk(
  'consultation/fetchConsultations',
  async ({ page = 1, limit = 10, status } = {}, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      if (status) params.append('status', status);

      const response = await axios.get(`${API_URL}/consultations?${params}`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch consultations');
    }
  }
);

export const bookConsultation = createAsyncThunk(
  'consultation/bookConsultation',
  async (consultationData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await axios.post(`${API_URL}/consultations`, consultationData, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to book consultation');
    }
  }
);

export const updateConsultationStatus = createAsyncThunk(
  'consultation/updateStatus',
  async ({ consultationId, status }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await axios.put(`${API_URL}/consultations/${consultationId}/status`, 
        { status },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update consultation');
    }
  }
);

export const cancelConsultation = createAsyncThunk(
  'consultation/cancelConsultation',
  async (consultationId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await axios.put(`${API_URL}/consultations/${consultationId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel consultation');
    }
  }
);

const initialState = {
  consultations: [],
  totalPages: 0,
  currentPage: 1,
  totalConsultations: 0,
  isLoading: false,
  error: null,
  bookingLoading: false,
};

const consultationSlice = createSlice({
  name: 'consultation',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Consultations
      .addCase(fetchConsultations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConsultations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.consultations = action.payload.consultations || [];
        state.totalPages = action.payload.totalPages || 0;
        state.currentPage = action.payload.currentPage || 1;
        state.totalConsultations = action.payload.totalConsultations || 0;
      })
      .addCase(fetchConsultations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Book Consultation
      .addCase(bookConsultation.pending, (state) => {
        state.bookingLoading = true;
        state.error = null;
      })
      .addCase(bookConsultation.fulfilled, (state, action) => {
        state.bookingLoading = false;
        state.consultations.unshift(action.payload.consultation);
        state.totalConsultations += 1;
      })
      .addCase(bookConsultation.rejected, (state, action) => {
        state.bookingLoading = false;
        state.error = action.payload;
      })
      // Update Consultation Status
      .addCase(updateConsultationStatus.fulfilled, (state, action) => {
        const index = state.consultations.findIndex(c => c._id === action.payload.consultation._id);
        if (index !== -1) {
          state.consultations[index] = action.payload.consultation;
        }
      })
      // Cancel Consultation
      .addCase(cancelConsultation.fulfilled, (state, action) => {
        const index = state.consultations.findIndex(c => c._id === action.payload.consultation._id);
        if (index !== -1) {
          state.consultations[index] = action.payload.consultation;
        }
      });
  },
});

export const { clearError } = consultationSlice.actions;
export default consultationSlice.reducer;
