import {
    Alert,
    Animated,
    FlatList,
    Modal,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import React, {useEffect, useRef, useState} from 'react';
import dayjs from 'dayjs';

const relativeTime = require('dayjs/plugin/relativeTime');
dayjs.extend(relativeTime);

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CheckBox from '@react-native-community/checkbox';

import {Bar} from 'react-native-progress';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ITEM_SIZE = 63;

interface ItemProps {
    id: number;
    task: string;
    created_at: Date;
}

export default function TodoList() {
    const [modalVisible, setModalVisible] = useState(false);
    const [todo, setTodo] = useState('');
    const [todoList, setTodoList] = useState<ItemProps[]>([
        {id: 1, task: 'One', created_at: new Date()},
    ]);
    //   console.log(typeof todo, typeof todoList);

    const [isEditing, setIsEditing] = useState<{
        editing: boolean;
        item: null | ItemProps;
    }>({
        editing: false,
        item: null,
    });

    const [showSingle, setShowSingle] = useState<{
        show: boolean;
        item: null | ItemProps;
    }>({show: false, item: null});

    const otpError = useRef(new Animated.Value(0)).current;
    const taskAnime = useRef(new Animated.Value(0)).current;

    //
    // Get data from
    useEffect(() => {
        getData();
    }, []);

    function getData() {
        AsyncStorage.getItem('todoList')
            .then(a => {
                const data = JSON.parse(a);
                console.log(data);
                if (data !== null) {
                    setTodoList(data);
                }
            })
            .catch(e => {
                console.log(e);
            });
    }

    //
    // Persist state
    function persistState(list: string) {
        AsyncStorage.clear();

        AsyncStorage.setItem('todoList', list)
            .then(a => {
                // console.log(a);
                getData();
            })
            .catch(e => {
                // console.log(e);
            });
    }

    // Animate otp error
    const triggerOtpError = () => {
        Animated.timing(otpError, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
        }).start();
    };

    // Remove otp error
    const removeOtpError = () => {
        Animated.timing(otpError, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
        }).start();
    };

    // Animate checkbox
    const triggerTaskAnime = () => {
        Animated.timing(taskAnime, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
        }).start();
    };

    // Remove checkbox animation
    const removeTaskAnime = () => {
        Animated.timing(taskAnime, {
            toValue: 0,
            duration: 0,
            useNativeDriver: false,
        }).start();
    };

    //
    // Open modal to create/edit a task
    function openAddModal() {
        setModalVisible(true);
    }

    //
    // Add/Update new task
    function addTask() {
        if (isEditing.editing) {
            const newState = todoList.map((obj: ItemProps) => {
                // if id equals clicked task, update task property
                if (obj.id === isEditing?.item?.id) {
                    return {...obj, task: todo};
                }

                // otherwise return object as is
                return obj;
            });

            setTodo('');
            setModalVisible(false);
            setIsEditing({editing: false, item: null});

            // Persist the tasks
            persistState(JSON.stringify(newState));
        } else {
            if (todo.trim() === '') {
                return triggerOtpError();
            }

            const lastItem = todoList.slice(-1)[0];

            let id;
            // If list is empty, set the id to 1 else the last id and increment it by 1
            if (!lastItem) {
                id = 1;
            } else {
                id = lastItem.id + 1;
            }

            setTodo('');
            setModalVisible(false);

            // Persist the tasks
            persistState(
                JSON.stringify([
                    ...todoList,
                    {id, task: todo, completed: false, created_at: new Date()},
                ]),
            );
        }
    }

    //
    // Check or uncheck task
    function setChecked(item, isChecked) {
        // console.log(item);
        const newState = todoList.map(obj => {
            // if id equals clicked task, update completed property
            if (obj.id === item.id) {
                return {...obj, completed: isChecked};
            }

            // otherwise return object as is
            return obj;
        });

        // Persist the tasks
        persistState(JSON.stringify(newState));
    }

    //
    // Toggle edit task
    function toggleEditTask(item) {
        setIsEditing({editing: true, item});
        setModalVisible(true);
        setTodo(item.task);
    }

    //
    // Remove task from todo list
    function deleteTask(item) {
        const newState = todoList.filter(obj => obj.id !== item.id);

        persistState(JSON.stringify(newState));
    }

    //
    //
    const scrollY = useRef(new Animated.Value(0)).current;

    const renderItem = ({item}) => {
        return (
            <View key={item.id.toString()} style={[styles.transParent]}>
                <View style={{flexDirection: 'row'}}>
                    <View style={{flex: 1, flexDirection: 'row'}}>
                        <Animated.View
                            style={{
                                color: taskAnime.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ['#c026d3', '#22c55e'],
                                }),
                                transform: [
                                    {
                                        translateX: taskAnime.interpolate({
                                            inputRange: [
                                                0, 0.2, 0.4, 0.6, 0.8, 1,
                                            ],
                                            outputRange: [
                                                -0, 10, -10, 10, -10, 0,
                                            ],
                                        }),
                                    },
                                ],
                            }}>
                            <CheckBox
                                disabled={false}
                                value={item.completed}
                                onValueChange={newValue => {
                                    console.log(newValue);
                                    setChecked(item, newValue);
                                }}
                                tintColors={{true: '#c026d3', false: '#e5e7eb'}}
                                onCheckColor="#c026d3"
                                // tintColor="#e5e7eb"
                                onTintColor="#c026d3"
                            />
                        </Animated.View>

                        <Text
                            onPress={() => {
                                setShowSingle({show: true, item});
                            }}
                            style={{
                                textDecorationLine: item.completed
                                    ? 'line-through'
                                    : 'none',
                                fontSize: 20,
                                marginRight: 20,
                                marginLeft: 10,
                            }}>
                            {item?.task}
                        </Text>
                    </View>

                    <MaterialIcons
                        name="edit"
                        size={24}
                        color="#10b981"
                        onPress={() => {
                            toggleEditTask(item);
                        }}
                        style={{marginLeft: 5}}
                    />

                    <MaterialIcons
                        name="delete"
                        size={24}
                        color="#f87171"
                        onPress={() => {
                            Alert.alert(
                                'Delete Task',
                                `${
                                    item.completed
                                        ? 'This task will be removed from your todo list'
                                        : "This item hasn't been completed yet"
                                }`,
                                [
                                    {
                                        text: 'Cancel',
                                        onPress: () =>
                                            console.log('Cancel Pressed'),
                                        style: 'cancel',
                                    },
                                    {
                                        text: 'OK',
                                        onPress: () => deleteTask(item),
                                    },
                                ],
                            );
                        }}
                    />
                </View>

                <Text style={{fontSize: 12, textAlign: 'right'}}>
                    {dayjs(item.created_at).fromNow()}
                </Text>
            </View>
        );
    };

    const done = todoList.filter(t => t.completed !== false);
    let progress = 0;
    if (todoList.length > 0) {
        progress = done.length / todoList.length;
    }

    //
    // If all items have been checked
    useEffect(() => {
        if (progress === 1) {
            triggerTaskAnime();
        } else {
            removeTaskAnime();
        }
    }, [progress]);

    //
    //
    return (
        <View style={{flex: 1, marginHorizontal: 30}}>
            <Text>Todo App</Text>

            <Bar
                progress={progress}
                color="#c026d3"
                unfilledColor="#e5e7eb"
                borderWidth={0}
                width={null}
                style={{marginTop: 20}}
            />

            <Ionicons
                name="add-circle"
                size={50}
                color="#c026d3"
                style={styles.addIcon}
                onPress={openAddModal}
            />

            {!showSingle.show ? (
                <FlatList
                    data={todoList}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                />
            ) : (
                <View>
                    <View style={{flexDirection: 'row', marginBottom: 15}}>
                        <View style={{flex: 1}}>
                            <Text style={{fontWeight: 'bold'}}>Task:</Text>
                        </View>

                        <View style={{flex: 2}}>
                            <Text>{showSingle.item.task}</Text>
                        </View>
                    </View>

                    <View style={{flexDirection: 'row', marginBottom: 15}}>
                        <View style={{flex: 1}}>
                            <Text style={{fontWeight: 'bold'}}>Status:</Text>
                        </View>

                        <View style={{flex: 2}}>
                            <Text>
                                {showSingle.item.completed
                                    ? 'Complete'
                                    : 'Pending'}
                            </Text>
                        </View>
                    </View>

                    <View style={{flexDirection: 'row', marginBottom: 15}}>
                        <View style={{flex: 1}}>
                            <Text style={{fontWeight: 'bold'}}>
                                Date created:
                            </Text>
                        </View>

                        <View style={{flex: 2}}>
                            <Text>
                                {dayjs(showSingle.item.created_at).format(
                                    'dddd, MMMM D, YYYY h:mm A',
                                )}
                            </Text>
                        </View>
                    </View>

                    <Ionicons
                        name="return-down-back"
                        size={32}
                        color="#c026d3"
                        onPress={() => {
                            setShowSingle({show: false, item: null});
                        }}
                    />
                </View>
            )}

            <View>
                <View
                    style={[
                        styles.centeredView,
                        {
                            justifyContent:
                                Platform.OS === 'ios' ? 'center' : 'flex-end',
                        },
                    ]}>
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={modalVisible}
                        onRequestClose={() => {
                            // Alert.alert('Modal has been closed.');
                            setModalVisible(false);
                        }}>
                        <SafeAreaView style={styles.oneFlex}>
                            <View
                                style={[
                                    styles.centeredView,
                                    {
                                        justifyContent:
                                            Platform.OS === 'ios'
                                                ? 'center'
                                                : 'flex-end',
                                    },
                                ]}>
                                <View style={styles.modalView}>
                                    <Text style={styles.transTitle}>
                                        {isEditing.editing
                                            ? 'Update task'
                                            : 'Add new task'}
                                    </Text>

                                    <View style={styles.infoContainer}>
                                        <Animated.Text
                                            style={[
                                                styles.label,
                                                {
                                                    // color: otpError.interpolate(
                                                    //     {
                                                    //         inputRange: [0, 1],
                                                    //         outputRange: [
                                                    //             '#6b7280',
                                                    //             '#c026d3',
                                                    //         ],
                                                    //     },
                                                    // ),
                                                    // transform: [
                                                    //     {
                                                    //         translateX:
                                                    //             otpError.interpolate(
                                                    //                 {
                                                    //                     inputRange:
                                                    //                         [
                                                    //                             0,
                                                    //                             0.2,
                                                    //                             0.4,
                                                    //                             0.6,
                                                    //                             0.8,
                                                    //                             1,
                                                    //                         ],
                                                    //                     outputRange:
                                                    //                         [
                                                    //                             -0,
                                                    //                             10,
                                                    //                             -10,
                                                    //                             10,
                                                    //                             -10,
                                                    //                             0,
                                                    //                         ],
                                                    //                 },
                                                    //             ),
                                                    //     },
                                                    // ],
                                                },
                                            ]}>
                                            Task
                                        </Animated.Text>

                                        <TextInput
                                            value={todo}
                                            onChangeText={text => {
                                                setTodo(text);

                                                removeOtpError();
                                            }}
                                            style={styles.userText}
                                            placeholder="New task"
                                            autoFocus={true}
                                        />
                                    </View>

                                    <View style={styles.sendRow}>
                                        <View style={styles.oneFlex}>
                                            <TouchableOpacity
                                                onPress={addTask}
                                                style={styles.btnSend}>
                                                <Text style={styles.sendText}>
                                                    {isEditing.editing
                                                        ? 'UPDATE'
                                                        : 'ADD'}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <Text
                                        style={[
                                            styles.sendText,
                                            {color: 'red'},
                                        ]}
                                        onPress={() => {
                                            setModalVisible(false);
                                        }}>
                                        Cancel
                                    </Text>
                                </View>
                            </View>
                        </SafeAreaView>
                    </Modal>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, .7)',
    },

    modalView: {
        backgroundColor: '#fff',
        width: '100%',
        padding: 20,
        borderRadius: 10,
    },

    transTitle: {
        fontSize: 16,
        marginBottom: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#c026d3',
    },

    sendRow: {flexDirection: 'row', marginVertical: 30},

    oneFlex: {flex: 1},

    btnSend: {
        backgroundColor: '#c026d3',
        paddingVertical: 15,
        borderRadius: 50,
        marginHorizontal: 100,
    },

    sendText: {textAlign: 'center', color: '#fff'},

    addIcon: {
        alignSelf: 'flex-end',
        marginRight: 20,
        position: 'relative',
        // bottom: -1000,
        top: 660,
        zIndex: 2000,
    },

    userText: {borderBottomColor: '#000', borderBottomWidth: 0.8, padding: 0},

    transParent: {
        backgroundColor: '#f9fafb',
        marginVertical: 5,
        paddingVertical: 7,
        paddingLeft: 10,
        // flexDirection: 'row',
        borderTopRightRadius: 15,
        borderBottomLeftRadius: 15,
    },
});
