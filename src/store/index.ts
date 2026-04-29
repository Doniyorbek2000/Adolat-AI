import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authReducer from './slices/authSlice';
import chatReducer from './slices/chatSlice';
import docsReducer from './slices/documentsSlice';
import subscriptionReducer from './slices/subscriptionSlice';
import settingsReducer from './slices/settingsSlice';
import adminReducer from './slices/adminSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  chat: chatReducer,
  documents: docsReducer,
  subscription: subscriptionReducer,
  settings: settingsReducer,
  admin: adminReducer,
});

const persistedReducer = persistReducer(
  { key: 'root', version: 1, storage: AsyncStorage, whitelist: ['auth', 'chat', 'documents', 'subscription', 'settings'] },
  rootReducer
);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (g) => g({ serializableCheck: { ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER] } }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
