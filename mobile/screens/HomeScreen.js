import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    SafeAreaView,
    Platform,
    StatusBar,
    Modal,
    TouchableWithoutFeedback
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Adjustable Image Size Variable
const BOT_IMAGE_HEIGHT = 240; // Increase this value to make the image larger

// Adjustable OTP Code Overlay Variables
const OTP_TOP_POSITION = '37%'; // Vertical position on the image (e.g., '40%', '50%')
const OTP_FONT_SIZE = 18;      // Size of the numbers
const OTP_LETTER_SPACING = 2.5;  // Spacing between numbers

export default function HomeScreen({ navigation }) {
    // Mock Data based on the "Filled" state design
    const delivery = {
        id: '1',
        botName: 'Jellybean',
        status: 'Queued',
        location: 'Faculty of Engineering, University of Lagos.',
        code: '0 1 2 3',
    };

    const [isExpanded, setIsExpanded] = useState(false);
    const [showTracking, setShowTracking] = useState(false);

    // Helper: Status Styles
    const getStatusStyles = (status) => {
        switch (status) {
            case 'Queued':
                return { bg: '#e2e8f0', text: '#64748b', dot: '#94a3b8' };
            case 'Deployed':
                return { bg: '#e0f2fe', text: '#0284c7', dot: '#0ea5e9' };
            case 'In Transit':
                return { bg: '#ffedd5', text: '#c2410c', dot: '#f97316' };
            case 'Arrived':
                return { bg: '#dcfce7', text: '#16a34a', dot: '#22c55e' };
            case 'Delivered':
                return { bg: '#22c55e', text: '#ffffff', dot: '#ffffff' };
            case 'Failed':
                return { bg: '#fee2e2', text: '#dc2626', dot: '#ef4444' };
            case 'Cancelled':
                return { bg: '#ef4444', text: '#ffffff', dot: '#ffffff' };
            default:
                return { bg: '#f1f5f9', text: '#64748b', dot: '#94a3b8' };
        }
    };

    const statusStyles = getStatusStyles(delivery.status);

    // Helper: Generate Tracking Events based on current status
    const getTrackingEvents = (currentStatus) => {
        const events = [
            { status: 'Queued', time: '02:06pm', desc: 'Item is lined up and awaiting bot availability.', icon: 'menu', lib: Feather },
            { status: 'Deployed', time: '02:10pm', desc: 'Item has been loaded onto the bot.', icon: 'package', lib: Feather },
            { status: 'In Transit', time: '02:15pm', desc: 'Bot is en route to delivery location.', icon: 'road-variant', lib: MaterialCommunityIcons },
            { status: 'Arrived', time: '02:35pm', desc: 'Bot has reached the delivery point and is ready for access.', icon: 'location-sharp', lib: Ionicons },
            { status: 'Delivered', time: '02:37pm', desc: 'Item has been successfully retrieved.', icon: 'check-circle', lib: Feather },
        ];

        let relevantEvents = [];
        let isCurrentFound = false;

        // Custom handling for Failed/Cancelled to replace the last step or append
        if (currentStatus === 'Failed') {
            const baseEvents = events.slice(0, 3); // Up to In Transit
            relevantEvents = [
                ...baseEvents,
                { status: 'Failed', time: '02:57pm', desc: 'Delivery could not be completed due to a system or route issue.', icon: 'alert-triangle', lib: Feather, isError: true }
            ];
            isCurrentFound = true; // All previous are completed
        } else if (currentStatus === 'Cancelled') {
            const baseEvents = events.slice(0, 2); // Up to Deployed
            relevantEvents = [
                ...baseEvents,
                { status: 'Cancelled', time: '02:12pm', desc: 'Delivery was cancelled before dispatch.', icon: 'close-circle', lib: Ionicons, isError: true }
            ];
            isCurrentFound = true;
        } else {
            // Standard flow
            for (let event of events) {
                if (isCurrentFound) break; // Stop adding future events if we only want up to current? 
                // Wait, design usually shows future events as grayed out? 
                // The images show ONLY the events up to the current one (e.g. In Transit shows Queued, Deployed, In Transit).
                // Image 2 shows Queued -> Deployed.
                // So we stop at current status.

                relevantEvents.push(event);
                if (event.status === currentStatus) {
                    isCurrentFound = true;
                }
            }
        }

        // Reverse to show latest at bottom? No, images show top-down: Queued (Top) -> ... -> Current (Bottom).
        return relevantEvents;
    };

    const trackingEvents = getTrackingEvents(delivery.status);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

            {/* Header Removed as per request */}

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.sectionTitle}>Incoming Deliveries</Text>

                {/* Delivery Card */}
                <View style={styles.deliveryCard}>
                    {/* Card Header */}
                    <View style={styles.cardHeader}>
                        <Text style={styles.botName}>{delivery.botName}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: statusStyles.bg }]}>
                            <View style={[styles.statusDot, { backgroundColor: statusStyles.dot }]} />
                            <Text style={[styles.statusText, { color: statusStyles.text }]}>{delivery.status}</Text>
                        </View>
                    </View>

                    <Text style={styles.locationText}>{delivery.location}</Text>



                    {/* View Details Toggle */}
                    <TouchableOpacity
                        onPress={() => setIsExpanded(true)}
                        disabled={isExpanded}
                        style={{ marginBottom: isExpanded ? 12 : 20 }}
                    >
                        <Text style={[
                            styles.viewDetailsLink,
                            isExpanded && { color: '#94a3b8', fontSize: 13, marginBottom: 0 }
                        ]}>
                            View Details
                        </Text>
                    </TouchableOpacity>

                    {/* Expanded Content Box */}
                    {isExpanded && (
                        <View style={styles.expandedCardContainer}>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Order ID</Text>
                                <Text style={styles.detailValue}>HZN-JD-001</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Bot ID</Text>
                                <Text style={styles.detailValue}>HZN-BOT-001</Text>
                            </View>

                            <Text style={styles.timelineTitle}>Timeline</Text>

                            <View style={styles.timelineCard}>
                                <View style={styles.timelineHeader}>
                                    <View style={styles.timelineIconContainer}>
                                        <Feather name="package" size={16} color="#0f172a" />
                                    </View>
                                    <Text style={styles.timelineStatus}>{delivery.status}</Text>
                                    <Text style={styles.timelineTime}>02:06pm</Text>
                                </View>
                                <Text style={styles.timelineDescription}>
                                    Item is lined up and awaiting bot availability.
                                </Text>
                            </View>

                            <TouchableOpacity
                                style={styles.showLessButton}
                                onPress={() => setIsExpanded(false)}
                            >
                                <Text style={styles.showLessText}>Show less</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Bot Image Area with Code Overlay */}
                    <View style={styles.botImageContainer}>
                        <Image
                            source={require('../assets/delivery_bot_jellybean.png')}
                            style={styles.botImage}
                            resizeMode="contain"
                        />
                        {/* OTP Code Overlay */}
                        <View style={styles.codeOverlay}>
                            <Text style={styles.codeText}>{delivery.code}</Text>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionButtonsRow}>
                        <TouchableOpacity
                            style={styles.trackButton}
                            onPress={() => setShowTracking(true)}
                        >
                            <MaterialCommunityIcons name="map-marker-path" size={20} color="#0f172a" style={{ marginRight: 8 }} />
                            <Text style={styles.trackButtonText}>Track Delivery</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.cancelButton}>
                            <Ionicons name="close-circle" size={20} color="#ef4444" style={{ marginRight: 8 }} />
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Sender Access Promo Card (Reused Design) */}
                <View style={styles.promoCard}>
                    <Image
                        source={require('../assets/sender_access_card.png')}
                        style={styles.promoImage}
                        resizeMode="cover"
                    />
                    <TouchableOpacity
                        style={styles.promoButtonOverlay}
                        onPress={() => navigation.navigate('Profile')}
                    >
                        <Text style={styles.promoButtonText}>Request Access</Text>
                    </TouchableOpacity>
                </View>

                {/* Bottom Padding */}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Bottom Navigation Bar */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItemActive}>
                    <View style={styles.navItemBadge}>
                        <Feather name="package" size={20} color="#ffffff" />
                        <Text style={styles.navItemText}>Feed</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem}>
                    <Feather name="box" size={24} color="#0f172a" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => navigation.navigate('Profile')}
                >
                    <Ionicons name="person-circle-outline" size={28} color="#0f172a" />
                </TouchableOpacity>
            </View>

            {/* Tracking Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showTracking}
                onRequestClose={() => setShowTracking(false)}
            >
                <TouchableWithoutFeedback onPress={() => setShowTracking(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.trackingModalContent}>
                                <View style={styles.modalHeader}>
                                    {/* Handle bar */}
                                    <View style={styles.modalHandle} />
                                </View>

                                <View style={styles.trackingList}>
                                    {trackingEvents.map((event, index) => {
                                        const isLast = index === trackingEvents.length - 1;
                                        const isError = event.isError;

                                        return (
                                            <View key={index} style={styles.trackingItem}>
                                                {/* Left Column: Icon + Line */}
                                                <View style={styles.trackingLeftCol}>
                                                    <View style={[
                                                        styles.trackingIconContainer,
                                                        isLast && isError ? { backgroundColor: '#fee2e2' } : null
                                                    ]}>
                                                        <event.lib
                                                            name={event.icon}
                                                            size={20}
                                                            color={isLast && isError ? '#ef4444' : (isLast ? '#0f172a' : '#64748b')}
                                                        />
                                                    </View>
                                                    {!isLast && <View style={styles.trackingLine} />}
                                                </View>

                                                {/* Right Column: Content */}
                                                <View style={styles.trackingRightCol}>
                                                    <View style={styles.trackingRowHeader}>
                                                        <Text style={[
                                                            styles.trackingStatusTitle,
                                                            isLast && isError ? { color: '#ef4444' } : (isLast ? { color: '#0f172a' } : { color: '#94a3b8' })
                                                        ]}>
                                                            {event.status}
                                                        </Text>
                                                        <Text style={[
                                                            styles.trackingTime,
                                                            isLast && isError ? { color: '#ef4444' } : (isLast ? { color: '#0f172a' } : { color: '#94a3b8' })
                                                        ]}>{event.time}</Text>
                                                    </View>
                                                    <Text style={styles.trackingDescription}>
                                                        {event.desc}
                                                    </Text>
                                                </View>
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
        paddingTop: Platform.OS === 'android' ? 40 : 0,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
        backgroundColor: '#f8fafc',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0f172a',
        letterSpacing: -0.5,
    },
    logoSun: {
        fontSize: 24,
        color: '#0f172a',
    },
    menuButton: {
        padding: 4,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 16,
    },
    // Delivery Card Styles
    deliveryCard: {
        backgroundColor: '#ffffff',
        borderRadius: 24,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#64748b',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    botName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e2e8f0',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 20,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#64748b',
    },
    locationText: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 6,
        lineHeight: 20,
        maxWidth: '90%',
    },
    viewDetailsLink: {
        fontSize: 14,
        color: '#64748b', // Changed to grey/slate as per design implications of "View Details" usually being subtle, or keep blue. The design looked subtle. 
        // Actually the design View Details looked blue. Keeping blue but checking.
        // Wait, looking at the image: "View Details" is blue.
        color: '#2563eb',
        fontWeight: '600',
        marginBottom: 20,
    },
    // Expanded View Styles
    expandedCardContainer: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        marginTop: 0,
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 8,
        alignItems: 'center',
    },
    detailLabel: {
        width: 100,
        fontSize: 15,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    detailValue: {
        fontSize: 15,
        color: '#64748b',
    },
    timelineTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#0f172a',
        marginTop: 12,
        marginBottom: 8,
    },
    timelineCard: {
        backgroundColor: '#e2e8f0', // Light gray background
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    timelineHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    timelineIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    timelineStatus: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#0f172a',
        flex: 1,
    },
    timelineTime: {
        fontSize: 13,
        fontWeight: 'bold', // Bold time
        color: '#0f172a',
    },
    timelineDescription: {
        fontSize: 13,
        color: '#64748b',
        marginLeft: 42, // Indent to align with text start
        lineHeight: 18,
    },
    showLessButton: {
        alignSelf: 'flex-end',
        marginTop: 4,
    },
    showLessText: {
        color: '#2563eb',
        fontWeight: '600',
        fontSize: 13,
    },
    botImageContainer: {
        width: '100%',
        height: BOT_IMAGE_HEIGHT,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        position: 'relative',
    },
    botImage: {
        width: '100%',
        height: '100%',
    },
    codeOverlay: {
        position: 'absolute',
        backgroundColor: '#ffffff',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        // Center vertically over image if desired, or adjust
        top: OTP_TOP_POSITION,
    },
    codeText: {
        fontSize: OTP_FONT_SIZE,
        fontWeight: 'bold',
        color: '#0f172a',
        letterSpacing: OTP_LETTER_SPACING,
    },
    actionButtonsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    trackButton: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#eff6ff', // Light blue background for emphasis
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    trackButtonText: {
        color: '#0f172a',
        fontWeight: '600',
        fontSize: 14,
    },
    cancelButton: {
        flex: 0.8,
        flexDirection: 'row',
        backgroundColor: '#fef2f2', // Light red
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButtonText: {
        color: '#ef4444',
        fontWeight: '600',
        fontSize: 14,
    },
    unlockButton: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#0f172a', // Dark Blue
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    unlockButtonText: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    // Promo Card (reused)
    promoCard: {
        width: '100%',
        aspectRatio: 418 / 294,
        borderRadius: 24,
        overflow: 'hidden',
        position: 'relative',
        marginBottom: 20,
    },
    promoImage: {
        width: '100%',
        height: '100%',
    },
    promoButtonOverlay: {
        position: 'absolute',
        bottom: 25,
        left: 25,
        backgroundColor: '#ffffff',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    promoButtonText: {
        color: '#0f172a',
        fontWeight: 'bold',
        fontSize: 12,
    },
    // Bottom Nav
    bottomNav: {
        position: 'absolute',
        bottom: 20,
        left: 24,
        right: 24,
        backgroundColor: '#eef2ff',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    navItem: {
        padding: 8,
    },
    navItemActive: {
        backgroundColor: '#0f172a',
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    navItemBadge: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    navItemText: {
        color: '#ffffff',
        marginLeft: 8,
        fontWeight: '600',
        fontSize: 14,
    },
    // Tracking Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.5)', // Dark dim background
        justifyContent: 'flex-end',
    },
    trackingModalContent: {
        backgroundColor: '#e2e8f0', // Slightly darker modal bg as per images
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 24,
        paddingBottom: 40,
        maxHeight: height * 0.8,
        minHeight: height * 0.5,
    },
    modalHeader: {
        alignItems: 'center',
        paddingVertical: 16,
        marginBottom: 8,
    },
    modalHandle: {
        width: 48,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: '#cbd5e1',
    },
    trackingList: {
        paddingTop: 8,
    },
    trackingItem: {
        flexDirection: 'row',
        marginBottom: 0, // Space handled by min height of item
    },
    trackingLeftCol: {
        alignItems: 'center',
        width: 40,
        marginRight: 16,
    },
    trackingIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f1f5f9', // Light circle background
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
    trackingLine: {
        width: 1, // Dashed line simulation (solid for now or border style)
        flex: 1,
        backgroundColor: '#cbd5e1',
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderStyle: 'dashed',
        position: 'absolute',
        top: 40,
        bottom: 0,
        left: '50%',
        marginLeft: -0.5,
        zIndex: 1,
        minHeight: 40, // Minimum height for the connector
    },
    trackingRightCol: {
        flex: 1,
        paddingBottom: 32, // Space between items
    },
    trackingRowHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
        marginTop: 8, // Align text with icon center roughly
    },
    trackingStatusTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#64748b', // Default gray
    },
    trackingTime: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#94a3b8',
    },
    trackingDescription: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
    }
});
