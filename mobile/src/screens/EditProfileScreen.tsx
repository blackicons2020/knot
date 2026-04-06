import React, { useState, useMemo, useCallback } from 'react';
import {
  FlatList, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text,
  TextInput, TouchableOpacity, View,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Colors, Spacing, BorderRadius } from '../theme/colors';
import {
  RootStackParamList, User, SmokingHabits, DrinkingHabits,
  MaritalStatus, WillingToRelocate, ChildrenPreference,
} from '../types';
import { COUNTRIES, STATES_BY_COUNTRY, CITIES_BY_STATE, MANUAL_ENTRY_VAL } from '../services/locationData';
import { db } from '../services/apiService';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type EditRoute = RouteProp<RootStackParamList, 'EditProfile'>;

/* ── Searchable dropdown modal ────────────────────────────── */

function DropdownModal({
  visible, title, options, onSelect, onClose, isDark,
}: {
  visible: boolean; title: string; options: string[];
  onSelect: (v: string) => void; onClose: () => void; isDark: boolean;
}) {
  const [search, setSearch] = useState('');
  const filtered = useMemo(
    () => search ? options.filter(o => o.toLowerCase().includes(search.toLowerCase())) : options,
    [search, options],
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={st.modalOverlay}>
        <View style={[st.modalContent, { backgroundColor: isDark ? Colors.darkCard : Colors.white }]}>
          <View style={st.modalHeader}>
            <Text style={[st.modalTitle, { color: isDark ? Colors.white : Colors.dark }]}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.gray400} />
            </TouchableOpacity>
          </View>
          <View style={[st.searchWrap, { backgroundColor: isDark ? Colors.darkSurface : Colors.gray50 }]}>
            <Ionicons name="search" size={18} color={Colors.gray400} />
            <TextInput
              style={[st.searchInput, { color: isDark ? Colors.white : Colors.gray900 }]}
              placeholder="Search..."
              placeholderTextColor={Colors.gray400}
              value={search}
              onChangeText={setSearch}
              autoFocus
            />
          </View>
          <FlatList
            data={filtered}
            keyExtractor={(item) => item}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={st.modalItem}
                onPress={() => { onSelect(item); setSearch(''); onClose(); }}
              >
                <Text style={[st.modalItemText, { color: isDark ? Colors.gray200 : Colors.gray900 }]}>{item}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={st.modalEmpty}>No results</Text>}
          />
        </View>
      </View>
    </Modal>
  );
}

/* ── Main Screen ──────────────────────────────────────────── */

export default function EditProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<EditRoute>();
  const { setUserProfile } = useAuth();
  const { isDarkMode } = useTheme();
  const [form, setForm] = useState<User>(params.user);

  // Dropdown modal state
  const [ddVisible, setDdVisible] = useState(false);
  const [ddTitle, setDdTitle] = useState('');
  const [ddOptions, setDdOptions] = useState<string[]>([]);
  const [ddCallback, setDdCallback] = useState<((v: string) => void) | null>(null);

  const openDropdown = useCallback((title: string, options: string[], cb: (v: string) => void) => {
    setDdTitle(title);
    setDdOptions(options);
    setDdCallback(() => cb);
    setDdVisible(true);
  }, []);

  const set = (key: keyof User, val: any) => {
    if (key === 'residenceCountry') setForm((p) => ({ ...p, residenceCountry: val, residenceState: '', residenceCity: '', country: val }));
    else if (key === 'residenceState') setForm((p) => ({ ...p, residenceState: val, residenceCity: '' }));
    else if (key === 'residenceCity') setForm((p) => ({ ...p, residenceCity: val, city: val }));
    else if (key === 'originCountry') setForm((p) => ({ ...p, originCountry: val, originState: '', originCity: '' }));
    else if (key === 'originState') setForm((p) => ({ ...p, originState: val, originCity: '' }));
    else setForm((p) => ({ ...p, [key]: val }));
  };

  const save = async () => {
    await db.saveUser(form);
    setUserProfile(form);
    navigation.goBack();
  };

  const labelStyle = [st.label, { color: Colors.gray400 }];
  const inputBg = isDarkMode ? Colors.darkSurface : Colors.gray50;
  const inputColor = isDarkMode ? Colors.white : Colors.gray900;
  const inputBorder = isDarkMode ? Colors.darkBorder : Colors.gray200;
  const inputStyle = [st.input, { backgroundColor: inputBg, color: inputColor, borderColor: inputBorder }];

  /* Dropdown-styled select button */
  const renderSelect = (label: string, value: string, options: string[], onSelect: (v: string) => void) => (
    <View style={{ marginBottom: 12 }}>
      <Text style={labelStyle}>{label}</Text>
      <TouchableOpacity
        style={[st.selectBtn, { backgroundColor: inputBg, borderColor: inputBorder }]}
        onPress={() => openDropdown(label, options, onSelect)}
      >
        <Text style={[st.selectText, { color: value ? inputColor : Colors.gray400 }]}
          numberOfLines={1}
        >
          {value || `Select ${label}`}
        </Text>
        <Ionicons name="chevron-down" size={18} color={Colors.gray400} />
      </TouchableOpacity>
    </View>
  );

  /* Location section with dropdown selects */
  const renderLocationSection = (prefix: 'residence' | 'origin', title: string) => {
    const countryVal = form[`${prefix}Country` as keyof User] as string;
    const stateVal = form[`${prefix}State` as keyof User] as string;
    const cityVal = form[`${prefix}City` as keyof User] as string;
    const states = STATES_BY_COUNTRY[countryVal] || [];
    const cities = CITIES_BY_STATE[stateVal] || [];
    const setCountry = (v: string) => set(`${prefix}Country` as keyof User, v);
    const setState = (v: string) => set(`${prefix}State` as keyof User, v);
    const setCity = (v: string) => set(`${prefix}City` as keyof User, v);

    const forceStateManual = !!countryVal && states.length === 0;
    const forceCityManual = !!stateVal && cities.length === 0;

    return (
      <View style={[st.card, { backgroundColor: isDarkMode ? Colors.darkCard : Colors.white }]}>
        <Text style={st.cardTitle}>{title}</Text>

        {renderSelect('Country', countryVal, COUNTRIES, setCountry)}

        {!!countryVal && (
          forceStateManual ? (
            <View style={{ marginBottom: 12 }}>
              <Text style={labelStyle}>State / Province</Text>
              <TextInput style={inputStyle} value={stateVal} onChangeText={setState} placeholder="Type state name" placeholderTextColor={Colors.gray400} />
            </View>
          ) : (
            renderSelect('State / Province', stateVal, states, setState)
          )
        )}

        {!!stateVal && (
          forceCityManual ? (
            <View style={{ marginBottom: 12 }}>
              <Text style={labelStyle}>City / Town</Text>
              <TextInput style={inputStyle} value={cityVal} onChangeText={setCity} placeholder="Type city name" placeholderTextColor={Colors.gray400} />
            </View>
          ) : (
            renderSelect('City / Town', cityVal, cities, setCity)
          )
        )}

        {prefix === 'origin' && (
          <View style={{ marginBottom: 12 }}>
            <Text style={labelStyle}>Cultural / Ethnic Identity</Text>
            <TextInput
              style={inputStyle}
              value={form.culturalBackground}
              onChangeText={(v) => set('culturalBackground', v)}
              placeholder="e.g. Yoruba, Punjabi, Ashkenazi"
              placeholderTextColor={Colors.gray400}
            />
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={[st.root, { backgroundColor: isDarkMode ? Colors.dark : Colors.gray100 }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={[st.header, { backgroundColor: isDarkMode ? Colors.darkCard : Colors.white }]}>
        <Text style={[st.headerTitle, { color: isDarkMode ? Colors.white : Colors.dark }]}>Edit Registry</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={Colors.gray400} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: Spacing.md, paddingBottom: 100 }}>
        {/* ── Identity ── */}
        <View style={[st.card, { backgroundColor: isDarkMode ? Colors.darkCard : Colors.white }]}>
          <Text style={st.cardTitle}>Identity</Text>
          <View style={{ marginBottom: 12 }}>
            <Text style={labelStyle}>Name</Text>
            <TextInput style={inputStyle} value={form.name} onChangeText={(v) => set('name', v)} />
          </View>
          <View style={st.row2}>
            <View style={st.col}>
              <Text style={labelStyle}>Age</Text>
              <TextInput style={inputStyle} value={String(form.age)} onChangeText={(v) => set('age', parseInt(v) || 0)} keyboardType="numeric" />
            </View>
            <View style={st.col}>
              {renderSelect('Marital Status', form.maritalStatus, Object.values(MaritalStatus), (v) => set('maritalStatus', v))}
            </View>
          </View>
        </View>

        {/* ── Locations ── */}
        {renderLocationSection('residence', 'Current Residence')}
        {renderLocationSection('origin', 'Heritage & Roots')}

        {/* ── Bio & Lifestyle ── */}
        <View style={[st.card, { backgroundColor: isDarkMode ? Colors.darkCard : Colors.white }]}>
          <Text style={st.cardTitle}>Bio & Lifestyle</Text>
          <View style={{ marginBottom: 12 }}>
            <Text style={labelStyle}>Occupation</Text>
            <TextInput style={inputStyle} value={form.occupation} onChangeText={(v) => set('occupation', v)} />
          </View>
          <View style={{ marginBottom: 12 }}>
            <Text style={labelStyle}>Registry Bio</Text>
            <TextInput
              style={[inputStyle, { height: 100, textAlignVertical: 'top' }]}
              value={form.bio}
              onChangeText={(v) => set('bio', v)}
              multiline
            />
          </View>
          <View style={st.row2}>
            <View style={st.col}>
              {renderSelect('Smoking', form.smoking, Object.values(SmokingHabits), (v) => set('smoking', v))}
            </View>
            <View style={st.col}>
              {renderSelect('Drinking', form.drinking, Object.values(DrinkingHabits), (v) => set('drinking', v))}
            </View>
          </View>
        </View>

        {/* ── Marriage & Partner Preferences ── */}
        <View style={[st.card, { backgroundColor: isDarkMode ? Colors.darkCard : Colors.white }]}>
          <Text style={st.cardTitle}>Marriage & Partner Preferences</Text>
          <View style={st.row2}>
            <View style={st.col}>
              {renderSelect('Marriage Timeline', form.marriageTimeline, ['ASAP', 'Within 1-2 years', '3+ years', 'Not sure'], (v) => set('marriageTimeline', v))}
            </View>
            <View style={st.col}>
              {renderSelect('Relocation', form.willingToRelocate, Object.values(WillingToRelocate), (v) => set('willingToRelocate', v))}
            </View>
          </View>
          <View style={{ marginBottom: 12 }}>
            <Text style={[labelStyle, { marginBottom: 8 }]}>Preferred Partner Age Range</Text>
            <View style={st.row2}>
              <View style={st.col}>
                <Text style={[st.subLabel, { color: Colors.gray400 }]}>Min Age</Text>
                <TextInput
                  style={inputStyle}
                  value={String(form.preferredPartnerAgeRange?.[0] || 18)}
                  onChangeText={(v) => set('preferredPartnerAgeRange', [parseInt(v) || 18, form.preferredPartnerAgeRange?.[1] || 99])}
                  keyboardType="numeric"
                />
              </View>
              <View style={st.col}>
                <Text style={[st.subLabel, { color: Colors.gray400 }]}>Max Age</Text>
                <TextInput
                  style={inputStyle}
                  value={String(form.preferredPartnerAgeRange?.[1] || 99)}
                  onChangeText={(v) => set('preferredPartnerAgeRange', [form.preferredPartnerAgeRange?.[0] || 18, parseInt(v) || 99])}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
          <View style={{ marginBottom: 12 }}>
            <Text style={labelStyle}>Marriage Expectations</Text>
            <TextInput
              style={[inputStyle, { height: 100, textAlignVertical: 'top' }]}
              value={form.marriageExpectations}
              onChangeText={(v) => set('marriageExpectations', v)}
              multiline
              placeholder="Describe your expectations for marriage..."
              placeholderTextColor={Colors.gray400}
            />
          </View>
        </View>
      </ScrollView>

      {/* Save button */}
      <View style={[st.footer, { backgroundColor: isDarkMode ? Colors.darkCard : Colors.white }]}>
        <TouchableOpacity style={st.saveBtn} onPress={save}>
          <Text style={st.saveBtnText}>Save Registry Updates</Text>
        </TouchableOpacity>
      </View>

      {/* Searchable dropdown modal */}
      <DropdownModal
        visible={ddVisible}
        title={ddTitle}
        options={ddOptions}
        onSelect={(v) => ddCallback?.(v)}
        onClose={() => setDdVisible(false)}
        isDark={isDarkMode}
      />
    </KeyboardAvoidingView>
  );
}

/* ── Styles ───────────────────────────────────────────────── */

const st = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.gray200 },
  headerTitle: { fontSize: 18, fontWeight: '900' },

  card: { padding: Spacing.md, borderRadius: BorderRadius.lg, marginBottom: 12, elevation: 1 },
  cardTitle: { fontSize: 13, fontWeight: '900', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 2, borderBottomWidth: 2, borderBottomColor: Colors.primary, paddingBottom: 8, marginBottom: 16 },

  label: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 },
  subLabel: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },

  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, marginBottom: 4 },

  selectBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
  selectText: { fontSize: 14, flex: 1 },

  row2: { flexDirection: 'row', gap: 12 },
  col: { flex: 1 },

  footer: { padding: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.gray200 },
  saveBtn: { backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center', elevation: 4 },
  saveBtnText: { color: Colors.white, fontSize: 16, fontWeight: '900' },

  /* Modal */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { maxHeight: '70%', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 24 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.gray100 },
  modalTitle: { fontSize: 16, fontWeight: '900' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, margin: 12, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12 },
  searchInput: { flex: 1, fontSize: 14, padding: 0 },
  modalItem: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.gray100 },
  modalItemText: { fontSize: 14 },
  modalEmpty: { textAlign: 'center', padding: 24, color: Colors.gray400, fontSize: 13 },
});
