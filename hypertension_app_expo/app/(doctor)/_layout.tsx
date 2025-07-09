import { Tabs } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../global.js';

export default function DoctorTabsLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabIcon,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <FontAwesome5 name="tachometer-alt" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="patients"
        options={{
          title: 'Patients',
          tabBarIcon: ({ color }) => <FontAwesome5 name="users" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="all_readings"
        options={{
          title: 'All Readings',
          tabBarIcon: ({ color }) => <FontAwesome5 name="chart-line" size={24} color={color} />,
        }}
      />
       <Tabs.Screen
        name="tips"
        options={{
          title: 'Lifestyle Tips',
          tabBarIcon: ({ color }) => <FontAwesome5 name="leaf" size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <FontAwesome5 name="user-md" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}