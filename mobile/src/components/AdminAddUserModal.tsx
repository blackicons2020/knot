import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import DateTimePicker from '@react-native-community/datetimepicker';
import { FlatList } from 'react-native';

import { Colors, BorderRadius, Spacing } from '../theme/colors';
import { api, API_URL } from '../services/apiService';
import { COUNTRIES, STATES_BY_COUNTRY } from '../services/locationData';

interface Props {
  visible: boolean;
  onClose: () => void;
  onUserAdded: () => void;
  isDarkMode: boolean;
}

export const AdminAddUserModal: React.FC<Props> = ({ visible, onClose, onUserAdded, isDarkMode }) => {
  const [loading, setLoading] = useState(false);

  // States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [occupation, setOccupation] = useState('');
  const [religion, setReligion] = useState('');
  
  const [residenceCountry, setResidenceCountry] = useState('');
  const [residenceState, setResidenceState] = useState('');
  const [residenceCity, setResidenceCity] = useState('');
  
  const [originCountry, setOriginCountry] = useState('');
  const [originState, setOriginState] = useState('');
  const [originCity, setOriginCity] = useState('');

  const [maritalStatus, setMaritalStatus] = useState('');
  const [childrenStatus, setChildrenStatus] = useState('');
  const [smoking, setSmoking] = useState('');
  const [drinking, setDrinking] = useState('');
  const [marriageTimeline, setMarriageTimeline] = useState('');
  const [willingToRelocate, setWillingToRelocate] = useState('');
  const [childrenPreference, setChildrenPreference] = useState('');

  const [bio, setBio] = useState('');
  const [education, setEducation] = useState('');
  const [culturalBackground, setCulturalBackground] = useState('');
  const [careerGoals, setCareerGoals] = useState('');
  const [marriageExpectations, setMarriageExpectations] = useState('');

  const [languagesSpoken, setLanguagesSpoken] = useState('');
  const [idealPartnerTraits, setIdealPartnerTraits] = useState('');
  
  const [profilePhotoUri, setProfilePhotoUri] = useState<string | null>(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownOptions, setDropdownOptions] = useState<string[]>([]);
  const [dropdownTitle, setDropdownTitle] = useState('');
  const [dropdownOnSelect, setDropdownOnSelect] = useState<(v: string) => void>(() => {});
  const [dropdownSearch, setDropdownSearch] = useState('');

  const openDropdown = (title: string, options: string[], onSelect: (v: string) => void) => {
    setDropdownTitle(title);
    setDropdownOptions(options);
    setDropdownOnSelect(() => onSelect);
    setDropdownSearch('');
    setDropdownVisible(true);
  };


  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      base64: true,
    });
    if (!result.canceled && result.assets?.[0]) {
      setProfilePhotoUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!email || !password || !firstName || !lastName) {
      Alert.alert('Error', 'Please fill in the required account details (Email, Password, First & Last Name).');
      return;
    }

    setLoading(true);
    try {
      let photoBase64 = null;
      if (profilePhotoUri) {
        // We can just use the api.uploadPhoto to upload the local URI and get a remote URL back
        // Wait, the web uses a base64 string directly in the payload!
        // But the mobile has `api.uploadPhoto`. Actually, the web backend accepts base64 or remote URL.
        const uploadedUrl = await api.uploadPhoto(profilePhotoUri);
        photoBase64 = uploadedUrl; // In this context, the backend can also accept a URL string for `selfieUrl`.
      }

      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email, password, firstName, lastName, dateOfBirth,
          occupation, religion,
          residenceCountry, residenceState, residenceCity,
          originCountry, originState, originCity,
          maritalStatus, childrenStatus, smoking, drinking,
          marriageTimeline, willingToRelocate, childrenPreference,
          languagesSpoken: languagesSpoken ? languagesSpoken.split(',').map(s => s.trim()) : [],
          idealPartnerTraits: idealPartnerTraits ? idealPartnerTraits.split(',').map(s => s.trim()) : [],
          profilePhoto: photoBase64,
          bio,
          education,
          culturalBackground,
          marriageExpectations,
          careerGoals
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to create user');
      }

      // Automatically attach the profile picture so it does not fallback to the mock picture
      if (photoBase64) {
        await api.saveUser({
          id: data.user.id || data.user._id,
          profileImageUrls: [photoBase64]
        } as any);
      }

      Alert.alert('Success', 'User has been added to the registry.');
      onUserAdded();
      onClose();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const bgStyle = { backgroundColor: isDarkMode ? Colors.darkCard : Colors.white };
  const textStyle = { color: isDarkMode ? Colors.white : Colors.dark };
  const inputBg = { backgroundColor: isDarkMode ? Colors.darkSurface : Colors.gray50 };
  const inputBorder = { borderColor: isDarkMode ? Colors.darkBorder : Colors.gray200 };

  
  const renderSelect = (label: string, value: string, setValue: (v: string) => void, options: string[], placeholder: string) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.input, inputBg, inputBorder, { justifyContent: 'center' }]}
        onPress={() => openDropdown(label, options, setValue)}
      >
        <Text style={[textStyle, !value && { color: Colors.gray400 }]}>
          {value || placeholder}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderDatePicker = (label: string, value: string, setValue: (v: string) => void, placeholder: string) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.input, inputBg, inputBorder, { justifyContent: 'center' }]}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={[textStyle, !value && { color: Colors.gray400 }]}>
          {value || placeholder}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={value ? new Date(value) : new Date(1990, 0, 1)}
          mode="date"
          display="spinner"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) {
              setValue(date.toISOString().split('T')[0]); // wait, I need to pass setValue
            }
          }}
        />
      )}
    </View>
  );

  const renderInput = (label: string, value: string, setValue: (v: string) => void, placeholder: string, keyboardType: any = 'default') => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, inputBg, inputBorder, textStyle]}
        value={value}
        onChangeText={setValue}
        placeholder={placeholder}
        placeholderTextColor={Colors.gray400}
        keyboardType={keyboardType}
      />
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, bgStyle]}>
        <View style={[styles.header, { borderBottomColor: isDarkMode ? Colors.darkBorder : Colors.gray100 }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={isDarkMode ? Colors.white : Colors.dark} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, textStyle]}>Add New User</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Profile Photo */}
          <View style={styles.photoContainer}>
            <TouchableOpacity onPress={pickImage} style={[styles.photoBox, inputBg, inputBorder]}>
              {profilePhotoUri ? (
                <Image source={{ uri: profilePhotoUri }} style={styles.photoImg} />
              ) : (
                <Ionicons name="camera" size={32} color={Colors.gray400} />
              )}
            </TouchableOpacity>
            <Text style={styles.photoLabel}>Profile Photo</Text>
          </View>

          {renderInput('Email *', email, setEmail, 'name@email.com', 'email-address')}
          {renderInput('Password *', password, setPassword, 'Minimum 6 characters', 'default')}
          {renderInput('First Name *', firstName, setFirstName, 'e.g. John')}
          {renderInput('Last Name *', lastName, setLastName, 'e.g. Doe')}
          {renderDatePicker('Date of Birth', dateOfBirth, setDateOfBirth, 'YYYY-MM-DD')}
          {renderInput('Occupation', occupation, setOccupation, 'e.g. Engineer')}
          {renderSelect('Religion', religion, setReligion, ['Christian', 'Muslim', 'Jewish', 'Hindu', 'Buddhist', 'Atheist', 'Agnostic', 'Other'], 'Select Religion')}
          {renderInput('Bio', bio, setBio, 'Short bio...')}
          {renderInput('Education', education, setEducation, 'e.g. BSc')}
          {renderInput('Cultural Background', culturalBackground, setCulturalBackground, 'e.g. Hispanic')}

          <Text style={styles.sectionTitle}>Location</Text>
          {renderSelect('Residence Country', residenceCountry, (v) => { setResidenceCountry(v); setResidenceState(''); setResidenceCity(''); }, COUNTRIES, 'Select Country')}
          {renderSelect('Residence State', residenceState, setResidenceState, STATES_BY_COUNTRY[residenceCountry] || [], 'Select State')}
          {renderInput('Residence City', residenceCity, setResidenceCity, 'City')}
          {renderSelect('Origin Country', originCountry, (v) => { setOriginCountry(v); setOriginState(''); setOriginCity(''); }, COUNTRIES, 'Select Country')}
          {renderSelect('Origin State', originState, setOriginState, STATES_BY_COUNTRY[originCountry] || [], 'Select State')}
          {renderInput('Origin City', originCity, setOriginCity, 'City')}

          <Text style={styles.sectionTitle}>Lifestyle & Preferences</Text>
          {renderSelect('Marital Status', maritalStatus, setMaritalStatus, ['Never Married', 'Divorced', 'Widowed', 'Separated'], 'Select Status')}
          {renderSelect('Children Status', childrenStatus, setChildrenStatus, ['No kids', 'Has kids'], 'Select')}
          {renderSelect('Smoking', smoking, setSmoking, ['Non-smoker', 'Occasional', 'Regular'], 'Select')}
          {renderSelect('Drinking', drinking, setDrinking, ['Never', 'Social', 'Regular'], 'Select')}
          {renderSelect('Marriage Timeline', marriageTimeline, setMarriageTimeline, ['ASAP', '1-2 years', '3-5 years', 'Not sure'], 'Select Timeline')}
          {renderSelect('Willing To Relocate', willingToRelocate, setWillingToRelocate, ['Yes', 'No', 'Maybe'], 'Select')}
          {renderSelect('Children Preference', childrenPreference, setChildrenPreference, ['Open to children', 'Want children', "Don't want children"], 'Select Preference')}
          {renderInput('Marriage Expectations', marriageExpectations, setMarriageExpectations, 'e.g. Traditional')}
          {renderInput('Career Goals', careerGoals, setCareerGoals, 'e.g. CEO')}
          {renderInput('Languages Spoken', languagesSpoken, setLanguagesSpoken, 'Comma separated')}
          {renderInput('Ideal Partner Traits', idealPartnerTraits, setIdealPartnerTraits, 'Comma separated')}

        </ScrollView>

        <View style={[styles.footer, { borderTopColor: isDarkMode ? Colors.darkBorder : Colors.gray100, backgroundColor: isDarkMode ? Colors.darkCard : Colors.white }]}>
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.submitBtnText}>Add User</Text>}
          </TouchableOpacity>
        </View>

        <Modal visible={dropdownVisible} animationType="slide" transparent>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: bgStyle.backgroundColor, height: '70%', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={[styles.headerTitle, textStyle]}>{dropdownTitle}</Text>
                <TouchableOpacity onPress={() => setDropdownVisible(false)} style={styles.closeBtn}>
                  <Ionicons name="close" size={24} color={isDarkMode ? Colors.white : Colors.dark} />
                </TouchableOpacity>
              </View>
              <TextInput
                style={[styles.input, inputBg, inputBorder, textStyle, { marginBottom: 12 }]}
                placeholder="Search..."
                placeholderTextColor={Colors.gray400}
                value={dropdownSearch}
                onChangeText={setDropdownSearch}
              />
              <FlatList
                data={dropdownOptions.filter(o => o.toLowerCase().includes(dropdownSearch.toLowerCase()))}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: inputBorder.borderColor }}
                    onPress={() => {
                      dropdownOnSelect(item);
                      setDropdownVisible(false);
                    }}
                  >
                    <Text style={[textStyle, { fontSize: 16 }]}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>

      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md, borderBottomWidth: 1 },
  closeBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  scroll: { padding: Spacing.md, paddingBottom: 100 },
  field: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: 'bold', color: Colors.gray500, textTransform: 'uppercase', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: BorderRadius.md, padding: 12, fontSize: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.primary, marginTop: 12, marginBottom: 16 },
  photoContainer: { alignItems: 'center', marginBottom: 24 },
  photoBox: { width: 100, height: 100, borderRadius: 50, borderWidth: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  photoImg: { width: '100%', height: '100%' },
  photoLabel: { marginTop: 8, fontSize: 12, fontWeight: 'bold', color: Colors.gray500, textTransform: 'uppercase' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Spacing.md, borderTopWidth: 1 },
  submitBtn: { backgroundColor: Colors.primary, padding: 16, borderRadius: BorderRadius.md, alignItems: 'center' },
  submitBtnText: { color: Colors.white, fontSize: 16, fontWeight: 'bold' }
});
