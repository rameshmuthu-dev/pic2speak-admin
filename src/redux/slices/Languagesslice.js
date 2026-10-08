import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import API from '../../api/api';

const PUBLIC_BASE_URL = '/languages';
const ADMIN_BASE_URL = '/languages';
const ACTIVE_LANGUAGE_STORAGE_KEY = 'pic2speak_active_language';

export const fetchLanguages = createAsyncThunk(
  'languages/fetchLanguages',
  async (status = 'active', { rejectWithValue }) => {
    try {
      const query = status === 'all' ? '?status=all' : '?status=active';
      const res = await API.get(`${PUBLIC_BASE_URL}${query}`);
      // Safe extraction whether data is inside res.data.data or directly res.data
      const responseData = res.data?.data !== undefined ? res.data.data : res.data;
      return Array.isArray(responseData) ? responseData : responseData?.languages || [];
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message || 'Failed to load languages.');
    }
  }
);

export const createLanguage = createAsyncThunk(
  'languages/createLanguage',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await API.post(ADMIN_BASE_URL, payload);
      return res.data?.data !== undefined ? res.data.data : res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message || 'Failed to create language.');
    }
  }
);

export const updateLanguage = createAsyncThunk(
  'languages/updateLanguage',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await API.put(`${ADMIN_BASE_URL}/${id}`, data);
      return res.data?.data !== undefined ? res.data.data : res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message || 'Failed to update language.');
    }
  }
);

export const changeLanguageStatus = createAsyncThunk(
  'languages/changeLanguageStatus',
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const res = await API.patch(`${ADMIN_BASE_URL}/${id}/status`, { isActive });
      return res.data?.data !== undefined ? res.data.data : res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message || 'Failed to update status.');
    }
  }
);

export const setDefaultLanguage = createAsyncThunk(
  'languages/setDefaultLanguage',
  async (id, { rejectWithValue }) => {
    try {
      const res = await API.patch(`${ADMIN_BASE_URL}/${id}/default`);
      return res.data?.data !== undefined ? res.data.data : res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message || 'Failed to set default language.');
    }
  }
);

export const fetchActiveLanguageSetting = createAsyncThunk(
  'languages/fetchActiveLanguageSetting',
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get(`${ADMIN_BASE_URL}/active-language`);
      return res.data?.data !== undefined ? res.data.data : res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message || 'Failed to load active language.');
    }
  }
);

export const updateActiveLanguageSetting = createAsyncThunk(
  'languages/updateActiveLanguageSetting',
  async (code, { rejectWithValue }) => {
    try {
      const res = await API.put(`${ADMIN_BASE_URL}/active-language`, { code });
      return res.data?.data !== undefined ? res.data.data : res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message || 'Failed to update active language.');
    }
  }
);

const persistActiveLanguage = (code) => {
  if (typeof window !== 'undefined' && code) {
    localStorage.setItem(ACTIVE_LANGUAGE_STORAGE_KEY, code);
  }
};

const upsertInList = (arr = [], updated) => {
  if (!updated) return;
  const idx = arr.findIndex((l) => l._id === updated._id);
  if (idx !== -1) {
    arr[idx] = updated;
  } else {
    arr.push(updated);
  }
};

const upsertInActiveItems = (arr = [], updated) => {
  if (!updated) return;
  const idx = arr.findIndex((l) => l._id === updated._id);
  if (updated.isActive) {
    if (idx !== -1) {
      arr[idx] = updated;
    } else {
      arr.push(updated);
    }
  } else if (idx !== -1) {
    arr.splice(idx, 1);
  }
};

const initialState = {
  items: [],
  list: [],
  status: 'idle',
  actionStatus: 'idle',
  activeLangStatus: 'idle',
  error: null,
  activeLanguageCode:
    (typeof window !== 'undefined' && localStorage.getItem(ACTIVE_LANGUAGE_STORAGE_KEY)) || 'en',
};

const languagesSlice = createSlice({
  name: 'languages',
  initialState,
  reducers: {
    setActiveLanguageCode: (state, action) => {
      state.activeLanguageCode = action.payload;
      persistActiveLanguage(action.payload);
    },
    setActiveLanguage: (state, action) => {
      const items = state.items || [];
      const list = state.list || [];
      const match = items.find((l) => l._id === action.payload) || list.find((l) => l._id === action.payload);
      if (match) {
        state.activeLanguageCode = match.code;
        persistActiveLanguage(match.code);
      }
    },
    clearLanguagesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLanguages.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchLanguages.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const requestedAll = action.meta.arg === 'all';
        const languages = Array.isArray(action.payload) ? action.payload : [];

        if (requestedAll) {
          state.list = languages;
        } else {
          state.items = languages;
          if (languages.length && !languages.some((l) => l.code === state.activeLanguageCode)) {
            const fallback = languages.find((l) => l.isDefault) || languages[0];
            state.activeLanguageCode = fallback.code;
            persistActiveLanguage(fallback.code);
          }
        }
      })
      .addCase(fetchLanguages.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createLanguage.pending, (state) => {
        state.actionStatus = 'loading';
        state.error = null;
      })
      .addCase(createLanguage.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        upsertInList(state.list, action.payload);
        if (action.payload?.isActive) {
          upsertInActiveItems(state.items, action.payload);
        }
      })
      .addCase(createLanguage.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload;
      })
      .addCase(updateLanguage.pending, (state) => {
        state.actionStatus = 'loading';
        state.error = null;
      })
      .addCase(updateLanguage.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        upsertInList(state.list, action.payload);
        upsertInActiveItems(state.items, action.payload);
      })
      .addCase(updateLanguage.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload;
      })
      .addCase(changeLanguageStatus.pending, (state) => {
        state.actionStatus = 'loading';
        state.error = null;
      })
      .addCase(changeLanguageStatus.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        upsertInList(state.list, action.payload);
        upsertInActiveItems(state.items, action.payload);
      })
      .addCase(changeLanguageStatus.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload;
      })
      .addCase(setDefaultLanguage.pending, (state) => {
        state.actionStatus = 'loading';
        state.error = null;
      })
      .addCase(setDefaultLanguage.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        const updateDefault = (arr = []) =>
          arr.map((l) => ({
            ...l,
            isDefault: l._id === action.payload?._id,
          }));
        state.list = updateDefault(state.list);
        state.items = updateDefault(state.items);
      })
      .addCase(setDefaultLanguage.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchActiveLanguageSetting.pending, (state) => {
        state.activeLangStatus = 'loading';
      })
      .addCase(fetchActiveLanguageSetting.fulfilled, (state, action) => {
        state.activeLangStatus = 'succeeded';
        const code = action.payload?.code;
        if (code) {
          state.activeLanguageCode = code;
          persistActiveLanguage(code);
        }
      })
      .addCase(fetchActiveLanguageSetting.rejected, (state) => {
        state.activeLangStatus = 'failed';
      })
      .addCase(updateActiveLanguageSetting.pending, (state, action) => {
        state.activeLanguageCode = action.meta.arg;
        persistActiveLanguage(action.meta.arg);
      })
      .addCase(updateActiveLanguageSetting.fulfilled, (state, action) => {
        const code = action.payload?.code || action.meta.arg;
        state.activeLanguageCode = code;
        persistActiveLanguage(code);
      })
      .addCase(updateActiveLanguageSetting.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { setActiveLanguageCode, setActiveLanguage, clearLanguagesError } = languagesSlice.actions;

const EMPTY_ARRAY = [];

export const selectAllLanguages = (state) => state.languages?.list || EMPTY_ARRAY;
export const selectActiveLanguages = (state) => state.languages?.items || EMPTY_ARRAY;
export const selectLanguagesStatus = (state) => state.languages?.status || 'idle';
export const selectLanguagesActionStatus = (state) => state.languages?.actionStatus || 'idle';
export const selectLanguagesError = (state) => state.languages?.error || null;
export const selectActiveLanguageCode = (state) => state.languages?.activeLanguageCode || 'en';
export const selectActiveLangSettingStatus = (state) => state.languages?.activeLangStatus || 'idle';

export const selectActiveLanguageId = createSelector(
  [selectActiveLanguages, selectActiveLanguageCode],
  (items, code) => {
    const match = items.find((l) => l.code === code);
    return match ? match._id : null;
  }
);

export default languagesSlice.reducer;