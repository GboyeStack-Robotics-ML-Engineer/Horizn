import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { auth, setAuthToken, setUserData } from '../services/api';

const { width } = Dimensions.get('window');

// Google Logo Component (Reused)
const GoogleIcon = () => (
    <Image
        source={require('../assets/google_logo.png')}
        style={{ width: 20, height: 20, marginRight: 10 }}
        resizeMode="contain"
    />
);

export default function LoginScreen() {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Simple validation
    const isFormValid = email && password;

    const handleLogin = async () => {
        if (!isFormValid) return;

        setLoading(true);
        try {
            const data = await auth.login(email, password);
            await setAuthToken(data.access_token);

            // Convert avatar_url to full URL if it exists
            const API_URL = 'http://192.168.0.3:8000';
            const userData = {
                ...data.user,
                avatar_url: data.user.avatar_url
                    ? `${API_URL}${data.user.avatar_url}`
                    : null
            };

            await setUserData(userData);
            navigation.replace('Home');
        } catch (error) {
            if (error?.includes('Email not verified')) {
                alert('Email not verified. Please check your inbox for a new code.');
                navigation.navigate('EmailVerification', { email });
            } else {
                alert(error);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        // TODO: Configure Google OAuth in Google Cloud Console
        // 1. Go to https://console.cloud.google.com/
        // 2. Create a project
        // 3. Enable Google+ API
        // 4. Create OAuth 2.0 credentials
        // 5. Add Android/iOS/Web client IDs to app.json

        alert(
            'Google Sign-In Setup Required\n\n' +
            'To enable Google authentication:\n\n' +
            '1. Set up OAuth in Google Cloud Console\n' +
            '2. Configure client IDs in app.json\n' +
            '3. Uncomment Google Sign-In code\n\n' +
            'See documentation for details.'
        );

        // Uncomment below after configuring Google OAuth:
        /*
        try {
            const config = {
                androidClientId: 'YOUR_ANDROID_CLIENT_ID',
                iosClientId: 'YOUR_IOS_CLIENT_ID',
                webClientId: 'YOUR_WEB_CLIENT_ID',
            };
            
            const result = await Google.logInAsync(config);
            
            if (result.type === 'success') {
                const { idToken } = result;
                const data = await auth.googleAuth(idToken);
                await setAuthToken(data.access_token);
                
                const API_URL = 'http://192.168.0.3:8000';
                const userData = {
                    ...data.user,
                    avatar_url: data.user.avatar_url 
                        ? `${API_URL}${data.user.avatar_url}` 
                        : null
                };
                
                await setUserData(userData);
                navigation.replace('Home');
            }
        } catch (error) {
            alert('Google Sign-In failed: ' + error.message);
        }
        */
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Header Image */}
            <View style={styles.headerContainer}>
                <Image
                    source={require('../assets/signin_header.png')}
                    style={styles.headerImage}
                    resizeMode="stretch"
                />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidingView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Title Section */}
                    <View style={styles.titleSection}>
                        <View style={styles.topDiamondWrapper}>
                            <View style={styles.topDiamond} />
                        </View>

                        <Text style={styles.title}>Sign In</Text>
                        <View style={styles.registerLinkContainer}>
                            <Text style={styles.registerLinkText}>Don't have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                                <Text style={styles.registerLinkHighlight}>Register here</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Form */}
                    <View style={styles.formContainer}>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Email Address"
                                placeholderTextColor="#94a3b8"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={styles.passwordInput}
                                    placeholder="Password"
                                    placeholderTextColor="#94a3b8"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity
                                    style={styles.eyeIcon}
                                    onPress={() => setShowPassword(!showPassword)}
                                >
                                    <Text style={{ fontSize: 18 }}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.signInButton,
                                !isFormValid && styles.signInButtonDisabled
                            ]}
                            disabled={!isFormValid || loading}
                            onPress={handleLogin}
                        >
                            <Text style={styles.signInButtonText}>
                                {loading ? 'Signing in...' : 'Sign in'}
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.orContainer}>
                            <Text style={styles.orText}>OR</Text>
                        </View>

                        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
                            <GoogleIcon />
                            <Text style={styles.googleButtonText}>Sign in with Google</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Footer Image - Fixed at bottom */}
            <View style={[styles.footerContainer, { height: width * (187 / 732) }]}>
                <Image
                    source={require('../assets/signin_footer_v2.png')}
                    style={styles.footerImage}
                    resizeMode="stretch"
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    headerContainer: {
        height: 220,
        width: '100%',
    },
    headerImage: {
        width: '100%',
        height: '100%',
    },
    keyboardAvoidingView: {
        flex: 1,
        zIndex: 10,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    titleSection: {
        alignItems: 'center',
        marginTop: -38,
    },
    topDiamondWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    topDiamond: {
        width: 20,
        height: 20,
        backgroundColor: '#f8fafc',
        transform: [{ rotate: '45deg' }],
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 8,
    },
    registerLinkContainer: {
        flexDirection: 'row',
        marginBottom: 30,
    },
    registerLinkText: {
        color: '#64748b',
        fontSize: 14,
    },
    registerLinkHighlight: {
        color: '#2563eb',
        fontWeight: '600',
        fontSize: 14,
    },
    formContainer: {
        paddingHorizontal: 24,
    },
    inputContainer: {
        marginBottom: 16,
    },
    input: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 30,
        paddingHorizontal: 20,
        paddingVertical: 14,
        fontSize: 14,
        color: '#0f172a',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 30,
        paddingHorizontal: 20,
    },
    passwordInput: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 14,
        color: '#0f172a',
    },
    eyeIcon: {
        padding: 10,
    },
    forgotPasswordText: {
        alignSelf: 'flex-end',
        color: '#2563eb',
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 20,
    },
    signInButton: {
        backgroundColor: '#0f172a',
        borderRadius: 30,
        paddingVertical: 16,
        alignItems: 'center',
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    signInButtonDisabled: {
        backgroundColor: '#94a3b8',
        shadowOpacity: 0,
        elevation: 0,
    },
    signInButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    orContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    orText: {
        color: '#64748b',
        fontSize: 14,
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#0f172a',
        borderRadius: 30,
        paddingVertical: 14,
        marginBottom: 24,
    },
    googleButtonText: {
        color: '#0f172a',
        fontSize: 15,
        fontWeight: '600',
    },
    footerContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    footerImage: {
        width: '100%',
        height: '100%',
    },
});
