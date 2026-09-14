import { View, StyleSheet, BackHandler, ActivityIndicator, Alert } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { WebView } from 'react-native-webview';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AppIndex() {
    const router = useRouter();
    const webViewRef = useRef(null);
    const focused = useIsFocused();
    const [showWebView, setShowWebView] = useState(true);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState('');

    useEffect(() => {
      const buscaToken = async () => {
        const token = await AsyncStorage.getItem('@auth_token');
        if(token) {
          setToken(token);
        }
      }

      buscaToken();
    }, [focused]);

    const handleError = () => {
        setShowWebView(false);
        Alert.alert(
          "Problema de conexão",
          "Não foi possível carregar o conteúdo. Por favor, tente novamente mais tarde.",
          [
              {
                  text: "OK",
                  onPress: () => router.replace('/(auth)/login')
              }
          ]
        );
    };

    const handleLogout = () => {
        setShowWebView(false);
        // Redireciona diretamente sem mostrar alerta
        router.replace('/(auth)/login');
    };

    const handleShouldStartLoadWithRequest = (request: any) => {
        // Tratamento específico para logout (402)
        if (request.url.includes('/erro402') || 
            request.url.includes('status=402') ||
            request.url.includes('redirect=402')) {
            
            handleLogout();
            return false;
        }
        
        // Tratamento para outros erros
        if (request.url.includes('/erro302') || 
            request.url.includes('status=302') ||
            request.url.includes('redirect=302') ||
            request.url.includes('HTTP_ERROR_500') ||
            request.url.includes('error=500')) {
            
            handleError();
            return false;
        }
        return true;
    };

    const handleNavigationStateChange = (navState: any) => {
        // Tratamento específico para logout (402)
        if (navState.url.includes('/erro402') || 
            navState.url.includes('status=402') ||
            navState.url.includes('redirect=402')) {
            
            handleLogout();
            return;
        }

        // Tratamento para outros erros
        if (navState.url.includes('/erro302') || 
            navState.url.includes('status=302') ||
            navState.url.includes('redirect=302') ||
            navState.url.includes('HTTP_ERROR_500') ||
            navState.url.includes('error=500') ||
            navState.title?.includes('500') ||
            navState.title?.includes('Error')) {
            
            handleError();
            return;
        }

        if (navState.loading === false) {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            )}
            
            {showWebView && token && (
                <WebView
                    ref={webViewRef}
                    style={[styles.webview, loading && styles.hiddenWebview]}
                    originWhitelist={['*']}
                    source={{ 
                      uri: `https://app-homologacao.aws.assim.com.br/`, 
                      headers: {
                        'Bearer': `${token}`
                      }
                    }}
                    onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
                    onNavigationStateChange={handleNavigationStateChange}
                    onLoadStart={() => {
                        setLoading(true);
                    }}
                    onLoadEnd={() => setLoading(false)}
                    onError={(syntheticEvent) => {
                        const { nativeEvent } = syntheticEvent;
                        console.log('WebView error: ', nativeEvent);
                        
                        if (nativeEvent.description.includes('302') || 
                            nativeEvent.description.includes('500') ||
                            nativeEvent.url.includes('/erro302')) {
                            handleError();
                        }
                    }}
                    onHttpError={(syntheticEvent) => {
                        const { nativeEvent } = syntheticEvent;
                        console.log('HTTP error: ', nativeEvent);
                        
                        if (nativeEvent.statusCode === 302 || nativeEvent.statusCode === 500) {
                            handleError();
                        }
                        
                        // Tratamento específico para logout (402)
                        if (nativeEvent.statusCode === 402) {
                            handleLogout();
                        }
                    }}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    startInLoadingState={true}
                    onContentProcessDidTerminate={() => {
                        handleError();
                    }}
                    thirdPartyCookiesEnabled={true}
                    sharedCookiesEnabled={true}
                    allowUniversalAccessFromFileURLs={true}
                />
            )} 
        </View>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  hiddenWebview: {
    height: 0,
    width: 0,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    zIndex: 10,
  },
});