import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import cartSlice from './slices/cartSlice';
import consultationSlice from './slices/consultationSlice';
import productSlice from './slices/productSlice';
import designerSlice from './slices/designerSlice';
import orderSlice from './slices/orderSlice';
import notificationSlice from './slices/notificationSlice';
import uiSlice from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    cart: cartSlice,
    consultation: consultationSlice,
    product: productSlice,
    designer: designerSlice,
    order: orderSlice,
    notification: notificationSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

// TypeScript types would be defined here in a .ts file
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;
