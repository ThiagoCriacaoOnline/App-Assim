import { View, Text, StyleSheet, Image, Alert, BackHandler } from 'react-native'
import React, { useState, useEffect } from 'react'
import HeaderAuxiliar from '@/app/Componentes/navigation/HeaderAuxiliar'
import TextPadrao from '@/app/Componentes/TextPadrao';
import { Colors } from '@/app/Constants/Constants';
import { useLocalSearchParams, useRouter } from 'expo-router';
import InputText from '@/app/Componentes/InputText';
import { AntDesign } from '@expo/vector-icons';
import PasswordRules from '@/app/Componentes/PasswordRules';
import BotaoPadrao from '@/app/Componentes/Botoes/BotaoPadrao';
import { CadastrarSenhaPrimeiroAcesso } from '@/app/Services/PrimeiroAcessoServices';

export default function CadastrarSenha() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(300);
  const [timerExpired, setTimerExpired] = useState(false);
  const {codigo} = useLocalSearchParams();

  const [password, setPassword] = useState('');
  const [errorPassword, setErrorPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorConfirmPassword, setErrorConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setTimerExpired(true);
          showExpirationAlert();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [timerExpired]);

  const showExpirationAlert = () => {
    Alert.alert(
      'Tempo Esgotado',
      'O código de verificação expirou. Você será redirecionado para solicitar um novo código.',
      [
        {
          text: 'OK',
          onPress: () => {
            router.replace('/register');
          }
        }
      ],
      { cancelable: false }
    );
  };

  const validatePassword = () => {
    let isValid = true;
    
    if (!password.trim()) {
      setErrorPassword('Por favor, digite sua senha');
      isValid = false;
    }
    
    if (!confirmPassword.trim()) {
      setErrorConfirmPassword('Por favor, confirme sua senha');
      isValid = false;
    }
    
    if (password !== confirmPassword) {
      setErrorConfirmPassword('As senhas não coincidem');
      isValid = false;
    }
    
    if (password.length < 4 || password.length > 8) {
      setErrorPassword('A senha deve ter entre 4 e 8 caracteres');
      isValid = false;
    }
    
    if (!/^[a-zA-Z0-9]+$/.test(password)) {
      setErrorPassword('A senha deve conter apenas letras e números');
      isValid = false;
    }
    
    return isValid;
  };

  const handleSubmit = async () => {
    // Limpar erros anteriores
    setErrorPassword('');
    setErrorConfirmPassword('');
    
    // Validar os campos antes de enviar
    if (!validatePassword()) {
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await CadastrarSenhaPrimeiroAcesso({
        codToken: codigo as string,
        senha: password,
        confirmaSenha: confirmPassword
      });

      if(response.status === 200 || response.status == 201) {
          Alert.alert('Primeiro Acesso', response.data.mensagem);
          router.replace({
              pathname: '/(auth)/login',
              params: {codigo: codigo}
          });
      } else {
          Alert.alert('Erro', response.data.retorno.mensagem);
      }
      
    } catch (error: any) {
      console.log(error);
      
      if (error.response?.data?.retorno?.mensagem) {
        Alert.alert('Erro', error.response.data.retorno.mensagem);
      } else {
        Alert.alert('Erro', 'Ocorreu um erro ao cadastrar a senha. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <HeaderAuxiliar rota={"/register"} />
      
      <View style={styles.header}>
        <Image 
          source={require('@/assets/images/assim/logo.png')}
          style={styles.imgHeader}
          resizeMode='contain'
        />
        <TextPadrao text="Crie sua senha para completar o cadastro." />
      </View>

      <View style={styles.form}>
        <InputText
          label="Senha"
          labelColor={Colors.azulIntermediario}
          placeholder="Digite sua senha"
          startIcon={<AntDesign name="lock" size={24} color={Colors.azulIntermediario} />}
          secureTextEntry={true}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (text) setErrorPassword('');
          }}
          errorMessage={errorPassword}
        />

        <InputText
          label="Confirmar senha"
          labelColor={Colors.azulIntermediario}
          placeholder="Repita sua senha"
          startIcon={<AntDesign name="lock" size={24} color={Colors.azulIntermediario} />}
          secureTextEntry={true}
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            if (text) setErrorConfirmPassword('');
          }}
          errorMessage={errorConfirmPassword}
          onSubmitEditing={handleSubmit}
        />

        <PasswordRules password={password}/>

        <BotaoPadrao 
          text='Enviar' 
          Loading={isLoading} 
          onPress={handleSubmit} 
          styleButton={{marginTop: 40}}
        />  
      </View>
    </View>
  );
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
    alignSelf: 'center'
  },
  form: {
    marginTop: 20,
    paddingHorizontal: 20
  },
  radioLabel: {
    color: Colors.azulIntermediario,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: 'left'
  }
});