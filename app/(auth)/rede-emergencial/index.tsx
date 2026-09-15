import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

export default function RedeEmergencial() {
    const router = useRouter();
    const webViewRef = useRef(null);
    const { long, lat } = useLocalSearchParams();
    const [coordenadas, setCoordenadas] = useState(false);
    const [showWebView, setShowWebView] = useState(true);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verificarCoordenadas = () => {
            if ((!long || long == '0') && (!lat || lat == '0')) {
                setCoordenadas(false);
                return;
            }
            
            setCoordenadas(true);
        }

        verificarCoordenadas();
    }, [long, lat]);

    // Função para interceptar e manipular requisições
    const handleShouldStartLoadWithRequest = (request: any) => {
        // Verificar se a URL contém indicadores de erro 302 ou 500
        if (request.url.includes('/erro302') || 
            request.url.includes('status=302') ||
            request.url.includes('redirect=302') ||
            request.url.includes('HTTP_ERROR_500') ||
            request.url.includes('error=500')) {
            
            // Impede que a página de erro seja carregada
            router.back();
            return false;
        }
        
        // Permite o carregamento de outras URLs
        return true;
    };

    // Função para capturar mudanças de navegação
    const handleNavigationStateChange = (navState: any) => {
        // Verificar se a URL contém indicadores de erro
        if (navState.url.includes('/erro302') || 
            navState.url.includes('status=302') ||
            navState.url.includes('redirect=302') ||
            navState.url.includes('HTTP_ERROR_500') ||
            navState.url.includes('error=500') ||
            navState.title?.includes('500') ||
            navState.title?.includes('Error')) {
            
            router.back();
            return;
        }

        // Esconder loading quando a página começar a carregar
        if (navState.loading === false) {
            setLoading(false);
        }
    };

    // Configurar o botão voltar do Android
    useEffect(() => {
        const backAction = () => {
            if (webViewRef.current && webViewRef.current.goBack) {
                webViewRef.current.goBack();
                return true;
            }
            router.back();
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );

        return () => backHandler.remove();
    }, []);

    return (
        <View style={styles.container}>
            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            )}
            
            {showWebView && (
                <WebView
                    ref={webViewRef}
                    style={[styles.webview, loading && styles.hiddenWebview]}
                    originWhitelist={['*']}
                    source={{ 
                        uri: coordenadas 
                            ? `https://assim-app-teste.aws.assim.com.br/emergencial?lat=${lat}&long=${long}` 
                            : 'https://assim-app-teste.aws.assim.com.br/emergencial' 
                    }}
                    onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
                    onNavigationStateChange={handleNavigationStateChange}
                    onLoadStart={() => setLoading(true)}
                    onLoadEnd={() => setLoading(false)}
                    onError={(syntheticEvent) => {
                        const { nativeEvent } = syntheticEvent;
                        console.log('WebView error: ', nativeEvent);
                        
                        if (nativeEvent.description.includes('302') || 
                            nativeEvent.description.includes('500') ||
                            nativeEvent.url.includes('/erro302')) {
                            router.back();
                        }
                    }}
                    onHttpError={(syntheticEvent) => {
                        const { nativeEvent } = syntheticEvent;
                        console.log('HTTP error: ', nativeEvent);
                        
                        if (nativeEvent.statusCode === 302 || nativeEvent.statusCode === 500) {
                            router.back();
                        }
                    }}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    startInLoadingState={true}
                    
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