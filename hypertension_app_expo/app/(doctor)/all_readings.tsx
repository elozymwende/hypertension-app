import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, ActivityIndicator } from 'react-native';
import { getFirestore, collection, query, orderBy, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { useTheme } from '../global.js';
import { firebaseApp } from '../global.js';
import { LineChart } from 'react-native-chart-kit';

export default function AllReadingsScreen() {
  const { colors } = useTheme();
  const [readings, setReadings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [containerWidth, setContainerWidth] = useState(0); // State for width

  // ... (useEffect logic remains the same)
  useEffect(() => {
    const db = getFirestore(firebaseApp);
    const readingsQuery = query(collection(db, "readings"), orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(readingsQuery, async (querySnapshot) => {
      const promises = querySnapshot.docs.map(async (docData) => {
        const reading = { ...docData.data(), id: docData.id };
        if (reading.userId) {
          const userDocRef = doc(db, "users", reading.userId);
          const userDoc = await getDoc(userDocRef);
          reading.userEmail = userDoc.exists() ? userDoc.data().email.split('@')[0] : 'Unknown';
        } else {
          reading.userEmail = 'Anonymous';
        }
        return reading;
      });

      const resolvedReadings = await Promise.all(promises);
      setReadings(resolvedReadings);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  
  const chartReadings = readings.slice(-15);
  const chartData = {
    labels: chartReadings.map((r, index) => 
      index % 3 === 0 && r.createdAt ? new Date(r.createdAt.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric'}) : ''
    ),
    datasets: [
      { data: chartReadings.map(r => r.systolic), color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})` },
      { data: chartReadings.map(r => r.diastolic), color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})` },
    ],
    legend: ["Systolic", "Diastolic"]
  };

  const renderItem = ({ item }) => (
    <View style={[styles.itemContainer, { backgroundColor: colors.card }]}>
      <View>
        <Text style={[styles.itemText, { color: colors.text }]}>
          <Text style={{fontWeight: 'bold'}}>{item.userEmail}:</Text> {item.systolic} / {item.diastolic}
        </Text>
      </View>
      <Text style={styles.dateText}>
        {item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleString() : 'No date'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}>
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <>
            {readings.filter(r => r.createdAt).length > 1 && containerWidth > 0 ? (
               <LineChart
                  data={chartData}
                  width={containerWidth} // Use measured width
                  height={250}
                  chartConfig={{
                    backgroundColor: colors.card,
                    backgroundGradientFrom: colors.card,
                    backgroundGradientTo: colors.card,
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(129, 230, 217, 0.1)`,
                    labelColor: (opacity = 1) => colors.text,
                    propsForDots: { r: "4", strokeWidth: "2", stroke: colors.primary }
                  }}
                  style={{ borderRadius: 16, paddingRight: 35 }}
                />
            ) : <Text style={{color: colors.text, textAlign: 'center', marginBottom: 20}}>Not enough data to create a chart.</Text>}
           
            <FlatList
              data={readings.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              ListHeaderComponent={<View style={{height: 20}}/>}
              ListEmptyComponent={<Text style={{color: colors.text}}>No readings found.</Text>}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        fontFamily: 'Inter_700Bold',
        paddingHorizontal: 10,
    },
    itemContainer: {
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        marginHorizontal: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemText: {
        fontSize: 16,
    },
    dateText: {
        fontSize: 12,
        color: 'gray',
    },
});