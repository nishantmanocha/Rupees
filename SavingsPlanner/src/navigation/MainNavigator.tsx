import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useStore } from '../store/useStore';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import PlanScreen from '../screens/plan/PlanScreen';
import CompareScreen from '../screens/compare/CompareScreen';
import GoalsScreen from '../screens/goals/GoalsScreen';
import LearnScreen from '../screens/learn/LearnScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import { Home, TrendingUp, Target, BookOpen, Settings as SettingsIcon } from 'lucide-react-native';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let icon;
          
          switch (route.name) {
            case 'Plan':
              icon = <Home size={size} color={color} />;
              break;
            case 'Compare':
              icon = <TrendingUp size={size} color={color} />;
              break;
            case 'Goals':
              icon = <Target size={size} color={color} />;
              break;
            case 'Learn':
              icon = <BookOpen size={size} color={color} />;
              break;
            case 'Settings':
              icon = <SettingsIcon size={size} color={color} />;
              break;
            default:
              icon = <Home size={size} color={color} />;
          }
          
          return icon;
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Plan" 
        component={PlanScreen}
        options={{
          title: 'Plan',
        }}
      />
      <Tab.Screen 
        name="Compare" 
        component={CompareScreen}
        options={{
          title: 'Compare',
        }}
      />
      <Tab.Screen 
        name="Goals" 
        component={GoalsScreen}
        options={{
          title: 'Goals',
        }}
      />
      <Tab.Screen 
        name="Learn" 
        component={LearnScreen}
        options={{
          title: 'Learn',
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          title: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
};

const MainNavigator = () => {
  const { hasCompletedOnboarding } = useStore();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!hasCompletedOnboarding ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <Stack.Screen name="MainTabs" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default MainNavigator;