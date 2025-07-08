import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, FlatList, Pressable } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import firebaseApp from './firebaseConfig.js';

export default function DoctorDashboard() {
  const router = useRouter();
  const auth = getAuth(firebaseApp);
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const db = getFirestore(firebaseApp);
    // Create a query to find all users with the role 'patient'
    const q = query(collection(db, "users"), where("role", "==", "patient"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const patientsData = [];
      querySnapshot.forEach((doc) => {
        patientsData.push({ id: doc.id, ...doc.data() });
      });
      setPatients(patientsData);
    });

    return () => unsubscribe();
  }, []);

  const handleLogOut = () => {
    signOut(auth).then(() => {
      router.replace('/');
    });
  };

  const renderPatient = ({ item }) => (
    <Pressable style={styles.patientItem}>
      <Text style={styles.patientEmail}>{item.email}</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Patient List</Text>
      
      <FlatList
        data={patients}
        renderItem={renderPatient}
        keyExtractor={(item) => item.id}
        style={styles.list}
        ListEmptyComponent={<Text>No patients found.</Text>}
      />

      <View style={{ marginTop: 30 }}>
        <Button title="Log Out" onPress={handleLogOut} color="#d9534f" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  list: {
    width: '100%',
  },
  patientItem: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    marginVertical: 8,
    borderRadius: 8,
  },
  patientEmail: {
    fontSize: 16,
  },
});