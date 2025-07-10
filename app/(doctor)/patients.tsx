import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore';
import { useTheme } from '../global.js';
import { firebaseApp } from '../global.js';

export default function PatientsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const db = getFirestore(firebaseApp);
    const q = query(collection(db, "users"), where("role", "==", "patient"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const patientsData = [];
      querySnapshot.forEach((doc) => {
        patientsData.push({ id: doc.id, ...doc.data() });
      });
      setPatients(patientsData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const renderPatient = ({ item }) => (
    <Pressable 
      style={[styles.patientItem, { backgroundColor: colors.card }]} 
      onPress={() => router.push(`/patient/${item.id}`)}
    >
      <Text style={[styles.patientEmail, { color: colors.text }]}>{item.email}</Text>
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <FlatList
          data={patients}
          renderItem={renderPatient}
          keyExtractor={(item) => item.id}
          style={styles.list}
          ListEmptyComponent={<Text style={{ color: colors.text }}>No patients found.</Text>}
        />
      )}
    </View>
  );
}

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
    marginBottom: 20,
    fontFamily: 'Inter_700Bold',
  },
  list: {
    width: '100%',
  },
  patientItem: {
    padding: 20,
    marginVertical: 8,
    borderRadius: 8,
  },
  patientEmail: {
    fontSize: 16,
  },
});