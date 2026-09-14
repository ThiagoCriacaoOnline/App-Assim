// components/InputText.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { Colors } from '../Constants/Constants';

interface InputProps {
  label?: string;
  labelColor?: string; 
  placeholder?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  secureTextEntry?: boolean;
  onPressEndIcon?: () => void;
  value?: string;
  onChangeText?: (text: string) => void;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  errorMessage?: string;
  shadow?: boolean; 
  max?: number;
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  onSubmitEditing?: () => void;
  blurOnSubmit?: boolean;
}

export default function InputText({
  label,
  labelColor,
  placeholder,
  startIcon,
  endIcon,
  secureTextEntry = false,
  value,
  onChangeText,
  onPressEndIcon,
  keyboardType = 'default',
  errorMessage,
  shadow = false,
  max,
  ...rest
}: InputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  return (
    <View style={{ marginBottom: 15 }}>
      {label && <Text style={{ marginBottom: 5, fontWeight: 'bold', color: labelColor || Colors.azulIntermediario}} allowFontScaling={false}>{label}</Text>}
      <View style={[
            styles.inputContainer,
            errorMessage && {borderColor: Colors.vermelhoEscuro},
            shadow && styles.shadow
        ]}>
        {startIcon && <View style={styles.icon}>{startIcon}</View>}
        <TextInput
          {...rest}
          style={[styles.textInput, {color: Colors.gray800}]}
          placeholder={placeholder}
          placeholderTextColor="#999"
          secureTextEntry={!isPasswordVisible}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          maxLength={max}
          allowFontScaling={false}
          returnKeyType={rest.returnKeyType}
          onSubmitEditing={rest.onSubmitEditing}
          blurOnSubmit={rest.blurOnSubmit}
        />

        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(prev => !prev)}
            style={styles.icon}
          >
            {isPasswordVisible ? (
                <Feather name="eye-off" size={24} color={Colors.azulClaro} style={styles.icon}/>
            ) : (
                <Feather name="eye" size={24} color={Colors.azulClaro} style={styles.icon}/>
            )}
          </TouchableOpacity>
        )}
        {!secureTextEntry && endIcon && (
          <TouchableOpacity onPress={onPressEndIcon} style={styles.icon}>
            {endIcon}
          </TouchableOpacity>
        )}
      </View>
      {errorMessage && (
           <Text style={styles.errorText}>{errorMessage}</Text>
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderBottomWidth: 2,
    borderBottomColor: Colors.azulIntermediario,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  textInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: Colors.gray800
  },
  icon: {
    paddingHorizontal: 5,
  },
  errorText: {
    color: Colors.vermelhoEscuro,
    marginTop: 5,
    marginLeft: 5,
    fontSize: 13,
  },
  shadow: {
    elevation: 4,
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 3 }, 
    shadowOpacity: 0.25, 
    shadowRadius: 4.65, 
  }
});
