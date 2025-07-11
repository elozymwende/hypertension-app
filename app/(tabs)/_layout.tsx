import { FontAwesome } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../global.js';

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          height: 60,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={focused ? [styles.activeTab, { backgroundColor: colors.primary }] : styles.inactiveTab}>
              <FontAwesome name="home" size={24} color={focused ? colors.primaryText : colors.tabIcon} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={focused ? [styles.activeTab, { backgroundColor: colors.primary }] : styles.inactiveTab}>
              <FontAwesome name="history" size={24} color={focused ? colors.primaryText : colors.tabIcon} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={focused ? [styles.activeTab, { backgroundColor: colors.primary }] : styles.inactiveTab}>
              <FontAwesome name="user" size={24} color={focused ? colors.primaryText : colors.tabIcon} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  activeTab: {
    width: 55,
    height: 55,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inactiveTab: {
    width: 55,
    height: 55,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba:(255, 255, 255, 0.1)'
  },
});