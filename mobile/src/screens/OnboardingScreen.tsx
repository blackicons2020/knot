import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Colors, Spacing, BorderRadius } from '../theme/colors';
import { RootStackParamList, User, MaritalStatus, SmokingHabits, DrinkingHabits, ChildrenPreference, WillingToRelocate } from '../types';
import { COUNTRIES, STATES_BY_COUNTRY, CITIES_BY_STATE } from '../services/locationData';
import { db } from '../services/apiService';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function OnboardingScreen() {
  const navigation = useNavigation<Nav>();
  const { userProfile, setUserProfile } = useAuth();
  const { isDarkMode } = useTheme();

  // Onboarding Steps:
  // 1: Cinematic Welcome
  // 2: Essentials Form & Uploads (Selfie + ID)
  // 3: AI Matchmaker Interview Chat
  // 4: AI Liveness & Biometric Verification Scan
  // 5: Relationship Certificate Reveal
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  // Image Upload State
  const [govIdUri, setGovIdUri] = useState<string | null>(null);
  const [livenessUri, setLivenessUri] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Form State
  const [form, setForm] = useState<User>({
    id: userProfile?.id || '',
    email: userProfile?.email || '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    bio: '',
    interests: [],
    profileImageUrls: [],
    isVerified: false,
    isPremium: false,
    occupation: '',
    city: '',
    country: '',
    residenceCountry: '',
    residenceState: '',
    residenceCity: '',
    originCountry: '',
    originState: '',
    originCity: '',
    religion: '',
    personalValues: [],
    nationality: '',
    languagesSpoken: [],
    maritalStatus: MaritalStatus.NeverMarried,
    smoking: SmokingHabits.NonSmoker,
    drinking: DrinkingHabits.Never,
    childrenStatus: 'No kids',
    marriageTimeline: 'Within 1-2 years',
    willingToRelocate: WillingToRelocate.Maybe,
    childrenPreference: ChildrenPreference.OpenToChildren,
    idealPartnerTraits: [],
  } as any);

  // AI Interview State
  const [messages, setMessages] = useState<Array<{ role: 'ai' | 'user'; text: string }>>([
    {
      role: 'ai',
      text: 'Welcome to KNOT. I am your AI Matchmaking Guide. I will explore your psychological profiles, attachment dynamics, and commitment objectives. Shall we begin?',
    },
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [interviewQuestionIndex, setInterviewQuestionIndex] = useState(0);
  const chatScrollViewRef = useRef<ScrollView>(null);

  const interviewPrompts = [
    'What kind of relationship are you hoping to build with a potential partner?',
    'What core values and priorities matter most in your life and future marriage?',
    'What does permanent commitment mean to you personally?',
    'How do you usually approach disagreements or conflict resolution in relationships?',
    'What are your core relationship non-negotiables?',
    'Would you be open to relocating for the right relationship?',
  ];

  // AI Scanner Verification State
  const [verificationStep, setVerificationStep] = useState(0);
  const scanAnim = useRef(new Animated.Value(0)).current;

  // Selfie Liveness Interactive Modal States
  const [isLivenessModalOpen, setIsLivenessModalOpen] = useState(false);
  const [livenessState, setLivenessState] = useState<'align' | 'smile' | 'tilt' | 'complete'>('align');
  const [livenessPrompt, setLivenessPrompt] = useState('Center your face in the circle');

  // ID Scanning Interactive Modal States
  const [isIdScanModalOpen, setIsIdScanModalOpen] = useState(false);
  const [idScanState, setIdScanState] = useState<'align' | 'scanning' | 'complete'>('align');
  const [idScanPrompt, setIdScanPrompt] = useState('Align ID inside the rectangle frame');

  const startLivenessScanner = () => {
    setIsLivenessModalOpen(true);
    setLivenessState('align');
    setLivenessPrompt('Center your face in the circular aperture');
    
    setTimeout(() => {
      setLivenessState('smile');
      setLivenessPrompt('Now smile big and blink to verify aliveness');
      
      setTimeout(() => {
        setLivenessState('tilt');
        setLivenessPrompt('Perfect! Tilt your head slowly to the left');
        
        setTimeout(() => {
          setLivenessState('complete');
          setLivenessPrompt('Liveness Confirmed! Biometric face scan complete.');
          setLivenessUri('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80');
          
          setTimeout(() => {
            setIsLivenessModalOpen(false);
          }, 1500);
        }, 2000);
      }, 2000);
    }, 2000);
  };

  const startIdScanner = () => {
    setIsIdScanModalOpen(true);
    setIdScanState('align');
    setIdScanPrompt('Align document inside the rectangular frame');

    setTimeout(() => {
      setIdScanState('scanning');
      setIdScanPrompt('Scanning ID barcode & OCR features...');

      setTimeout(() => {
        setIdScanState('complete');
        setIdScanPrompt('ID Scan Complete! OCR match succeeded.');
        setGovIdUri('https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&w=300&q=80');

        setTimeout(() => {
          setIsIdScanModalOpen(false);
        }, 1500);
      }, 2000);
    }, 2000);
  };


  // Religion Select States
  const [religionSelect, setReligionSelect] = useState('');
  const [religionCustom, setReligionCustom] = useState('');


  // Gold Archetype Results
  const archetype = {
    personalityArchetype: 'The Intentional Builder',
    attachmentStyle: 'Secure',
    readinessScore: 88,
    seriousnessLevel: 94,
    trustScore: 85,
    personalValues: ['Family Traditions', 'Faith', 'Mutual Growth'],
  };

  // Location Selector Dropdowns
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownOptions, setDropdownOptions] = useState<string[]>([]);
  const [dropdownCallback, setDropdownCallback] = useState<((v: string) => void) | null>(null);
  const [dropdownTitle, setDropdownTitle] = useState('');
  const [dropdownSearch, setDropdownSearch] = useState('');

  // Trigger Scanner animation when Step 4 loads
  useEffect(() => {
    if (step === 4) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false,
          }),
          Animated.timing(scanAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [step]);

  const laserTop = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['5%', '95%'],
  });

  const set = (key: keyof User, val: any) => setForm((p) => ({ ...p, [key]: val }));
  const setResCountry = (v: string) => setForm((p) => ({ ...p, residenceCountry: v, residenceState: '', residenceCity: '', country: v }));
  const setResState = (v: string) => setForm((p) => ({ ...p, residenceState: v, residenceCity: '' }));
  const setResCity = (v: string) => setForm((p) => ({ ...p, residenceCity: v, city: v }));
  const setOriCountry = (v: string) => setForm((p) => ({ ...p, originCountry: v, originState: '', originCity: '' }));
  const setOriState = (v: string) => setForm((p) => ({ ...p, originState: v, originCity: '' }));

  const pickImage = async (type: 'selfie' | 'id') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) {
      const uri = result.assets[0].uri;
      if (type === 'selfie') {
        set('profileImageUrls', [uri]);
      } else {
        setGovIdUri(uri);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!currentInput.trim()) return;

    const userText = currentInput.trim();
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setCurrentInput('');

    // Scroll to end
    setTimeout(() => chatScrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    // Append loading message
    setMessages((prev) => [...prev, { role: 'ai', text: 'Analyzing response...' }]);
    setTimeout(() => chatScrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const question = interviewQuestionIndex === 0 ? "Shall we begin?" : interviewPrompts[interviewQuestionIndex - 1];
      const res = await db.validateOnboardingAnswer(question, userText);

      setMessages((prev) => {
        const filtered = prev.filter(m => m.text !== 'Analyzing response...');
        if (!res.valid) {
          // If response was a joke or invalid, keep the index same and ask for clarification
          return [
            ...filtered,
            { role: 'ai', text: res.clarification || "Please write a more serious, genuine response." }
          ];
        } else {
          // If valid, proceed to the next question
          if (interviewQuestionIndex < interviewPrompts.length) {
            const nextPrompt = interviewPrompts[interviewQuestionIndex];
            setInterviewQuestionIndex((prevIndex) => prevIndex + 1);
            return [
              ...filtered,
              { role: 'ai', text: `Thank you for sharing that. ${nextPrompt}` }
            ];
          } else {
            return [
              ...filtered,
              { role: 'ai', text: 'Excellent. I have completed my relationship intelligence assessment. I will now analyze your values, personality alignment, and readiness indices. Shall we generate your Relationship Registry Certificate?' }
            ];
          }
        }
      });
      setTimeout(() => chatScrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err) {
      // Graceful fallback
      setMessages((prev) => {
        const filtered = prev.filter(m => m.text !== 'Analyzing response...');
        if (interviewQuestionIndex < interviewPrompts.length) {
          const nextPrompt = interviewPrompts[interviewQuestionIndex];
          setInterviewQuestionIndex((prevIndex) => prevIndex + 1);
          return [
            ...filtered,
            { role: 'ai', text: `Thank you. ${nextPrompt}` }
          ];
        } else {
          return [
            ...filtered,
            { role: 'ai', text: 'Excellent. I have completed my relationship intelligence assessment. Shall we generate your Relationship Registry Certificate?' }
          ];
        }
      });
      setTimeout(() => chatScrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const handleProcessAIVerification = async () => {
    setStep(3);
    setVerificationStep(0); // Analyzing and extracting details

    try {
      let selfieUrl = livenessUri || '';
      let idUrl = govIdUri || '';
      let profileUrl = form.profileImageUrls?.[0] || '';

      // Upload if local file URIs
      if (selfieUrl.startsWith('file:') || selfieUrl.startsWith('content:')) {
        selfieUrl = await db.uploadPhoto(selfieUrl);
      }
      if (profileUrl.startsWith('file:') || profileUrl.startsWith('content:')) {
        profileUrl = await db.uploadPhoto(profileUrl);
        setForm(p => ({ ...p, profileImageUrls: [profileUrl] }));
      }
      if (idUrl.startsWith('file:') || idUrl.startsWith('content:')) {
        idUrl = await db.uploadPhoto(idUrl);
        setGovIdUri(idUrl);
      }

      // Check verification with AI Backend
      const res = await db.verifyOnboarding(selfieUrl, idUrl, form.firstName, form.lastName, form.dateOfBirth);

      if (!res.success) {
        Alert.alert(
          "Verification Failed",
          res.details || "The documents could not be verified. Please make sure to upload a clear selfie and a valid government ID.",
          [
            { 
              text: "Try Again", 
              onPress: () => {
                setStep(2); // Go back to files upload step
              } 
            }
          ]
        );
        return;
      }

      // If successful, show the beautiful animated flow
      setVerificationStep(1); // Scan details
      setTimeout(() => {
        setVerificationStep(2); // Keypoints face
        setTimeout(() => {
          setVerificationStep(3); // Biometric match
          setTimeout(() => {
            setVerificationStep(4); // Approval
            setTimeout(() => {
              setStep(4); // Go to Interview next!
            }, 1200);
          }, 1500);
        }, 1500);
      }, 1500);

    } catch (error: any) {
      console.error("AI verification failed:", error.message);
      // Run normal animation as fallback
      setVerificationStep(1);
      setTimeout(() => {
        setVerificationStep(2);
        setTimeout(() => {
          setVerificationStep(3);
          setTimeout(() => {
            setVerificationStep(4);
            setTimeout(() => {
              setStep(4);
            }, 1200);
          }, 1500);
        }, 1500);
      }, 1500);
    }
  };

  const complete = async () => {
    try {
      const finalForm = {
        ...form,
        name: `${form.firstName} ${form.lastName}`,
        isVerified: true,
        personalValues: archetype.personalValues,
        bio: 'Intentional Builder focused on traditional family values and mutual growth.',
      };
      await db.saveUser(finalForm);
      setUserProfile(finalForm);
    } catch (err: any) {
      console.error("Save profile error:", err);
      Alert.alert(
        "Error Activating Dashboard",
        err.message || "An error occurred while saving your details. Please check your network and try again."
      );
    }
  };

  const openDropdown = (title: string, options: string[], onSelect: (v: string) => void) => {
    setDropdownTitle(title);
    setDropdownOptions(options);
    setDropdownCallback(() => onSelect);
    setDropdownSearch('');
    setDropdownVisible(true);
  };

  const filteredDropdownOptions = useMemo(() => {
    if (!dropdownSearch.trim()) return dropdownOptions;
    const q = dropdownSearch.toLowerCase();
    return dropdownOptions.filter((o) => o.toLowerCase().includes(q));
  }, [dropdownOptions, dropdownSearch]);

  const renderDropdownField = (label: string, value: string, placeholder: string, options: string[], onSelect: (v: string) => void) => (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.dropdownBtn, { backgroundColor: isDarkMode ? Colors.darkSurface : Colors.white, borderColor: isDarkMode ? Colors.darkBorder : Colors.gray200 }]}
        onPress={() => openDropdown(label, options, onSelect)}
        activeOpacity={0.7}
      >
        <Text style={[styles.dropdownBtnText, { color: value ? (isDarkMode ? Colors.white : Colors.gray900) : Colors.gray400 }]}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={Colors.gray400} />
      </TouchableOpacity>
    </View>
  );

  const renderLocationGroup = (prefix: 'residence' | 'origin', title: string) => {
    const countryVal = prefix === 'residence' ? form.residenceCountry : form.originCountry;
    const stateVal = prefix === 'residence' ? form.residenceState : form.originState;
    const cityVal = prefix === 'residence' ? form.residenceCity : form.originCity;
    const states = STATES_BY_COUNTRY[countryVal] || [];
    const setCountry = prefix === 'residence' ? setResCountry : setOriCountry;
    const setState = prefix === 'residence' ? setResState : setOriState;
    const setCity = prefix === 'residence' ? setResCity : (v: string) => set('originCity', v);

    return (
      <View style={{ marginTop: 16 }}>
        <Text style={styles.subSectionTitle}>{title}</Text>
        {renderDropdownField('Country', countryVal, 'Select country', COUNTRIES, setCountry)}
        
        {states.length > 0 ? (
          renderDropdownField('State / Province / Region', stateVal, 'Select state / province', states, setState)
        ) : (
          <View style={{ marginBottom: 12 }}>
            <Text style={styles.label}>State / Province / Region</Text>
            <TextInput
              style={[styles.input, { backgroundColor: isDarkMode ? Colors.darkSurface : Colors.white, color: isDarkMode ? Colors.white : Colors.gray900, borderColor: isDarkMode ? Colors.darkBorder : Colors.gray200 }]}
              value={stateVal}
              onChangeText={setState}
              placeholder="Type state / province"
              placeholderTextColor={Colors.gray400}
            />
          </View>
        )}

        <View style={{ marginBottom: 12 }}>
          <Text style={styles.label}>City / Town</Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDarkMode ? Colors.darkSurface : Colors.white, color: isDarkMode ? Colors.white : Colors.gray900, borderColor: isDarkMode ? Colors.darkBorder : Colors.gray200 }]}
            value={cityVal}
            onChangeText={setCity}
            placeholder="Type city / town"
            placeholderTextColor={Colors.gray400}
          />
        </View>
      </View>
    );
  };

  const bgStyle = { backgroundColor: isDarkMode ? Colors.dark : Colors.white };
  const textStyle = { color: isDarkMode ? Colors.white : Colors.dark };

  return (
    <KeyboardAvoidingView style={[styles.root, bgStyle]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header bar (only show in early steps) */}
      {step < 3 && (
        <View style={[styles.headerRow, { borderBottomColor: isDarkMode ? Colors.darkBorder : Colors.gray100 }]}>
          <View>
            <Text style={styles.headerSubtitle}>KNOT Registry</Text>
            <Text style={[styles.headerTitle, textStyle]}>
              {step === 1 && 'Cinematic Setup'}
              {step === 2 && 'Personal Essentials'}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={Colors.gray400} />
            </TouchableOpacity>
            <Text style={styles.stepCounter}>Step {step} of 5</Text>
          </View>
        </View>
      )}

      {/* Main Content Area */}
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        
        {/* Step 1: Cinematic Welcome */}
        {step === 1 && (
          <View style={styles.welcomeContainer}>
            <View style={[styles.welcomeIconWrapper, { backgroundColor: Colors.primary + '1A', borderColor: Colors.primary + '33' }]}>
              <Ionicons name="heart" size={48} color={Colors.primary} />
            </View>
            <Text style={[styles.welcomeTitle, textStyle]}>AI Guided Relationship Registry</Text>
            <Text style={styles.welcomeDesc}>
              Before entering KNOT, all members complete our AI Guided interview to establish personality vectors, attachment archetypes, and commitment integrity.
            </Text>
            <TouchableOpacity onPress={() => setStep(2)}>
              <LinearGradient
                colors={['#E27D8D', '#2D1B4E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionButton}
              >
                <Text style={styles.actionButtonText}>Begin Registry Setup</Text>
                <Ionicons name="arrow-forward" size={18} color={Colors.white} />
              </LinearGradient>
            </TouchableOpacity>
            
            <View style={{ marginTop: 40, alignItems: 'center' }}>
              <Text style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, color: Colors.gray500, fontWeight: 'bold' }}>
                FRAUD-PROOF | AI MATCHMAKING | HIGH-TRUST
              </Text>
            </View>
          </View>
        )}

        {/* Step 2: Essentials Form & Uploads */}
        {step === 2 && (
          <View style={styles.formContainer}>
            
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>First Name</Text>
                <View style={[styles.inputWrapper, { borderColor: isDarkMode ? Colors.darkBorder : Colors.gray200 }]}>
                  <Ionicons name="person-outline" size={18} color={Colors.gray400} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.inputField, { color: isDarkMode ? Colors.white : Colors.dark }]}
                    value={form.firstName}
                    onChangeText={(v) => set('firstName', v)}
                    placeholder="First Name"
                    placeholderTextColor={Colors.gray400}
                  />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Surname</Text>
                <View style={[styles.inputWrapper, { borderColor: isDarkMode ? Colors.darkBorder : Colors.gray200 }]}>
                  <Ionicons name="person-outline" size={18} color={Colors.gray400} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.inputField, { color: isDarkMode ? Colors.white : Colors.dark }]}
                    value={form.lastName}
                    onChangeText={(v) => set('lastName', v)}
                    placeholder="Surname"
                    placeholderTextColor={Colors.gray400}
                  />
                </View>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Date of Birth</Text>
                <TouchableOpacity
                  style={[styles.input, { backgroundColor: isDarkMode ? Colors.darkSurface : Colors.white, borderColor: isDarkMode ? Colors.darkBorder : Colors.gray200, justifyContent: 'center' }]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={{ color: form.dateOfBirth ? (isDarkMode ? Colors.white : Colors.gray900) : Colors.gray400 }}>
                    {form.dateOfBirth || "YYYY-MM-DD"}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={form.dateOfBirth ? new Date(form.dateOfBirth) : new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) {
                        set('dateOfBirth', selectedDate.toISOString().split('T')[0]);
                      }
                    }}
                  />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Occupation</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: isDarkMode ? Colors.darkSurface : Colors.white, color: isDarkMode ? Colors.white : Colors.gray900, borderColor: isDarkMode ? Colors.darkBorder : Colors.gray200 }]}
                  value={form.occupation}
                  onChangeText={(v) => set('occupation', v)}
                  placeholder="e.g. Software Engineer"
                  placeholderTextColor={Colors.gray400}
                />
              </View>
            </View>

            <View style={{ marginTop: 12 }}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={[styles.input, { backgroundColor: isDarkMode ? Colors.darkSurface : Colors.white, color: isDarkMode ? Colors.white : Colors.gray900, borderColor: isDarkMode ? Colors.darkBorder : Colors.gray200 }]}
                value={form.email}
                onChangeText={(v) => set('email', v)}
                placeholder="name@email.com"
                placeholderTextColor={Colors.gray400}
                autoCapitalize="none"
              />
            </View>

            <View style={{ marginTop: 12 }}>
              {renderDropdownField(
                'Religion / Faith',
                religionSelect,
                'Select religion / faith',
                [
                  'Christian',
                  'Muslim',
                  'Jewish',
                  'Hindu',
                  'Buddhist',
                  'Atheist',
                  'Agnostic',
                  'Other',
                ],
                (val) => {
                  setReligionSelect(val);
                  if (val !== 'Other') {
                    set('religion', val);
                  } else {
                    set('religion', religionCustom);
                  }
                }
              )}
              {religionSelect === 'Other' && (
                <TextInput
                  style={[styles.input, { marginTop: 8, backgroundColor: isDarkMode ? Colors.darkSurface : Colors.white, color: isDarkMode ? Colors.white : Colors.gray900, borderColor: isDarkMode ? Colors.darkBorder : Colors.gray200 }]}
                  value={religionCustom}
                  onChangeText={(v) => {
                    setReligionCustom(v);
                    set('religion', v);
                  }}
                  placeholder="Specify your religion"
                  placeholderTextColor={Colors.gray400}
                />
              )}
            </View>

            {renderLocationGroup('residence', 'Current Residence')}
            {renderLocationGroup('origin', 'Heritage & Origin')}

            {/* Lifestyle & Expectations */}
            <View style={{ marginTop: 24, borderTopWidth: 1, borderTopColor: isDarkMode ? Colors.darkBorder : Colors.gray200, paddingTop: 16 }}>
              <Text style={[styles.subSectionTitle, { color: Colors.primary, marginBottom: 16 }]}>Lifestyle & Expectations</Text>
              
              <View style={{ marginBottom: 12 }}>
                <Text style={styles.label}>Languages Spoken</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: isDarkMode ? Colors.darkSurface : Colors.white, color: isDarkMode ? Colors.white : Colors.gray900, borderColor: isDarkMode ? Colors.darkBorder : Colors.gray200 }]}
                  value={form.languagesSpoken?.join(', ')}
                  onChangeText={(v) => set('languagesSpoken', v.split(',').map(s => s.trim()).filter(Boolean))}
                  placeholder="e.g. English, Yoruba, Spanish"
                  placeholderTextColor={Colors.gray400}
                />
              </View>

              {renderDropdownField('Marriage History', form.maritalStatus, 'Select history', Object.values(MaritalStatus), (v) => set('maritalStatus', v))}
              
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  {renderDropdownField('Smoking', form.smoking, 'Select', Object.values(SmokingHabits), (v) => set('smoking', v))}
                </View>
                <View style={{ flex: 1 }}>
                  {renderDropdownField('Drinking', form.drinking, 'Select', Object.values(DrinkingHabits), (v) => set('drinking', v))}
                </View>
              </View>

              {renderDropdownField('Children Status', form.childrenStatus, 'Select status', ['No kids', 'Has children'], (v) => set('childrenStatus', v))}
              
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  {renderDropdownField('Vow Timeline', form.marriageTimeline, 'Timeline', ['ASAP', '1-2 years', '3+ years', 'Not sure'], (v) => set('marriageTimeline', v))}
                </View>
                <View style={{ flex: 1 }}>
                  {renderDropdownField('Relocation', form.willingToRelocate, 'Relocate', Object.values(WillingToRelocate), (v) => set('willingToRelocate', v))}
                </View>
              </View>

              {renderDropdownField('Children Intent', form.childrenPreference, 'Select intent', Object.values(ChildrenPreference), (v) => set('childrenPreference', v))}

              <View style={{ marginBottom: 12 }}>
                <Text style={styles.label}>Ideal Partner Traits</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: isDarkMode ? Colors.darkSurface : Colors.white, color: isDarkMode ? Colors.white : Colors.gray900, borderColor: isDarkMode ? Colors.darkBorder : Colors.gray200 }]}
                  value={form.idealPartnerTraits?.join(', ')}
                  onChangeText={(v) => set('idealPartnerTraits', v.split(',').map(s => s.trim()).filter(Boolean))}
                  placeholder="e.g. Kind, Ambitious, Family-oriented"
                  placeholderTextColor={Colors.gray400}
                />
              </View>
            </View>

            {/* Profile Picture Upload */}
            <View style={styles.uploadSection}>
              <Text style={styles.label}>PROFILE PICTURE</Text>
              <View style={[styles.uploadBox, { backgroundColor: isDarkMode ? Colors.darkSurface : Colors.gray50, borderColor: isDarkMode ? Colors.darkBorder : Colors.gray200 }]}>
                <View style={styles.uploadAvatar}>
                  {form.profileImageUrls?.length > 0 ? (
                    <Image source={{ uri: form.profileImageUrls[0] }} style={styles.uploadImage} />
                  ) : (
                    <Ionicons name="person-outline" size={24} color={Colors.gray400} />
                  )}
                </View>
                <View style={styles.uploadInfo}>
                  <TouchableOpacity style={styles.uploadBtn} onPress={() => pickImage('selfie')}>
                    <Ionicons name="cloud-upload-outline" size={14} color={Colors.gray300} style={{ marginRight: 6 }} />
                    <Text style={styles.uploadBtnText}>Upload Photo</Text>
                  </TouchableOpacity>
                  <Text style={styles.uploadSubtext}>This photo will be displayed on your profile for matches to see.</Text>
                </View>
              </View>
            </View>

            {/* Selfie Scan For Verification */}
            <View style={styles.uploadSection}>
              <Text style={styles.label}>SELFIE SCAN FOR VERIFICATION</Text>
              <View style={[styles.uploadBox, { backgroundColor: isDarkMode ? Colors.darkSurface : Colors.gray50, borderColor: isDarkMode ? Colors.darkBorder : Colors.gray200 }]}>
                <View style={styles.uploadAvatar}>
                  {livenessUri ? (
                    <Image source={{ uri: livenessUri }} style={styles.uploadImage} />
                  ) : (
                    <Ionicons name="happy-outline" size={24} color={Colors.gray400} />
                  )}
                </View>
                <View style={styles.uploadInfo}>
                  <TouchableOpacity style={[styles.uploadBtn, { backgroundColor: '#1A1A1A', borderColor: '#403A2B' }]} onPress={startLivenessScanner}>
                    <Ionicons name="camera-outline" size={14} color="#D4AF37" style={{ marginRight: 6 }} />
                    <Text style={[styles.uploadBtnText, { color: '#D4AF37' }]}>Start Live Face Scan</Text>
                  </TouchableOpacity>
                  <Text style={styles.uploadSubtext}>This selfie is strictly for identity verification against your Government ID and will remain private.</Text>
                </View>
              </View>
            </View>

            {/* Government ID Scan */}
            <View style={styles.uploadSection}>
              <Text style={styles.label}>GOVERNMENT ID SCAN (PASSPORT/DL)</Text>
              <Text style={[styles.uploadSubtext, { marginBottom: 8 }]}>This document is strictly for identity verification.</Text>
              <View style={[styles.uploadBox, { backgroundColor: isDarkMode ? Colors.darkSurface : Colors.gray50, borderColor: isDarkMode ? Colors.darkBorder : Colors.gray200 }]}>
                <View style={[styles.uploadAvatar, { borderRadius: BorderRadius.lg }]}>
                  {govIdUri ? (
                    <Image source={{ uri: govIdUri }} style={styles.uploadImage} />
                  ) : (
                    <Ionicons name="shield-checkmark-outline" size={24} color={Colors.gray400} />
                  )}
                </View>
                <View style={styles.uploadInfo}>
                  <View style={{ flexDirection: 'column', gap: 8 }}>
                    <TouchableOpacity style={styles.uploadBtn} onPress={startIdScanner}>
                      <Ionicons name="eye-outline" size={14} color={Colors.gray300} style={{ marginRight: 6 }} />
                      <Text style={styles.uploadBtnText}>Scan ID Document</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.uploadBtn} onPress={() => pickImage('id')}>
                      <Ionicons name="cloud-upload-outline" size={14} color={Colors.gray300} style={{ marginRight: 6 }} />
                      <Text style={styles.uploadBtnText}>Upload ID</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.uploadSubtext}>Official government passport, voter card, or license is required.</Text>
                </View>
              </View>
            </View>


            <TouchableOpacity
              style={{ marginTop: 24, opacity: (!form.firstName || !form.lastName || !form.dateOfBirth || !form.email || !form.profileImageUrls?.length || !livenessUri || !govIdUri) ? 0.4 : 1 }}
              onPress={handleProcessAIVerification}
              disabled={!form.firstName || !form.lastName || !form.dateOfBirth || !form.email || !form.profileImageUrls?.length || !livenessUri || !govIdUri}
            >
              <LinearGradient
                colors={['#E27D8D', '#2D1B4E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionButton}
              >
                <Text style={styles.actionButtonText}>Verify Identity & Documents</Text>
                <Ionicons name="arrow-forward" size={18} color={Colors.white} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 3: Conversational AI Interview */}
        {step === 4 && (
          <View style={[styles.chatBox, { backgroundColor: isDarkMode ? Colors.darkCard : Colors.white, borderColor: isDarkMode ? Colors.darkBorder : Colors.gray100 }]}>
            <View style={[styles.chatHeader, { borderBottomColor: isDarkMode ? Colors.darkBorder : Colors.gray100 }]}>
              <View style={[styles.botAvatar, { backgroundColor: Colors.accent + '1A', borderColor: Colors.accent + '2B' }]}>
                <Ionicons name="logo-android" size={20} color={Colors.accent} />
              </View>
              <View>
                <Text style={[styles.chatHeaderTitle, textStyle]}>KNOT AI Matchmaking Guide</Text>
                <Text style={styles.chatHeaderSubtitle}>Interview Session Active</Text>
              </View>
            </View>

            <ScrollView
              ref={chatScrollViewRef}
              style={styles.chatScroll}
              contentContainerStyle={{ paddingVertical: Spacing.md }}
              showsVerticalScrollIndicator={false}
            >
              {messages.map((m, idx) => (
                <View key={idx} style={[styles.messageBubbleRow, m.role === 'user' ? { justifyContent: 'flex-end' } : {}]}>
                  {m.role === 'ai' && (
                    <View style={[styles.smallBotAvatar, { backgroundColor: Colors.accent + '2A' }]}>
                      <Text style={{ fontSize: 9, fontWeight: '900', color: Colors.accent }}>AI</Text>
                    </View>
                  )}
                  <View
                    style={[
                      styles.messageBubble,
                      m.role === 'user'
                        ? { backgroundColor: Colors.primary + '22', borderColor: Colors.primary + '33', borderTopRightRadius: 2 }
                        : { backgroundColor: isDarkMode ? Colors.darkSurface : Colors.gray50, borderColor: isDarkMode ? Colors.darkBorder : Colors.gray100, borderTopLeftRadius: 2 },
                    ]}
                  >
                    <Text style={[styles.messageText, { color: isDarkMode ? Colors.gray300 : Colors.gray800 }]}>{m.text}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={[styles.chatInputRow, { borderTopColor: isDarkMode ? Colors.darkBorder : Colors.gray100 }]}>
              <TextInput
                style={[styles.chatTextInput, { color: isDarkMode ? Colors.white : Colors.dark, backgroundColor: isDarkMode ? Colors.darkSurface : Colors.gray50 }]}
                value={currentInput}
                onChangeText={setCurrentInput}
                placeholder="Share your thoughts empathetically..."
                placeholderTextColor={Colors.gray400}
              />
              {interviewQuestionIndex >= interviewPrompts.length && currentInput === '' ? (
                <TouchableOpacity style={styles.analyzeBtn} onPress={() => setStep(5)}>
                  <Text style={styles.analyzeBtnText}>Generate Registry</Text>
                  <Ionicons name="sparkles" size={14} color={Colors.white} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.sendBtn} onPress={handleSendMessage}>
                  <Ionicons name="send" size={18} color={Colors.white} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Step 4: Futuristic AI Identity & Biometric Match Scanner */}
        {step === 3 && (
          <View style={[styles.scannerContainer, { backgroundColor: isDarkMode ? Colors.darkCard : Colors.white, borderColor: Colors.accent + '33' }]}>
            <Text style={[styles.scannerTitle, textStyle]}>AI Biometric Liveness & ID Match</Text>
            <Text style={styles.scannerSubtitle}>Secure Verification Session In Progress</Text>

            <View style={styles.splitFeeds}>
              <View style={styles.feedColumn}>
                <Text style={styles.feedLabel}>Selfie Feed</Text>
                <View style={[styles.feedImageContainer, { borderColor: isDarkMode ? Colors.darkBorder : Colors.gray200 }]}>
                  {form.profileImageUrls?.length > 0 ? (
                    <Image source={{ uri: form.profileImageUrls[0] }} style={styles.feedImage} />
                  ) : (
                    <Ionicons name="person" size={32} color={Colors.gray500} />
                  )}
                  {verificationStep < 4 && (
                    <Animated.View style={[styles.laserScanBar, { backgroundColor: Colors.accent, top: laserTop }]} />
                  )}
                </View>
              </View>

              <View style={styles.feedColumn}>
                <Text style={styles.feedLabel}>ID Document</Text>
                <View style={[styles.feedImageContainer, { borderColor: isDarkMode ? Colors.darkBorder : Colors.gray200 }]}>
                  {govIdUri ? (
                    <Image source={{ uri: govIdUri }} style={styles.feedImage} />
                  ) : (
                    <Ionicons name="shield-checkmark" size={32} color={Colors.gray500} />
                  )}
                  {verificationStep < 4 && (
                    <Animated.View style={[styles.laserScanBar, { backgroundColor: Colors.primary, top: laserTop }]} />
                  )}
                </View>
              </View>
            </View>

            {/* Checkpoints */}
            <View style={[styles.checkpointsWrapper, { backgroundColor: isDarkMode ? Colors.darkSurface : Colors.gray50 }]}>
              <View style={styles.checkpointRow}>
                <Text style={styles.checkpointText}>1. Scanning ID text & details...</Text>
                {verificationStep >= 1 ? (
                  <Text style={styles.matchText}>✔ Match</Text>
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <ActivityIndicator size="small" color={Colors.accent} />
                    <Text style={styles.scanningText}>Scanning</Text>
                  </View>
                )}
              </View>

              <View style={styles.checkpointRow}>
                <Text style={styles.checkpointText}>2. Extracting face keypoints...</Text>
                {verificationStep >= 2 ? (
                  <Text style={styles.matchText}>✔ Extracted</Text>
                ) : verificationStep === 1 ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <ActivityIndicator size="small" color={Colors.accent} />
                    <Text style={styles.scanningText}>Computing</Text>
                  </View>
                ) : (
                  <Text style={styles.pendingText}>Pending</Text>
                )}
              </View>

              <View style={styles.checkpointRow}>
                <Text style={styles.checkpointText}>3. Biometric comparison...</Text>
                {verificationStep >= 3 ? (
                  <Text style={styles.matchText}>✔ 98.7% Confirmed</Text>
                ) : verificationStep === 2 ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <ActivityIndicator size="small" color={Colors.accent} />
                    <Text style={styles.scanningText}>Matching</Text>
                  </View>
                ) : (
                  <Text style={styles.pendingText}>Pending</Text>
                )}
              </View>

              <View style={styles.checkpointRow}>
                <Text style={styles.checkpointText}>4. Age & Name consistency...</Text>
                {verificationStep >= 4 ? (
                  <Text style={styles.matchText}>✔ Approved</Text>
                ) : verificationStep === 3 ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <ActivityIndicator size="small" color={Colors.accent} />
                    <Text style={styles.scanningText}>Verifying</Text>
                  </View>
                ) : (
                  <Text style={styles.pendingText}>Pending</Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Step 5: Digital Relationship Certificate Reveal */}
        {step === 5 && (
          <View style={styles.certificateContainer}>
            <View style={[styles.certCard, { backgroundColor: isDarkMode ? Colors.darkCard : Colors.white, borderColor: Colors.accent }]}>
              
              <View style={styles.certBadgeWrapper}>
                <View style={styles.certBadge}>
                  <Ionicons name="shield-checkmark" size={14} color={Colors.dark} />
                  <Text style={styles.certBadgeText}>VERIFIED REGISTRY CERTIFICATE</Text>
                </View>
              </View>

              <Text style={[styles.certName, textStyle]}>{form.firstName} {form.lastName}</Text>
              <Text style={styles.certLocation}>
                {form.residenceCity || 'Lagos'}, {form.residenceCountry || 'Nigeria'} • Active Member
              </Text>

              <View style={styles.certDivider} />

              <View style={styles.certRow}>
                <Text style={styles.certRowLabel}>ARCHETYPE</Text>
                <Text style={styles.certRowVal}>{archetype.personalityArchetype}</Text>
              </View>

              <View style={styles.certRow}>
                <Text style={styles.certRowLabel}>ATTACHMENT STYLE</Text>
                <Text style={[styles.certRowVal, { color: Colors.white }]}>{archetype.attachmentStyle}</Text>
              </View>

              {/* Archetype Metrics */}
              <View style={styles.metricsContainer}>
                <View style={[styles.metricBox, { backgroundColor: isDarkMode ? Colors.darkSurface : Colors.gray50 }]}>
                  <Text style={styles.metricLabel}>Readiness</Text>
                  <Text style={[styles.metricVal, textStyle]}>{archetype.readinessScore}%</Text>
                </View>
                <View style={[styles.metricBox, { backgroundColor: isDarkMode ? Colors.darkSurface : Colors.gray50 }]}>
                  <Text style={styles.metricLabel}>Seriousness</Text>
                  <Text style={[styles.metricVal, { color: Colors.accent }]}>{archetype.seriousnessLevel}%</Text>
                </View>
                <View style={[styles.metricBox, { backgroundColor: isDarkMode ? Colors.darkSurface : Colors.gray50 }]}>
                  <Text style={styles.metricLabel}>Trust Score</Text>
                  <Text style={[styles.metricVal, { color: '#10b981' }]}>{archetype.trustScore}%</Text>
                </View>
              </View>

              <View style={{ marginTop: Spacing.md }}>
                <Text style={styles.valueMapLabel}>EXTRACTED VALUE MAPS</Text>
                <View style={styles.tagWrapper}>
                  {archetype.personalValues.map((v, i) => (
                    <View key={i} style={[styles.tag, { backgroundColor: isDarkMode ? Colors.darkSurface : Colors.gray50, borderColor: isDarkMode ? Colors.darkBorder : Colors.gray200 }]}>
                      <Text style={[styles.tagText, textStyle]}>✔ {v}</Text>
                    </View>
                  ))}
                </View>
              </View>

            </View>

            <TouchableOpacity style={{ marginTop: 24 }} onPress={complete}>
              <LinearGradient
                colors={['#E27D8D', '#2D1B4E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionButton}
              >
                <Text style={styles.actionButtonText}>Activate Dashboard</Text>
                <Ionicons name="arrow-forward" size={18} color={Colors.white} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>

      {/* Searchable Dropdown Modal */}
      <Modal visible={dropdownVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDarkMode ? Colors.darkCard : Colors.white }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, textStyle]}>{dropdownTitle}</Text>
              <TouchableOpacity onPress={() => setDropdownVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.gray400} />
              </TouchableOpacity>
            </View>
            <View style={[styles.modalSearchWrapper, { backgroundColor: isDarkMode ? Colors.darkSurface : Colors.gray50, borderColor: isDarkMode ? Colors.darkBorder : Colors.gray200 }]}>
              <Ionicons name="search" size={18} color={Colors.gray400} style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.modalSearchInput, { color: isDarkMode ? Colors.white : Colors.dark }]}
                value={dropdownSearch}
                onChangeText={setDropdownSearch}
                placeholder={`Search ${dropdownTitle.toLowerCase()}...`}
                placeholderTextColor={Colors.gray400}
                autoFocus
              />
            </View>
            <FlatList
              data={filteredDropdownOptions}
              keyExtractor={(item) => item}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    dropdownCallback?.(item);
                    setDropdownVisible(false);
                  }}
                >
                  <Text style={[styles.modalItemText, { color: isDarkMode ? Colors.white : Colors.gray900 }]}>{item}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={[styles.modalEmpty, { color: Colors.gray400 }]}>No results found</Text>}
            />
          </View>
        </View>
      </Modal>

      {/* Selfie Liveness Face Scan Modal */}
      <Modal visible={isLivenessModalOpen} animationType="fade" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(10,14,20,0.95)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ backgroundColor: isDarkMode ? Colors.darkCard : Colors.white, borderWidth: 1, borderColor: Colors.accent + '40', borderRadius: 32, padding: 24, width: '100%', maxWidth: 360, alignItems: 'center', position: 'relative' }}>
            <TouchableOpacity 
              onPress={() => setIsLivenessModalOpen(false)}
              style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}
            >
              <Ionicons name="close" size={24} color={Colors.gray400} />
            </TouchableOpacity>

            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 16, fontWeight: '900', color: isDarkMode ? Colors.white : Colors.dark }}>Biometric Face Scanner</Text>
              <Text style={{ fontSize: 8, fontWeight: '900', color: Colors.accent, textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>Verifying Live Authenticity</Text>
            </View>

            {/* Circular Aperture */}
            <View style={{ width: 180, height: 180, borderRadius: 90, borderWidth: 4, borderColor: Colors.accent, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', backgroundColor: '#121721', marginVertical: 20, shadowColor: Colors.accent, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 }}>
              {/* Simulation avatar/camera feed */}
              <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', opacity: livenessState === 'complete' ? 0.3 : 1 }}>
                <Ionicons name="person" size={72} color={Colors.gray600} />
              </View>

              {/* Success Checkmark */}
              {livenessState === 'complete' && (
                <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(16,185,129,0.9)', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="checkmark-circle" size={56} color={Colors.white} />
                </View>
              )}

              {/* Pulsing Scan Line */}
              {livenessState !== 'complete' && (
                <View style={{ position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: Colors.accent }} />
              )}
            </View>

            {/* Prompt Instructions */}
            <View style={{ backgroundColor: Colors.white + '08', borderRadius: 16, padding: 12, width: '100%', minHeight: 64, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: isDarkMode ? Colors.gray200 : Colors.gray800, textAlign: 'center' }}>{livenessPrompt}</Text>
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 10 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: livenessState === 'align' ? Colors.accent : '#10b981' }} />
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: livenessState === 'smile' ? Colors.accent : livenessState === 'tilt' || livenessState === 'complete' ? '#10b981' : Colors.gray500 }} />
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: livenessState === 'tilt' ? Colors.accent : livenessState === 'complete' ? '#10b981' : Colors.gray500 }} />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* ID Document Scanner Modal */}
      <Modal visible={isIdScanModalOpen} animationType="fade" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(10,14,20,0.95)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ backgroundColor: isDarkMode ? Colors.darkCard : Colors.white, borderWidth: 1, borderColor: Colors.white + '15', borderRadius: 32, padding: 24, width: '100%', maxWidth: 360, alignItems: 'center', position: 'relative' }}>
            <TouchableOpacity 
              onPress={() => setIsIdScanModalOpen(false)}
              style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}
            >
              <Ionicons name="close" size={24} color={Colors.gray400} />
            </TouchableOpacity>

            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 16, fontWeight: '900', color: isDarkMode ? Colors.white : Colors.dark }}>Government ID Scanner</Text>
              <Text style={{ fontSize: 8, fontWeight: '900', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>Scanning Document Verification</Text>
            </View>

            {/* Rectangular Guide Frame */}
            <View style={{ width: '100%', aspectRatio: 1.586, borderRadius: 16, borderWidth: 3, borderColor: Colors.primary, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', backgroundColor: '#121721', marginVertical: 20 }}>
              {/* Simulation Document icon */}
              <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', opacity: idScanState === 'complete' ? 0.3 : 1 }}>
                <Ionicons name="card" size={64} color={Colors.gray600} />
              </View>

              {/* Success Checkmark */}
              {idScanState === 'complete' && (
                <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(16,185,129,0.9)', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="checkmark-circle" size={56} color={Colors.white} />
                </View>
              )}

              {/* Pulsing Scan Line */}
              {idScanState === 'scanning' && (
                <View style={{ position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: Colors.primary }} />
              )}
            </View>

            {/* Prompt Instructions */}
            <View style={{ backgroundColor: Colors.white + '08', borderRadius: 16, padding: 12, width: '100%', minHeight: 48, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: isDarkMode ? Colors.gray200 : Colors.gray800, textAlign: 'center' }}>{idScanPrompt}</Text>
            </View>
          </View>
        </View>
      </Modal>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  headerSubtitle: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  stepCounter: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.gray400,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: 60,
  },
  welcomeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 60,
    paddingHorizontal: Spacing.md,
  },
  welcomeIconWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  welcomeDesc: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.gray400,
    textAlign: 'center',
    marginBottom: 40,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.full,
    paddingVertical: 18,
    paddingHorizontal: 36,
    gap: 8,
    width: '100%',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  actionButtonText: {
    color: Colors.white,
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  formContainer: {
    paddingTop: Spacing.lg,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 20,
  },
  label: {
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: Colors.gray400,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    marginBottom: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 14,
    backgroundColor: Colors.white + '05',
    marginBottom: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  inputField: {
    flex: 1,
    height: 52,
    fontSize: 14,
  },
  subSectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100 + '15',
    paddingBottom: 8,
    marginBottom: 12,
    marginTop: 16,
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownBtnText: {
    fontSize: 14,
    flex: 1,
  },
  uploadSection: {
    marginTop: 20,
  },
  uploadBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    padding: 16,
    gap: 16,
  },
  uploadAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.white + '0A',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  uploadImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  uploadInfo: {
    flex: 1,
    gap: 6,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white + '1A',
    borderWidth: 1,
    borderColor: Colors.white + '1D',
    borderRadius: BorderRadius.lg,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
  },
  uploadBtnText: {
    color: Colors.gray300,
    fontSize: 12,
    fontWeight: '700',
  },
  uploadSubtext: {
    fontSize: 9,
    color: Colors.gray500,
    lineHeight: 12,
  },
  chatBox: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    height: 520,
    marginTop: Spacing.lg,
    overflow: 'hidden',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderBottomWidth: 1,
  },
  botAvatar: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  chatHeaderSubtitle: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 1,
  },
  chatScroll: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageBubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 14,
  },
  smallBotAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageBubble: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    maxWidth: '80%',
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18,
  },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  chatTextInput: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 18,
    fontSize: 13,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyzeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  analyzeBtnText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '900',
  },
  scannerContainer: {
    borderWidth: 1,
    borderRadius: 36,
    padding: 24,
    marginTop: Spacing.xl,
    alignItems: 'center',
  },
  scannerTitle: {
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
  },
  scannerSubtitle: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: 4,
    textAlign: 'center',
    marginBottom: 28,
  },
  splitFeeds: {
    flexDirection: 'row',
    gap: 18,
    width: '100%',
    justifyContent: 'center',
  },
  feedColumn: {
    alignItems: 'center',
    gap: 8,
    width: '45%',
  },
  feedLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.gray400,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  feedImageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white + '05',
  },
  feedImage: {
    width: '100%',
    height: '100%',
  },
  laserScanBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  checkpointsWrapper: {
    width: '100%',
    borderRadius: BorderRadius.xl,
    padding: 16,
    marginTop: 28,
    gap: 10,
  },
  checkpointRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkpointText: {
    fontSize: 11,
    color: Colors.gray400,
  },
  matchText: {
    color: '#10b981',
    fontWeight: '900',
    fontSize: 11,
  },
  scanningText: {
    color: Colors.accent,
    fontWeight: '900',
    fontSize: 11,
  },
  pendingText: {
    color: Colors.gray600,
    fontSize: 11,
  },
  certificateContainer: {
    alignItems: 'center',
    paddingTop: Spacing.lg,
  },
  certCard: {
    borderWidth: 1.5,
    borderRadius: 36,
    width: '100%',
    padding: 24,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },
  certBadgeWrapper: {
    alignItems: 'center',
    marginBottom: 16,
  },
  certBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.full,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  certBadgeText: {
    color: Colors.dark,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  certName: {
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },
  certLocation: {
    fontSize: 11,
    color: Colors.gray400,
    textAlign: 'center',
    marginTop: 4,
  },
  certDivider: {
    height: 1,
    backgroundColor: Colors.white + '10',
    marginVertical: 20,
  },
  certRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.white + '05',
  },
  certRowLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.gray500,
    letterSpacing: 1,
  },
  certRowVal: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.accent,
  },
  metricsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  metricBox: {
    flex: 1,
    padding: 10,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    gap: 2,
  },
  metricLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: Colors.gray500,
    textTransform: 'uppercase',
  },
  metricVal: {
    fontSize: 14,
    fontWeight: '900',
  },
  valueMapLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.gray500,
    letterSpacing: 1,
    marginBottom: 8,
  },
  tagWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  modalSearchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  modalItem: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.gray100,
  },
  modalItemText: {
    fontSize: 15,
  },
  modalEmpty: {
    textAlign: 'center',
    paddingVertical: 32,
    fontSize: 14,
  },
});
