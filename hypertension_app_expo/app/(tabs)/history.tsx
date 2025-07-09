import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, ActivityIndicator, Dimensions } from 'react-native';
import { getFirestore, collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useTheme, firebaseApp } from '../global.js';
import { LineChart } from 'react-native-chart-kit'; // --- 1. Import LineChart ---

export default function HistoryScreen() {
  const { colors } = useTheme();
  const [readings, setReadings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const auth = getAuth(firebaseApp);
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      const db = getFirestore(firebaseApp);
      const q = query(
        collection(db, "readings"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "asc") // Order by ascending for the chart
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const readingsData = [];
        querySnapshot.forEach((doc) => {
          readingsData.push({ ...doc.data(), id: doc.id });
        });
        setReadings(readingsData);
        setIsLoading(false);
      });

      return () => unsubscribe();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  // --- 2. Prepare data for the chart ---
  const chartData = {
    labels: readings.map(r => r.createdAt ? new Date(r.createdAt.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric'}) : ''),
    datasets: [
      {
        data: readings.map(r => r.systolic),
        color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`, // Red for Systolic
        strokeWidth: 2,
      },
      {
        data: readings.map(r => r.diastolic),
        color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`, // Blue for Diastolic
        strokeWidth: 2,
      },
    ],
    legend: ["Systolic", "Diastolic"]
  };

  const renderItem = ({ item }) => (
    <View style={[styles.itemContainer, { backgroundColor: colors.card }]}>
      <Text style={[styles.itemText, { color: colors.text }]}>
        Systolic: {item.systolic}, Diastolic: {item.diastolic}
      </Text>
      <Text style={styles.dateText}>
        {item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleString() : 'No date'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Your Readings History</Text>
      
      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <>
          {/* --- 3. Render the chart if there is data --- */}
          {readings.length > 1 ? (
             <LineChart
                data={chartData}
                width={Dimensions.get("window").width - 40} // from react-native
                height={220}
                yAxisSuffix=""
                yAxisInterval={10}
                chartConfig={{
                  backgroundColor: colors.card,
                  backgroundGradientFrom: colors.card,
                  backgroundGradientTo: colors.card,
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => colors.text,
                  style: {
                    borderRadius: 16
                  },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: colors.primary
                  }
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16
                }}
              />
          ) : <Text style={{color: colors.text, textAlign: 'center', marginBottom: 20}}>Log at least two readings to see a chart.</Text>}
         
          <FlatList
            data={readings.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)} // Sort descending for the list
            renderItem={renderItem}
            keyExtractor={item => item.id}
            ListEmptyComponent={<Text style={{color: colors.text}}>No readings found.</Text>}
          />
        </>
      )}
    </SafeAreaView>
  );
}

// ... Your styles remain here
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