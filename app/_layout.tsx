import { Stack, useSegments } from "expo-router";
import { useEffect } from "react";
import { BackHandler} from "react-native";
import { KeyboardAvoidingView, Platform, StatusBar } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import * as Location from 'expo-location';

export default function RootLayout() {
  const segments = useSegments();
  const pathname = "/" + segments.join("/"); // monta a rota atual

  // rotas onde o botão "voltar" deve funcionar normalmente
  const rotasPermitidas = [
    "/(app)/home",
    "/(auth)/login"
  ];

  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        await Location.requestForegroundPermissionsAsync();
        console.log('Permissão de localização solicitada');
      } catch (error) {
        console.log('Erro ao solicitar permissão de localização:', error);
      }
    };

    requestLocationPermission();
  }, []);

  useEffect(() => {
    const backAction = () => {
      if (rotasPermitidas.includes(pathname)) {
        return false; // permite voltar
      }
      return true; // bloqueia
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [pathname]);

  return (
    <>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#fff" 
        translucent={false} // Mudei para false
      />
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1 }} edges={["top","bottom", "left", "right"]}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? -20 : 0} 
          >
            <Stack
              screenOptions={{
                headerShown: false,
                statusBarHidden: false,
                statusBarStyle: "light", 
                statusBarBackgroundColor: "white", 
                statusBarTranslucent: false, 
                animation: 'slide_from_right'
              }}
            >
              <Stack.Screen 
                name="(auth)" 
                options={{ 
                  headerShown: false,
                  statusBarStyle: "light",
                  statusBarBackgroundColor: "white",
                  statusBarTranslucent: false
                }} 
              />
              <Stack.Screen 
                name="(app)" 
                options={{ 
                  headerShown: false,
                  statusBarStyle: "light",
                  statusBarBackgroundColor: "white",
                  statusBarTranslucent: false
                }} 
              />
            </Stack>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </SafeAreaProvider>
    </>
  );
}