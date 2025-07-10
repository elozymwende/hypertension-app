import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme, firebaseApp } from '../global.js';
import { getAuth, signOut } from 'firebase/auth';
import StyledButton from '../components/StyledButton';

export default function ProfileScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const auth = getAuth();
  const user = auth.currentUser;

  const getInitial = () => {
    if (user && user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return '?';
  };

  const handleLogOut = () => {
    signOut(auth).then(() => router.replace('/'));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
        <Text style={styles.avatarText}>{getInitial()}</Text>
      </View>

      <Text style={[styles.emailText, { color: colors.text }]}>{user ? user.email : 'No user logged in'}</Text>
      
      {/* --- Pass the 'icon' prop to each button --- */}
      <View style={styles.buttonContainer}>
        <StyledButton icon="pills" title="My Medications" onPress={() => router.push('/medications')} color={colors.card} textColor={colors.text}/>
        <StyledButton icon="bullseye" title="My Health Goals" onPress={() => router.push('/health_goals')} color={colors.card} textColor={colors.text}/>
        <StyledButton icon="comment-medical" title="View Recommendations" onPress={() => router.push('/recommendations')} color={colors.card} textColor={colors.text}/>
        <StyledButton icon="leaf" title="Lifestyle & Diet Tips" onPress={() => router.push('/lifestyle')} color={colors.card} textColor={colors.text}/>
      </View>
      
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
    paddingTop: 60,
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
  emailText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  buttonContainer: {
      width: '90%',
      alignItems: 'center',
  },
});