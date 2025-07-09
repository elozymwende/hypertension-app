import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button, SafeAreaView, Alert, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { getFirestore, collection, addDoc, serverTimestamp, onSnapshot, orderBy, query, doc, deleteDoc } from 'firebase/firestore';
import { useTheme } from '../global.js';
import { firebaseApp } from '../global.js';
import { FontAwesome5 } from '@expo/vector-icons';

export default function TipsManagementScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tips, setTips] = useState([]);

  // Fetch existing tips
  useEffect(() => {
    const db = getFirestore(firebaseApp);
    const q = query(collection(db, "lifestyle_tips"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const tipsData = [];
        querySnapshot.forEach((doc) => {
            tipsData.push({ id: doc.id, ...doc.data() });
        });
        setTips(tipsData);
    });
    return () => unsubscribe();
  }, []);


  const handleSaveTip = async () => {
    if (title.trim() === '' || content.trim() === '') {
      Alert.alert('Error', 'Please fill out both title and content.');
      return;
    }
    try {
      const db = getFirestore(firebaseApp);
      await addDoc(collection(db, "lifestyle_tips"), {
        title: title,
        content: content,
        createdAt: serverTimestamp(),
      });
      Alert.alert('Success', 'Tip saved successfully!');
      setTitle('');
      setContent('');
    } catch (error) {
      console.error("Error saving tip: ", error);
      Alert.alert('Error', 'Could not save tip.');
    }
  };

  const handleDeleteTip = async (tipId) => {
    // This is a more direct way to delete for web compatibility
    try {
        const db = getFirestore(firebaseApp);
        await deleteDoc(doc(db, "lifestyle_tips", tipId));
        Alert.alert('Success', 'Tip has been deleted.');
    } catch (error) {
        console.error("Error deleting tip: ", error);
        Alert.alert('Error', 'Could not delete tip.');
    }
  };


  const renderTip = ({ item }) => (
    <Pressable onPress={() => router.push(`/edit_tip/${item.id}`)}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
                <Pressable onPress={() => handleDeleteTip(item.id)}>
                    <FontAwesome5 name="trash-alt" size={20} color="red" />
                </Pressable>
            </View>
            <Text style={[styles.cardContent, { color: colors.text }]}>{item.content}</Text>
        </View>
    </Pressable>
  );



  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <FlatList
            ListHeaderComponent={
                <>
                    <Text style={[styles.title, { color: colors.text }]}>Manage Lifestyle Tips</Text>
                    <View style={[styles.inputContainer, {backgroundColor: colors.card}]}>
                        <TextInput
                            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                            placeholder="Tip Title"
                            placeholderTextColor="gray"
                            value={title}
                            onChangeText={setTitle}
                        />
                        <TextInput
                            style={[styles.input, styles.contentInput, { color: colors.text, borderColor: colors.border }]}
                            placeholder="Tip Content..."
                            placeholderTextColor="gray"
                            value={content}
                            onChangeText={setContent}
                            multiline={true}
                        />
                        <Button title="Save New Tip" onPress={handleSaveTip} color={colors.primary} />
                    </View>
                    <Text style={[styles.listTitle, { color: colors.text }]}>Existing Tips</Text>
                </>
            }
            data={tips}
            renderItem={renderTip}
            keyExtractor={item => item.id}
            ListEmptyComponent={<Text style={{ color: colors.text, textAlign: 'center' }}>No tips created yet.</Text>}
        />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 20,
    fontFamily: 'Inter_700Bold',
  },
  inputContainer: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  contentInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 15,
  },
  listTitle: {
      fontSize: 20,
      fontWeight: '600',
      marginTop: 30,
      marginBottom: 10,
      marginHorizontal: 20,
  },
  card: {
      marginHorizontal: 20,
      borderRadius: 8,
      padding: 20,
      marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  cardContent: {
    fontSize: 16,
    lineHeight: 24,
  }
});