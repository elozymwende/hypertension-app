import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; // Import getAuth
import firebaseApp from './firebaseConfig.js';

export default function LogReadingScreen() {
  const router = useRouter();
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');

  const handleSave = async () => {
    if (!systolic || !diastolic) {
      Alert.alert('Error', 'Please fill out both fields.');
      return;
    }

    const auth = getAuth(firebaseApp);
    const user = auth.currentUser; // Get the currently logged-in user

    if (user) {
      try {
        const db = getFirestore(firebaseApp);
        // Add a new document with the user's ID
        await addDoc(collection(db, "readings"), {
          userId: user.uid, // Add the user's unique ID
          systolic: parseInt(systolic, 10),
          diastolic: parseInt(diastolic, 10),
          createdAt: serverTimestamp(),
        });

        Alert.alert('Success', 'Reading saved!');
        router.back();
      } catch (e) {
        console.error("Error adding document: ", e);
        Alert.alert('Error', 'Could not save reading.');
      }
    } else {
      Alert.alert('Error', 'You must be logged in to save readings.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Log New Reading</Text>
      <TextInput
        style={styles.input}
        placeholder="Systolic (e.g., 120)"
        keyboardType="number-pad"
        value={systolic}
        onChangeText={setSystolic}
      />
      <TextInput
        style={styles.input}
        placeholder="Diastolic (e.g., 80)"
        keyboardType="number-pad"
        value={diastolic}
        onChangeText={setDiastolic}
      />
      <Button title="Save Reading" onPress={handleSave} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 15,
  },
});