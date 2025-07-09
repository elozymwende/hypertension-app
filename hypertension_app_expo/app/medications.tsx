import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Button, SafeAreaView, Alert, ActivityIndicator, Platform } from 'react-native';
import { getFirestore, collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useTheme } from './global.js';
import { firebaseApp } from './global.js';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker'; // Import the new component

export default function MedicationsScreen() {
  const { colors } = useTheme();
  const [medications, setMedications] = useState([]);
  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // --- New state for the time picker ---
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedMed, setSelectedMed] = useState(null);
  
  const auth = getAuth(firebaseApp);
  const user = auth.currentUser;

  // Fetch medications from Firestore
  useEffect(() => {
    // ... (useEffect logic remains the same)
    if (!user) {
      setIsLoading(false);
      return;
    }
    const db = getFirestore(firebaseApp);
    const q = query(collection(db, "medications"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const medsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMedications(medsData);
        setIsLoading(false);
    });
    return () => unsubscribe();
  }, [user]);


  // Save a new medication
  const handleAddMedication = async () => {
    // ... (handleAddMedication logic remains the same)
    if (medName.trim() === '' || dosage.trim() === '') return;
    if (!user) return;
    try {
      const db = getFirestore(firebaseApp);
      await addDoc(collection(db, "medications"), {
        userId: user.uid,
        name: medName,
        dosage: dosage,
        createdAt: serverTimestamp(),
      });
      setMedName('');
      setDosage('');
    } catch (e) { console.error("Error adding medication: ", e); }
  };
  
  // --- Updated Reminder Logic ---
  const handleSetReminderPress = (medication) => {
    if (Platform.OS === 'web') {
      alert('Reminders can only be set on the mobile app.');
      return;
    }
    setSelectedMed(medication);
    setShowTimePicker(true);
  };

  const onTimeChange = async (event, selectedDate) => {
    setShowTimePicker(false); // Hide the picker
    if (event.type === 'set' && selectedDate && selectedMed) {
      const hour = selectedDate.getHours();
      const minute = selectedDate.getMinutes();

      // Cancel any previous notifications for this med before setting a new one
      // (Advanced feature, for now we'll just set a new one)

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Medication Reminder! 💊",
          body: `It's time to take your ${selectedMed.name}.`,
        },
        trigger: {
          hour: hour,
          minute: minute,
          repeats: true, // Make it a daily reminder
        },
      });
      Alert.alert('Reminder Set', `You will be reminded daily at ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}.`);
    }
  };
  
  // Log that a medication was taken
  const handleMarkAsTaken = async (medication) => {
    // ... (handleMarkAsTaken logic remains the same)
    if (!user) return;
    try {
        const db = getFirestore(firebaseApp);
        await addDoc(collection(db, "medication_log"), {
            userId: user.uid,
            medicationId: medication.id,
            medicationName: medication.name,
            takenAt: serverTimestamp(),
        });
        Alert.alert('Logged!', `${medication.name} has been logged as taken.`);
    } catch (error) { console.error("Error logging medication: ", error); }
  };
  
  const renderItem = ({ item }) => (
    <View style={[styles.itemContainer, { backgroundColor: colors.card }]}>
      <View style={styles.medInfo}>
        <Text style={[styles.itemTitle, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.itemSubtitle, { color: colors.text }]}>{item.dosage}</Text>
      </View>
      <View style={styles.buttonGroup}>
        <Button title="Taken" onPress={() => handleMarkAsTaken(item)} color="#5cb85c" />
        <View style={{height: 5}} />
        <Button title="Set Reminder" onPress={() => handleSetReminderPress(item)} color={colors.primary} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>My Medications</Text>
      
      {/* ... (Form to add new medication remains the same) ... */}
      <View style={styles.inputContainer}>
        <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]} placeholder="Medication Name" placeholderTextColor="gray" value={medName} onChangeText={setMedName}/>
        <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]} placeholder="Dosage" placeholderTextColor="gray" value={dosage} onChangeText={setDosage} />
        <Button title="Add Medication" onPress={handleAddMedication} color={colors.primary} />
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <FlatList
          data={medications}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          ListEmptyComponent={<Text style={{ color: colors.text, textAlign: 'center' }}>No medications added yet.</Text>}
          style={{marginTop: 20}}
        />
      )}

      {/* --- The Time Picker Modal --- */}
      {showTimePicker && (
        <DateTimePicker
            testID="dateTimePicker"
            value={new Date()}
            mode={'time'}
            is24Hour={true}
            display="default"
            onChange={onTimeChange}
        />
      )}
    </SafeAreaView>
  );
}

// ... (your styles remain here, no changes needed)
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
    inputContainer: {
        padding: 15,
        borderRadius: 8,
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
    medInfo: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    itemSubtitle: {
        fontSize: 14,
        marginTop: 5,
    },
    buttonGroup: {
        marginLeft: 10,
    },
});