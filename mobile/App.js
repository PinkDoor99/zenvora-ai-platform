/**
 * Zenvora AI Platform - React Native Mobile App
 * Complete mobile application with all platform features
 */

import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  Dimensions,
  ActivityIndicator,
  FlatList,
  Image,
  StatusBar,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import Sound from 'react-native-sound';
import { launchImageLibrary } from 'react-native-image-picker';
import Share from 'react-native-share';
import { Biometry } from 'react-native-biometrics';

const { width, height } = Dimensions.get('window');
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Global styles
const colors = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#48bb78',
  warning: '#f6ad55',
  error: '#fc8181',
  dark: '#1a202c',
  light: '#f7fafc',
  text: '#2d3748',
  border: '#e2e8f0',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  header: {
    backgroundColor: colors.primary,
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.light,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.light,
    borderRadius: 12,
    padding: 16,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonText: {
    color: colors.light,
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: colors.light,
    marginVertical: 8,
  },
  lessonCard: {
    backgroundColor: colors.light,
    borderRadius: 12,
    padding: 16,
    margin: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  codeEditor: {
    backgroundColor: colors.dark,
    color: colors.light,
    fontFamily: 'monospace',
    padding: 12,
    borderRadius: 8,
    minHeight: 100,
    marginVertical: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.light,
    borderRadius: 20,
    padding: 20,
    margin: 20,
    maxHeight: height * 0.8,
  },
});

// Main App Component
const ZenvoraApp = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize biometric authentication
      const biometry = new Biometry();
      const { available } = await biometry.isSensorAvailable();
      
      // Load user data
      const userData = await loadUserData();
      setUser(userData);
      
      setLoading(false);
    } catch (error) {
      console.error('App initialization error:', error);
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    // Simulate loading user data
    return {
      id: 'user_123',
      name: 'John Developer',
      email: 'john@zenvora.com',
      avatar: '👨‍💻',
      subscription: 'premium',
      progress: {
        lessonsCompleted: 12,
        totalLessons: 45,
        currentLevel: 'intermediate',
      },
    };
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.light, marginTop: 16 }}>Loading Zenvora AI...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Main" options={{ headerShown: false }}>
          {() => <MainApp user={user} />}
        </Stack.Screen>
        <Stack.Screen name="Lesson" options={{ headerShown: false }}>
          {() => <LessonScreen user={user} />}
        </Stack.Screen>
        <Stack.Screen name="CodeEditor" options={{ headerShown: false }}>
          {() => <CodeEditorScreen user={user} />}
        </Stack.Screen>
        <Stack.Screen name="Profile" options={{ headerShown: false }}>
          {() => <ProfileScreen user={user} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Main Tab Navigator
const MainApp = ({ user }) => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Dashboard':
              iconName = 'dashboard';
              break;
            case 'Learn':
              iconName = 'school';
              break;
            case 'Code':
              iconName = 'code';
              break;
            case 'AI Tools':
              iconName = 'psychology';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'help';
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text,
        tabBarStyle: {
          backgroundColor: colors.light,
          borderTopWidth: 0,
          elevation: 10,
        },
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.light,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Learn" component={LearnScreen} />
      <Tab.Screen name="Code" component={CodeScreen} />
      <Tab.Screen name="AI Tools" component={AIToolsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// Dashboard Screen
const DashboardScreen = ({ user }) => {
  const [stats, setStats] = useState({
    lessonsCompleted: 12,
    codeAnalysis: 45,
    projectsCreated: 8,
    aiAssists: 156,
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Welcome back, {user?.name}!</Text>
        <Text style={{ color: colors.light, textAlign: 'center', marginTop: 8 }}>
          Continue your coding journey
        </Text>
      </LinearGradient>

      <ScrollView style={{ padding: 16 }}>
        {/* Stats Grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <View style={[styles.card, { width: '48%' }]}>
            <Icon name="school" size={32} color={colors.primary} />
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text }}>
              {stats.lessonsCompleted}
            </Text>
            <Text style={{ color: colors.text }}>Lessons</Text>
          </View>
          <View style={[styles.card, { width: '48%' }]}>
            <Icon name="analytics" size={32} color={colors.success} />
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text }}>
              {stats.codeAnalysis}
            </Text>
            <Text style={{ color: colors.text }}>Analyses</Text>
          </View>
          <View style={[styles.card, { width: '48%' }]}>
            <Icon name="folder" size={32} color={colors.warning} />
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text }}>
              {stats.projectsCreated}
            </Text>
            <Text style={{ color: colors.text }}>Projects</Text>
          </View>
          <View style={[styles.card, { width: '48%' }]}>
            <Icon name="psychology" size={32} color={colors.error} />
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text }}>
              {stats.aiAssists}
            </Text>
            <Text style={{ color: colors.text }}>AI Helps</Text>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.card}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 12 }}>
            Recent Activity
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Icon name="check-circle" size={20} color={colors.success} />
            <Text style={{ marginLeft: 8, color: colors.text }}>
              Completed "JavaScript Arrays" lesson
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Icon name="code" size={20} color={colors.primary} />
            <Text style={{ marginLeft: 8, color: colors.text }}>
              Analyzed React component code
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="star" size={20} color={colors.warning} />
            <Text style={{ marginLeft: 8, color: colors.text }}>
              Earned "Code Master" badge
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.card}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 12 }}>
            Quick Actions
          </Text>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Continue Learning</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, { backgroundColor: colors.success }]}>
            <Text style={styles.buttonText}>Start New Project</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Learn Screen
const LearnScreen = () => {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [lessons, setLessons] = useState([]);

  const levels = [
    { id: 'beginner', title: 'Beginner', icon: 'emoji-nature', color: colors.success },
    { id: 'intermediate', title: 'Intermediate', icon: 'emoji-people', color: colors.warning },
    { id: 'advanced', title: 'Advanced', icon: 'emoji-events', color: colors.error },
    { id: 'expert', title: 'Expert', icon: 'workspace-premium', color: colors.primary },
  ];

  const loadLessons = (level) => {
    setSelectedLevel(level);
    // Mock lessons data
    const mockLessons = [
      {
        id: 'lesson-1',
        title: 'Your First Lines of Code',
        description: 'Learn the fundamentals of programming',
        duration: '30 min',
        difficulty: level,
        completed: false,
      },
      {
        id: 'lesson-2',
        title: 'Variables and Data Types',
        description: 'Understanding how to store and manipulate data',
        duration: '45 min',
        difficulty: level,
        completed: false,
      },
      {
        id: 'lesson-3',
        title: 'Control Flow',
        description: 'Master if/else statements and loops',
        duration: '60 min',
        difficulty: level,
        completed: false,
      },
    ];
    setLessons(mockLessons);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Learn to Code</Text>
      </LinearGradient>

      <ScrollView style={{ padding: 16 }}>
        {!selectedLevel ? (
          <View>
            <Text style={{ color: colors.light, fontSize: 16, marginBottom: 16 }}>
              Choose your skill level to get started
            </Text>
            {levels.map((level) => (
              <TouchableOpacity
                key={level.id}
                style={[styles.card, { flexDirection: 'row', alignItems: 'center' }]}
                onPress={() => loadLessons(level.id)}
              >
                <View style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: level.color,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 16,
                }}>
                  <Icon name={level.icon} size={30} color={colors.light} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text }}>
                    {level.title}
                  </Text>
                  <Text style={{ color: colors.text }}>
                    {level.id === 'beginner' && 'Perfect for absolute beginners'}
                    {level.id === 'intermediate' && 'Build on your existing skills'}
                    {level.id === 'advanced' && 'Master complex concepts'}
                    {level.id === 'expert' && 'Professional development'}
                  </Text>
                </View>
                <Icon name="chevron-right" size={24} color={colors.text} />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View>
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}
              onPress={() => setSelectedLevel(null)}
            >
              <Icon name="arrow-back" size={24} color={colors.light} />
              <Text style={{ color: colors.light, marginLeft: 8 }}>Back to levels</Text>
            </TouchableOpacity>
            <Text style={{ color: colors.light, fontSize: 18, marginBottom: 16 }}>
              {selectedLevel.charAt(0).toUpperCase() + selectedLevel.slice(1)} Lessons
            </Text>
            {lessons.map((lesson) => (
              <TouchableOpacity key={lesson.id} style={styles.lessonCard}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text }}>
                  {lesson.title}
                </Text>
                <Text style={{ color: colors.text, marginTop: 4 }}>
                  {lesson.description}
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                  <Text style={{ color: colors.text }}>⏱ {lesson.duration}</Text>
                  <Text style={{ color: colors.primary }}>
                    {lesson.completed ? '✅ Completed' : '▶️ Start'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// Code Screen
const CodeScreen = () => {
  const [code, setCode] = useState('// Welcome to Zenvora AI Code Editor\nfunction hello() {\n  console.log("Hello, World!");\n}');
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const analyzeCode = async () => {
    setAnalyzing(true);
    // Simulate code analysis
    setTimeout(() => {
      setAnalysis({
        complexity: 7,
        maintainability: 85,
        security: 92,
        performance: 78,
        suggestions: [
          'Consider adding error handling',
          'Use more descriptive variable names',
          'Add JSDoc comments for better documentation'
        ],
        issues: [
          { type: 'warning', line: 2, message: 'Missing error handling' }
        ]
      });
      setAnalyzing(false);
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Code Editor</Text>
      </LinearGradient>

      <ScrollView style={{ padding: 16 }}>
        <View style={styles.card}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 12 }}>
            Write Your Code
          </Text>
          <TextInput
            style={styles.codeEditor}
            multiline
            value={code}
            onChangeText={setCode}
            placeholder="Type your code here..."
            placeholderTextColor={colors.text}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity style={[styles.button, { flex: 1, marginRight: 8 }]} onPress={analyzeCode}>
              {analyzing ? (
                <ActivityIndicator color={colors.light} />
              ) : (
                <Text style={styles.buttonText}>🔍 Analyze</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, { flex: 1, marginLeft: 8, backgroundColor: colors.success }]}>
              <Text style={styles.buttonText}>▶️ Run</Text>
            </TouchableOpacity>
          </View>
        </View>

        {analysis && (
          <View style={styles.card}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 12 }}>
              Analysis Results
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.primary }}>
                  {analysis.complexity}
                </Text>
                <Text style={{ color: colors.text }}>Complexity</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.success }}>
                  {analysis.maintainability}%
                </Text>
                <Text style={{ color: colors.text }}>Maintainability</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.warning }}>
                  {analysis.security}%
                </Text>
                <Text style={{ color: colors.text }}>Security</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.error }}>
                  {analysis.performance}%
                </Text>
                <Text style={{ color: colors.text }}>Performance</Text>
              </View>
            </View>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 8 }}>
              💡 Suggestions
            </Text>
            {analysis.suggestions.map((suggestion, index) => (
              <Text key={index} style={{ color: colors.text, marginBottom: 4 }}>
                • {suggestion}
              </Text>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// AI Tools Screen
const AIToolsScreen = () => {
  const [selectedTool, setSelectedTool] = useState(null);
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [processing, setProcessing] = useState(false);

  const tools = [
    { id: 'generate', title: 'Code Generation', icon: 'auto_awesome', description: 'Generate code from natural language' },
    { id: 'security', title: 'Security Scan', icon: 'security', description: 'Find vulnerabilities in your code' },
    { id: 'optimize', title: 'Performance', icon: 'speed', description: 'Optimize your code for better performance' },
    { id: 'document', title: 'Documentation', icon: 'description', description: 'Auto-generate code documentation' },
  ];

  const processTool = async () => {
    setProcessing(true);
    // Simulate AI processing
    setTimeout(() => {
      let output = '';
      switch (selectedTool) {
        case 'generate':
          output = `// Generated function based on: ${input}\nfunction ${input.toLowerCase().replace(/\s+/g, '_')}() {\n  // Auto-generated implementation\n  console.log("Generated: ${input}");\n  return "Success!";\n}`;
          break;
        case 'security':
          output = '🔒 Security Analysis Complete\n\n✅ No critical vulnerabilities found\n⚠️ 1 medium issue: Missing input validation\n💡 Recommendation: Add input sanitization';
          break;
        case 'optimize':
          output = '⚡ Performance Optimization Suggestions:\n\n• Use array methods instead of loops\n• Implement memoization for expensive operations\n• Consider lazy loading for large datasets';
          break;
        case 'document':
          output = '/**\n * Auto-generated documentation\n * @description Function description\n * @param {type} paramName - Parameter description\n * @returns {type} Return value description\n */';
          break;
      }
      setResult(output);
      setProcessing(false);
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>AI Tools</Text>
      </LinearGradient>

      <ScrollView style={{ padding: 16 }}>
        {!selectedTool ? (
          <View>
            <Text style={{ color: colors.light, fontSize: 16, marginBottom: 16 }}>
              Choose an AI tool to assist your development
            </Text>
            {tools.map((tool) => (
              <TouchableOpacity
                key={tool.id}
                style={styles.card}
                onPress={() => setSelectedTool(tool.id)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    backgroundColor: colors.primary,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 16,
                  }}>
                    <Icon name={tool.icon} size={24} color={colors.light} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text }}>
                      {tool.title}
                    </Text>
                    <Text style={{ color: colors.text }}>{tool.description}</Text>
                  </View>
                  <Icon name="chevron-right" size={24} color={colors.text} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View>
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}
              onPress={() => setSelectedTool(null)}
            >
              <Icon name="arrow-back" size={24} color={colors.light} />
              <Text style={{ color: colors.light, marginLeft: 8 }}>Back to tools</Text>
            </TouchableOpacity>
            
            <View style={styles.card}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 12 }}>
                {tools.find(t => t.id === selectedTool)?.title}
              </Text>
              <TextInput
                style={styles.input}
                multiline
                value={input}
                onChangeText={setInput}
                placeholder={
                  selectedTool === 'generate' ? 'Describe what code you want to generate...' :
                  selectedTool === 'security' ? 'Paste your code for security analysis...' :
                  selectedTool === 'optimize' ? 'Paste your code for optimization...' :
                  'Paste your code for documentation...'
                }
                placeholderTextColor={colors.text}
              />
              <TouchableOpacity style={styles.button} onPress={processTool}>
                {processing ? (
                  <ActivityIndicator color={colors.light} />
                ) : (
                  <Text style={styles.buttonText}>🤖 Process</Text>
                )}
              </TouchableOpacity>
            </View>

            {result && (
              <View style={styles.card}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 12 }}>
                  Result
                </Text>
                <Text style={{ color: colors.text, fontFamily: 'monospace' }}>
                  {result}
                </Text>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: colors.success, marginTop: 12 }]}
                  onPress={() => Share.open({ message: result })}
                >
                  <Text style={styles.buttonText}>📤 Share Result</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// Profile Screen
const ProfileScreen = ({ user }) => {
  const [settings, setSettings] = useState({
    notifications: true,
    biometric: true,
    darkMode: true,
    autoSave: true,
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Profile</Text>
      </LinearGradient>

      <ScrollView style={{ padding: 16 }}>
        <View style={styles.card}>
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: colors.primary,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 12,
            }}>
              <Text style={{ fontSize: 40 }}>{user?.avatar}</Text>
            </View>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}>
              {user?.name}
            </Text>
            <Text style={{ color: colors.text }}>{user?.email}</Text>
            <Text style={{ color: colors.primary, marginTop: 4 }}>
              {user?.subscription?.toUpperCase()} PLAN
            </Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}>
                {user?.progress?.lessonsCompleted}
              </Text>
              <Text style={{ color: colors.text }}>Lessons</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}>
                {user?.progress?.currentLevel}
              </Text>
              <Text style={{ color: colors.text }}>Level</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}>
                🔥
              </Text>
              <Text style={{ color: colors.text }}>Streak</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>
            Settings
          </Text>
          {Object.entries(settings).map(([key, value]) => (
            <View key={key} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ color: colors.text, textTransform: 'capitalize' }}>
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </Text>
              <TouchableOpacity
                style={{
                  width: 50,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: value ? colors.primary : colors.border,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={() => setSettings({...settings, [key]: !value})}
              >
                <View style={{
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  backgroundColor: colors.light,
                  transform: [{ translateX: value ? 12 : -12 }],
                }} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>📊 View Progress</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, { backgroundColor: colors.success }]}>
            <Text style={styles.buttonText}>🏆 Achievements</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, { backgroundColor: colors.warning }]}>
            <Text style={styles.buttonText}>💳 Upgrade Plan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, { backgroundColor: colors.error }]}>
            <Text style={styles.buttonText}>🚪 Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ZenvoraApp;
