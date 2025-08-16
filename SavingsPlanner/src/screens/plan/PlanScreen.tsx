import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Wallet, Receipt, PiggyBank, Plus, Edit3, TrendingUp, Target } from 'lucide-react-native';
import { LineChart } from 'react-native-chart-kit';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { useStore } from '../../store/useStore';
import { calculateMonthlySurplus, calculateSavingProjection, formatCurrency, getImprovementTips } from '../../utils/calculations';
import { dayjs } from '../../utils/dayjs';

const PlanScreen: React.FC = () => {
  const navigation = useNavigation();
  const { income, expenses, goals, primaryGoalId, setIncome, addExpense } = useStore();
  
  const [showIncomeInput, setShowIncomeInput] = useState(false);
  const [tempIncome, setTempIncome] = useState(income.toString());

  const monthlySurplus = calculateMonthlySurplus(income, expenses);
  const primaryGoal = goals.find(goal => goal.id === primaryGoalId);
  
  const savingProjection = primaryGoal 
    ? calculateSavingProjection(primaryGoal.targetAmount, monthlySurplus)
    : null;

  const improvementTips = getImprovementTips(monthlySurplus, expenses);

  const handleUpdateIncome = () => {
    const newIncome = parseFloat(tempIncome);
    if (newIncome > 0) {
      setIncome(newIncome);
      setShowIncomeInput(false);
    } else {
      Alert.alert('Invalid Amount', 'Please enter a valid income amount.');
    }
  };

  const handleAddExpense = () => {
    // Navigate to add expense screen or show modal
    Alert.alert('Add Expense', 'This will open the expense management screen.');
  };

  const getSurplusColor = (surplus: number) => {
    if (surplus <= 0) return 'text-danger-600 dark:text-danger-400';
    if (surplus < 10000) return 'text-warning-600 dark:text-warning-400';
    return 'text-success-600 dark:text-success-400';
  };

  const getSurplusIcon = (surplus: number) => {
    if (surplus <= 0) return '⚠️';
    if (surplus < 10000) return '💡';
    return '🎉';
  };

  const renderChart = () => {
    if (!savingProjection || savingProjection.monthlyData.length === 0) return null;

    const chartData = {
      labels: ['0m', '6m', '12m', '18m', '24m'],
      datasets: [{
        data: [
          savingProjection.monthlyData[0],
          savingProjection.monthlyData[6] || 0,
          savingProjection.monthlyData[12] || 0,
          savingProjection.monthlyData[18] || 0,
          savingProjection.monthlyData[24] || 0,
        ],
        color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
        strokeWidth: 3
      }]
    };

    return (
      <Card className="mb-4">
        <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Savings Projection (24 months)
        </Text>
        <LineChart
          data={chartData}
          width={300}
          height={180}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16
            },
            propsForDots: {
              r: '4',
              strokeWidth: '2',
              stroke: '#2563eb'
            }
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16
          }}
        />
      </Card>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 py-4">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            Financial Plan
          </Text>
          <Text className="text-base text-gray-600 dark:text-gray-400">
            Track your income, expenses, and savings potential
          </Text>
        </View>

        {/* Summary Cards */}
        <View className="px-6 mb-6">
          {/* Income Card */}
          <Card className="mb-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-primary-100 rounded-full items-center justify-center mr-3">
                  <Wallet size={24} color="#2563eb" />
                </View>
                <View>
                  <Text className="text-sm text-gray-600 dark:text-gray-400">Monthly Income</Text>
                  <Text className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(income)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setShowIncomeInput(true)}>
                <Edit3 size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            {showIncomeInput && (
              <View className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <View className="flex-row items-center space-x-2">
                  <Text className="text-lg text-gray-500">₹</Text>
                  <TextInput
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-lg"
                    value={tempIncome}
                    onChangeText={setTempIncome}
                    keyboardType="numeric"
                    placeholder="Enter new income"
                  />
                </View>
                <View className="flex-row space-x-2 mt-2">
                  <Button
                    title="Update"
                    onPress={handleUpdateIncome}
                    size="sm"
                  />
                  <Button
                    title="Cancel"
                    onPress={() => setShowIncomeInput(false)}
                    variant="outline"
                    size="sm"
                  />
                </View>
              </View>
            )}
          </Card>

          {/* Expenses Card */}
          <Card className="mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-warning-100 rounded-full items-center justify-center mr-3">
                  <Receipt size={24} color="#d97706" />
                </View>
                <View>
                  <Text className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</Text>
                  <Text className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(expenses.reduce((sum, exp) => sum + exp.amount, 0))}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleAddExpense}>
                <Plus size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            {expenses.length > 0 && (
              <View>
                {expenses.slice(0, 3).map((expense) => (
                  <View key={expense.id} className="flex-row justify-between items-center py-2">
                    <Text className="text-gray-700 dark:text-gray-300">{expense.name}</Text>
                    <Text className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(expense.amount)}
                    </Text>
                  </View>
                ))}
                {expenses.length > 3 && (
                  <Text className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                    +{expenses.length - 3} more expenses
                  </Text>
                )}
              </View>
            )}
          </Card>

          {/* Surplus Card */}
          <Card className="mb-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-success-100 rounded-full items-center justify-center mr-3">
                  <PiggyBank size={24} color="#16a34a" />
                </View>
                <View>
                  <Text className="text-sm text-gray-600 dark:text-gray-400">Monthly Surplus</Text>
                  <Text className={`text-xl font-bold ${getSurplusColor(monthlySurplus)}`}>
                    {formatCurrency(monthlySurplus)}
                  </Text>
                </View>
              </View>
              <Text className="text-2xl">{getSurplusIcon(monthlySurplus)}</Text>
            </View>
            
            {monthlySurplus > 0 && (
              <View className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-sm text-gray-600 dark:text-gray-400">Daily Saving</Text>
                  <Text className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(monthlySurplus / 30)}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-gray-600 dark:text-gray-400">Weekly Saving</Text>
                  <Text className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(monthlySurplus / 4)}
                  </Text>
                </View>
              </View>
            )}
          </Card>
        </View>

        {/* Primary Goal Section */}
        {primaryGoal && (
          <View className="px-6 mb-6">
            <Card>
              <View className="flex-row items-center mb-3">
                <Target size={20} color="#2563eb" />
                <Text className="text-lg font-semibold text-gray-900 dark:text-white ml-2">
                  Primary Goal: {primaryGoal.title}
                </Text>
              </View>
              
              <View className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-3 mb-3">
                <Text className="text-sm text-primary-800 dark:text-primary-200">
                  Target: {formatCurrency(primaryGoal.targetAmount)}
                  {primaryGoal.targetDate && ` • Due: ${dayjs(primaryGoal.targetDate).format('MMM YYYY')}`}
                </Text>
              </View>

              {savingProjection && (
                <View>
                  <Text className="text-base font-medium text-gray-900 dark:text-white mb-2">
                    Time to reach goal:
                  </Text>
                  <View className="flex-row space-x-4">
                    <View className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                      <Text className="text-sm text-gray-600 dark:text-gray-400">Saving Only</Text>
                      <Text className="text-lg font-bold text-gray-900 dark:text-white">
                        {savingProjection.monthsToGoal === Infinity ? '∞' : `${savingProjection.monthsToGoal} months`}
                      </Text>
                    </View>
                    <View className="flex-1 bg-primary-100 dark:bg-primary-900/20 rounded-lg p-3">
                      <Text className="text-sm text-primary-600 dark:text-primary-400">With Investing</Text>
                      <Text className="text-lg font-bold text-primary-600 dark:text-primary-400">
                        ~{Math.ceil(savingProjection.monthsToGoal * 0.7)} months
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </Card>
          </View>
        )}

        {/* Chart */}
        {renderChart()}

        {/* Improvement Tips */}
        <View className="px-6 mb-6">
          <Card>
            <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              💡 Improvement Tips
            </Text>
            {improvementTips.map((tip, index) => (
              <View key={index} className="flex-row items-start mb-2">
                <Text className="text-primary-600 mr-2">•</Text>
                <Text className="flex-1 text-gray-700 dark:text-gray-300 text-sm">
                  {tip}
                </Text>
              </View>
            ))}
          </Card>
        </View>

        {/* Quick Actions */}
        <View className="px-6 mb-6">
          <Card>
            <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Quick Actions
            </Text>
            <View className="space-y-3">
              <Button
                title="Add New Goal"
                onPress={() => navigation.navigate('Goals' as never)}
                variant="outline"
                fullWidth
              />
              <Button
                title="Compare Investment Options"
                onPress={() => navigation.navigate('Compare' as never)}
                fullWidth
              />
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PlanScreen;