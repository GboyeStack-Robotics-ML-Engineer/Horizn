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
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../services/api';

const { width, height } = Dimensions.get('window');

// Control the size of the corner images here (1.0 = original, 1.2 = 20% larger, etc.)
const IMAGE_SCALE = 1.6;
const LOGO_SCALE = 2.1; // Adjustable scale for the central logo

export default function ForgotPasswordScreen() {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [emailSent, setEmailSent] = useState(false);

    const [loading, setLoading] = useState(false);

    const handleSendEmail = async () => {
        if (!email) return;

        setLoading(true);
        try {
            await auth.forgotPassword(email);
            setEmailSent(true);
            // Navigate to Verification after delay
            setTimeout(() => {
                navigation.navigate('EmailVerification', { email });
            }, 1500);
        } catch (error) {
            alert(error || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Header Image - Top Right */}
            <View style={styles.headerContainer}>
                <Image
                    source={require('../assets/forgot_password_header.png')}
                    style={styles.headerImage}
                    resizeMode="contain"
                />
            </View>

            {/* Footer Image - Bottom Left */}
            <View style={styles.footerContainer}>
                <Image
                    source={require('../assets/forgot_password_footer.png')}
                    style={styles.footerImage}
                    resizeMode="contain"
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
                    {/* Main Content */}
                    <View style={styles.contentContainer}>

                        {/* Success State Overlay/Replacement */}
                        {emailSent ? (
                            <View style={styles.successCard}>
                                <View style={styles.iconCircle}>
                                    <Ionicons name="checkmark" size={30} color="#ffffff" />
                                </View>
                                <Text style={styles.successTitle}>Email Sent!</Text>
                            </View>
                        ) : null}

                        {/* Logo/Icon Area (Top Diamond) */}
                        <View style={styles.topDiamondWrapper}>
                            <Image
                                source={require('../assets/forgot_password_logo.png')}
                                style={styles.logoImage}
                                resizeMode="contain"
                            />
                        </View>

                        <Text style={styles.title}>Forgot Password?</Text>
                        <Text style={styles.subtitle}>
                            Enter the email address tied to your account
                        </Text>

                        {/* Input */}
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

                        {/* Send Button */}
                        <TouchableOpacity
                            style={[styles.sendButton, (!email || loading) && styles.sendButtonDisabled]}
                            onPress={handleSendEmail}
                            disabled={!email || loading}
                        >
                            <Text style={styles.sendButtonText}>
                                {loading ? 'Sending...' : 'Send Email'}
                            </Text>
                        </TouchableOpacity>

                        {/* Back to Login */}
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={styles.backButtonText}>Continue with another account</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    headerContainer: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 100 * IMAGE_SCALE,
        height: 137 * IMAGE_SCALE,
        alignItems: 'flex-end',
        justifyContent: 'flex-start',
        zIndex: 0,
    },
    headerImage: {
        width: '100%',
        height: '100%',
    },
    footerContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: 99 * IMAGE_SCALE,
        height: 130 * IMAGE_SCALE,
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
        zIndex: 0,
    },
    footerImage: {
        width: '100%',
        height: '100%',
    },
    keyboardAvoidingView: {
        flex: 1,
        zIndex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingBottom: 40,
    },
    contentContainer: {
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    topDiamondWrapper: {
        width: 80 * LOGO_SCALE,
        height: 60 * LOGO_SCALE,
        marginBottom: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoImage: {
        width: '100%',
        height: '100%',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    inputContainer: {
        width: '100%',
        marginBottom: 20,
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
    sendButton: {
        width: '100%',
        backgroundColor: '#0f172a',
        borderRadius: 30,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    sendButtonDisabled: {
        backgroundColor: '#9ca3af',
        shadowOpacity: 0,
    },
    sendButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    backButton: {
        padding: 10,
    },
    backButtonText: {
        color: '#2563eb',
        fontSize: 14,
        fontWeight: '600',
    },

    // Success State
    successCard: {
        position: 'absolute',
        top: -100, // Position relative to content or screen top?
        // To cover the logo area or float, styling in component might need logic.
        // For now, it replaces nothing, just overlays?
        // Actually logical placement in JSX suggests it pushes headers down or sits ontop.
        // Given absolute top -100, that might clip.
        // Let's adjust based on previous design observation: usually replaces logo or sits above title.
        // I will trust the container relative placement or adjust if needed.
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        marginBottom: 20,
        zIndex: 10,
        top: 0, // Reset to natural flow if relative, or specific position?
        // Removing 'top' to let it flow in Flexbox 'contentContainer' 
        position: 'relative',
    },
    iconCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#22c55e', // Green
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    successTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0f172a',
    },
});
