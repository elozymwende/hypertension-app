import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, Button, TextInput, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getFirestore, collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { useTheme, firebaseApp } from '../global.js';
export default function PatientDetailScreen() {
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();
  const router = useRouter();

  const [readings, setReadings] = useState([]);
  const [patient, setPatient] = useState(null);
  const [recommendation, setRecommendation] = useState('');
  const [isListLoading, setIsListLoading] = useState(true);
  const [isSending, setIsSending] = useState(false); // New loading state for sending

  useEffect(() => {
    if (id) {
      const db = getFirestore(firebaseApp);
      
      const patientDocRef = doc(db, "users", id);
      getDoc(patientDocRef).then(docSnap => {
        if (docSnap.exists()) {
          setPatient(docSnap.data());
        }
      });
      
      const readingsQuery = query(
        collection(db, "readings"),
        where("userId", "==", id),
        orderBy("createdAt", "desc")
      );
      const unsubscribe = onSnapshot(readingsQuery, (querySnapshot) => {
        const readingsData = [];
        querySnapshot.forEach((doc) => {
          readingsData.push({ ...doc.data(), id: doc.id });
        });
        setReadings(readingsData);
        setIsListLoading(false);
      });

      return () => unsubscribe();
    }
  }, [id]);

  const handleSendRecommendation = async () => {
    if (recommendation.trim() === '') {
      Alert.alert('Error', 'Please write a recommendation.');
      return;
    }
    setIsSending(true); // Start sending
    try {
      const db = getFirestore(firebaseApp);
      await addDoc(collection(db, "recommendations"), {
        patientId: id,
        text: recommendation,
        createdAt: serverTimestamp(),
        doctorName: "Dr. Smith"
      });
      Alert.alert('Success', 'Recommendation sent!');
      setRecommendation('');
    } catch (error) {
      Alert.alert('Error', 'Failed to send recommendation.');
    } finally {
      setIsSending(false); // Stop sending
    }
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
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1}}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
            <Button title="Back to Dashboard" onPress={() => router.push('/dashboard')} color={colors.primary} />
            <Text style={[styles.title, { color: colors.text }]}>
                Readings for {patient ? patient.email : 'Patient'}
            </Text>
        </View>

        {isListLoading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <FlatList
            data={readings}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            ListEmptyComponent={<Text style={{ color: colors.text }}>No readings found.</Text>}
            style={{flex: 1}}
          />
        )}
        
        <View style={[styles.inputContainer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="Write a recommendation..."
            placeholderTextColor="gray"
            multiline
            value={recommendation}
            onChangeText={setRecommendation}
          />
          {/* Conditional UI for the send button */}
          {isSending ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Button title="Send" onPress={handleSendRecommendation} color={colors.primary} />
          )}
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

// ... your styles remain here
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingTop: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        margin: 10,
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
    inputContainer: {
        padding: 10,
        borderTopWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 60
    },
    input: {
        flex: 1,
        minHeight: 40,
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingTop: 10,
        marginRight: 10,
    }
});