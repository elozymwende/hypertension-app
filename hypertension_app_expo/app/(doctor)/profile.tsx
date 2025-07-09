import { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../global.js';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import StyledButton from '../components/StyledButton';
import { firebaseApp } from '../global.js';

export default function DoctorProfileScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const auth = getAuth(firebaseApp);
  const user = auth.currentUser;
  
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    if (user) {
      const db = getFirestore(firebaseApp);
      const userDocRef = doc(db, "users", user.uid);
      const unsubscribe = onSnapshot(userDocRef, (doc) => {
        setUserInfo(doc.data());
      });
      return () => unsubscribe();
    }
  }, [user]);

  const getInitial = () => {
    if (userInfo && userInfo.fullName) {
      return userInfo.fullName.charAt(0).toUpperCase();
    } else if (user && user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'D';
  };

  const handleLogOut = () => {
    signOut(auth).then(() => router.replace('/'));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
        <Text style={styles.avatarText}>{getInitial()}</Text>
      </View>

      <Text style={[styles.fullNameText, { color: colors.text }]}>
        {userInfo?.fullName || 'Doctor Name'}
      </Text>
      <Text style={[styles.specialtyText, { color: 'gray' }]}>
        {userInfo?.specialty || 'Specialty'}
      </Text>
      <Text style={[styles.emailText, { color: colors.text }]}>
        {user ? user.email : 'No user logged in'}
      </Text>
      
      <StyledButton icon="pencil-alt" title="Edit Profile" onPress={() => router.push('/edit_doctor_profile')} color={colors.card} textColor={colors.text}/>

      <View style={{flex: 1}} /> 

      <StyledButton icon="sign-out-alt" title="Log Out" onPress={handleLogOut} color="#d9534f" textColor="#fff"/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarText: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#fff',
  },
  fullNameText: {
      fontSize: 22,
      fontWeight: 'bold',
  },
  specialtyText: {
      fontSize: 16,
      color: 'gray',
      marginBottom: 10,
  },
  emailText: {
    fontSize: 16,
    marginBottom: 30,
  },
});