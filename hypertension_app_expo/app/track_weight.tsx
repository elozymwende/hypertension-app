import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button, SafeAreaView, Alert, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { getFirestore, collection, addDoc, serverTimestamp, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useTheme, firebaseApp } from './global.js';

export default function TrackWeightScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [weight, setWeight] = useState('');
  const [weightHistory, setWeightHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const auth = getAuth(firebaseApp);
  const user = auth.currentUser;

  // Fetch weight history
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    const db = getFirestore(firebaseApp);
    const q = query(collection(db, "weight_log"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const historyData = [];
      querySnapshot.forEach((doc) => {
        historyData.push({ ...doc.data(), id: doc.id });
      });
      setWeightHistory(historyData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSaveWeight = async () => {
    if (weight.trim() === '' || !user) {
      Alert.alert('Error', 'Please enter a valid weight.');
      return;
    }
    try {
      const db = getFirestore(firebaseApp);
      await addDoc(collection(db, "weight_log"), {
        userId: user.uid,
        weight: parseFloat(weight),
        createdAt: serverTimestamp(),
      });
      Alert.alert('Success', 'Weight saved!');
      setWeight('');
    } catch (e) {
      console.error("Error saving weight: ", e);
      Alert.alert('Error', 'Could not save weight.');
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.itemContainer, { backgroundColor: colors.card }]}>
      <Text style={[styles.itemText, { color: colors.text }]}>Weight: {item.weight} kg</Text>
      <Text style={styles.dateText}>
        {item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() : 'No date'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Track Your Weight</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          placeholder="Enter today's weight in kg"
          placeholderTextColor="gray"
          keyboardType="numeric"
          value={weight}
          onChangeText={setWeight}
        />
        <Button title="Save Weight" onPress={handleSaveWeight} color={colors.primary} />
      </View>
      
      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <FlatList
          data={weightHistory}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          ListEmptyComponent={<Text style={{ color: colors.text, textAlign: 'center' }}>No weight entries yet.</Text>}
        />
      )}
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
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  itemContainer: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 16,
  },
  dateText: {
    fontSize: 14,
    color: 'gray',
  },
});