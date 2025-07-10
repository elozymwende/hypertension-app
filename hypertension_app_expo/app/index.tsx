import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, SafeAreaView, Pressable, Platform, ActivityIndicator, ScrollView, KeyboardAvoidingView } from 'react-native';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { useTheme, firebaseApp } from './global.js';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import StyledButton from './components/StyledButton';

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
    if (!email || !password) {
        alert("Please enter both email and password.");
        return;
    }
    setIsLoading(true);
    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          role: role,
          fullName: "", // Initialize empty fields
          specialty: ""
        });
        if (role === 'doctor') {
            router.replace('/dashboard');
        } else {
            router.replace('/home');
        }
      })
      .catch((error) => {
        alert(`Sign Up Failed: ${error.message}`);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleLogin = () => {
    if (!email || !password) {
        alert("Please enter both email and password.");
        return;
    }
    setIsLoading(true);
    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const savedRole = docSnap.data().role;
          if (savedRole !== role) {
            alert(`Login failed. This is a '${savedRole}' account. Please select the correct role.`);
            setIsLoading(false);
            return;
          }
          if (savedRole === 'doctor') {
            router.replace('/dashboard');
          } else {
            router.replace('/home');
          }
        } else {
            alert("No user data found. Defaulting to patient view.");
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
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{flex: 1}}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.header}>
                <FontAwesome5 name="heartbeat" size={60} color={colors.primary} />
                <Text style={[styles.title, { color: colors.text }]}>Hypertension App</Text>
                <Text style={[styles.subtitle, { color: 'gray' }]}>Monitor. Manage. Thrive.</Text>
            </View>

            <View style={[styles.roleSelector, { borderColor: colors.primary }]}>
            <Pressable onPress={() => setRole('patient')} style={[styles.roleButton, role === 'patient' && { backgroundColor: colors.primary }]}>
                <Text style={[styles.roleText, { color: colors.primary }, role === 'patient' && { color: colors.primaryText }]}>I am a Patient</Text>
            </Pressable>
            <Pressable onPress={() => setRole('doctor')} style={[styles.roleButton, role === 'doctor' && { backgroundColor: colors.primary }]}>
                <Text style={[styles.roleText, { color: colors.primary }, role === 'doctor' && { color: colors.primaryText }]}>I am a Doctor</Text>
            </Pressable>
            </View>

            <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <FontAwesome name="envelope" size={20} color="gray" style={styles.icon} />
                <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Email"
                    placeholderTextColor="gray"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
            </View>
            
            <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <FontAwesome name="lock" size={24} color="gray" style={styles.icon} />
                <TextInput
                    style={[styles.input, { color: colors.text }]}
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
                    />
                </Pressable>
            </View>

            {isLoading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
            ) : (
            <View style={styles.buttonContainer}>
                <StyledButton title="Login" onPress={handleLogin} color={colors.primary} textColor={colors.primaryText} />
                <StyledButton title="Sign Up" onPress={handleSignUp} color={colors.card} textColor={colors.text} />
            </View>
            )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        fontFamily: 'Inter_700Bold',
        marginTop: 15,
    },
    subtitle: {
        fontSize: 16,
        color: 'gray',
        marginTop: 5,
    },
    roleSelector: {
        flexDirection: 'row',
        marginBottom: 20,
        borderWidth: 1,
        borderRadius: 8,
        overflow: 'hidden',
    },
    roleButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    roleText: {
        fontWeight: '600',
        fontSize: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 55,
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 15,
        paddingHorizontal: 15,
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: 16,
    },
    icon: {
        marginRight: 10,
    },
    buttonContainer: {
        marginTop: 20,
    }
});