import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useTheme } from './global.js';
import { firebaseApp } from './global.js';

export default function LogReadingScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // This is the single, correct version of the function
  const handleSave = async () => {
    if (!systolic || !diastolic) {
      Alert.alert('Error', 'Please fill out both fields.');
      return;
    }

    setIsLoading(true);
    const auth = getAuth(firebaseApp);
    const user = auth.currentUser;
    const systolicValue = parseInt(systolic, 10);
    const diastolicValue = parseInt(diastolic, 10);

    if (user) {
      try {
        const db = getFirestore(firebaseApp);
        await addDoc(collection(db, "readings"), {
          userId: user.uid,
          systolic: systolicValue,
          diastolic: diastolicValue,
          createdAt: serverTimestamp(),
        });
        
        // Check for high blood pressure
        if (systolicValue >= 130 || diastolicValue >= 80) {
            Alert.alert(
                "High Reading Alert", 
                "Your blood pressure reading is higher than normal. Please monitor it closely and consult your doctor.",
                [{ text: "OK" }]
            );
        } else {
            Alert.alert('Success', 'Reading saved!');
        }
        
        router.back();
      } catch (e) {
        console.error("Error adding document: ", e);
        Alert.alert('Error', 'Could not save reading.');
      } finally {
        setIsLoading(false);
      }
    } else {
      Alert.alert('Error', 'You must be logged in to save readings.');
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Log New Reading</Text>

      <TextInput
        style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        placeholder="Systolic (e.g., 120)"
        placeholderTextColor="gray"
        keyboardType="number-pad"
        value={systolic}
        onChangeText={setSystolic}
      />

      <TextInput
        style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        placeholder="Diastolic (e.g., 80)"
        placeholderTextColor="gray"
        keyboardType="number-pad"
        value={diastolic}
        onChangeText={setDiastolic}
      />
      
      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <Button title="Save Reading" onPress={handleSave} color={colors.primary} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 15,
  },
});