import React, { useState, useEffect } from 'react';
import { BlurView } from 'expo-blur';
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
    TextInput,
    Modal,
    FlatList,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { getUserData, setUserData, auth } from '../services/api';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

const COUNTRIES = [
    { code: '+234', name: 'Nigeria', type: 'Nigeria' },
    { code: '+1', name: 'USA', type: 'USA' },
    { code: '+44', name: 'UK', type: 'UK' },
    { code: '+233', name: 'Ghana', type: 'Ghana' },
];

export default function ProfileScreen({ navigation }) {
    const [activeTab, setActiveTab] = useState('UserInfo'); // 'UserInfo' | 'SenderAccess'
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // User data - loaded from storage
    const [user, setUser] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: null,
        avatar: null,
    });

    // State for Edit Mode
    const [isEditing, setIsEditing] = useState(false);
    const [showCountryPicker, setShowCountryPicker] = useState(false);
    const [showChangeEmailModal, setShowChangeEmailModal] = useState(false);
    const [timer, setTimer] = useState(52);
    const [editForm, setEditForm] = useState({
        firstName: '',
        lastName: '',
        countryCode: '+234',
        phone: '',
        email: '',
    });

    // Sender Access State
    const [senderAccessStep, setSenderAccessStep] = useState('intro'); // 'intro' | 'form'
    const [showUseCaseDropdown, setShowUseCaseDropdown] = useState(false);
    const [showFrequencyDropdown, setShowFrequencyDropdown] = useState(false);
    const [accessForm, setAccessForm] = useState({
        orgName: '',
        address: '',
        useCase: '',
        customUseCase: '',
        frequency: '',
        agreement1: false,
        agreement2: false,
    });

    // Load user data on mount
    useEffect(() => {
        const loadUser = async () => {
            try {
                const userData = await getUserData();
                if (userData) {
                    setUser({
                        firstName: userData.first_name || '',
                        lastName: userData.last_name || '',
                        email: userData.email || '',
                        phone: userData.phone || null,
                        avatar: userData.avatar_url || null,
                    });
                    setEditForm({
                        firstName: userData.first_name || '',
                        lastName: userData.last_name || '',
                        countryCode: '+234',
                        phone: userData.phone || '',
                        email: userData.email || '',
                    });
                }
            } catch (error) {
                console.log('Error loading user:', error);
            } finally {
                setLoading(false);
            }
        };
        loadUser();
    }, []);

    useEffect(() => {
        let interval;
        if (showChangeEmailModal) {
            setTimer(52); // Reset timer when modal opens
            interval = setInterval(() => {
                setTimer((prevTimer) => {
                    if (prevTimer <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prevTimer - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [showChangeEmailModal]);

    const renderFlag = (type) => {
        // ... (renderFlag content same as before) ...
        if (type === 'Nigeria') {
            return (
                <View style={styles.flagContainer}>
                    <View style={styles.flagGreen} />
                    <View style={styles.flagWhite} />
                    <View style={styles.flagGreen} />
                </View>
            );
        } else if (type === 'USA') {
            return (
                <View style={styles.flagContainer}>
                    <View style={[styles.flagStripe, { backgroundColor: '#B22234' }]} />
                    <View style={[styles.flagStripe, { backgroundColor: '#ffffff' }]} />
                    <View style={[styles.flagStripe, { backgroundColor: '#3C3B6E' }]} />
                </View>
            );
        } else if (type === 'UK') {
            return (
                <View style={styles.flagContainer}>
                    <View style={[styles.flagFull, { backgroundColor: '#012169' }]} />
                    <View style={[styles.flagCrossVertical, { backgroundColor: '#ffffff' }]} />
                    <View style={[styles.flagCrossHorizontal, { backgroundColor: '#ffffff' }]} />
                    <View style={[styles.flagCrossVertical, { backgroundColor: '#C8102E', width: 2 }]} />
                    <View style={[styles.flagCrossHorizontal, { backgroundColor: '#C8102E', height: 2 }]} />
                </View>
            );
        }
        else if (type === 'Ghana') {
            return (
                <View style={styles.flagContainer}>
                    <View style={[styles.flagStripe, { backgroundColor: '#CE1126' }]} />
                    <View style={[styles.flagStripe, { backgroundColor: '#FCD116' }]} />
                    <View style={[styles.flagStripe, { backgroundColor: '#006B3F' }]} />
                </View>
            );
        }
        return <View style={[styles.flagContainer, { backgroundColor: '#ccc' }]} />;
    };



    const getCountryType = (code) => {
        const country = COUNTRIES.find(c => c.code === code);
        return country ? country.type : 'Nigeria';
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Call backend to update profile
            const updatedUser = await auth.updateProfile({
                first_name: editForm.firstName,
                last_name: editForm.lastName,
                phone: editForm.phone ? `${editForm.countryCode} ${editForm.phone}` : null,
            });

            // Update local state
            setUser({
                ...user,
                firstName: updatedUser.first_name,
                lastName: updatedUser.last_name,
                phone: updatedUser.phone,
            });

            // Persist to storage
            await setUserData(updatedUser);

            setIsEditing(false);
            alert('Profile updated successfully!');
        } catch (error) {
            console.log('Save error:', error);
            alert(error || 'Failed to save profile');
        } finally {
            setSaving(false);
        }
    };

    const handleDiscard = () => {
        // Reset form to current user data
        setEditForm({
            firstName: user.firstName,
            lastName: user.lastName,
            countryCode: '',
            phone: '',
            email: user.email,
        });
        setIsEditing(false);
    };

    const pickImage = async () => {
        // Request permission
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Sorry, we need camera roll permissions to change your profile picture.');
            return;
        }

        // Launch image picker
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            const imageUri = result.assets[0].uri;

            // Show loading state - update avatar locally first for instant feedback
            setUser({ ...user, avatar: imageUri });

            try {
                // Upload to backend
                const updatedUser = await auth.uploadAvatar(imageUri);

                // Construct full URL for avatar
                const API_URL = 'http://192.168.0.3:8000'; // Same as api.js
                const fullAvatarUrl = updatedUser.avatar_url
                    ? `${API_URL}${updatedUser.avatar_url}`
                    : null;

                // Update with server response
                setUser({ ...user, avatar: fullAvatarUrl });

                // Persist to storage
                await setUserData({ ...updatedUser, avatar_url: fullAvatarUrl });

                alert('Profile picture updated!');
            } catch (error) {
                console.log('Upload error:', error);
                // Revert on failure
                setUser({ ...user, avatar: null });
                alert(error || 'Failed to upload profile picture');
            }
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

            {/* Main Content Scroll */}
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header Title */}
                <Text style={styles.headerTitle}>Profile</Text>

                {/* Custom Tabs */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tabItem, activeTab === 'UserInfo' && styles.tabItemActive]}
                        onPress={() => setActiveTab('UserInfo')}
                    >
                        <MaterialCommunityIcons
                            name="card-account-details-outline"
                            size={20}
                            color={activeTab === 'UserInfo' ? '#0f172a' : '#94a3b8'}
                        />
                        <Text style={[styles.tabText, activeTab === 'UserInfo' && styles.tabTextActive]}>
                            User Info
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tabItem, activeTab === 'SenderAccess' && styles.tabItemActive]}
                        onPress={() => setActiveTab('SenderAccess')}
                    >
                        <MaterialCommunityIcons
                            name="robot-industrial"
                            size={20}
                            color={activeTab === 'SenderAccess' ? '#0f172a' : '#94a3b8'}
                        />
                        <Text style={[styles.tabText, activeTab === 'SenderAccess' && styles.tabTextActive]}>
                            Sender Access
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Avatar Section */}
                {activeTab === 'UserInfo' && (
                    <View style={styles.avatarSection}>
                        <View style={styles.avatarContainer}>
                            {user.avatar ? (
                                <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Text style={styles.avatarInitials}>
                                        {user.firstName[0]}{user.lastName[0]}
                                    </Text>
                                </View>
                            )}
                        </View>
                        <TouchableOpacity style={styles.addPictureButton} onPress={pickImage}>
                            <Text style={styles.addPictureText}>
                                {user.avatar ? 'Change picture' : 'Add picture'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* User Details - Conditional Rendering */}
                {activeTab === 'UserInfo' ? (
                    <View>
                        {!isEditing ? (
                            // READ ONLY VIEW
                            <View style={styles.detailsSection}>
                                <View style={styles.detailsHeader}>
                                    <View>
                                        <Text style={styles.userName}>{user.firstName} {user.lastName}</Text>
                                        <Text style={styles.userEmail}>{user.email}</Text>
                                    </View>
                                    <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
                                        <Text style={styles.editButtonText}>Edit</Text>
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity>
                                    <Text style={styles.addPhoneLink}>
                                        {user.phone ? user.phone : 'Add a phone number'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            // EDIT MODE VIEW
                            <View style={styles.editContainer}>
                                {/* First Name */}
                                <TextInput
                                    style={styles.inputField}
                                    value={editForm.firstName}
                                    onChangeText={(text) => setEditForm({ ...editForm, firstName: text })}
                                    placeholder="First Name"
                                />

                                {/* Last Name */}
                                <TextInput
                                    style={styles.inputField}
                                    value={editForm.lastName}
                                    onChangeText={(text) => setEditForm({ ...editForm, lastName: text })}
                                    placeholder="Last Name"
                                />

                                {/* Phone Number Row */}
                                <View style={styles.phoneRow}>
                                    <TouchableOpacity
                                        style={[styles.inputField, styles.countryCodeContainer]}
                                        onPress={() => setShowCountryPicker(true)}
                                    >
                                        <Text style={styles.countryCodeTextValue}>{editForm.countryCode}</Text>
                                        {renderFlag(getCountryType(editForm.countryCode))}
                                    </TouchableOpacity>
                                    <TextInput
                                        style={[styles.inputField, styles.phoneInput]}
                                        value={editForm.phone}
                                        onChangeText={(text) => setEditForm({ ...editForm, phone: text })}
                                        placeholder="Phone Number"
                                        keyboardType="phone-pad"
                                    />
                                </View>

                                {/* Country Picker Modal */}
                                <Modal
                                    visible={showCountryPicker}
                                    transparent={true}
                                    animationType="slide"
                                    onRequestClose={() => setShowCountryPicker(false)}
                                >
                                    <View style={styles.modalOverlay}>
                                        <View style={styles.modalContent}>
                                            <View style={styles.modalHeader}>
                                                <Text style={styles.modalTitle}>Select Country</Text>
                                                <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
                                                    <Ionicons name="close" size={24} color="#0f172a" />
                                                </TouchableOpacity>
                                            </View>
                                            <FlatList
                                                data={COUNTRIES}
                                                keyExtractor={(item) => item.code}
                                                renderItem={({ item }) => (
                                                    <TouchableOpacity
                                                        style={styles.countryItem}
                                                        onPress={() => {
                                                            setEditForm({ ...editForm, countryCode: item.code });
                                                            setShowCountryPicker(false);
                                                        }}
                                                    >
                                                        <View style={styles.countryItemLeft}>
                                                            {renderFlag(item.type)}
                                                            <Text style={styles.countryName}>{item.name}</Text>
                                                        </View>
                                                        <Text style={styles.countryCode}>{item.code}</Text>
                                                    </TouchableOpacity>
                                                )}
                                            />
                                        </View>
                                    </View>
                                </Modal>

                                {/* Email Row (Read only with Change link) */}
                                <View style={styles.emailInputContainer}>
                                    <Text style={styles.emailInputValue}>{editForm.email}</Text>
                                    <TouchableOpacity onPress={() => setShowChangeEmailModal(true)}>
                                        <Text style={styles.emailChangeLink}>Change</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* ... Actions ... */}

                                {/* Change Email OTP Modal */}
                                <Modal
                                    visible={showChangeEmailModal}
                                    transparent={true}
                                    animationType="fade"
                                    onRequestClose={() => setShowChangeEmailModal(false)}
                                >
                                    <BlurView intensity={80} tint="dark" style={styles.modalOverlay}>
                                        <TouchableOpacity
                                            style={styles.modalDismissArea}
                                            activeOpacity={1}
                                            onPress={() => setShowChangeEmailModal(false)}
                                        />
                                        <View style={styles.bottomSheetContent}>
                                            <View style={styles.bottomSheetHandle} />

                                            <Text style={styles.bsTitle}>Change Email</Text>
                                            <Text style={styles.bsSubtitle}>
                                                Enter the OTP sent to <Text style={{ fontWeight: 'bold', color: '#0f172a' }}>johndoe@email.com</Text>
                                            </Text>

                                            <Text style={styles.bsTimer}>
                                                Resend code in <Text style={{ fontWeight: 'bold', color: '#0f172a' }}>{timer}</Text> seconds
                                            </Text>

                                            {/* OTP Inputs */}
                                            <View style={styles.otpContainer}>
                                                {[0, 1, 2, 3].map((index) => (
                                                    <TextInput
                                                        key={index}
                                                        style={styles.otpInput}
                                                        keyboardType="number-pad"
                                                        maxLength={1}
                                                        // Simplified mock handling for visual
                                                        onChangeText={() => { }}
                                                    />
                                                ))}
                                            </View>

                                            <TouchableOpacity style={styles.verifyButton} disabled={true}>
                                                <Text style={styles.verifyButtonText}>Verify</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity style={styles.cantAccessContainer}>
                                                <Text style={styles.cantAccessText}>
                                                    Can't access your email? <Text style={styles.clickHereText}>Click here</Text>
                                                </Text>
                                                <Feather name="external-link" size={14} color="#2563eb" style={{ marginLeft: 4, marginTop: 2 }} />
                                            </TouchableOpacity>
                                        </View>
                                    </BlurView>
                                </Modal>

                                {/* Action Buttons */}
                                <View style={styles.editActions}>
                                    <TouchableOpacity onPress={handleDiscard} disabled={saving}>
                                        <Text style={styles.discardText}>Discard</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.saveButton, saving && { opacity: 0.6 }]}
                                        onPress={handleSave}
                                        disabled={saving}
                                    >
                                        <Text style={styles.saveButtonText}>
                                            {saving ? 'Saving...' : 'Save'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        <View style={styles.divider} />

                        {/* Saved Locations */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Saved Locations</Text>
                            <Text style={styles.emptyStateText}>Nothing to show</Text>
                        </View>

                        {/* Promo Card - Sender Access */}
                        <View style={styles.promoCard}>
                            <Image
                                source={require('../assets/sender_access_card.png')}
                                style={styles.promoImage}
                                resizeMode="cover"
                            />
                            {/* Overlay Button */}
                            <TouchableOpacity
                                style={styles.promoButtonOverlay}
                                onPress={() => setActiveTab('SenderAccess')}
                            >
                                <Text style={styles.promoButtonText}>Request Access</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    // SENDER ACCESS VIEW
                    senderAccessStep === 'intro' ? (
                        <View style={styles.senderAccessContainer}>
                            <View style={styles.roleContainer}>
                                <Text style={styles.roleLabel}>User Role</Text>
                                <Text style={styles.roleValue}>Recipient</Text>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.requestAccessCard}>
                                <Text style={styles.accessTitle}>Request Sender Access</Text>
                                <Text style={styles.accessDescription}>
                                    Upgrade your account to send packages using autonomous robots.
                                </Text>

                                <View style={styles.accessNoteContainer}>
                                    <View style={styles.blueDot} />
                                    <Text style={styles.accessNote}>Subject to approval by system admin.</Text>
                                </View>

                                <TouchableOpacity
                                    style={styles.requestAccessButton}
                                    onPress={() => setSenderAccessStep('form')}
                                >
                                    <Text style={styles.requestAccessButtonText}>Request Access</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        // FORM VIEW
                        <View style={styles.senderAccessFormContainer}>
                            {/* Breadcrumbs */}
                            <View style={styles.breadcrumbsContainer}>
                                <TouchableOpacity onPress={() => setSenderAccessStep('intro')}>
                                    <Ionicons name="arrow-back" size={18} color="#64748b" style={{ marginRight: 6 }} />
                                </TouchableOpacity>
                                <Text style={styles.breadcrumbText}>
                                    <Text style={styles.breadcrumbLink} onPress={() => setSenderAccessStep('intro')}>Profile</Text>
                                    <Text style={styles.breadcrumbSeparator}> • </Text>
                                    <Text style={styles.breadcrumbLink} onPress={() => setSenderAccessStep('intro')}>Sender Access</Text>
                                    <Text style={styles.breadcrumbSeparator}> • </Text>
                                    <Text style={styles.breadcrumbActive}>Request Form</Text>
                                </Text>
                            </View>

                            <Text style={styles.formTitle}>Request Sender Access</Text>
                            <Text style={styles.formSubtitle}>Fill the form below</Text>

                            {/* Org Name */}
                            <View style={styles.formGroup}>
                                <Text style={styles.inputLabel}>Organisation Name</Text>
                                <TextInput
                                    style={styles.accessInput}
                                    placeholder="Organisation Name"
                                    placeholderTextColor="#94a3b8"
                                    value={accessForm.orgName}
                                    onChangeText={(t) => setAccessForm({ ...accessForm, orgName: t })}
                                />
                            </View>

                            {/* Org Address */}
                            <View style={styles.formGroup}>
                                <Text style={styles.inputLabel}>Organisation Address</Text>
                                <TextInput
                                    style={[styles.accessInput, styles.textArea]}
                                    placeholder="Organisation Address"
                                    placeholderTextColor="#94a3b8"
                                    multiline={true}
                                    numberOfLines={3}
                                    textAlignVertical="top"
                                    value={accessForm.address}
                                    onChangeText={(t) => setAccessForm({ ...accessForm, address: t })}
                                />
                            </View>

                            {/* Use Case Dropdown */}
                            <View style={[styles.formGroup, { zIndex: 20 }]}>
                                <Text style={styles.inputLabel}>Intended Use Case</Text>
                                <TouchableOpacity
                                    style={styles.dropdownButton}
                                    onPress={() => setShowUseCaseDropdown(!showUseCaseDropdown)}
                                >
                                    <Text style={accessForm.useCase ? styles.dropdownValue : styles.dropdownPlaceholder}>
                                        {accessForm.useCase || 'Select use case'}
                                    </Text>
                                    <Feather name={showUseCaseDropdown ? "chevron-up" : "chevron-down"} size={20} color="#64748b" />
                                </TouchableOpacity>

                                {showUseCaseDropdown && (
                                    <View style={styles.dropdownList}>
                                        {['Food Delivery', 'Document Logistics', 'Equipment Transport', 'Other'].map((item) => (
                                            <TouchableOpacity
                                                key={item}
                                                style={styles.dropdownItem}
                                                onPress={() => {
                                                    setAccessForm({ ...accessForm, useCase: item });
                                                    setShowUseCaseDropdown(false);
                                                }}
                                            >
                                                <Text style={styles.dropdownItemText}>{item}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>

                            {/* Conditional Custom Use Case */}
                            {accessForm.useCase === 'Other' && (
                                <View style={styles.formGroup}>
                                    <Text style={styles.inputLabel}>Specify your use case</Text>
                                    <TextInput
                                        style={styles.accessInput}
                                        placeholder="Custom use case"
                                        placeholderTextColor="#94a3b8"
                                        value={accessForm.customUseCase}
                                        onChangeText={(t) => setAccessForm({ ...accessForm, customUseCase: t })}
                                    />
                                </View>
                            )}

                            {/* Frequency Dropdown */}
                            <View style={[styles.formGroup, { zIndex: 10 }]}>
                                <Text style={styles.inputLabel}>Estimated Usage Frequency</Text>
                                <TouchableOpacity
                                    style={styles.dropdownButton}
                                    onPress={() => setShowFrequencyDropdown(!showFrequencyDropdown)}
                                >
                                    <Text style={accessForm.frequency ? styles.dropdownValue : styles.dropdownPlaceholder}>
                                        {accessForm.frequency || 'Select frequency'}
                                    </Text>
                                    <Feather name={showFrequencyDropdown ? "chevron-up" : "chevron-down"} size={20} color="#64748b" />
                                </TouchableOpacity>

                                {showFrequencyDropdown && (
                                    <View style={styles.dropdownList}>
                                        {['Daily', 'Weekly', 'Monthly', 'Occasional'].map((item) => (
                                            <TouchableOpacity
                                                key={item}
                                                style={styles.dropdownItem}
                                                onPress={() => {
                                                    setAccessForm({ ...accessForm, frequency: item });
                                                    setShowFrequencyDropdown(false);
                                                }}
                                            >
                                                <Text style={styles.dropdownItemText}>{item}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>

                            {/* Agreements */}
                            <View style={styles.agreementContainer}>
                                <TouchableOpacity
                                    style={styles.checkboxRow}
                                    onPress={() => setAccessForm({ ...accessForm, agreement1: !accessForm.agreement1 })}
                                >
                                    <View style={[styles.checkbox, accessForm.agreement1 && styles.checkboxChecked]}>
                                        {accessForm.agreement1 && <Feather name="check" size={12} color="#fff" />}
                                    </View>
                                    <Text style={styles.agreementText}>
                                        I understand that sender access allows control of physical autonomous devices and may incur usage-based charges.*
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.checkboxRow}
                                    onPress={() => setAccessForm({ ...accessForm, agreement2: !accessForm.agreement2 })}
                                >
                                    <View style={[styles.checkbox, accessForm.agreement2 && styles.checkboxChecked]}>
                                        {accessForm.agreement2 && <Feather name="check" size={12} color="#fff" />}
                                    </View>
                                    <Text style={styles.agreementText}>
                                        I agree to use this feature responsibly and accept liability for misuse or unauthorized operations performed under my account.*
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Submit Button */}
                            <TouchableOpacity
                                style={[
                                    styles.submitAccessButton,
                                    (!accessForm.orgName || !accessForm.address || !accessForm.useCase || !accessForm.frequency || !accessForm.agreement1 || !accessForm.agreement2) && styles.submitAccessButtonDisabled
                                ]}
                                disabled={!accessForm.orgName || !accessForm.address || !accessForm.useCase || !accessForm.frequency || !accessForm.agreement1 || !accessForm.agreement2}
                            >
                                <Text style={styles.submitAccessButtonText}>Submit</Text>
                            </TouchableOpacity>
                        </View>
                    )
                )}

                {/* Extra padding for bottom nav */}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Bottom Navigation Bar (Visual Placeholder) */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="calendar-outline" size={24} color="#0f172a" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => navigation.navigate('Home')}
                >
                    <Feather name="package" size={24} color="#0f172a" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="person-circle" size={28} color="#0f172a" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
        paddingTop: Platform.OS === 'android' ? 40 : 0,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 20,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 20,
    },
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 30,
    },
    tabItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 24,
        paddingBottom: 8,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabItemActive: {
        borderBottomColor: '#0f172a',
    },
    tabText: {
        fontSize: 14,
        color: '#94a3b8',
        marginLeft: 6,
        fontWeight: '500',
    },
    tabTextActive: {
        color: '#0f172a',
        fontWeight: 'bold',
    },
    inputField: {
        borderWidth: 1.5, // Slightly thicker
        borderColor: '#64748b', // Darker border (Slate 500)
        borderRadius: 25,
        paddingHorizontal: 20,
        paddingVertical: 16,
        fontSize: 14,
        color: '#0f172a',
        fontWeight: 'bold', // Bold text
        marginBottom: 16,
        backgroundColor: '#f8fafc',
    },
    phoneRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    countryCodeContainer: {
        width: '37%', // Match user refinement
        marginBottom: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between', // Text left, Flag right
        paddingVertical: 0, // Reset padding for container alignment
        height: 54, // Fixed height to match TextInput default approx
    },
    countryCodeTextValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    flagContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        overflow: 'hidden',
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    flagGreen: {
        flex: 1,
        backgroundColor: '#008751', // Nigeria Green
    },
    flagWhite: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    flagStripe: {
        flex: 1,
    },
    flagFull: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    flagCrossVertical: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: '42%',
        width: 4,
    },
    flagCrossHorizontal: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: '42%',
        height: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '50%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    countryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    countryItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    countryName: {
        fontSize: 16,
        color: '#0f172a',
        marginLeft: 12,
        fontWeight: '500',
    },
    countryCode: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: 'bold',
    },
    // Bottom Sheet Styles
    modalDismissArea: {
        flex: 1,
    },
    bottomSheetContent: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 24,
        paddingBottom: 40,
        alignItems: 'center',
    },
    bottomSheetHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#e2e8f0',
        borderRadius: 2,
        marginBottom: 24,
    },
    bsTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 8,
    },
    bsSubtitle: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 24,
        textAlign: 'center',
    },
    bsTimer: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 24,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    otpInput: {
        width: 60,
        height: 60,
        borderWidth: 1.5,
        borderColor: '#cbd5e1',
        borderRadius: 16,
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        backgroundColor: '#f8fafc',
        color: '#0f172a',
    },
    verifyButton: {
        width: '100%',
        backgroundColor: '#94a3b8', // Gray for disabled state
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 24,
    },
    verifyButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cantAccessContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cantAccessText: {
        fontSize: 14,
        color: '#64748b',
    },
    clickHereText: {
        color: '#2563eb',
        fontWeight: 'bold',
    },
    phoneInput: {
        width: '60%',
        marginBottom: 0,
    },
    emailInputContainer: {
        borderWidth: 1.5,
        borderColor: '#cbd5e1', // Keep email slightly lighter or match? Image shows distinct border.
        borderRadius: 25,
        paddingHorizontal: 20,
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        backgroundColor: '#f8fafc',
    },

    avatarSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 20,
        backgroundColor: '#9ca3af', // Gray placeholder
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitials: {
        fontSize: 36,
        color: '#ffffff',
        fontWeight: 'bold',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    addPictureButton: {
        backgroundColor: '#eef2ff',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },
    addPictureText: {
        color: '#0f172a',
        fontWeight: '600',
        fontSize: 14,
    },
    detailsSection: {
        marginBottom: 20,
    },
    detailsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    userEmail: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 2,
    },
    saveButton: {
        backgroundColor: '#e0e7ff',
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 25, // Match input radius
    },
    saveButtonText: {
        color: '#4f46e5',
        fontWeight: 'bold',
        fontSize: 14,
    },
    editActions: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        gap: 30, // Spacing between Discard and Save
    },
    discardText: {
        color: '#0f172a',
        fontWeight: 'bold',
        fontSize: 14,
    },
    editButton: {
        backgroundColor: '#eef2ff',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 15,
    },
    editButtonText: {
        color: '#0f172a',
        fontWeight: '600',
        fontSize: 12,
    },
    addPhoneLink: {
        color: '#2563eb',
        fontSize: 14,
        fontWeight: '600',
        marginTop: 8,
    },
    divider: {
        height: 1,
        backgroundColor: '#e2e8f0',
        marginVertical: 20,
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: 14,
        color: '#64748b',
    },

    promoCard: {
        width: '100%',
        aspectRatio: 418 / 294, // Based on asset dimensions
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
        bottom: 25, // Adjust to match design
        left: 25,   // Adjust to match design
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
    bottomNav: {
        position: 'absolute',
        bottom: 20, // Floating slightly
        left: 24,
        right: 24,
        backgroundColor: '#eef2ff', // Light blueish gray specific to design
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    // Sender Access Styles
    senderAccessContainer: {
        paddingHorizontal: 4,
    },
    roleContainer: {
        marginBottom: 20,
    },
    roleLabel: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 4,
    },
    roleValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    requestAccessCard: {
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        padding: 24,
        marginTop: 20,
    },
    accessTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 8,
    },
    accessDescription: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
        marginBottom: 16,
    },
    accessNoteContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    blueDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#2563eb',
        marginRight: 8,
    },
    accessNote: {
        fontSize: 12,
        color: '#0f172a',
        fontWeight: '500',
    },
    requestAccessButton: {
        backgroundColor: '#0f172a',
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
    },
    requestAccessButtonText: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    // Form Styles
    senderAccessFormContainer: {
        paddingHorizontal: 4,
    },
    breadcrumbsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    breadcrumbText: {
        fontSize: 14,
        color: '#64748b',
    },
    breadcrumbLink: {
        textDecorationLine: 'none',
    },
    breadcrumbSeparator: {
        color: '#94a3b8',
    },
    breadcrumbActive: {
        color: '#0f172a',
        fontWeight: '600',
    },
    formTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 8,
    },
    formSubtitle: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 24,
    },
    formGroup: {
        marginBottom: 20,
        position: 'relative',
    },
    inputLabel: {
        fontSize: 14,
        color: '#94a3b8', // Light slate
        marginBottom: 8,
    },
    accessInput: {
        borderWidth: 1.5,
        borderColor: '#0f172a', // Dark border as per design
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#0f172a',
        fontWeight: '600',
        backgroundColor: '#ffffff',
    },
    textArea: {
        height: 100,
        paddingTop: 14,
    },
    dropdownButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#0f172a',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: '#ffffff',
    },
    dropdownValue: {
        fontSize: 16,
        color: '#0f172a',
        fontWeight: '600',
    },
    dropdownPlaceholder: {
        fontSize: 16,
        color: '#94a3b8',
    },
    dropdownList: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginTop: 4,
        zIndex: 100,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        paddingVertical: 4,
    },
    dropdownItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    dropdownItemText: {
        fontSize: 15,
        color: '#0f172a',
    },
    agreementContainer: {
        marginTop: 10,
        marginBottom: 24,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 1.5,
        borderColor: '#0f172a',
        marginRight: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
    },
    checkboxChecked: {
        backgroundColor: '#0f172a',
    },
    agreementText: {
        flex: 1,
        fontSize: 12,
        color: '#64748b',
        lineHeight: 18,
    },
    submitAccessButton: {
        backgroundColor: '#0f172a', // "Ready" state color (Dark Blue)
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
        marginBottom: 40,
    },
    submitAccessButtonDisabled: {
        backgroundColor: '#94a3b8', // "Not Ready" state color (Gray)
        opacity: 1, // Full opacity since we are changing color
    },
    submitAccessButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
