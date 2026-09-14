import { View, Text, StyleSheet, TextStyle, ViewStyle, TouchableOpacity } from 'react-native';
import React from 'react';
import { Colors } from '../Constants/Constants';

interface TextPadraoProps {
  text?: string;
  styleText?: TextStyle;
  styleContainer?: ViewStyle;
  onPress?: () => void; 
}

export default function TextPadrao({ text = 'Texto padrão', styleText, styleContainer, onPress }: TextPadraoProps) {

  const Content = (
    <Text style={[styles.text, styleText]} allowFontScaling={false}>
      {text}
    </Text>
  );

  return (
    <View style={[styles.container, styleContainer]}>
      {onPress ? (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
          {Content}
        </TouchableOpacity>
      ) : (
        Content
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  text: {
    fontSize: 12,
    color: Colors.azulIntermediario,
    fontWeight: "bold"
  },
});
