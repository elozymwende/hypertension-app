import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { useTheme } from '../global.js';
import { firebaseApp } from '../global.js';
import { FontAwesome5 } from '@expo/vector-icons';

// A reusable card component for the dashboard
const DashboardCard = ({ title, value, icon, onPress, color, textColor }) => (
    <Pressable onPress={onPress} style={[styles.card, { backgroundColor: color }]}>
        <FontAwesome5 name={icon} size={30} color={textColor} />
        <Text style={[styles.cardTitle, { color: textColor }]}>{title}</Text>
        <Text style={[styles.cardValue, { color: textColor }]}>{value}</Text>
    </Pressable>
);

export default function DoctorDashboard() {
  const router = useRouter();
  const { colors } = useTheme();
  const [patientCount, setPatientCount] = useState(0);

  useEffect(() => {
    const db = getFirestore(firebaseApp);
    const q = query(collection(db, "users"), where("role", "==", "patient"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setPatientCount(querySnapshot.size); // Get the number of patients
    });

    return () => unsubscribe();
  }, []);

  return (
    <ScrollView style={{ backgroundColor: colors.background }}>
        <View style={styles.container}>
            <Text style={[styles.title, { color: colors.text }]}>Doctor Dashboard</Text>

            <DashboardCard
                title="Total Patients"
                value={patientCount}
                icon="users"
                onPress={() => router.push('/patients')}
                color={colors.card}
                textColor={colors.text}
            />

            <DashboardCard
                title="Manage Lifestyle Tips"
                value="Create & Edit"
                icon="leaf"
                onPress={() => router.push('/tips')}
                color={colors.card}
                textColor={colors.text}
            />
             <DashboardCard
                title="View All Readings"
                value="Data & Charts"
                icon="chart-line"
                // --- THIS IS THE CORRECTED LINE ---
                onPress={() => router.push('/all_readings')} 
                color={colors.card}
                textColor={colors.text}
            />
        </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        alignItems: 'center'
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        fontFamily: 'Inter_700Bold',
        marginBottom: 20,
    },
    card: {
        width: '100%',
        padding: 25,
        borderRadius: 12,
        marginVertical: 10,
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 16,
        marginTop: 10,
    },
    cardValue: {
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: 5,
    }
});