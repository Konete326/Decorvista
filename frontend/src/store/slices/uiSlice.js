import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarOpen: false,
  mobileMenuOpen: false,
  theme: 'light',
  loading: {
    global: false,
    components: {},
  },
  modals: {
    login: false,
    register: false,
    productDetail: false,
    bookConsultation: false,
  },
  toast: {
    show: false,
    message: '',
    type: 'info', // info, success, warning, error
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    setMobileMenuOpen: (state, action) => {
      state.mobileMenuOpen = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    setGlobalLoading: (state, action) => {
      state.loading.global = action.payload;
    },
    setComponentLoading: (state, action) => {
      const { component, loading } = action.payload;
      state.loading.components[component] = loading;
    },
    openModal: (state, action) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action) => {
      state.modals[action.payload] = false;
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(modal => {
        state.modals[modal] = false;
      });
    },
    showToast: (state, action) => {
      state.toast = {
        show: true,
        message: action.payload.message,
        type: action.payload.type || 'info',
      };
    },
    hideToast: (state) => {
      state.toast.show = false;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleMobileMenu,
  setMobileMenuOpen,
  setTheme,
  setGlobalLoading,
  setComponentLoading,
  openModal,
  closeModal,
  closeAllModals,
  showToast,
  hideToast,
} = uiSlice.actions;

export default uiSlice.reducer;
