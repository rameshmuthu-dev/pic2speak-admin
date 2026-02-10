import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/api';

/**
 * ASYNC THUNKS
 */

/**
 * 1. Create a New Sentence
 * Sends FormData containing text, lessonId, image, and audio files.
 */
export const createSentence = createAsyncThunk(
    'sentences/create',
    async (formData, { rejectWithValue }) => {
        try {
            // NOTE: We do not set 'Content-Type' headers manually. 
            // Axios automatically detects FormData and sets the boundary.
            const response = await API.post('/sentences', formData);
            return response.data.sentence;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Sentence creation failed");
        }
    }
);

/**
 * 2. Fetch Sentences by Lesson ID
 * Retrieves all slides associated with a specific lesson, sorted by 'order'.
 */
export const fetchSentencesByLesson = createAsyncThunk(
    'sentences/fetchByLesson',
    async (lessonId, { rejectWithValue }) => {
        try {
            const response = await API.get(`/sentences/lesson/${lessonId}`);
            return response.data.sentences;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to load sentences");
        }
    }
);

/**
 * 3. Update Sentence
 * This handles both text updates and new file uploads (Image/Audio).
 * Expects an object containing 'id' and 'formData'.
 */
export const updateSentence = createAsyncThunk(
    'sentences/update',
    async ({ id, formData }, { rejectWithValue }) => {
        try {
            // Sending a PUT request with FormData to the specific sentence ID
            const response = await API.put(`/sentences/${id}`, formData);
            return response.data.sentence;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Update failed");
        }
    }
);

/**
 * 4. Delete Sentence
 * Removes the slide from the database and triggers file cleanup on the server.
 */
export const deleteSentence = createAsyncThunk(
    'sentences/delete',
    async (id, { rejectWithValue }) => {
        try {
            await API.delete(`/sentences/${id}`);
            return id; // Return the ID so we can filter it out of the local state
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Delete failed");
        }
    }
);

/**
 * SENTENCE SLICE
 */
const sentenceSlice = createSlice({
    name: 'sentences',
    initialState: {
        items: [],           // Holds the list of sentences for the current lesson
        loading: false,      // Global loading state for sentence actions
        success: false,      // Used to trigger UI events like closing modals
        error: null          // Holds error messages from the backend
    },
    reducers: {
        // Resets success and error flags before starting a new operation
        resetSentenceState: (state) => {
            state.success = false;
            state.error = null;
        },
        // Clears the list when navigating away from a lesson
        clearSentences: (state) => {
            state.items = [];
        }
    },
    extraReducers: (builder) => {
        builder
            /* --- FETCHING Sentences --- */
            .addCase(fetchSentencesByLesson.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })

            /* --- CREATING a Sentence --- */
            .addCase(createSentence.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.items.push(action.payload); // Append the new slide to the list
            })

            /* --- UPDATING a Sentence --- */
            .addCase(updateSentence.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                // Find the specific slide in the array and replace it with the updated version
                const index = state.items.findIndex(s => s._id === action.payload._id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })

            /* --- DELETING a Sentence --- */
            .addCase(deleteSentence.fulfilled, (state, action) => {
                state.loading = false;
                state.items = state.items.filter(s => s._id !== action.payload);
            })

            /* --- GLOBAL MATCHERS for Pending and Rejected states --- */
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