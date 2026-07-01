import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../theme/colors';

export interface FilterCriteria {
  minAge?: string;
  maxAge?: string;
  location?: string;
  maritalStatus?: string;
  childrenStatus?: string;
}

interface MatchFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterCriteria) => void;
  currentFilters: FilterCriteria;
  isDarkMode: boolean;
}

export default function MatchFilterModal({ visible, onClose, onApply, currentFilters, isDarkMode }: MatchFilterModalProps) {
  const [filters, setFilters] = useState<FilterCriteria>(currentFilters);

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleClear = () => {
    const empty = { minAge: '', maxAge: '', location: '', maritalStatus: '', childrenStatus: '' };
    setFilters(empty);
    onApply(empty);
    onClose();
  };

  const renderSelect = (label: string, value: string | undefined, options: string[], key: keyof FilterCriteria) => (
    <View style={styles.fieldContainer}>
      <Text style={[styles.label, { color: isDarkMode ? Colors.gray300 : Colors.gray700 }]}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsRow}>
        <TouchableOpacity
          style={[styles.optionBtn, !value && { backgroundColor: Colors.accent }]}
          onPress={() => setFilters(prev => ({ ...prev, [key]: '' }))}
        >
          <Text style={[styles.optionText, !value && { color: Colors.white }]}>Any</Text>
        </TouchableOpacity>
        {options.map(opt => (
          <TouchableOpacity
            key={opt}
            style={[styles.optionBtn, value === opt && { backgroundColor: Colors.accent }]}
            onPress={() => setFilters(prev => ({ ...prev, [key]: opt }))}
          >
            <Text style={[styles.optionText, value === opt && { color: Colors.white }]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: isDarkMode ? Colors.darkCard : Colors.white }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: isDarkMode ? Colors.white : Colors.dark }]}>Filter Matches</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={isDarkMode ? Colors.white : Colors.dark} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 40 }}>
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: isDarkMode ? Colors.gray300 : Colors.gray700 }]}>Age Range</Text>
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, { flex: 1, color: isDarkMode ? Colors.white : Colors.dark, borderColor: isDarkMode ? Colors.darkBorder : Colors.gray200 }]}
                  placeholder="Min Age"
                  placeholderTextColor={Colors.gray400}
                  keyboardType="number-pad"
                  value={filters.minAge}
                  onChangeText={(val) => setFilters(prev => ({ ...prev, minAge: val }))}
                />
                <Text style={{ marginHorizontal: 10, color: Colors.gray500 }}>-</Text>
                <TextInput
                  style={[styles.input, { flex: 1, color: isDarkMode ? Colors.white : Colors.dark, borderColor: isDarkMode ? Colors.darkBorder : Colors.gray200 }]}
                  placeholder="Max Age"
                  placeholderTextColor={Colors.gray400}
                  keyboardType="number-pad"
                  value={filters.maxAge}
                  onChangeText={(val) => setFilters(prev => ({ ...prev, maxAge: val }))}
                />
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: isDarkMode ? Colors.gray300 : Colors.gray700 }]}>Location</Text>
              <TextInput
                style={[styles.input, { color: isDarkMode ? Colors.white : Colors.dark, borderColor: isDarkMode ? Colors.darkBorder : Colors.gray200 }]}
                placeholder="e.g. Lagos"
                placeholderTextColor={Colors.gray400}
                value={filters.location}
                onChangeText={(val) => setFilters(prev => ({ ...prev, location: val }))}
              />
            </View>

            {renderSelect('Marital Status', filters.maritalStatus, ['Never Married', 'Divorced', 'Widowed', 'Separated'], 'maritalStatus')}
            {renderSelect('Children', filters.childrenStatus, ['None', 'Has Children'], 'childrenStatus')}

          </ScrollView>

          <View style={[styles.footer, { borderTopColor: isDarkMode ? Colors.darkBorder : Colors.gray200 }]}>
            <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
              <Text style={styles.clearBtnText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
              <Text style={styles.applyBtnText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,150,150,0.1)',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    padding: Spacing.md,
  },
  fieldContainer: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionsRow: {
    flexDirection: 'row',
  },
  optionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.gray200,
    marginRight: 8,
    backgroundColor: 'transparent',
  },
  optionText: {
    fontSize: 14,
    color: Colors.gray500,
  },
  footer: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderTopWidth: 1,
  },
  clearBtn: {
    flex: 1,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearBtnText: {
    color: Colors.gray500,
    fontWeight: '600',
    fontSize: 16,
  },
  applyBtn: {
    flex: 2,
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.md,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
