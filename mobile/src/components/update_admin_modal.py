import os

file_path = "mobile/src/components/AdminAddUserModal.tsx"
with open(file_path, "r") as f:
    content = f.read()

# Add imports
imports_to_add = """
import DateTimePicker from '@react-native-community/datetimepicker';
import { FlatList } from 'react-native';
"""
content = content.replace("import * as ImagePicker from 'expo-image-picker';", "import * as ImagePicker from 'expo-image-picker';\n" + imports_to_add)

# Add dropdown states
dropdown_states = """
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
"""
content = content.replace("const [profilePhotoUri, setProfilePhotoUri] = useState<string | null>(null);", "const [profilePhotoUri, setProfilePhotoUri] = useState<string | null>(null);\n" + dropdown_states)

# Add renderSelect and renderDatePicker
renderers = """
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

  const renderDatePicker = (label: string, value: string, placeholder: string) => (
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
"""
# wait, renderDatePicker needs setValue
renderers = renderers.replace("const renderDatePicker = (label: string, value: string, placeholder: string) =>", "const renderDatePicker = (label: string, value: string, setValue: (v: string) => void, placeholder: string) =>")

content = content.replace("const renderInput = (label: string, value: string, setValue: (v: string) => void, placeholder: string, keyboardType: any = 'default') => (", renderers + "\n  const renderInput = (label: string, value: string, setValue: (v: string) => void, placeholder: string, keyboardType: any = 'default') => (")

# Add the Dropdown Modal JSX right before </Modal>
modal_jsx = """
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
"""

content = content.replace("      </View>\n    </Modal>", modal_jsx + "\n      </View>\n    </Modal>")

# Replace text inputs with select/datepicker
replacements = [
    ("{renderInput('Date of Birth', dateOfBirth, setDateOfBirth, 'YYYY-MM-DD')}", "{renderDatePicker('Date of Birth', dateOfBirth, setDateOfBirth, 'YYYY-MM-DD')}"),
    ("{renderInput('Religion', religion, setReligion, 'e.g. Christian')}", "{renderSelect('Religion', religion, setReligion, ['Christian', 'Muslim', 'Jewish', 'Hindu', 'Buddhist', 'Atheist', 'Agnostic', 'Other'], 'Select Religion')}"),
    ("{renderInput('Residence Country', residenceCountry, setResidenceCountry, 'Country')}", "{renderSelect('Residence Country', residenceCountry, (v) => { setResidenceCountry(v); setResidenceState(''); setResidenceCity(''); }, COUNTRIES, 'Select Country')}"),
    ("{renderInput('Residence State', residenceState, setResidenceState, 'State')}", "{renderSelect('Residence State', residenceState, setResidenceState, STATES_BY_COUNTRY[residenceCountry] || [], 'Select State')}"),
    ("{renderInput('Origin Country', originCountry, setOriginCountry, 'Country')}", "{renderSelect('Origin Country', originCountry, (v) => { setOriginCountry(v); setOriginState(''); setOriginCity(''); }, COUNTRIES, 'Select Country')}"),
    ("{renderInput('Origin State', originState, setOriginState, 'State')}", "{renderSelect('Origin State', originState, setOriginState, STATES_BY_COUNTRY[originCountry] || [], 'Select State')}"),
    ("{renderInput('Marital Status', maritalStatus, setMaritalStatus, 'e.g. Never Married')}", "{renderSelect('Marital Status', maritalStatus, setMaritalStatus, ['Never Married', 'Divorced', 'Widowed', 'Separated'], 'Select Status')}"),
    ("{renderInput('Children Status', childrenStatus, setChildrenStatus, 'e.g. No kids')}", "{renderSelect('Children Status', childrenStatus, setChildrenStatus, ['No kids', 'Has kids'], 'Select')}"),
    ("{renderInput('Smoking', smoking, setSmoking, 'e.g. Non-smoker')}", "{renderSelect('Smoking', smoking, setSmoking, ['Non-smoker', 'Occasional', 'Regular'], 'Select')}"),
    ("{renderInput('Drinking', drinking, setDrinking, 'e.g. Occasional')}", "{renderSelect('Drinking', drinking, setDrinking, ['Never', 'Social', 'Regular'], 'Select')}"),
    ("{renderInput('Marriage Timeline', marriageTimeline, setMarriageTimeline, 'e.g. 1-2 years')}", "{renderSelect('Marriage Timeline', marriageTimeline, setMarriageTimeline, ['ASAP', '1-2 years', '3-5 years', 'Not sure'], 'Select Timeline')}"),
    ("{renderInput('Willing To Relocate', willingToRelocate, setWillingToRelocate, 'e.g. Yes')}", "{renderSelect('Willing To Relocate', willingToRelocate, setWillingToRelocate, ['Yes', 'No', 'Maybe'], 'Select')}"),
    ("{renderInput('Children Preference', childrenPreference, setChildrenPreference, 'e.g. Want kids')}", "{renderSelect('Children Preference', childrenPreference, setChildrenPreference, ['Open to children', 'Want children', \"Don't want children\"], 'Select Preference')}"),
]

for old, new in replacements:
    content = content.replace(old, new)

with open(file_path, "w") as f:
    f.write(content)

print("Done")
