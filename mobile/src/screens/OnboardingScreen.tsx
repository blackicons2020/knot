import React, { useState, useMemo } from 'react';
import {
  Alert, FlatList, Image, KeyboardAvoidingView, Modal, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Colors, Spacing, BorderRadius } from '../theme/colors';
import {
  RootStackParamList, User, SmokingHabits, DrinkingHabits,
  ChildrenPreference, WillingToRelocate,
} from '../types';
import { COUNTRIES, STATES_BY_COUNTRY, CITIES_BY_STATE, MANUAL_ENTRY_VAL } from '../services/locationData';
import { db } from '../services/apiService';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function OnboardingScreen() {
  const navigation = useNavigation<Nav>();
  const { userProfile, setUserProfile } = useAuth();
  const { isDarkMode } = useTheme();

  const [step, setStep] = useState(1);
  const totalSteps = 5;
  const [form, setForm] = useState<User>({
    id: userProfile?.id || '',
    email: userProfile?.email || '',
    name: '', age: 25, bio: '', interests: [], profileImageUrls: [],
    isVerified: false, isPremium: false, occupation: '',
    city: '', country: '', residenceCountry: '', residenceState: '', residenceCity: '',
    originCountry: '', originState: '', originCity: '',
    education: '', languages: [], religion: '', culturalBackground: '',
    personalValues: [], smoking: SmokingHabits.NonSmoker, drinking: DrinkingHabits.Never,
    maritalStatus: 'Never Married' as any, childrenStatus: '',
    marriageTimeline: 'ASAP', willingToRelocate: WillingToRelocate.Maybe,
    preferredMarryFrom: '', childrenPreference: ChildrenPreference.OpenToChildren,
    idealPartnerTraits: [], marriageExpectations: '',
    preferredPartnerAgeRange: [18, 99], nationality: '', careerGoals: '',
  });

  const set = (key: keyof User, val: any) => setForm((p) => ({ ...p, [key]: val }));
  const setResCountry = (v: string) => setForm((p) => ({ ...p, residenceCountry: v, residenceState: '', residenceCity: '', country: v }));
  const setResState = (v: string) => setForm((p) => ({ ...p, residenceState: v, residenceCity: '' }));
  const setResCity = (v: string) => setForm((p) => ({ ...p, residenceCity: v, city: v }));
  const setOriCountry = (v: string) => setForm((p) => ({ ...p, originCountry: v, originState: '', originCity: '' }));
  const setOriState = (v: string) => setForm((p) => ({ ...p, originState: v, originCity: '' }));

  const next = () => {
    if (step === 1 && (!form.residenceCountry || !form.originCountry || !form.residenceCity || !form.originCity)) {
      Alert.alert('Required', 'Please complete residence and origin details.');
      return;
    }
    if (step === 4 && form.profileImageUrls.length === 0) {
      Alert.alert('Required', 'A profile picture is mandatory.');
      return;
    }
    if (step === 5 && !form.isVerified) {
      Alert.alert('Required', 'Verification is mandatory to complete signup.');
      return;
    }
    if (step < totalSteps) setStep(step + 1);
    else complete();
  };
  const prev = () => { if (step > 1) setStep(step - 1); };

  const complete = async () => {
    await db.saveUser(form);
    setUserProfile(form);
  };

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      set('profileImageUrls', [result.assets[0].uri]);
    }
  };

  const labelStyle = [s.label, { color: isDarkMode ? Colors.gray400 : Colors.gray400 }];
  const inputStyle = [s.input, { backgroundColor: isDarkMode ? Colors.darkSurface : Colors.white, color: isDarkMode ? Colors.white : Colors.gray900, borderColor: isDarkMode ? Colors.darkBorder : Colors.gray200 }];

  // Dropdown state
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownOptions, setDropdownOptions] = useState<string[]>([]);
  const [dropdownCallback, setDropdownCallback] = useState<((v: string) => void) | null>(null);
  const [dropdownTitle, setDropdownTitle] = useState('');
  const [dropdownSearch, setDropdownSearch] = useState('');

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

  const renderPicker = (label: string, value: string, options: string[], onSelect: (v: string) => void) => (
    <View style={{ marginBottom: 16 }}>
      <Text style={labelStyle}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
        {options.map((o) => (
          <TouchableOpacity
            key={o}
            style={[s.chip, value === o && { backgroundColor: Colors.primary, borderColor: Colors.primary }]}
            onPress={() => onSelect(o)}
          >
            <Text style={[s.chipText, value === o && { color: Colors.white }]}>{o}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderDropdownField = (label: string, value: string, placeholder: string, options: string[], onSelect: (v: string) => void) => (
    <View style={{ marginBottom: 12 }}>
      <Text style={labelStyle}>{label}</Text>
      <TouchableOpacity
        style={[s.dropdownBtn, { backgroundColor: isDarkMode ? Colors.darkSurface : Colors.white, borderColor: isDarkMode ? Colors.darkBorder : Colors.gray200 }]}
        onPress={() => openDropdown(label, options, onSelect)}
        activeOpacity={0.7}
      >
        <Text style={[s.dropdownBtnText, { color: value ? (isDarkMode ? Colors.white : Colors.gray900) : Colors.gray400 }]}>
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
    const cities = CITIES_BY_STATE[stateVal] || [];
    const setCountry = prefix === 'residence' ? setResCountry : setOriCountry;
    const setState = prefix === 'residence' ? setResState : setOriState;
    const setCity = prefix === 'residence' ? setResCity : (v: string) => set('originCity', v);

    return (
      <View style={{ marginTop: 16 }}>
        <Text style={s.subSectionTitle}>{title}</Text>
        {renderDropdownField('Country', countryVal, 'Select country', COUNTRIES, setCountry)}
        {!!countryVal && (
          <>
            {states.length > 0 ? (
              renderDropdownField('State / Province / Region', stateVal, 'Select state / province', states, setState)
            ) : (
              <View style={{ marginBottom: 12 }}>
                <Text style={labelStyle}>State / Province / Region</Text>
                <TextInput style={inputStyle} value={stateVal} onChangeText={setState} placeholder="Type state / province" placeholderTextColor={Colors.gray400} />
              </View>
            )}
          </>
        )}
        {!!stateVal && (
          <View style={{ marginBottom: 12 }}>
            <Text style={labelStyle}>City / Town</Text>
            {cities.length > 0 ? (
              renderDropdownField('City / Town', cityVal, 'Select city / town', cities, setCity)
            ) : (
              <TextInput style={inputStyle} value={cityVal} onChangeText={setCity} placeholder="Type city / town" placeholderTextColor={Colors.gray400} />
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={[s.root, { backgroundColor: isDarkMode ? Colors.dark : Colors.white }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 140 }}>
        {/* Header */}
        <View style={s.headerRow}>
          <View>
            <Text style={s.headerSubtitle}>Knot Global Registry</Text>
            <Text style={[s.headerTitle, { color: isDarkMode ? Colors.white : Colors.dark }]}>
              {step === 1 && 'Identity & Roots'}
              {step === 2 && 'Lifestyle & Values'}
              {step === 3 && 'Commitment'}
              {step === 4 && 'First Impressions'}
              {step === 5 && 'Verification'}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="close" size={22} color={Colors.gray300} />
            </TouchableOpacity>
            <Text style={s.stepCounter}>{step}/{totalSteps}</Text>
          </View>
        </View>
        {/* Progress bar */}
        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: `${(step / totalSteps) * 100}%` }]} />
        </View>

        {/* Step 1 */}
        {step === 1 && (
          <View style={{ marginTop: 24 }}>
            <Text style={labelStyle}>Full Name</Text>
            <TextInput style={inputStyle} value={form.name} onChangeText={(v) => set('name', v)} placeholder="Enter your name" placeholderTextColor={Colors.gray400} />
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={labelStyle}>Age</Text>
                <TextInput style={inputStyle} value={String(form.age)} onChangeText={(v) => set('age', parseInt(v) || 0)} keyboardType="numeric" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={labelStyle}>Occupation</Text>
                <TextInput style={inputStyle} value={form.occupation} onChangeText={(v) => set('occupation', v)} placeholder="e.g. Architect" placeholderTextColor={Colors.gray400} />
              </View>
            </View>
            {renderLocationGroup('residence', 'Current Residence')}
            {renderLocationGroup('origin', 'Heritage & Origin')}
            <View style={{ marginTop: 16 }}>
              <Text style={labelStyle}>Cultural / Ethnic Identity</Text>
              <TextInput style={inputStyle} value={form.culturalBackground} onChangeText={(v) => set('culturalBackground', v)} placeholder="e.g. Yoruba, Punjabi" placeholderTextColor={Colors.gray400} />
            </View>
            <View style={{ marginTop: 16 }}>
              <Text style={labelStyle}>Marriage-Oriented Bio</Text>
              <TextInput style={[inputStyle, { height: 100, textAlignVertical: 'top' }]} value={form.bio} onChangeText={(v) => set('bio', v)} multiline placeholder="What are you looking for?" placeholderTextColor={Colors.gray400} />
            </View>
          </View>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <View style={{ marginTop: 24 }}>
            <Text style={[s.stepDesc, { color: isDarkMode ? Colors.gray400 : Colors.gray500 }]}>Honesty about your lifestyle ensures a more stable marriage match.</Text>
            <View style={{ marginTop: 16 }}>
              <Text style={labelStyle}>Religion / Faith</Text>
              <TextInput style={inputStyle} value={form.religion} onChangeText={(v) => set('religion', v)} placeholder="e.g. Christian, Muslim" placeholderTextColor={Colors.gray400} />
            </View>
            {renderPicker('Smoking', form.smoking, Object.values(SmokingHabits), (v) => set('smoking', v))}
            {renderPicker('Drinking', form.drinking, Object.values(DrinkingHabits), (v) => set('drinking', v))}
          </View>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <View style={{ marginTop: 24 }}>
            <Text style={[s.stepDesc, { color: isDarkMode ? Colors.gray400 : Colors.gray500 }]}>Knot matches users based on marriage timeline and relocation readiness.</Text>
            {renderPicker('Marriage Timeline', form.marriageTimeline, ['ASAP', '1-2 years', '3+ years', 'Not sure'], (v) => set('marriageTimeline', v))}
            {renderPicker('Future Children', form.childrenPreference, Object.values(ChildrenPreference), (v) => set('childrenPreference', v))}
            {renderPicker('Relocation', form.willingToRelocate, Object.values(WillingToRelocate), (v) => set('willingToRelocate', v))}
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
              <View style={{ flex: 1 }}>
                <Text style={labelStyle}>Min Age</Text>
                <TextInput style={inputStyle} value={String(form.preferredPartnerAgeRange[0])} onChangeText={(v) => set('preferredPartnerAgeRange', [parseInt(v) || 18, form.preferredPartnerAgeRange[1]])} keyboardType="numeric" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={labelStyle}>Max Age</Text>
                <TextInput style={inputStyle} value={String(form.preferredPartnerAgeRange[1])} onChangeText={(v) => set('preferredPartnerAgeRange', [form.preferredPartnerAgeRange[0], parseInt(v) || 99])} keyboardType="numeric" />
              </View>
            </View>
            <View style={{ marginTop: 16 }}>
              <Text style={labelStyle}>Marriage Expectations</Text>
              <TextInput style={[inputStyle, { height: 80, textAlignVertical: 'top' }]} value={form.marriageExpectations} onChangeText={(v) => set('marriageExpectations', v)} multiline placeholder="Describe expectations..." placeholderTextColor={Colors.gray400} />
            </View>
          </View>
        )}

        {/* Step 4 - Photo */}
        {step === 4 && (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Ionicons name="sparkles" size={24} color={Colors.accent} style={{ marginBottom: 8 }} />
            <Text style={[s.photoTitle, { color: isDarkMode ? Colors.white : Colors.primary }]}>First Impressions</Text>
            <Text style={[s.stepDesc, { textAlign: 'center', marginBottom: 24, color: isDarkMode ? Colors.gray400 : Colors.gray500 }]}>Registry members prefer authentic, high-quality portraits.</Text>
            <TouchableOpacity onPress={pickPhoto} style={s.photoBox}>
              {form.profileImageUrls.length > 0 ? (
                <Image source={{ uri: form.profileImageUrls[0] }} style={s.photoImage} />
              ) : (
                <View style={s.photoPlaceholder}>
                  <View style={s.photoPlusCircle}>
                    <Ionicons name="add" size={40} color={Colors.primary} />
                  </View>
                  <Text style={s.photoHint}>Tap to upload your registry photo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Step 5 - Verification */}
        {step === 5 && (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <View style={s.verifyCircle}>
              <Ionicons name="sparkles" size={40} color={Colors.white} />
            </View>
            <Text style={[s.verifyTitle, { color: isDarkMode ? Colors.white : Colors.dark }]}>Final Step: Verification</Text>
            <Text style={[s.stepDesc, { textAlign: 'center', marginBottom: 24, color: isDarkMode ? Colors.gray400 : Colors.gray500 }]}>
              All users must verify their identity. This ensures safety and authenticity.
            </Text>
            {form.isVerified ? (
              <View style={s.verifiedBox}>
                <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                <Text style={s.verifiedText}>Identity Verified Successfully</Text>
              </View>
            ) : (
              <TouchableOpacity style={s.verifyBtn} onPress={() => set('isVerified', true)}>
                <Ionicons name="sparkles" size={20} color={Colors.white} />
                <Text style={s.verifyBtnText}>Verify Now</Text>
              </TouchableOpacity>
            )}
            <Text style={s.verifyFootnote}>Verified users get 3x more matches and priority display</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom buttons */}
      <View style={[s.bottomBar, { backgroundColor: isDarkMode ? Colors.darkCard : Colors.white }]}>
        {step > 1 && (
          <TouchableOpacity style={s.backBtn} onPress={prev}>
            <Text style={s.backBtnText}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={s.nextBtn} onPress={next}>
          <Text style={s.nextBtnText}>{step === totalSteps ? 'Activate Registry' : 'Continue'}</Text>
        </TouchableOpacity>
      </View>

      {/* Searchable Dropdown Modal */}
      <Modal visible={dropdownVisible} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={[s.modalContent, { backgroundColor: isDarkMode ? Colors.darkCard : Colors.white }]}>
            <View style={s.modalHeader}>
              <Text style={[s.modalTitle, { color: isDarkMode ? Colors.white : Colors.dark }]}>{dropdownTitle}</Text>
              <TouchableOpacity onPress={() => setDropdownVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.gray400} />
              </TouchableOpacity>
            </View>
            <View style={[s.modalSearchWrapper, { backgroundColor: isDarkMode ? Colors.darkSurface : Colors.gray50, borderColor: isDarkMode ? Colors.darkBorder : Colors.gray200 }]}>
              <Ionicons name="search" size={18} color={Colors.gray400} style={{ marginRight: 8 }} />
              <TextInput
                style={[s.modalSearchInput, { color: isDarkMode ? Colors.white : Colors.dark }]}
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
                  style={s.modalItem}
                  onPress={() => {
                    dropdownCallback?.(item);
                    setDropdownVisible(false);
                  }}
                >
                  <Text style={[s.modalItemText, { color: isDarkMode ? Colors.white : Colors.gray900 }]}>{item}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={[s.modalEmpty, { color: Colors.gray400 }]}>No results found</Text>}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  headerSubtitle: { fontSize: 10, fontWeight: '900', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 3, marginBottom: 4 },
  headerTitle: { fontSize: 22, fontWeight: '900' },
  stepCounter: { fontSize: 11, fontWeight: '700', color: Colors.gray300, textTransform: 'uppercase', letterSpacing: 2, marginTop: 8 },
  progressTrack: { height: 6, backgroundColor: Colors.gray100, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 3 },
  stepDesc: { fontSize: 13, lineHeight: 20 },
  label: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: BorderRadius.lg, paddingHorizontal: 16, paddingVertical: 14, fontSize: 14, marginBottom: 4 },
  subSectionTitle: { fontSize: 11, fontWeight: '900', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 2, borderBottomWidth: 1, borderBottomColor: Colors.gray100, paddingBottom: 8, marginBottom: 12 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: Colors.gray200, marginRight: 8, backgroundColor: Colors.white },
  chipText: { fontSize: 12, fontWeight: '700', color: Colors.gray700 },
  photoTitle: { fontSize: 26, fontWeight: '900', marginBottom: 4 },
  photoBox: { width: 260, aspectRatio: 4 / 5, borderRadius: 36, overflow: 'hidden', borderWidth: 3, borderStyle: 'dashed', borderColor: Colors.gray200 },
  photoImage: { width: '100%', height: '100%' },
  photoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.gray50, padding: 32 },
  photoPlusCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.light, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  photoHint: { fontSize: 10, fontWeight: '900', color: Colors.gray400, textTransform: 'uppercase', letterSpacing: 2, textAlign: 'center' },
  verifyCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 24, elevation: 8 },
  verifyTitle: { fontSize: 22, fontWeight: '900', marginBottom: 8 },
  verifiedBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#f0fdf4', paddingHorizontal: 24, paddingVertical: 16, borderRadius: 16, borderWidth: 1, borderColor: '#dcfce7' },
  verifiedText: { fontWeight: '700', color: '#15803d' },
  verifyBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.primary, paddingHorizontal: 40, paddingVertical: 18, borderRadius: 24, elevation: 8 },
  verifyBtnText: { color: Colors.white, fontSize: 16, fontWeight: '900' },
  verifyFootnote: { fontSize: 10, fontWeight: '900', color: Colors.gray400, textTransform: 'uppercase', letterSpacing: 2, marginTop: 24, textAlign: 'center' },
  bottomBar: { flexDirection: 'row', gap: 12, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32, borderTopWidth: 1, borderTopColor: Colors.gray50 },
  backBtn: { paddingHorizontal: 28, paddingVertical: 16, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.gray100 },
  backBtnText: { color: Colors.gray400, fontWeight: '700' },
  nextBtn: { flex: 1, backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: BorderRadius.lg, alignItems: 'center', elevation: 4 },
  nextBtnText: { color: Colors.white, fontSize: 16, fontWeight: '900' },
  dropdownBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderRadius: BorderRadius.lg, paddingHorizontal: 16, paddingVertical: 14 },
  dropdownBtnText: { fontSize: 14, flex: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { maxHeight: '80%', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 16, paddingBottom: 32 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 12 },
  modalTitle: { fontSize: 18, fontWeight: '900' },
  modalSearchWrapper: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, borderWidth: 1, borderRadius: BorderRadius.lg, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 8 },
  modalSearchInput: { flex: 1, fontSize: 14, padding: 0 },
  modalItem: { paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.gray100 },
  modalItemText: { fontSize: 15 },
  modalEmpty: { textAlign: 'center', paddingVertical: 32, fontSize: 14 },
});
