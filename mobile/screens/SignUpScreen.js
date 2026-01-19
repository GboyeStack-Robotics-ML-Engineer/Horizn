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
import { auth } from '../services/api';

const { width } = Dimensions.get('window');

// Google Logo Component
const GoogleIcon = () => (
    <Image
        source={require('../assets/google_logo.png')}
        style={{ width: 20, height: 20, marginRight: 10 }}
        resizeMode="contain"
    />
);

export default function SignUpScreen() {
    const navigation = useNavigation();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Simple validation to enable button
    const isFormValid = firstName && lastName && email && password;

    const handleSignUp = async () => {
        if (!isFormValid) return;

        setLoading(true);
        try {
            await auth.register({
                email,
                password,
                first_name: firstName,
                last_name: lastName
            });
            // Proceed to email verification
            navigation.navigate('EmailVerification', { email });
        } catch (error) {
            alert(error); // Show error message from backend
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Header Image Background - Using static asset with mask included */}
            <View style={styles.headerContainer}>
                <Image
                    source={require('../assets/header_with_mask.png')}
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
                    {/* Logo Section */}
                    <View style={styles.logoSection}>
                        {/* Central Diamond/Logo Element matching design */}
                        <View style={styles.topDiamondWrapper}>
                            <View style={styles.topDiamond} />
                        </View>

                        {/* Main App Logo - Removed Text as requested */}
                        <View style={styles.appLogoContainer}>
                            {/* User requested to remove 'horizn' text */}
                        </View>

                        <Text style={styles.title}>Sign Up</Text>
                        <View style={styles.loginLinkContainer}>
                            <Text style={styles.loginLinkText}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.loginLinkHighlight}>Login here</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Form */}
                    <View style={styles.formContainer}>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Firstname"
                                placeholderTextColor="#94a3b8"
                                value={firstName}
                                onChangeText={setFirstName}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Lastname"
                                placeholderTextColor="#94a3b8"
                                value={lastName}
                                onChangeText={setLastName}
                            />
                        </View>

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

                        <TouchableOpacity
                            style={[
                                styles.signUpButton,
                                !isFormValid && styles.signUpButtonDisabled
                            ]}
                            disabled={!isFormValid || loading}
                            onPress={handleSignUp}
                        >
                            <Text style={styles.signUpButtonText}>
                                {loading ? 'Creating Account...' : 'Sign up'}
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.orContainer}>
                            <Text style={styles.orText}>OR</Text>
                        </View>

                        <TouchableOpacity style={styles.googleButton}>
                            <GoogleIcon />
                            <Text style={styles.googleButtonText}>Sign up with Google</Text>
                        </TouchableOpacity>

                        <Text style={styles.footerText}>
                            By signing up, you agree to our <Text style={styles.linkText}>User Agreement</Text>, <Text style={styles.linkText}>Privacy Policy</Text>, and <Text style={styles.linkText}>Cookie Policy</Text>.
                        </Text>
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
        height: 220,
        width: '100%',
        position: 'relative',
    },
    headerImage: {
        width: '100%',
        height: '100%',
    },
    // Removed unused overlay and mask styles
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    logoSection: {
        alignItems: 'center',
        marginTop: -38, // Pull up MORE into the mask area since image has the mask
    },
    topDiamondWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    topDiamond: {
        width: 20,
        height: 20,
        backgroundColor: '#f8fafc', // Matches page background
        transform: [{ rotate: '45deg' }],
    },
    appLogoContainer: {
        marginBottom: 0, // Reduced since text is gone
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Removed unused appLogoText and mountainIcon styles
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 8,
    },
    loginLinkContainer: {
        flexDirection: 'row',
        marginBottom: 30,
    },
    loginLinkText: {
        color: '#64748b',
        fontSize: 14,
    },
    loginLinkHighlight: {
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
    signUpButton: {
        backgroundColor: '#0f172a',
        borderRadius: 30,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    signUpButtonDisabled: {
        backgroundColor: '#94a3b8',
        shadowOpacity: 0,
        elevation: 0,
    },
    signUpButtonText: {
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
    footerText: {
        textAlign: 'center',
        color: '#64748b',
        fontSize: 11,
        lineHeight: 16,
    },
    linkText: {
        color: '#0f172a',
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
});
