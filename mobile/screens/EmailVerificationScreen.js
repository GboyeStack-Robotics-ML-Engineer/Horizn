import React, { useState, useEffect, useRef } from 'react';
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
import { useRoute } from '@react-navigation/native';
import { auth, setAuthToken, setUserData } from '../services/api';

const { width, height } = Dimensions.get('window');

// Control the size of the corner images here (1.0 = original, 1.2 = 20% larger, etc.)
const IMAGE_SCALE = 1.0;
const LOGO_SCALE = 1.65; // Adjustable scale for the central logo
const FOOTER_OFFSET = 20; // Positive value pushes it down (we will negate it in styles)

export default function EmailVerificationScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const email = route.params?.email || 'johndoe@email.com'; // Get email from params

    const [otp, setOtp] = useState(['', '', '', '']);
    const [timer, setTimer] = useState(52);
    const [verificationStatus, setVerificationStatus] = useState('idle');
    const [loading, setLoading] = useState(false);
    const inputRefs = useRef([]);

    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleOtpChange = (value, index) => {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (verificationStatus === 'incorrect' || verificationStatus === 'failed') {
            setVerificationStatus('idle');
        }

        if (value && index < 3) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleBackspace = (key, index) => {
        if (key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleVerify = async () => {
        const code = otp.join('');
        if (code.length !== 4) return;

        setLoading(true);
        try {
            const data = await auth.verifyEmail(email, code);
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
            setVerificationStatus('success');

            setTimeout(() => {
                navigation.replace('Home');
            }, 1000);
        } catch (error) {
            console.log('Verification Error:', error);
            setVerificationStatus('failed'); // or 'incorrect' based on error
            alert(error);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (timer > 0) return;

        try {
            await auth.resendOtp(email);
            setTimer(60);
            setVerificationStatus('idle');
            alert('Code resent! Check your inbox.');
        } catch (error) {
            alert(error || 'Failed to resend code');
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Header Image - Top Right */}
            <View style={styles.headerContainer}>
                <Image
                    source={require('../assets/email_verify_header.png')}
                    style={styles.headerImage}
                    resizeMode="contain"
                />
            </View>

            {/* Footer Image - Bottom Left */}
            <View style={styles.footerContainer}>
                <Image
                    source={require('../assets/email_verify_footer.png')}
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

                        {/* Success/Failed Modal States */}
                        {verificationStatus === 'success' && (
                            <View style={styles.stateCard}>
                                <View style={styles.iconCircleSuccess}>
                                    <Ionicons name="checkmark" size={30} color="#ffffff" />
                                </View>
                                <Text style={styles.stateTitle}>Email Verified!</Text>
                            </View>
                        )}

                        {verificationStatus === 'failed' && (
                            <View style={styles.stateCard}>
                                <View style={styles.iconCircleFailed}>
                                    <Ionicons name="close" size={30} color="#ffffff" />
                                </View>
                                <Text style={styles.stateTitle}>Verification failed</Text>
                            </View>
                        )}

                        {/* Logo/Icon Area (Top Diamond) */}
                        <View style={styles.topDiamondWrapper}>
                            <Image
                                source={require('../assets/forgot_password_logo.png')}
                                style={styles.logoImage}
                                resizeMode="contain"
                            />
                        </View>

                        <Text style={styles.title}>Verify email</Text>
                        <Text style={styles.subtitle}>
                            Check <Text style={styles.boldText}>{email}</Text> for your OTP
                        </Text>

                        {/* Incorrect OTP Message */}
                        {verificationStatus === 'incorrect' && (
                            <Text style={styles.errorText}>Incorrect OTP</Text>
                        )}

                        {/* Resend Link */}
                        {verificationStatus !== 'incorrect' && (
                            <View style={styles.timerContainer}>
                                {timer > 0 ? (
                                    <Text style={styles.timerText}>
                                        Resend code in <Text style={styles.boldTimer}>{timer} seconds</Text>
                                    </Text>
                                ) : (
                                    <TouchableOpacity onPress={handleResend}>
                                        <Text style={styles.resendLink}>Resend code</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}

                        {verificationStatus === 'incorrect' && <View style={{ marginBottom: 20 }} />}

                        {/* OTP Inputs */}
                        <View style={styles.otpContainer}>
                            {otp.map((digit, index) => (
                                <TextInput
                                    key={index}
                                    ref={(ref) => (inputRefs.current[index] = ref)}
                                    style={[
                                        styles.otpInput,
                                        (verificationStatus === 'incorrect' || verificationStatus === 'failed') ? styles.otpInputError : null
                                    ]}
                                    value={digit}
                                    onChangeText={(val) => handleOtpChange(val, index)}
                                    onKeyPress={({ nativeEvent }) => handleBackspace(nativeEvent.key, index)}
                                    keyboardType="number-pad"
                                    maxLength={1}
                                    selectTextOnFocus
                                />
                            ))}
                        </View>

                        {/* Verify Button */}
                        <TouchableOpacity
                            style={[styles.verifyButton, (otp.some(d => !d) || loading) && styles.verifyButtonDisabled]}
                            onPress={handleVerify}
                            disabled={otp.some(d => !d) || loading}
                        >
                            <Text style={styles.verifyButtonText}>
                                {loading ? 'Verifying...' : 'Verify'}
                            </Text>
                        </TouchableOpacity>

                        {/* Back to Login */}
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.navigate('Login')}
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
        width: 145 * IMAGE_SCALE, // Actual asset width 145
        height: 201 * IMAGE_SCALE, // Actual asset height 201
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
        bottom: -FOOTER_OFFSET,
        left: 0,
        width: 160 * IMAGE_SCALE,
        height: 207 * IMAGE_SCALE,
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
    boldText: {
        fontWeight: 'bold',
        color: '#0f172a',
    },
    timerContainer: {
        marginBottom: 30,
    },
    timerText: {
        fontSize: 14,
        color: '#94a3b8',
    },
    boldTimer: {
        fontWeight: 'bold',
        color: '#0f172a',
    },
    resendLink: {
        fontSize: 14,
        color: '#2563eb', // Link blue
        fontWeight: '600',
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
        marginBottom: 30,
    },
    otpInput: {
        width: 60,
        height: 60,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 15,
        textAlign: 'center',
        fontSize: 24,
        color: '#0f172a',
        backgroundColor: '#ffffff',
    },
    otpInputError: {
        borderColor: '#ef4444', // Red border
        color: '#ef4444',
    },
    verifyButton: {
        width: '100%',
        backgroundColor: '#0f172a', // Navy active
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
    verifyButtonDisabled: {
        backgroundColor: '#9ca3af',
        shadowOpacity: 0,
        elevation: 0,
    },
    verifyButtonText: {
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

    // Validation States
    errorText: {
        color: '#ef4444',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 20,
        textAlign: 'center',
    },
    stateCard: {
        position: 'absolute',
        top: -80, // Adjust to float above logo or sit at top
        backgroundColor: '#ffffff',
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        marginBottom: 20,
        zIndex: 10,
        minWidth: 180,
    },
    stateTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#0f172a',
        marginTop: 5,
    },
    iconCircleSuccess: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#22c55e', // Green
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconCircleFailed: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#ef4444', // Red
        alignItems: 'center',
        justifyContent: 'center',
    },
});
