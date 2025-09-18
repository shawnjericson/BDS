import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CreateBookingScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tạo booking</Text>
      <Text style={styles.subtitle}>Form tạo booking sẽ được hiển thị ở đây</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default CreateBookingScreen;
