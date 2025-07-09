import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { getFirestore, collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { useTheme } from './global.js';
import { firebaseApp } from './global.js';

// This component stays the same, it just displays the data it's given
const LifestyleTip = ({ title, content, color, textColor }) => (
  <View style={[styles.card, { backgroundColor: color }]}>
    <Text style={[styles.cardTitle, { color: textColor }]}>{title}</Text>
    <Text style={[styles.cardContent, { color: textColor }]}>{content}</Text>
  </View>
);

export default function LifestyleScreen() {
  const { colors } = useTheme();
  const [tips, setTips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- NEW: Fetch tips from Firestore ---
  useEffect(() => {
    const db = getFirestore(firebaseApp);
    const q = query(collection(db, "lifestyle_tips"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tipsData = [];
      querySnapshot.forEach((doc) => {
        tipsData.push({ id: doc.id, ...doc.data() });
      });
      setTips(tipsData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Lifestyle & Diet Tips</Text>
      
      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <FlatList
          data={tips}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <LifestyleTip
              title={item.title}
              content={item.content}
              color={colors.card}
              textColor={colors.text}
            />
          )}
          ListEmptyComponent={<Text style={{ color: colors.text, textAlign: 'center' }}>No tips available at the moment.</Text>}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    fontFamily: 'Inter_700Bold',
  },
  card: {
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cardContent: {
    fontSize: 16,
    lineHeight: 24,
  }
});