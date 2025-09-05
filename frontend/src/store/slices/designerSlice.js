import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Async thunks
export const fetchDesigners = createAsyncThunk(
  'designer/fetchDesigners',
  async ({ page = 1, limit = 12, specialty, location } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      if (specialty) params.append('specialty', specialty);
      if (location) params.append('location', location);

      const response = await axios.get(`${API_URL}/designers?${params}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch designers');
    }
  }
);

export const fetchDesignerById = createAsyncThunk(
  'designer/fetchDesignerById',
  async (designerId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/designers/${designerId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch designer');
    }
  }
);

export const updateDesignerProfile = createAsyncThunk(
  'designer/updateProfile',
  async (profileData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await axios.put(`${API_URL}/designers/profile`, profileData, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const fetchDesignerAvailability = createAsyncThunk(
  'designer/fetchAvailability',
  async (designerId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/designers/${designerId}/availability`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch availability');
    }
  }
);

export const updateAvailability = createAsyncThunk(
  'designer/updateAvailability',
  async (availabilityData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await axios.put(`${API_URL}/designers/availability`, availabilityData, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update availability');
    }
  }
);

const initialState = {
  designers: [],
  currentDesigner: null,
  availability: [],
  totalPages: 0,
  currentPage: 1,
  totalDesigners: 0,
  isLoading: false,
  error: null,
  filters: {
    specialty: '',
    location: '',
  },
};

const designerSlice = createSlice({
  name: 'designer',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCurrentDesigner: (state) => {
      state.currentDesigner = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Designers
      .addCase(fetchDesigners.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDesigners.fulfilled, (state, action) => {
        state.isLoading = false;
        state.designers = action.payload.designers || [];
        state.totalPages = action.payload.totalPages || 0;
        state.currentPage = action.payload.currentPage || 1;
        state.totalDesigners = action.payload.totalDesigners || 0;
      })
      .addCase(fetchDesigners.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Designer by ID
      .addCase(fetchDesignerById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDesignerById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentDesigner = action.payload.designer;
      })
      .addCase(fetchDesignerById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Designer Profile
      .addCase(updateDesignerProfile.fulfilled, (state, action) => {
        state.currentDesigner = action.payload.designer;
      })
      // Fetch Availability
      .addCase(fetchDesignerAvailability.fulfilled, (state, action) => {
        state.availability = action.payload.availability || [];
      })
      // Update Availability
      .addCase(updateAvailability.fulfilled, (state, action) => {
        state.availability = action.payload.availability || [];
      });
  },
});

export const { clearError, setFilters, clearCurrentDesigner } = designerSlice.actions;
export default designerSlice.reducer;
