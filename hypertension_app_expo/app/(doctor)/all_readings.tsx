import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, ActivityIndicator, Dimensions } from 'react-native';
import { getFirestore, collection, query, orderBy, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { useTheme } from '../global.js';
import { firebaseApp } from '../global.js';
import { LineChart } from 'react-native-chart-kit';

export default function AllReadingsScreen() {
  const { colors } = useTheme();
  const [readings, setReadings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const db = getFirestore(firebaseApp);
    const readingsQuery = query(collection(db, "readings"), orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(readingsQuery, async (querySnapshot) => {
      const promises = querySnapshot.docs.map(async (docData) => {
        const reading = { ...docData.data(), id: docData.id };
        
        if (reading.userId) {
          const userDocRef = doc(db, "users", reading.userId);
          const userDoc = await getDoc(userDocRef);
          reading.userEmail = userDoc.exists() ? userDoc.data().email : 'Unknown User';
        } else {
          reading.userEmail = 'Anonymous Reading';
        }
        return reading;
      });

      const resolvedReadings = await Promise.all(promises);
      setReadings(resolvedReadings);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  // This is the single, correct chartData object
  const chartData = {
    labels: readings
        .filter(r => r.createdAt)
        .map(r => new Date(r.createdAt.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric'})),
    datasets: [
      { 
        data: readings.filter(r => r.createdAt).map(r => r.systolic), 
        color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`, 
        strokeWidth: 2 
      },
      { 
        data: readings.filter(r => r.createdAt).map(r => r.diastolic), 
        color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`, 
        strokeWidth: 2 
      },
    ],
    legend: ["Systolic", "Diastolic"]
  };

  const renderItem = ({ item }) => (
    <View style={[styles.itemContainer, { backgroundColor: colors.card }]}>
      <Text style={[styles.itemText, { color: colors.text }]}>
        {item.userEmail}: {item.systolic} / {item.diastolic}
      </Text>
      <Text style={styles.dateText}>
        {item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleString() : 'No date'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>All Patient Readings</Text>
      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <>
          {readings.filter(r => r.createdAt).length > 1 ? (
             <LineChart
                data={chartData}
                width={Dimensions.get("window").width - 40}
                height={220}
                chartConfig={{
                  backgroundColor: colors.card,
                  backgroundGradientFrom: colors.card,
                  backgroundGradientTo: colors.card,
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => colors.text,
                }}
                bezier
                style={{ borderRadius: 16 }}
              />
          ) : <Text style={{color: colors.text, textAlign: 'center', marginBottom: 20}}>Not enough data to create a chart.</Text>}
         
          <FlatList
            data={readings.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            ListEmptyComponent={<Text style={{color: colors.text}}>No readings found.</Text>}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        fontFamily: 'Inter_700Bold',
    },
    itemContainer: {
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