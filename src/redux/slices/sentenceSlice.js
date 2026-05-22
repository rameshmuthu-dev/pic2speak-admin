import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/api';

export const createSentence = createAsyncThunk(
    'sentences/create',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await API.post('/sentences', formData);
            return response.data.sentence;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Sentence creation failed");
        }
    }
);

export const fetchSentencesBySubLesson = createAsyncThunk(
    'sentences/fetchBySubLesson',
    async (subLessonId, { rejectWithValue }) => {
        try {
            const response = await API.get(`/sentences/sublesson/${subLessonId}`);
            return response.data.sentences;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to load sentences");
        }
    }
);

export const updateSentence = createAsyncThunk(
    'sentences/update',
    async ({ id, formData }, { rejectWithValue }) => {
        try {
            const response = await API.put(`/sentences/${id}`, formData);
            return response.data.sentence;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Update failed");
        }
    }
);

export const deleteSentence = createAsyncThunk(
    'sentences/delete',
    async (id, { rejectWithValue }) => {
        try {
            await API.delete(`/sentences/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Delete failed");
        }
    }
);

const sentenceSlice = createSlice({
    name: 'sentences',
    initialState: {
        items: [],
        loading: false,
        success: false,
        error: null
    },
    reducers: {
        resetSentenceState: (state) => {
            state.success = false;
            state.error = null;
        },
        clearSentences: (state) => {
            state.items = [];
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSentencesBySubLesson.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(createSentence.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.items.push(action.payload);
            })
            .addCase(updateSentence.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                const index = state.items.findIndex(s => s._id === action.payload._id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            .addCase(deleteSentence.fulfilled, (state, action) => {
                state.loading = false;
                state.items = state.items.filter(s => s._id !== action.payload);
            })
            .addMatcher(
                (action) => action.type.endsWith('/pending'),
                (state) => {
                    state.loading = true;
                    state.error = null;
                    state.success = false;
                }
            )
            .addMatcher(
                (action) => action.type.endsWith('/rejected'),
                (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                    state.success = false;
                }
            );
    }
});

export const { resetSentenceState, clearSentences } = sentenceSlice.actions;
export default sentenceSlice.reducer;