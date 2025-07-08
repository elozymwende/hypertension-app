import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, SafeAreaView, Pressable } from 'react-native';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore'; // Import Firestore functions
import firebaseApp from '../firebaseConfig.js';
import { useRouter } from 'expo-router';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient'); // New state for the role
  const router = useRouter();
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);

  const handleSignUp = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        // Now, save the user's role in Firestore
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          role: role,
        });
        console.log('User signed up and role saved!');
        // Navigate based on role
        if (role === 'patient') {
          router.replace('/home');
        } else {
          router.replace('/doctor_dashboard');
        }
      })
      .catch((error) => {
        alert(`Sign Up Failed: ${error.message}`);
      });
  };

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        // After login, check the user's role in Firestore
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().role === 'doctor') {
          router.replace('/doctor_dashboard');
        } else {
          router.replace('/home');
        }
      })
      .catch((error) => {
        alert(`Login Failed: ${error.message}`);
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Hypertension App</Text>

        {/* Role Selector */}
        <View style={styles.roleSelector}>
          <Pressable onPress={() => setRole('patient')} style={[styles.roleButton, role === 'patient' && styles.selectedRole]}>
            <Text style={[styles.roleText, role === 'patient' && styles.selectedRoleText]}>I am a Patient</Text>
          </Pressable>
          <Pressable onPress={() => setRole('doctor')} style={[styles.roleButton, role === 'doctor' && styles.selectedRole]}>
            <Text style={[styles.roleText, role === 'doctor' && styles.selectedRoleText]}>I am a Doctor</Text>
          </Pressable>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <View style={styles.buttonRow}>
          <Button title="Login" onPress={handleLogin} />
          <View style={{ width: 20 }} />
          <Button title="Sign Up" onPress={handleSignUp} color="#5cb85c" />
        </View>
      </View>
    </SafeAreaView>
  );
}

// Add new styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
    },
    content: {
        marginHorizontal: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    roleSelector: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#007AFF',
        borderRadius: 8,
        overflow: 'hidden',
    },
    roleButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
    },
    selectedRole: {
        backgroundColor: '#007AFF',
    },
    roleText: {
        color: '#007AFF',
        fontWeight: '600',
    },
    selectedRoleText: {
        color: '#fff',
    },
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 20,
        paddingHorizontal: 15,
        backgroundColor: '#fff',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
});