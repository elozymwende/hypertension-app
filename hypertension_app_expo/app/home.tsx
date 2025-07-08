import { View, Text, StyleSheet, Button } from 'react-native';
import { useRouter } from 'expo-router';
// Import Firebase Auth functions
import { getAuth, signOut } from 'firebase/auth';
import firebaseApp from './firebaseConfig.js';

export default function HomeScreen() {
  const router = useRouter();

  // New function to handle logging out
  const handleLogOut = () => {
    const auth = getAuth(firebaseApp);
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        console.log('User signed out');
        router.replace('/'); // Navigate back to login screen
      })
      .catch((error) => {
        console.error('Logout Error:', error);
        alert('Logout Failed');
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Home!</Text>
      <Text style={styles.subtitle}>What would you like to do?</Text>

      <View style={styles.buttonContainer}>
        <Button
          title="Log New Reading"
          onPress={() => router.push('/log_reading')}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="View History"
          onPress={() => router.push('/history')}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Log Out"
          onPress={handleLogOut} // Call the new logout function
          color="#d9534f"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
    color: 'gray',
  },
  buttonContainer: {
    width: '60%',
    marginVertical: 10,
  },
});