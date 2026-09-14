import { Text, ViewStyle, TextStyle, Keyboard, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Colors } from '@/app/Constants/Constants';

interface BotaoProps {
    text: string;
    onPress?: () => void;
    styleButton?: ViewStyle;
    styleText?: TextStyle;
    Loading?: boolean;
}

export default function BotaoPadrao({ text, onPress, styleButton, styleText, Loading = false }: BotaoProps) {
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
        const showSubscription = Keyboard.addListener("keyboardDidShow", () => setKeyboardVisible(true));
        const hideSubscription = Keyboard.addListener("keyboardDidHide", () => setKeyboardVisible(false));

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    });

    if (isKeyboardVisible) {
      return null;
    }
  
    return (
      <TouchableOpacity onPress={onPress} style={[styles.button, styleButton]} disabled={Loading}>

        {!Loading 
          ? <Text style={[styles.text, styleText]} allowFontScaling={false}>{text}</Text> 
          : <ActivityIndicator color={Colors.branco} />}
      </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
      width: "75%",
      backgroundColor: Colors.azulIntermediario,
      paddingVertical: 15,
      borderRadius: 5,
      alignItems: 'center',
      marginHorizontal: 'auto'
    },
    text: {
      color: Colors.branco,
      fontWeight: 'bold',
      fontSize: 16,
    },
});