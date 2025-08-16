import React, { useState } from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Wallet, TrendingUp, Target, CheckCircle } from 'lucide-react-native';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { useStore } from '../../store/useStore';
import { OnboardingStep } from '../../types';

const { width } = Dimensions.get('window');

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation();
  const { income, expenses, setIncome, addExpense, completeOnboarding } = useStore();
  
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('intro');
  const [tempIncome, setTempIncome] = useState(income.toString());
  const [tempExpense, setTempExpense] = useState({ name: '', amount: '', category: 'Other' as const });
  const [tempExpenses, setTempExpenses] = useState<Array<{ name: string; amount: string; category: string }>>([]);

  const steps = [
    {
      id: 'intro',
      title: 'Welcome to Savings Planner',
      subtitle: 'Plan your savings and compare investment options',
      icon: Wallet,
      content: 'Let\'s get started by understanding your financial situation and setting up your savings goals.'
    },
    {
      id: 'income',
      title: 'Monthly Income',
      subtitle: 'Enter your monthly take-home income',
      icon: TrendingUp,
      content: 'This helps us calculate how much you can save and invest each month.'
    },
    {
      id: 'expenses',
      title: 'Monthly Expenses',
      subtitle: 'Add your recurring monthly expenses',
      icon: Target,
      content: 'We\'ll use this to calculate your monthly surplus and recommend savings strategies.'
    },
    {
      id: 'complete',
      title: 'All Set!',
      subtitle: 'You\'re ready to start planning',
      icon: CheckCircle,
      content: 'Your financial profile is set up. Let\'s start planning your savings journey!'
    }
  ];

  const currentStepData = steps.find(step => step.id === currentStep);

  const handleNext = () => {
    if (currentStep === 'intro') {
      setCurrentStep('income');
    } else if (currentStep === 'income') {
      if (parseFloat(tempIncome) > 0) {
        setIncome(parseFloat(tempIncome));
        setCurrentStep('expenses');
      }
    } else if (currentStep === 'expenses') {
      // Save all expenses
      tempExpenses.forEach(expense => {
        if (expense.name && parseFloat(expense.amount) > 0) {
          addExpense({
            id: Date.now().toString() + Math.random(),
            name: expense.name,
            amount: parseFloat(expense.amount),
            category: expense.category as any
          });
        }
      });
      setCurrentStep('complete');
    } else if (currentStep === 'complete') {
      completeOnboarding();
      navigation.navigate('MainTabs' as never);
    }
  };

  const handleBack = () => {
    if (currentStep === 'income') {
      setCurrentStep('intro');
    } else if (currentStep === 'expenses') {
      setCurrentStep('income');
    } else if (currentStep === 'complete') {
      setCurrentStep('expenses');
    }
  };

  const addTempExpense = () => {
    if (tempExpense.name && tempExpense.amount) {
      setTempExpenses([...tempExpenses, { ...tempExpense }]);
      setTempExpense({ name: '', amount: '', category: 'Other' });
    }
  };

  const removeTempExpense = (index: number) => {
    setTempExpenses(tempExpenses.filter((_, i) => i !== index));
  };

  const canProceed = () => {
    if (currentStep === 'income') {
      return parseFloat(tempIncome) > 0;
    }
    if (currentStep === 'expenses') {
      return tempExpenses.length > 0;
    }
    return true;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'intro':
        return (
          <View className="flex-1 justify-center items-center px-6">
            <View className="items-center mb-8">
              <View className="w-24 h-24 bg-primary-100 rounded-full items-center justify-center mb-6">
                <Wallet size={48} color="#2563eb" />
              </View>
              <Text className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
                {currentStepData?.title}
              </Text>
              <Text className="text-lg text-gray-600 dark:text-gray-400 text-center">
                {currentStepData?.subtitle}
              </Text>
            </View>
            <Text className="text-base text-gray-600 dark:text-gray-400 text-center leading-6">
              {currentStepData?.content}
            </Text>
          </View>
        );

      case 'income':
        return (
          <View className="flex-1 px-6">
            <View className="items-center mb-8">
              <View className="w-20 h-20 bg-success-100 rounded-full items-center justify-center mb-4">
                <TrendingUp size={40} color="#16a34a" />
              </View>
              <Text className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-2">
                {currentStepData?.title}
              </Text>
              <Text className="text-base text-gray-600 dark:text-gray-400 text-center">
                {currentStepData?.subtitle}
              </Text>
            </View>
            
            <Input
              label="Monthly Take-Home Income"
              placeholder="Enter amount (e.g., 50000)"
              value={tempIncome}
              onChangeText={setTempIncome}
              keyboardType="numeric"
              leftIcon={<Text className="text-lg text-gray-500">₹</Text>}
            />
            
            <Text className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">
              This should be your net income after taxes and deductions
            </Text>
          </View>
        );

      case 'expenses':
        return (
          <View className="flex-1 px-6">
            <View className="items-center mb-6">
              <View className="w-20 h-20 bg-warning-100 rounded-full items-center justify-center mb-4">
                <Target size={40} color="#d97706" />
              </View>
              <Text className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-2">
                {currentStepData?.title}
              </Text>
              <Text className="text-base text-gray-600 dark:text-gray-400 text-center mb-4">
                {currentStepData?.subtitle}
              </Text>
            </View>

            <Card className="mb-4">
              <Input
                label="Expense Name"
                placeholder="e.g., Rent, EMI, Utilities"
                value={tempExpense.name}
                onChangeText={(text) => setTempExpense({ ...tempExpense, name: text })}
              />
              <Input
                label="Monthly Amount"
                placeholder="Enter amount"
                value={tempExpense.amount}
                onChangeText={(text) => setTempExpense({ ...tempExpense, amount: text })}
                keyboardType="numeric"
                leftIcon={<Text className="text-lg text-gray-500">₹</Text>}
              />
              <Button
                title="Add Expense"
                onPress={addTempExpense}
                disabled={!tempExpense.name || !tempExpense.amount}
                fullWidth
              />
            </Card>

            {tempExpenses.length > 0 && (
              <Card>
                <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Added Expenses
                </Text>
                {tempExpenses.map((expense, index) => (
                  <View key={index} className="flex-row justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <View className="flex-1">
                      <Text className="font-medium text-gray-900 dark:text-white">{expense.name}</Text>
                      <Text className="text-sm text-gray-500 dark:text-gray-400">₹{expense.amount}</Text>
                    </View>
                    <Button
                      title="Remove"
                      onPress={() => removeTempExpense(index)}
                      variant="danger"
                      size="sm"
                    />
                  </View>
                ))}
                <View className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                    Total: ₹{tempExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || '0'), 0)}
                  </Text>
                </View>
              </Card>
            )}
          </View>
        );

      case 'complete':
        return (
          <View className="flex-1 justify-center items-center px-6">
            <View className="items-center mb-8">
              <View className="w-24 h-24 bg-success-100 rounded-full items-center justify-center mb-6">
                <CheckCircle size={48} color="#16a34a" />
              </View>
              <Text className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
                {currentStepData?.title}
              </Text>
              <Text className="text-lg text-gray-600 dark:text-gray-400 text-center mb-4">
                {currentStepData?.subtitle}
              </Text>
            </View>
            <Text className="text-base text-gray-600 dark:text-gray-400 text-center leading-6 mb-6">
              {currentStepData?.content}
            </Text>
            
            <View className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 w-full">
              <Text className="text-sm text-primary-800 dark:text-primary-200 text-center">
                💡 Tip: You can always update your income and expenses in the Settings tab
              </Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Progress Bar */}
      <View className="px-6 py-4">
        <View className="flex-row items-center justify-between mb-2">
          {steps.map((step, index) => (
            <View key={step.id} className="flex-1 items-center">
              <View className={`
                w-8 h-8 rounded-full items-center justify-center
                ${currentStep === step.id 
                  ? 'bg-primary-600' 
                  : steps.findIndex(s => s.id === currentStep) > index 
                    ? 'bg-success-600' 
                    : 'bg-gray-300 dark:bg-gray-600'
                }
              `}>
                <Text className={`
                  text-sm font-semibold
                  ${currentStep === step.id || steps.findIndex(s => s.id === currentStep) > index
                    ? 'text-white'
                    : 'text-gray-600 dark:text-gray-400'
                  }
                `}>
                  {index + 1}
                </Text>
              </View>
            </View>
          ))}
        </View>
        <View className="flex-row">
          {steps.map((_, index) => (
            <View key={index} className={`
              flex-1 h-1 mx-1 rounded-full
              ${steps.findIndex(s => s.id === currentStep) > index 
                ? 'bg-success-600' 
                : 'bg-gray-300 dark:bg-gray-600'
              }
            `} />
          ))}
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {renderStepContent()}
      </ScrollView>

      {/* Navigation */}
      <View className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <View className="flex-row space-x-3">
          {currentStep !== 'intro' && (
            <Button
              title="Back"
              onPress={handleBack}
              variant="outline"
              fullWidth
            />
          )}
          <Button
            title={currentStep === 'complete' ? 'Get Started' : 'Next'}
            onPress={handleNext}
            disabled={!canProceed()}
            fullWidth
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingScreen;