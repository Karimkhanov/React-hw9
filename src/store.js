import { configureStore } from '@reduxjs/toolkit';
import itemsReducer from './features/items/itemsSlice';

export const store = configureStore({
  reducer: {
    items: itemsReducer,
  },
});