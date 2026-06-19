import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';

import { HapticTab } from '@/src/componentes/interface/HapticTab';
import { cores } from '@/src/constantes/tema';
import { useDadosClinica } from '@/src/contextos/DadosClinicaContexto';

export default function TabLayout() {
  const { perfilUsuario } = useDadosClinica();
  const podeGerenciarClinica =
    perfilUsuario?.cargo === 'administrador' || perfilUsuario?.cargo === 'atendente';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: cores.azulProfundo,
        tabBarInactiveTintColor: cores.textoSuave,
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: 12,
          height: 76,
          paddingTop: 8,
          paddingBottom: 10,
          borderTopWidth: 1,
          borderTopColor: cores.bordaClara,
          borderRadius: 28,
          backgroundColor: 'rgba(255,255,255,0.72)',
          overflow: 'hidden',
          shadowColor: cores.sombra,
          shadowOffset: { width: 0, height: 16 },
          shadowOpacity: 0.16,
          shadowRadius: 30,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '800',
        },
        tabBarBackground: () => (
          <BlurView
            blurReductionFactor={1}
            experimentalBlurMethod="dimezisBlurView"
            intensity={84}
            tint="extraLight"
            style={StyleSheet.absoluteFill}
          />
        ),
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Agenda',
          tabBarIcon: ({ color }) => <MaterialIcons size={25} name="event-note" color={color} />,
        }}
      />
      <Tabs.Screen
        name="pacientes"
        options={{
          title: 'Pacientes',
          href: podeGerenciarClinica ? undefined : null,
          tabBarIcon: ({ color }) => <MaterialIcons size={25} name="people-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profissionais"
        options={{
          title: 'Profissionais',
          href: podeGerenciarClinica ? undefined : null,
          tabBarIcon: ({ color }) => <MaterialIcons size={25} name="badge" color={color} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => (
            <MaterialIcons size={25} name="person-outline" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
