import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useTheme } from '../global.js';
import { firebaseApp } from '../global.js';

export default function EditTipScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { id } = useLocalSearchParams(); // Get the tip's ID from the URL

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the specific tip's data when the screen loads
  useEffect(() => {
    if (!id) return;
    const db = getFirestore(firebaseApp);
    const tipRef = doc(db, "lifestyle_tips", id);

    getDoc(tipRef).then((docSnap) => {
      if (docSnap.exists()) {
        const tipData = docSnap.data();
        setTitle(tipData.title);
        setContent(tipData.content);
      } else {
        Alert.alert("Error", "Tip not found.");
      }
      setIsLoading(false);
    });
  }, [id]);

  const handleUpdateTip = async () => {
    if (title.trim() === '' || content.trim() === '') {
      Alert.alert('Error', 'Please fill out both title and content.');
      return;
    }
    setIsLoading(true);
    try {
      const db = getFirestore(firebaseApp);
      const tipRef = doc(db, "lifestyle_tips", id);
      await updateDoc(tipRef, {
        title: title,
        content: content,
      });
      Alert.alert('Success', 'Tip updated successfully!');
      router.back();
    } catch (error) {
      console.error("Error updating tip: ", error);
      Alert.alert('Error', 'Could not update tip.');
    } finally {
        setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return <ActivityIndicator size="large" color={colors.primary} style={{flex: 1, backgroundColor: colors.background}}/>
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Edit Lifestyle Tip</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        placeholder="Tip Title"
        placeholderTextColor="gray"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, styles.contentInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        placeholder="Tip Content..."
        placeholderTextColor="gray"
        value={content}
        onChangeText={setContent}
        multiline={true}
        numberOfLines={4}
      />
      <Button title="Update Tip" onPress={handleUpdateTip} color={colors.primary} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  contentInput: {
    minHeight: 120,
    textAlignVertical: 'top',
    paddingTop: 15,
  }
});