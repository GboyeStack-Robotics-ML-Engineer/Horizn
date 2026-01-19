import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
    // Animation values
    const spinAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;

    // Background animations (kept for atmosphere)
    const flowAnim1 = useRef(new Animated.Value(0)).current;
    const flowAnim2 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // 1. Start Gear Spinning (Loop)
        Animated.loop(
            Animated.timing(spinAnim, {
                toValue: 1,
                duration: 3000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();

        // 2. Start Background Flows
        startBackgroundAnimations();

        // 3. Sequence: Wait -> Swipe Away -> Navigate
        const sequenceTimer = setTimeout(() => {
            // Animate swipe (Slide UP off screen)
            Animated.timing(slideAnim, {
                toValue: 1,
                duration: 800,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }).start(() => {
                // Navigate after animation completes
                navigation.replace('Login');
            });
        }, 5000); // Wait 5 seconds to show the loading effect

        return () => clearTimeout(sequenceTimer);
    }, []);

    const startBackgroundAnimations = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(flowAnim1, { toValue: 1, duration: 15000, easing: Easing.bezier(0.4, 0.0, 0.2, 1), useNativeDriver: true }),
                Animated.timing(flowAnim1, { toValue: 0, duration: 15000, easing: Easing.bezier(0.4, 0.0, 0.2, 1), useNativeDriver: true }),
            ])
        ).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(flowAnim2, { toValue: 1, duration: 12000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                Animated.timing(flowAnim2, { toValue: 0, duration: 12000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            ])
        ).start();
    };

    // Interpolations
    const spin = spinAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });

    const slideY = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -height] // Slide completely up
    });

    // Background Interpolations
    const translateX1 = flowAnim1.interpolate({ inputRange: [0, 1], outputRange: [-width * 0.2, width * 0.1] });
    const translateY1 = flowAnim1.interpolate({ inputRange: [0, 1], outputRange: [-height * 0.1, height * 0.1] });
    const translateX2 = flowAnim2.interpolate({ inputRange: [0, 1], outputRange: [width * 0.1, -width * 0.2] });
    const rotate = flowAnim2.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '5deg'] });

    return (
        <Animated.View style={[styles.container, { transform: [{ translateY: slideY }] }]}>
            {/* Background Layers */}
            <LinearGradient colors={['#020617', '#0f172a', '#1e293b']} style={styles.absoluteFill} />

            <Animated.View style={[styles.absoluteFill, { width: width * 1.5, height: height * 1.5, transform: [{ translateX: translateX1 }, { translateY: translateY1 }, { scale: 1.2 }], opacity: 0.6 }]}>
                <LinearGradient colors={['transparent', '#172554', '#1e3a8a', 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.absoluteFill} />
            </Animated.View>

            <Animated.View style={[styles.absoluteFill, { width: width * 1.5, height: height * 1.5, top: -height * 0.2, left: -width * 0.2, transform: [{ translateX: translateX2 }, { rotate: rotate }], opacity: 0.4 }]}>
                <LinearGradient colors={['transparent', '#2563eb', 'transparent']} locations={[0.2, 0.5, 0.8]} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }} style={styles.absoluteFill} />
            </Animated.View>

            {/* Content Layer */}
            <View style={styles.logoContainer}>
                <View style={styles.textRow}>
                    <Text style={styles.logoText}>H</Text>
                    <Animated.View style={{ transform: [{ rotate: spin }] }}>
                        <Ionicons name="settings-sharp" size={42} color="#ffffff" style={styles.gearIcon} />
                    </Animated.View>
                    <Text style={styles.logoText}>rizn</Text>
                </View>
                <Text style={styles.subtitle}>Autonomous Delivery</Text>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#020617', // Match bg color for smooth edge
    },
    absoluteFill: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    logoContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    textRow: {
        flexDirection: 'row',
        alignItems: 'center', // Center vertically
        justifyContent: 'center',
    },
    logoText: {
        fontSize: 52,
        fontWeight: '300',
        color: '#ffffff',
        letterSpacing: 4,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 6,
    },
    gearIcon: {
        marginHorizontal: 1, // Adjust spacing
        marginTop: 4, // Visual alignment with text baseline
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowRadius: 6,
    },
    subtitle: {
        marginTop: 20,
        color: '#94a3b8',
        fontSize: 14,
        letterSpacing: 3,
        fontWeight: '500',
        opacity: 0.8,
    }
});
