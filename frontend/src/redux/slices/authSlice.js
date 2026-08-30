import { createSlice } from "@reduxjs/toolkit";

// Load initial state from localStorage if available
const loadState = () => {
  try {
    const serializedState = localStorage.getItem('authState');
    if (serializedState === null) {
      return {
        userId: null,
        isAuthenticated: false,
        role: null
      };
    }
    return JSON.parse(serializedState);
  } catch {
    return {
      userId: null,
      isAuthenticated: false,
      role: null
    };
  }
};


const initialState = loadState();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUserInfo(state, action) {
      const { userType, user } = action.payload;
      
      if (user) {
        state.userId = user._id;
        state.isAuthenticated = true;
        state.role = userType;
        
        // Save to localStorage whenever state changes
        localStorage.setItem('authState', JSON.stringify({
          userId: user._id,
          isAuthenticated: true,
          role: userType
        }));
      }
    },
    logout() {
      // Clear localStorage on logout
      localStorage.removeItem('authState');
      return {
        userId: null,
        isAuthenticated: false,
        role: null
      };
    }
  }
});



export const { setUserInfo, logout } = authSlice.actions;

// Selectors
export const selectUserId = (state) => state.auth.userId;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUserRole = (state) => state.auth.role;

// Removed selectIsAdmin since permissions.isAdmin wasn't in the state
// If you need it, add permissions to your state structure first

export default authSlice.reducer;