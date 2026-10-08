import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../api/api"; // <-- adjust this path to your axios instance

// NOTE: adjust to match how LessonMaster routes are mounted, e.g.
// app.use("/api/v1/admin/lessons", lessonMasterRoutes)
const BASE_URL = "/lesson-masters";

// =============================================
// Thunks (mirror LessonMasterController 1:1)
// =============================================
export const fetchLessons = createAsyncThunk(
  "lessons/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await API.get(BASE_URL);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const getLessonById = createAsyncThunk(
  "lessons/getById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await API.get(`${BASE_URL}/${id}`);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// payload: { order, thumbnailFile } — thumbnailFile is optional now (map
// builder creates a Lesson Card with just an order first; a thumbnail can be
// attached later from the Content section via updateLesson)
export const createLesson = createAsyncThunk(
  "lessons/create",
  async ({ order, thumbnailFile }, { rejectWithValue }) => {
    try {
      let payload;
      if (thumbnailFile) {
        payload = new FormData();
        payload.append("order", order);
        payload.append("thumbnail", thumbnailFile);
      } else {
        payload = { order };
      }

      const { data } = await API.post(BASE_URL, payload);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// payload: { id, order, thumbnailFile } — thumbnailFile optional
export const updateLesson = createAsyncThunk(
  "lessons/update",
  async ({ id, order, thumbnailFile }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      if (order !== undefined) formData.append("order", order);
      if (thumbnailFile) formData.append("thumbnail", thumbnailFile);

      const { data } = await API.put(`${BASE_URL}/${id}`, formData);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const changeLessonStatus = createAsyncThunk(
  "lessons/changeStatus",
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const { data } = await API.patch(`${BASE_URL}/${id}/status`, { isActive });
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteLesson = createAsyncThunk(
  "lessons/delete",
  async (id, { rejectWithValue }) => {
    try {
      await API.delete(`${BASE_URL}/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// =============================================
// Slice
// =============================================
const lessonsSlice = createSlice({
  name: "lessons",
  initialState: {
    items: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLessons.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchLessons.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchLessons.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(createLesson.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateLesson.fulfilled, (state, action) => {
        const idx = state.items.findIndex((l) => l._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(changeLessonStatus.fulfilled, (state, action) => {
        const idx = state.items.findIndex((l) => l._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteLesson.fulfilled, (state, action) => {
        state.items = state.items.filter((l) => l._id !== action.payload);
      });
  },
});

export const selectAllLessons = (state) => state.lessons.items;

export default lessonsSlice.reducer;