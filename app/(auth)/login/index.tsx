import { View, Text, StyleSheet, Image, Switch, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native'
import React, { useCallback, useEffect, useState, useRef } from 'react'
import HeaderAuxiliar from '@/app/Componentes/navigation/HeaderAuxiliar'
import TextPadrao from '@/app/Componentes/TextPadrao';
import { useRouter } from 'expo-router';
import InputText from '@/app/Componentes/InputText';
import { Colors } from '@/app/Constants/Constants';
import BotaoPadrao from '@/app/Componentes/Botoes/BotaoPadrao';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from "expo-local-authentication";
import { LoginBeneficiario } from '@/app/Services/loginService';

export default function Login() {
  const router = useRouter();
  const [acesso, setAcesso] = useState('');
  const [password, setPassword] = useState('');
  const [erroAcesso, setErroAcesso] = useState('');
  const [erroSenha, setErroSenha] = useState('');
  const [isEnabledCpf, setIsEnabledCpf] = useState(false);
  const [isEnabledDigital, setIsEnabledDigital] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const passwordRef = useRef<any>(null);

  // Carregar configurações salvas
  useEffect(() => {
    const loadSavedSettings = async () => {
      try {
        // Carregar lembrete de CPF
        const lembrarCpf = await AsyncStorage.getItem('lembrarCpf');
        if (lembrarCpf === 'true') {
          setIsEnabledCpf(true);
          const cpfSalvo = await AsyncStorage.getItem('cpfLogin');
          if (cpfSalvo) {
            setAcesso(cpfSalvo);
          }
        }

        // Carregar configuração de biometria
        const biometricEnabled = await AsyncStorage.getItem('biometricEnabled');
        if (biometricEnabled === 'true') {
          setIsEnabledDigital(true);
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      }
    };

    loadSavedSettings();
  }, []);

  // Verificar autenticação biométrica disponível
  useEffect(() => {
    const checkBiometricAvailability = async () => {
      try {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        
        if (!compatible || !isEnrolled) {
          setIsEnabledDigital(false);
          await AsyncStorage.setItem('biometricEnabled', 'false');
        }
      } catch (error) {
        console.error('Erro ao verificar biometria:', error);
      }
    };

    checkBiometricAvailability();
  }, []);

  const handleToggleCpf = useCallback(async () => {
    const novoValor = !isEnabledCpf;
    setIsEnabledCpf(novoValor);
    
    try {
      await AsyncStorage.setItem('lembrarCpf', novoValor.toString());
      if (novoValor && acesso) {
        await AsyncStorage.setItem('cpfLogin', acesso);
      } else {
        await AsyncStorage.removeItem('cpfLogin');
      }
    } catch (error) {
      console.error('Erro ao salvar configuração de CPF:', error);
    }
  }, [isEnabledCpf, acesso]);

  const handleToggleBiometric = useCallback(async () => {
    const novoValor = !isEnabledDigital;
    
    // Verificar se a biometria está disponível antes de habilitar
    if (novoValor) {
      try {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        
        if (!compatible || !isEnrolled) {
          Alert.alert(
            'Biometria não disponível',
            'Seu dispositivo não suporta biometria ou não há biometria cadastrada.'
          );
          return;
        }
      } catch (error) {
        console.error('Erro ao verificar biometria:', error);
        return;
      }
    }
    
    setIsEnabledDigital(novoValor);
    
    try {
      await AsyncStorage.setItem('biometricEnabled', novoValor.toString());
      if (!novoValor) {
        await AsyncStorage.removeItem('@userCredentials');
      }
    } catch (error) {
      console.error('Erro ao salvar configuração de biometria:', error);
    }
  }, [isEnabledDigital]);

  const handleAuthentication = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Autentique-se para acessar",
        fallbackLabel: "Usar senha",
        disableDeviceFallback: false
      });

      if (result.success) {
        const savedCredentials = await AsyncStorage.getItem('@userCredentials');
        if (savedCredentials) {
          const { acesso: savedAcesso, password: savedPassword } = JSON.parse(savedCredentials);
          await handleLogin(savedAcesso, savedPassword);
        }
      } else {
        // Não mostra alerta se o usuário apenas cancelou a biometria
        console.log('Autenticação biométrica cancelada pelo usuário');
      }
    } catch (error) {
      console.error('Erro na autenticação biométrica:', error);
      Alert.alert('Erro', 'Falha na autenticação biométrica.');
    }
  };

  const handleLogin = async (cpf: string, senha: string) => {
    if (!cpf || cpf.length < 11 || !senha) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos corretamente.');
      return;
    }

    setIsLoading(true);

    try {
      const fcmToken = await AsyncStorage.getItem('fcmToken');
      
      const loginData = {
        cpf,
        senha: senha,
        token: fcmToken || '',
      };

      const response = await LoginBeneficiario(loginData);

      if (response.status === 200) {
        const token = response.data.hash;
        
        // VERIFICAR SE O TOKEN EXISTE ANTES DE SALVAR
        if (!token) {
          throw new Error('Token não recebido do servidor');
        }
        
        // Salvar token de autenticação
        await AsyncStorage.setItem('@auth_token', token);
        await AsyncStorage.setItem('isAuthenticated', 'true');
        
        // Salvar credenciais se a biometria estiver habilitada
        if (isEnabledDigital) {
          await AsyncStorage.setItem('@userCredentials', JSON.stringify({
            acesso: cpf,
            password: senha
          }));
        }
        
        // Salvar CPF se a opção estiver habilitada
        if (isEnabledCpf) {
          await AsyncStorage.setItem('cpfLogin', cpf);
        }

        router.replace('/(app)');
      } else {
        Alert.alert('Login', response.data.mensagem || 'Erro ao fazer login');
      }
    } catch (error: any) {      
      // Tratamento específico para erro de token
      if (error.message === 'Token não recebido do servidor') {
        Alert.alert('Erro', 'Não foi possível obter o token de autenticação. Tente novamente.');
      } else {
        Alert.alert('Login', error.response?.data?.mensagem || 'Erro ao conectar com o servidor');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Validações
    if (!acesso || acesso.length < 11) {
      setErroAcesso('CPF inválido');
      return;
    }

    if (!password) {
      setErroSenha('Senha obrigatória');
      return;
    }

    await handleLogin(acesso, password);
  };

  const handleResetarSenha = () => {
    router.push('/(auth)/password');
  };

  // Tentar autenticação biométrica automaticamente apenas no primeiro carregamento
  useEffect(() => {
    const tryBiometricAuth = async () => {
      if (isFirstLoad && isEnabledDigital) {
        setIsFirstLoad(false);
        const hasCredentials = await AsyncStorage.getItem('@userCredentials');
        
        if (hasCredentials) {
          // Pequeno delay para carregar a interface primeiro
          setTimeout(() => {
            handleAuthentication();
          }, 500);
        }
      }
    };

    tryBiometricAuth();
  }, [isEnabledDigital, isFirstLoad]);

  return (
    <View style={{ flex: 1 }}>
      <HeaderAuxiliar rota={"/"}/>
 
      <View style={styles.header}>
        <Image 
          source={require('@/assets/images/assim/logo.png')}
          style={styles.imgHeader}
          resizeMode='contain'
        />
        <TextPadrao text="Pronto, agora é só fazer o login e aproveitar as facilidades da Agência Virtual!" />
      </View>

      <ScrollView style={styles.form}>
        <InputText 
          label='CPF (Apenas números)'
          keyboardType='numeric'
          returnKeyType="next"
          max={11}
          value={acesso}
          onChangeText={(text) => {
            const numericText = text.replace(/[^0-9]/g, '');
            setAcesso(numericText);
            if (numericText) setErroAcesso('');
          }}
          errorMessage={erroAcesso}
          onSubmitEditing={() => passwordRef.current?.focus()}
        />

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel} allowFontScaling={false}>Lembrar CPF</Text>
          <Switch
            trackColor={{ false: "#767577", true: Colors.azulClaro }}
            thumbColor={isEnabledCpf ? Colors.azulIntermediario : "#f4f3f4"}
            onValueChange={handleToggleCpf}
            value={isEnabledCpf}
          />
        </View>

        <InputText 
          // ref={passwordRef}
          label="Senha"
          secureTextEntry={true}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (text) setErroSenha('');
          }}
          errorMessage={erroSenha}
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />

        <TouchableOpacity style={{ marginTop: 15, marginBottom: 20 }} onPress={handleResetarSenha}>
          <TextPadrao 
            text='Esqueci a senha' 
            styleText={{ fontSize: 14, fontWeight: 400, width: "100%", textAlign: "right"}}
          />
        </TouchableOpacity>

        <BotaoPadrao 
          text='ENTRAR' 
          onPress={handleSubmit}
          Loading={isLoading}
        />

        <View style={[styles.switchContainer, {marginTop: 30}]}>
          <Text style={styles.switchLabel} allowFontScaling={false}>
            {isEnabledDigital ? "Digital Habilitada" : "Habilitar digital"}
          </Text>
          <Switch
            trackColor={{ false: "#767577", true: Colors.azulClaro }}
            thumbColor={isEnabledDigital ? Colors.azulIntermediario : "#f4f3f4"}
            onValueChange={handleToggleBiometric}
            value={isEnabledDigital}
          />
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    marginTop: 40,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    gap: 20
  },
  imgHeader: {
    width: "80%",
    height: 60,
    alignSelf: 'center',
  },
  form: {
    marginTop: 20,
    paddingHorizontal: 20
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    width: "100%",
    marginVertical: 10,
  },
  switchLabel: {
    textAlign: "right",
    fontSize: 14,
    marginRight: 10,
    color: Colors.azulIntermediario,
  }
});