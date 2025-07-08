import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
// Import the 'where' function for querying
import { getFirestore, collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; // Import getAuth
import firebaseApp from './firebaseConfig.js';

export default function HistoryScreen() {
  const [readings, setReadings] = useState([]);
  const auth = getAuth(firebaseApp);
  const user = auth.currentUser;

  useEffect(() => {
    if (user) { // Only fetch data if a user is logged in
      const db = getFirestore(firebaseApp);
      // Create a query that filters by the current user's ID
      const q = query(
        collection(db, "readings"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const readingsData = [];
        querySnapshot.forEach((doc) => {
          readingsData.push({ ...doc.data(), id: doc.id });
        });
        setReadings(readingsData);
      });

      return () => unsubscribe();
    }
  }, [user]); // Re-run the effect if the user changes

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemText}>
        Systolic: {item.systolic}, Diastolic: {item.diastolic}
      </Text>
      <Text style={styles.dateText}>
        {item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleString() : 'No date'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Your Readings History</Text>
      <FlatList
        data={readings}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={<Text>No readings found for this user.</Text>}
      />
    </SafeAreaView>
  );
}

// Styles remain the same
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
    itemContainer: {
        backgroundColor: '#f5f5f5',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
    },
    itemText: {
        fontSize: 16,
        fontWeight: '500',
    },
    dateText: {
        fontSize: 12,
        color: 'gray',
        marginTop: 5,
    },
});