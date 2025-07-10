import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, ActivityIndicator } from 'react-native';
import { getFirestore, collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useTheme } from '../global.js';
import { firebaseApp } from '../global.js';
import { LineChart } from 'react-native-chart-kit';

export default function HistoryScreen() {
  const { colors } = useTheme();
  const [readings, setReadings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [containerWidth, setContainerWidth] = useState(0); // State to hold the container's width
  const auth = getAuth(firebaseApp);
  const user = auth.currentUser;

  useEffect(() => {
    // ... (useEffect logic remains the same)
    if (user) {
        const db = getFirestore(firebaseApp);
        const q = query(
            collection(db, "readings"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "asc")
        );
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const readingsData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setReadings(readingsData);
            setIsLoading(false);
        });
        return () => unsubscribe();
    } else {
        setIsLoading(false);
    }
  }, [user]);

  const chartReadings = readings.slice(-15);
  const chartData = {
    labels: chartReadings.map((r, index) => 
      index % 3 === 0 && r.createdAt ? new Date(r.createdAt.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric'}) : ''
    ),
    datasets: [
      { data: chartReadings.map(r => r.systolic), color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`},
      { data: chartReadings.map(r => r.diastolic), color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})`},
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
        <View onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}>
            <Text style={[styles.title, { color: colors.text }]}>Your Readings History</Text>
            
            {isLoading ? (
                <ActivityIndicator size="large" color={colors.primary} />
            ) : (
                <>
                {readings.length > 1 && containerWidth > 0 ? (
                    <LineChart
                        data={chartData}
                        width={containerWidth} // Use the measured width
                        height={220}
                        chartConfig={{
                            backgroundColor: colors.card,
                            backgroundGradientFrom: colors.card,
                            backgroundGradientTo: colors.card,
                            decimalPlaces: 0,
                            color: (opacity = 1) => `rgba(129, 230, 217, 0)`,
                            labelColor: (opacity = 1) => colors.text,
                            propsForDots: { r: "5", strokeWidth: "2", stroke: colors.primary }
                        }}
                        bezier={false}
                        style={{ borderRadius: 16, paddingRight: 35 }} // Add padding to align dots
                    />
                ) : <Text style={{color: colors.text, textAlign: 'center', marginBottom: 20}}>Log at least two readings to see a chart.</Text>}
                
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
        paddingHorizontal: 20,
    },
    itemContainer: {
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        marginHorizontal: 20,
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