import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme, firebaseApp } from '../global.js';
import { FontAwesome5 } from '@expo/vector-icons'; // Import a new icon set

// A new reusable component for our feature cards
const FeatureCard = ({ icon, title, description, onPress, color, textColor }) => (
  <Pressable onPress={onPress} style={[styles.featureCard, { backgroundColor: color }]}>
    <FontAwesome5 name={icon} size={24} color={textColor} />
    <View style={styles.cardTextContainer}>
      <Text style={[styles.cardTitle, { color: textColor }]}>{title}</Text>
      <Text style={[styles.cardDescription, { color: textColor }]}>{description}</Text>
    </View>
  </Pressable>
);

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <ScrollView style={[{ backgroundColor: colors.background }]}>
      <View style={styles.container}>
        {/* --- ADD THE LOGO --- */}
        <FontAwesome5 name="heartbeat" size={50} color={colors.primary} style={{ marginBottom: 20 }} />

        <Text style={[styles.title, { color: colors.text }]}>Welcome Home!</Text>
        <Text style={[styles.subtitle, { color: 'gray' }]}>Your health journey starts here.</Text>
        
        {/* --- ADD NEW FEATURE CARDS --- */}
        <FeatureCard
          icon="plus-circle"
          title="Log New Reading"
          description="Enter your latest blood pressure measurement."
          onPress={() => router.push('/log_reading')}
          color={colors.primary}
          textColor={colors.primaryText}
        />
        <FeatureCard
          icon="chart-line"
          title="View History & Chart"
          description="See your progress and trends over time."
          onPress={() => router.push('/history')}
          color={colors.card}
          textColor={colors.text}
        />
        <FeatureCard
          icon="weight"
          title="Track Your Weight"
          description="Log your daily weight to see the bigger picture."
          onPress={() => router.push('/track_weight')}
          color={colors.card}
          textColor={colors.text}
        />
        <FeatureCard
          icon="pills"
          title="Manage Medications"
          description="View your medication list and log your adherence."
          onPress={() => router.push('/medications')}
          color={colors.card}
          textColor={colors.text}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'Inter_700Bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
  },
  // --- NEW STYLES FOR FEATURE CARDS ---
  featureCard: {
    width: '100%',
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  cardTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardDescription: {
    fontSize: 14,
    marginTop: 4,
  },
});