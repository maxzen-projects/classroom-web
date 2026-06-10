import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  permissions: [],
  loading: false,
  error: null,
};

const permissionsSlice = createSlice({
  name: 'permissions',
  initialState,
  reducers: {
    setPermissions: (state, action) => {
      state.permissions = action.payload;
      state.loading = false;
      state.error = null;
    },
    clearPermissions: (state) => {
      state.permissions = [];
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setPermissions, clearPermissions, setLoading, setError } = permissionsSlice.actions;

export default permissionsSlice.reducer;
