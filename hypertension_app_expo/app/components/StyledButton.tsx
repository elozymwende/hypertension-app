import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons'; // Import the icon set

// The button now accepts an 'icon' prop
const StyledButton = ({ title, onPress, color, textColor = '#1A202C', icon }) => (
    <Pressable onPress={onPress} style={[styles.buttonBase, { backgroundColor: color }]}>
        {/* If an icon name is provided, display it */}
        {icon && <FontAwesome5 name={icon} size={16} color={textColor} style={{ marginRight: 10 }} />}
        <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>
    </Pressable>
);

const styles = StyleSheet.create({
    buttonBase: {
        width: '100%',
        paddingVertical: 15,
        marginVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        flexDirection: 'row', // Align icon and text horizontally
        justifyContent: 'center', // Center the content
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default StyledButton;