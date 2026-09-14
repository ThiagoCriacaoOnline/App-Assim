import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../Constants/Constants';

interface PasswordRulesProps {
  password: string;
}

export default function PasswordRules({ password }: PasswordRulesProps) {
  const hasValidLength = password.length >= 4 && password.length <= 8;
  const hasOnlyAlphanumeric = password.length > 0 ? /^[a-zA-Z0-9]+$/.test(password) : false;
  const hasNoSpecialChars = password.length > 0 ? !/[^a-zA-Z0-9]/.test(password) : false;

  const rules = [
    { label: 'Deve conter de 4 à 8 caracteres', valid: hasValidLength },
    { label: 'Pode conter números e/ou letras', valid: hasOnlyAlphanumeric },
    { label: 'Não são permitidos caracteres especiais ex (#$%¨&*()@)', valid: hasNoSpecialChars },
  ];

  return (
    <View style={styles.container}>
      {rules.map((rule, index) => (
        <View key={index} style={styles.ruleContainer}>
          <MaterialIcons
            name={rule.valid ? 'check-circle' : 'radio-button-unchecked'}
            size={20}
            color={rule.valid ? Colors.success : "#7a7a7a"}
          />
          <Text style={[styles.ruleText, rule.valid && styles.ruleTextValid]} allowFontScaling={false}>
            {rule.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    gap: 10,
  },
  ruleContainer: {
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ruleText: {
    fontSize: 14,
    color: "#7a7a7a",
  },
  ruleTextValid: {
    color: Colors.success,
    textDecorationLine: 'line-through',
  },
});