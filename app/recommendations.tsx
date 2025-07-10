import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, ActivityIndicator } from 'react-native';
import { getFirestore, collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useTheme, firebaseApp } from './global.js';

export default function RecommendationsScreen() {
  const { colors } = useTheme();
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const auth = getAuth(firebaseApp);
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      const db = getFirestore(firebaseApp);
      // Query to find all recommendations for the current user
      const q = query(
        collection(db, "recommendations"),
        where("patientId", "==", user.uid),
        orderBy("createdAt", "desc")
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const recommendationsData = [];
        querySnapshot.forEach((doc) => {
          recommendationsData.push({ ...doc.data(), id: doc.id });
        });
        setRecommendations(recommendationsData);
        setIsLoading(false);
      });

      return () => unsubscribe();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const renderItem = ({ item }) => (
    <View style={[styles.itemContainer, { backgroundColor: colors.card }]}>
      <Text style={[styles.itemText, { color: colors.text }]}>{item.text}</Text>
      <Text style={styles.dateText}>
        Sent on: {item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleString() : 'No date'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Doctor's Recommendations</Text>
      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <FlatList
          data={recommendations}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          ListEmptyComponent={<Text style={{ color: colors.text }}>No recommendations found.</Text>}
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
  itemContainer: {
    padding: 20,
    borderRadius: 8,
    marginBottom: 10,
  },
  itemText: {
    fontSize: 16,
  },
  dateText: {
    fontSize: 12,
    color: 'gray',
    marginTop: 10,
    textAlign: 'right',
  },
});