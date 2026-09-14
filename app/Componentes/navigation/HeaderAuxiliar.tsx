import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'
import { Colors, width } from '@/app/Constants/Constants'
import { Ionicons } from '@expo/vector-icons';

interface HeaderProps {
    rota?: String,
    params?: object;
}

export default function HeaderAuxiliar({ rota, params }: HeaderProps) {
    const router = useRouter();

    const handleBackPress = () => {
        if(rota) {
            router.push({
                pathname: `${rota}`,
                params: params, 
            });
            return;
        }

        router.back();
    }

    return (
        <View style={styles.header}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={handleBackPress}
            >
                <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Image 
                source={require('@/assets/images/assim/LOGO-AGENCIA-VIRTUAL.png')}
                style={styles.imgHeader}
                resizeMode='contain'
            />
        </View>
    )
}

const styles = StyleSheet.create({
    header: {
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.azulIntermediario,
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    backButton: {
        padding: 10,
        zIndex: 1,
    },
    headerTitle: {
         position: 'absolute',
        left: 0,
        right: 0,
        textAlign: 'center',
        color: Colors.branco,
        fontSize: 16,
        fontWeight: 'bold',
    },
    imgHeader: {
        marginHorizontal: 'auto',
        transform: [{translateX: -20}]
    }
    
});