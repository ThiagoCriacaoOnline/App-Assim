import { View, StyleSheet, Image, ScrollView, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import HeaderAuxiliar from '@/app/Componentes/navigation/HeaderAuxiliar';
import TextPadrao from '@/app/Componentes/TextPadrao';
import RadioGroup, { RadioButtonProps } from 'react-native-radio-buttons-group';
import { Colors } from '@/app/Constants/Constants';
import BotaoPadrao from '@/app/Componentes/Botoes/BotaoPadrao';
import { EnvioDeCodigo } from '@/app/Services/PrimeiroAcessoServices';

export default function VerificacaoCadastro() {
    const router = useRouter();
    const { retorno } = useLocalSearchParams();
    const [loading, setLoading] = useState(false);

    // Garantir que parsedRetorno sempre seja objeto
    const parsedRetorno = retorno ? JSON.parse(retorno as string) : { sms: [], email: [] };

    const [radioButtons, setRadioButtons] = useState<RadioButtonProps[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        const smsArray = Array.isArray(parsedRetorno.sms) ? parsedRetorno.sms : [];
        const emailArray = Array.isArray(parsedRetorno.email) ? parsedRetorno.email : [];

        const options: RadioButtonProps[] = [
            ...smsArray.map((item: any, index: number) => ({
                id: item.id,
                label: `Telefone: ${item.contato}`,
                value: item.id,
                labelStyle: styles.radioLabel,
                color: Colors.azulIntermediario,
                borderColor: Colors.azulIntermediario,
                selected: index === 0 && smsArray.length > 0 // Seleciona o primeiro SMS se existir
            })),
            ...emailArray.map((item: any, index: number) => ({
                id: item.id,
                label: `E-mail: ${item.contato}`,
                labelStyle: styles.radioLabel,
                value: item.id,
                color: Colors.azulIntermediario,
                borderColor: Colors.azulIntermediario,
                selected: index === 0 && smsArray.length === 0 // Seleciona o primeiro e-mail se não houver SMS
            }))
        ];

        // Encontrar o ID do item selecionado
        const selectedOption = options.find(option => option.selected);
        if (selectedOption) {
            setSelectedId(selectedOption.id);
        }

        setRadioButtons(options);
    }, []);

    function onPressRadioButton(selectedId: string) {
        setSelectedId(selectedId);
        // Atualizar o estado dos radio buttons para refletir a seleção
        setRadioButtons(prevButtons => 
            prevButtons.map(button => ({
                ...button,
                selected: button.id === selectedId
            }))
        );
    }

    const handleSubmit = async () => {
    setLoading(true);

    try {
        const data = {
            OPtoken: selectedId
        }

        const response = await EnvioDeCodigo(data);
        
            if(response.status === 200) {
                const selectedOption = radioButtons.find(button => button.id === selectedId);
                let tipo = '';
                let contato = '';
                
                if (selectedOption) {
                    // Determina se é telefone ou email e pega o valor completo
                    tipo = selectedOption.label.startsWith('Telefone') ? 'telefone' : 'email';
                    contato = selectedOption.label.split(': ')[1];
                }

                router.push({
                    pathname: "/register/verificacaoCodigo",
                    params: {
                        tipoContato: tipo,
                        contato: contato
                    }
                });
            } else {
                throw response;
            }
        } catch(error: any) {
            const errorMessage = error?.mensagem || error?.message || 'Erro desconhecido';
            Alert.alert("Atenção", errorMessage);
            
            console.error('Erro na requisição:', error);
        } finally {
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
                <TextPadrao text="Para garantir sua segurança, enviaremos um código de verificação." />
            </View>

            <ScrollView style={styles.form}>
                <TextPadrao text='Enviar código de verificação.' styleText={{ fontSize: 16 }} />

                <View style={{ width: "100%", alignItems: "flex-start", marginTop: 20, marginBottom: 40 }}>
                    {radioButtons.length > 0 && (
                        <RadioGroup
                            containerStyle={{ alignItems: "flex-start" }}
                            radioButtons={radioButtons}
                            onPress={(id) => onPressRadioButton(id)}
                            selectedId={selectedId || undefined}
                            layout="column"
                        />
                    )}
                </View>

                <BotaoPadrao text='Enviar' Loading={loading} onPress={handleSubmit}/>
            </ScrollView>
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