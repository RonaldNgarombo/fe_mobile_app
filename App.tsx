import {SafeAreaView, StyleSheet, Text, View} from 'react-native';
import React from 'react';

import TodoList from './components/TodoList';
// import Checkbox from 'expo-checkbox';

export default function App() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.container}>
                <TodoList />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: '#fff'},
});
