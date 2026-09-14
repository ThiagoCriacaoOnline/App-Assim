import { View, StyleSheet, Image, Alert } from 'react-native'
import React, { useState } from 'react'
import { Colors } from '@/app/Constants/Constants';
import HeaderAuxiliar from '@/app/Componentes/navigation/HeaderAuxiliar';
import TextPadrao from '@/app/Componentes/TextPadrao';
import { useLocalSearchParams, useRouter } from 'expo-router';
import InputText from '@/app/Componentes/InputText';
import { MaterialIcons } from '@expo/vector-icons';
import BotaoPadrao from '@/app/Componentes/Botoes/BotaoPadrao';
import VerificacaoCadastro from './verificacaoCadastro';
import { ValidarCodigo } from '@/app/Services/PrimeiroAcessoServices';

export default function VerificacaoCodigo() {
    const router = useRouter();
    const { tipoContato, contato } = useLocalSearchParams();
    const [codigo, setCodigo] = useState('');
    const [erroCodigo, setErroCodigo] = useState('');
    const [loading, setLoading] = useState(false);
    const mensagem = `Insira no campo abaixo o código enviado para ${tipoContato === 'telefone' ? 'o telefone' : 'o e-mail'} ${contato}`;

    const handleSubmit = async () => {
        // Limpar erro anterior
        setErroCodigo('');

        if (!codigo.trim()) {
            setErroCodigo('Por favor, insira o código de verificação');
            return;
        }

        if (codigo.length !== 6) {
            setErroCodigo('O código deve ter exatamente 6 dígitos');
            return;
        }

        if (!/^\d+$/.test(codigo)) {
            setErroCodigo('O código deve conter apenas números');
            return;
        }

        setLoading(true);
        
        try{
            const data = {
                codToken: codigo
            };

            const response = await ValidarCodigo(data);

            if(response.status === 200 || response.status == 201) {
                router.replace({
                    pathname: '/(auth)/register/cadastrarSenha',
                    params: {codigo: codigo}
                });
            } else {
                Alert.alert('Erro', response.data.retorno.mensagem);
            }

        }catch(error: any){
             if (error.response) {
                Alert.alert("Primeiro acesso", error.response);
            } else if (error.request) {
                setErroCodigo('Erro de conexão. Verifique sua internet e tente novamente.');
            } else {
                setErroCodigo('Ocorreu um erro inesperado. Tente novamente.');
            }
        }finally {
            setLoading(false);
        }
    }

    return (
        <View style={{ flex: 1 }}>
            <HeaderAuxiliar rota={"/register"} />

            <View style={styles.header}>
                <Image 
                    source={require('@/assets/images/assim/logo.png')}
                    style={styles.imgHeader}
                    resizeMode='contain'
                />
                <TextPadrao text={mensagem} />
            </View>

            <View style={styles.form}>
                
                <InputText 
                    label='Código de verificação' 
                    labelColor={Colors.azulIntermediario}
                    placeholder='000000' 
                    startIcon={<MaterialIcons name="security" size={24} color={Colors.azulIntermediario} />}
                    keyboardType='numeric'
                    value={codigo}
                    onChangeText={(text) => {
                        // Permitir apenas números e limitar a 6 caracteres
                        const numericText = text.replace(/[^0-9]/g, '');
                        if (numericText.length <= 6) {
                            setCodigo(numericText);
                        }
                        if (numericText) setErroCodigo('');
                    }}
                    errorMessage={erroCodigo}
                    max={6}
                    onSubmitEditing={handleSubmit}
                />

                <BotaoPadrao 
                    text='Enviar' 
                    Loading={loading} 
                    onPress={handleSubmit} 
                    styleButton={{marginTop: 30}}
                />    

            </View>
            
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