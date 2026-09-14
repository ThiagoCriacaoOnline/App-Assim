import { useRouter } from "expo-router";
import { Image, Linking, StyleSheet, Text, TouchableOpacity, View, Alert, Platform } from "react-native";
import { Colors, height, width } from "../Constants/Constants";
import BotaoPadrao from "../Componentes/Botoes/BotaoPadrao";
import * as Location from 'expo-location';
import { useState } from "react";

export default function Index() {
  const router = useRouter();
  const [loadingEmergencial, setLoadingEmergencial] = useState(false);

  const openPrivacyPolicy = () => {
    Linking.openURL("https://assim.com.br/site/?area=politica-de-privacidade-aplicativo&v=15012025");
  };

  const openLocationSettings = async () => {
    try {
      if (Platform.OS === 'ios') {
        // Para iOS - abre configurações do app específico
        await Linking.openURL('app-settings:');
      } else {
        // Para Android - abre configurações de localização diretamente
        await Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS');
      }
    } catch (error) {
      // Fallback caso o método específico falhe
      Linking.openSettings();
    }
  };

  const openDeviceSettings = async () => {
    try {
      if (Platform.OS === 'ios') {
        // Para iOS - abre configurações de localização do dispositivo
        await Linking.openURL('App-Prefs:LOCATION_SERVICES');
      } else {
        // Para Android - abre configurações de localização
        await Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS');
      }
    } catch (error) {
      // Fallback para configurações gerais
      Linking.openSettings();
    }
  };

  const handleEmergencial = async () => {
    setLoadingEmergencial(true);
    
    try {
      // 1. Verificar se há permissão de localização
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Localização Opcional',
          'Para uma experiência mais personalizada, podemos mostrar os locais de atendimento mais próximos de você. Mas você pode acessar a rede emergencial mesmo sem compartilhar sua localização.',
          [
            {
              text: "Cancelar",
              style: 'cancel',
              onPress: () => {}
            },
            {
              text: 'Usar sem localização',
              onPress: () => {
                router.push('/rede-emergencial');
              }
            },
            {
              text: 'Permitir localização',
              onPress: async () => {
                await openLocationSettings();
              }
            }
          ]
        );
        setLoadingEmergencial(false);
        return;
      }

      // 2. Verificar se a localização está ativada no dispositivo
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      
      if (!servicesEnabled) {
        Alert.alert(
          'Localização Desativada',
          'Para mostrarmos os locais mais próximos, você precisa ativar a localização. Mas pode acessar a rede emergencial mesmo assim.',
          [
            {
              text: "Cancelar",
              style: 'cancel',
              onPress: () => {}
            },
            {
              text: 'Acessar sem localização',
              onPress: () => {
                router.push('/rede-emergencial');
              }
            },
            {
              text: 'Ativar localização',
              onPress: async () => {
                await openDeviceSettings();
              }
            }
          ]
        );
        setLoadingEmergencial(false);
        return;
      }

      // 3. Obter a localização atual do usuário
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 10000, // 10 segundos de timeout
      });

      const { latitude, longitude } = location.coords;

      // 4. Navegar para a tela de rede emergencial com as coordenadas
      router.push({
        pathname: '/rede-emergencial',
        params: { long: longitude.toString(), lat: latitude.toString() }
      });

    } catch (error) {
      console.error('Erro ao obter localização:', error);
      Alert.alert(
        'Acesso à Rede Emergencial',
        'Não foi possível obter sua localização, mas você ainda pode acessar a rede emergencial.',
        [
          {
            text: 'Cancelar',
            style: 'cancel'
          },
          {
            text: 'Acessar mesmo assim',
            onPress: () => {
              router.push('/rede-emergencial');
            }
          }
        ]
      );
    } finally {
      setLoadingEmergencial(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image 
        source={require('@/assets/images/assim/Fundo.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      <View style={styles.content}>
        <BotaoPadrao 
          text="ENTRAR" 
          onPress={() => router.push('/login')} 
          styleButton={{ backgroundColor: Colors.azulEscuro }}
        />
        
        <BotaoPadrao 
          text="CADASTRAR"
          onPress={() => router.push('/register')} 
          styleButton={{ backgroundColor: Colors.azulClaro }}
        />
        
        <BotaoPadrao 
          text="REDE EMERGENCIAL" 
          onPress={handleEmergencial}
          Loading={loadingEmergencial}
          styleButton={{ 
            backgroundColor: Colors.vermelhoEscuro, 
            marginTop: 30 
          }}
        />
      </View>

      <TouchableOpacity onPress={openPrivacyPolicy} style={styles.btnPrivacidade}>
        <Text allowFontScaling={false} style={styles.linkText}>
          POLÍTICA DE PRIVACIDADE
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 0,
    padding: 0
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
    height: "100%"
  },
  content: {
    width: width,
    height: height,
    justifyContent: 'center',
    gap: 10
  },
  btnPrivacidade: {
    position: "absolute",
    bottom: 170,
    left: "50%",
    transform: [
      { translateX: -60 }
    ],
  },
  linkText: {
    color: Colors.branco,
    fontWeight: 'bold',
    fontSize: 10
  }
});