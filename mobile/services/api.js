import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// CONFIGURATION
// Replace this with your computer's local IP address if running on a physical device
// For Android Emulator, use 'http://10.0.2.2:8000'
// For iOS Simulator, use 'http://localhost:8000'
const API_URL = 'http://192.168.0.3:8000';

const api = axios.create({
    baseURL: `${API_URL}/auth`,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Storage Keys
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

// --- Token Management ---

export const setAuthToken = async (token) => {
    try {
        const tokenString = typeof token === 'string' ? token : JSON.stringify(token);
        console.log('[API] Saving Token:', tokenString.substring(0, 10) + '...');
        if (Platform.OS === 'web') {
            localStorage.setItem(TOKEN_KEY, tokenString);
        } else {
            await SecureStore.setItemAsync(TOKEN_KEY, tokenString);
        }
    } catch (error) {
        console.error('Error saving token', error);
    }
};

export const getAuthToken = async () => {
    try {
        if (Platform.OS === 'web') {
            return localStorage.getItem(TOKEN_KEY);
        } else {
            return await SecureStore.getItemAsync(TOKEN_KEY);
        }
    } catch (error) {
        console.error('Error getting token', error);
        return null;
    }
};

export const removeAuthToken = async () => {
    try {
        if (Platform.OS === 'web') {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
        } else {
            await SecureStore.deleteItemAsync(TOKEN_KEY);
            await SecureStore.deleteItemAsync(USER_KEY);
        }
    } catch (error) {
        console.error('Error removing token', error);
    }
};

// --- User Data Management ---

export const setUserData = async (user) => {
    try {
        const userData = JSON.stringify(user);
        if (Platform.OS === 'web') {
            localStorage.setItem(USER_KEY, userData);
        } else {
            await SecureStore.setItemAsync(USER_KEY, userData);
        }
    } catch (error) {
        console.error('Error saving user data', error);
    }
};

export const getUserData = async () => {
    try {
        let userData;
        if (Platform.OS === 'web') {
            userData = localStorage.getItem(USER_KEY);
        } else {
            userData = await SecureStore.getItemAsync(USER_KEY);
        }
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Error getting user data', error);
        return null;
    }
};

// --- Helper Functions ---

export const convertAvatarUrl = (avatarUrl) => {
    if (!avatarUrl) return null;
    // If already a full URL, return as is
    if (avatarUrl.startsWith('http')) return avatarUrl;
    // Convert relative path to full URL
    return `${API_URL}${avatarUrl}`;
};

// --- Request Interceptor ---
api.interceptors.request.use(
    async (config) => {
        const token = await getAuthToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// --- API Methods ---

export const auth = {
    register: async (userData) => {
        try {
            console.log('[API] Register attempt:', { ...userData, password: '***' });
            const response = await api.post('/register', userData);
            return response.data;
        } catch (error) {
            console.log('[API] Register error:', error.response?.data);
            throw error.response?.data?.detail || 'Registration failed';
        }
    },

    login: async (email, password) => {
        try {
            console.log('[API] Login attempt:', { email, password: '***' });
            const response = await api.post('/login', { email, password });
            return response.data;
        } catch (error) {
            console.log('[API] Login error:', error.response?.data);
            throw error.response?.data?.detail || 'Login failed';
        }
    },

    verifyEmail: async (email, code) => {
        try {
            const response = await api.post('/verify-email', { email, code });
            return response.data;
        } catch (error) {
            throw error.response?.data?.detail || 'Verification failed';
        }
    },

    resendOtp: async (email, type = 'email_verification') => {
        try {
            const response = await api.post('/resend-otp', { email, otp_type: type });
            return response.data;
        } catch (error) {
            throw error.response?.data?.detail || 'Failed to resend Code';
        }
    },

    forgotPassword: async (email) => {
        try {
            const response = await api.post('/forgot-password', { email });
            return response.data;
        } catch (error) {
            throw error.response?.data?.detail || 'Request failed';
        }
    },

    resetPassword: async (email, code, newPassword) => {
        try {
            const response = await api.post('/reset-password', {
                email,
                code,
                new_password: newPassword
            });
            return response.data;
        } catch (error) {
            throw error.response?.data?.detail || 'Reset failed';
        }
    },

    googleAuth: async (idToken) => {
        try {
            const response = await api.post('/google', { id_token: idToken });
            return response.data;
        } catch (error) {
            throw error.response?.data?.detail || 'Google Auth failed';
        }
    },

    getProfile: async () => {
        try {
            const response = await api.get('/me');
            return response.data;
        } catch (error) {
            throw error.response?.data?.detail || 'Failed to fetch profile';
        }
    },

    updateProfile: async (profileData) => {
        try {
            const response = await api.put('/profile', profileData);
            return response.data;
        } catch (error) {
            throw error.response?.data?.detail || 'Failed to update profile';
        }
    },

    uploadAvatar: async (imageUri) => {
        try {
            // Get the auth token
            const token = await getAuthToken();
            console.log('[API] Upload - Got token:', token ? `${token.substring(0, 20)}...` : 'null');

            if (!token) {
                throw 'Not authenticated';
            }

            // Create form data for file upload
            const formData = new FormData();
            formData.append('file', {
                uri: imageUri,
                type: 'image/jpeg',
                name: 'avatar.jpg',
            });

            const uploadUrl = `${API_URL}/auth/upload-avatar`;
            console.log('[API] Upload - Sending to:', uploadUrl);

            // Use fetch API for file uploads (more reliable than axios for multipart)
            const response = await fetch(uploadUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // Don't set Content-Type - let fetch set it with the boundary
                },
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                console.log('[API] Upload error:', data);
                throw data.detail || 'Upload failed';
            }

            console.log('[API] Upload success:', data);
            return data;
        } catch (error) {
            console.log('[API] Upload error:', error);
            throw error.message || error || 'Failed to upload avatar';
        }
    }
};

export default auth;
