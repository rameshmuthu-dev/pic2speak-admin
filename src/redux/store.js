import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import adminReducer from './slices/adminSlice';




// import languageReducer from './slices/languageSlice'; // Adjust path if needed
import adventureMapReducer from './slices/Adventuremapslice'; // Adjust path if needed
import assetGroupReducer from './slices/Assetgroupslice'; // Adjust path if needed


import languagesReducer from './slices/Languagesslice';
import lessonsReducer from './slices/Lessonsslice';

import lessonMasterReducer from './slices/Lessonmasterslice';
import lessonContentReducer from './slices/Lessoncontentslice';
import lessonNodeReducer from './slices/Lessonnodeslice';
import sceneReducer from './slices/sceneSlice';
import sceneContentReducer from './slices/sceneContentSlice';
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

   

    languages: languagesReducer,
    adventureMap: adventureMapReducer,
    assetGroups: assetGroupReducer,
    

    lessons: lessonsReducer,

    lessonMaster: lessonMasterReducer,
    lessonContent: lessonContentReducer,
    lessonNode: lessonNodeReducer,
    scene: sceneReducer,
    sceneContent: sceneContentReducer,
  
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Prevents errors when handling File objects (images) in state
    }),
});

export default store;