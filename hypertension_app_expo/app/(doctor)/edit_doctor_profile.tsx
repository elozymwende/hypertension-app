import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useTheme } from '../global.js';
import { firebaseApp } from '../global.js';

export default function EditDoctorProfileScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const auth = getAuth(firebaseApp);
  const user = auth.currentUser;

  const [fullName, setFullName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current profile data
  useEffect(() => {
    if (!user) return;
    const db = getFirestore(firebaseApp);
    const userDocRef = doc(db, "users", user.uid);
    getDoc(userDocRef).then((docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setFullName(userData.fullName || '');
        setSpecialty(userData.specialty || '');
      }
      setIsLoading(false);
    });
  }, [user]);

  const handleSaveChanges = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const db = getFirestore(firebaseApp);
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        fullName: fullName,
        specialty: specialty,
      });
      Alert.alert("Success", "Profile updated successfully!");
      router.back();
    } catch (error) {
      console.error("Error updating profile: ", error);
      Alert.alert("Error", "Could not update profile.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1, backgroundColor: colors.background }}/>
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <TextInput
        style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        placeholder="Full Name"
        placeholderTextColor="gray"
        value={fullName}
        onChangeText={setFullName}
      />
      <TextInput
        style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        placeholder="Specialty (e.g., Cardiologist)"
        placeholderTextColor="gray"
        value={specialty}
        onChangeText={setSpecialty}
      />
      <Button title="Save Changes" onPress={handleSaveChanges} color={colors.primary} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: 'Inter_700Bold',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
});