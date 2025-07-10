import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useTheme } from './global.js';
import { firebaseApp } from './global.js';
import StyledButton from './components/StyledButton';

// A new component for displaying a goal
const GoalDisplayCard = ({ label, value, unit, colors }) => (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.cardLabel, { color: 'gray'}]}>{label}</Text>
        <Text style={[styles.cardValue, { color: colors.text }]}>{value || 'Not set'}</Text>
        {value && <Text style={[styles.cardUnit, { color: 'gray'}]}> {unit}</Text>}
    </View>
);

export default function HealthGoalsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const auth = getAuth(firebaseApp);
  const user = auth.currentUser;

  const [targetSystolic, setTargetSystolic] = useState('');
  const [targetDiastolic, setTargetDiastolic] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch existing goals when the screen loads
  useEffect(() => {
    if (!user) return;
    const db = getFirestore(firebaseApp);
    const goalsDocRef = doc(db, "health_goals", user.uid);

    getDoc(goalsDocRef).then((docSnap) => {
      if (docSnap.exists()) {
        const goalsData = docSnap.data();
        setTargetSystolic(goalsData.systolic || '');
        setTargetDiastolic(goalsData.diastolic || '');
        setTargetWeight(goalsData.weight || '');
      }
      setIsLoading(false);
    });
  }, [user]);

  const handleSaveGoals = async () => {
    // ... (handleSaveGoals function remains the same)
  };

  if (isLoading) {
      return <ActivityIndicator size="large" color={colors.primary} style={{flex: 1, backgroundColor: colors.background}}/>
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: 'My Health Goals' }} />
      <Text style={[styles.title, { color: colors.text }]}>Your Health Goals</Text>
      
      {/* --- NEW: Display current goals --- */}
      <View style={styles.cardContainer}>
          <GoalDisplayCard label="Target Systolic" value={targetSystolic} unit="mmHg" colors={colors} />
          <GoalDisplayCard label="Target Diastolic" value={targetDiastolic} unit="mmHg" colors={colors} />
          <GoalDisplayCard label="Target Weight" value={targetWeight} unit="kg" colors={colors} />
      </View>

      <Text style={[styles.subtitle, { color: 'gray' }]}>Update your targets below:</Text>
      
      <TextInput
        style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        placeholder="Target Systolic (e.g., 120)"
        placeholderTextColor="gray"
        keyboardType="number-pad"
        value={targetSystolic}
        onChangeText={setTargetSystolic}
      />
      <TextInput
        style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        placeholder="Target Diastolic (e.g., 80)"
        placeholderTextColor="gray"
        keyboardType="number-pad"
        value={targetDiastolic}
        onChangeText={setTargetDiastolic}
      />
      <TextInput
        style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        placeholder="Target Weight in kg"
        placeholderTextColor="gray"
        keyboardType="numeric"
        value={targetWeight}
        onChangeText={setTargetWeight}
      />

      <StyledButton title="Save Goals" onPress={handleSaveGoals} color={colors.primary} textColor={colors.primaryText} />
    </SafeAreaView>
  );
}

// Add new styles for the cards
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'Inter_700Bold',
  },
  subtitle: {
      textAlign: 'center',
      marginBottom: 20,
      fontSize: 16,
  },
  cardContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 30,
      width: '100%',
  },
  card: {
      flex: 1,
      borderRadius: 8,
      padding: 15,
      alignItems: 'center',
      marginHorizontal: 5,
  },
  cardLabel: {
      fontSize: 12,
  },
  cardValue: {
      fontSize: 22,
      fontWeight: 'bold',
  },
  cardUnit: {
      fontSize: 12,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
});