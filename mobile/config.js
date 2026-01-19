// API Configuration
// ⚠️ IMPORTANT: Update this when testing on a physical device

const ENV = {
    development: {
        apiUrl: 'http://localhost:8000',  // For testing with emulator
        // When testing on phone, replace localhost with your computer's IP:
        // apiUrl: 'http://192.168.1.100:8000',
    },
    production: {
        apiUrl: 'https://your-production-api.com',  // Update with your production API
    }
};

const getEnvVars = () => {
    // You can add logic here to detect environment
    // For now, we'll use development
    return ENV.development;
};

export default getEnvVars;
