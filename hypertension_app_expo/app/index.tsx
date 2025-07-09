import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, SafeAreaView, Pressable, Platform, ActivityIndicator } from 'react-native';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { useTheme } from './global.js';
import { firebaseApp } from './global.js';
import { FontAwesome } from '@expo/vector-icons';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient');
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const router = useRouter();
  const { colors } = useTheme();

  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);

  const handleSignUp = () => {
    setIsLoading(true);
    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          role: role,
        });
        router.replace('/home');
      })
      .catch((error) => {
        alert(`Sign Up Failed: ${error.message}`);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleLogin = () => {
    setIsLoading(true);
    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const savedRole = docSnap.data().role;
          const selectedRole = role; // The role from the toggle switch

          // --- THIS IS THE NEW LOGIC ---
          // Check if the selected role matches their saved role
          if (savedRole !== selectedRole) {
            alert(`Login failed. This is a '${savedRole}' account. Please select the correct role to log in.`);
            setIsLoading(false);
            return; // Stop the login process
          }

          // If roles match, navigate to the correct dashboard
          if (savedRole === 'doctor') {
            router.replace('/dashboard');
          } else {
            router.replace('/home');
          }

        } else {
          // Default to patient home if no role is found (should not happen with sign up)
          router.replace('/home');
        }
      })
      .catch((error) => {
        alert(`Login Failed: ${error.message}`);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Hypertension App</Text>

        <View style={[styles.roleSelector, { borderColor: colors.primary }]}>
          <Pressable onPress={() => setRole('patient')} style={[styles.roleButton, role === 'patient' && { backgroundColor: colors.primary }]}>
            <Text style={[styles.roleText, { color: colors.primary }, role === 'patient' && { color: colors.primaryText }]}>I am a Patient</Text>
          </Pressable>
          <Pressable onPress={() => setRole('doctor')} style={[styles.roleButton, role === 'doctor' && { backgroundColor: colors.primary }]}>
            <Text style={[styles.roleText, { color: colors.primary }, role === 'doctor' && { color: colors.primaryText }]}>I am a Doctor</Text>
          </Pressable>
        </View>

        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          placeholder="Email"
          placeholderTextColor="gray"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        
        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TextInput
            style={[styles.passwordInput, { color: colors.text }]}
            placeholder="Password"
            placeholderTextColor="gray"
            secureTextEntry={!isPasswordVisible}
            value={password}
            onChangeText={setPassword}
          />
          <Pressable onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
            <FontAwesome 
              name={isPasswordVisible ? "eye-slash" : "eye"} 
              size={20} 
              color="gray" 
              style={styles.icon}
            />
          </Pressable>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
        ) : (
          <View style={styles.buttonRow}>
            <Button title="Login" onPress={handleLogin} color={Platform.OS === 'ios' ? colors.primaryText : colors.primary} />
            <View style={{ width: 20 }} />
            <Button title="Sign Up" onPress={handleSignUp} color="#5cb85c" />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
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
        borderRadius: 8,
        overflow: 'hidden',
    },
    roleButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
    },
    roleText: {
        fontWeight: '600',
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 20,
        paddingHorizontal: 15,
    },
    passwordInput: {
        flex: 1,
        height: '100%',
    },
    icon: {
        marginLeft: 10,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
});