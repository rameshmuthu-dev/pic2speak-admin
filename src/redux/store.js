import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import adminReducer from './slices/adminSlice';
import categoryReducer from './slices/categorySlice';
import topicReducer from './slices/topicSlice';
import lessonReducer from './slices/lessonSlice';
import sentenceReducer from './slices/sentenceSlice';

/**
 * REDUX STORE CONFIGURATION
 * The central state management hub for the Pic2Speak Admin Panel.
 * Includes reducers for Auth, Dashboard Analytics, and Content Management.
 */
const store = configureStore({
  reducer: {
    // Session and Authentication
    auth: authReducer,

    // Dashboard Statistics and System Health
    admin: adminReducer,

    // Content Management Hierarchy
    categories: categoryReducer,
    topics: topicReducer,
    lessons: lessonReducer,
    sentences: sentenceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Prevents errors when handling File objects (images) in state
    }),
});

export default store;