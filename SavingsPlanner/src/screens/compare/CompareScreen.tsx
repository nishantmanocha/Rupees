import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { TrendingUp, Target, Calendar, DollarSign } from 'lucide-react-native';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { useStore } from '../../store/useStore';
import { calculateMonthlySurplus, calculateAllProjections, formatCurrency, formatPercentage } from '../../utils/calculations';

const HORIZON_OPTIONS = [6, 12, 24, 36, 60, 120];

const CompareScreen: React.FC = () => {
  const navigation = useNavigation();
  const { income, expenses, goals, instruments, primaryGoalId } = useStore();
  
  const [selectedGoalId, setSelectedGoalId] = useState(primaryGoalId || '');
  const [monthlyContribution, setMonthlyContribution] = useState('');
  const [selectedHorizon, setSelectedHorizon] = useState(24);
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);

  const monthlySurplus = calculateMonthlySurplus(income, expenses);
  const selectedGoal = goals.find(goal => goal.id === selectedGoalId);
  
  // Default monthly contribution to current surplus
  const contribution = monthlyContribution ? parseFloat(monthlyContribution) : monthlySurplus;

  const projections = useMemo(() => {
    if (!selectedGoal || contribution <= 0) return [];
    
    return calculateAllProjections(
      selectedGoal.targetAmount,
      contribution,
      instruments.filter(inst => selectedInstruments.includes(inst.id)),
      selectedHorizon
    );
  }, [selectedGoal, contribution, selectedInstruments, selectedHorizon, instruments]);

  const handleInstrumentToggle = (instrumentId: string) => {
    setSelectedInstruments(prev => 
      prev.includes(instrumentId)
        ? prev.filter(id => id !== instrumentId)
        : [...prev, instrumentId]
    );
  };

  const handleSetAsPlan = () => {
    if (selectedGoal && selectedInstruments.length > 0) {
      // Here you would typically update the user's plan
      Alert.alert(
        'Plan Updated',
        `Your plan has been updated to use ${selectedInstruments.length} investment option(s) for the ${selectedGoal.title} goal.`
      );
    }
  };

  const renderLineChart = () => {
    if (!selectedGoal || projections.length === 0) return null;

    const labels = Array.from({ length: Math.min(selectedHorizon, 24) + 1 }, (_, i) => 
      i % 6 === 0 ? `${i}m` : ''
    ).filter(label => label);

    const datasets = [
      // Saving only line
      {
        data: Array.from({ length: Math.min(selectedHorizon, 24) + 1 }, (_, i) => 
          contribution * i
        ),
        color: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
        strokeWidth: 2
      },
      // Investment lines
      ...projections.slice(0, 3).map((projection, index) => ({
        data: projection.monthlyData.slice(0, Math.min(selectedHorizon, 24) + 1),
        color: (opacity = 1) => [
          `rgba(37, 99, 235, ${opacity})`,
          `rgba(16, 185, 129, ${opacity})`,
          `rgba(245, 158, 11, ${opacity})`
        ][index] || `rgba(37, 99, 235, ${opacity})`,
        strokeWidth: 2
      }))
    ];

    const chartData = { labels, datasets };

    return (
      <Card className="mb-4">
        <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Growth Over Time (24 months)
        </Text>
        <LineChart
          data={chartData}
          width={350}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16
            },
            propsForDots: {
              r: '3',
              strokeWidth: '2',
            }
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16
          }}
        />
        <View className="mt-3 flex-row flex-wrap">
          <View className="flex-row items-center mr-4 mb-2">
            <View className="w-3 h-3 bg-gray-500 rounded-full mr-2" />
            <Text className="text-xs text-gray-600 dark:text-gray-400">Saving Only</Text>
          </View>
          {projections.slice(0, 3).map((projection, index) => (
            <View key={projection.instrumentId} className="flex-row items-center mr-4 mb-2">
              <View 
                className="w-3 h-3 rounded-full mr-2"
                style={{
                  backgroundColor: [
                    '#2563eb',
                    '#10b981',
                    '#f59e0b'
                  ][index] || '#2563eb'
                }}
              />
              <Text className="text-xs text-gray-600 dark:text-gray-400">
                {projection.instrumentName}
              </Text>
            </View>
          ))}
        </View>
      </Card>
    );
  };

  const renderBarChart = () => {
    if (!selectedGoal || projections.length === 0) return null;

    const chartData = {
      labels: ['Saving', ...projections.map(p => p.instrumentName.slice(0, 8))],
      datasets: [{
        data: [
          contribution * selectedHorizon,
          ...projections.map(p => p.finalValue)
        ]
      }]
    };

    return (
      <Card className="mb-4">
        <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Final Amount at {selectedHorizon} months
        </Text>
        <BarChart
          data={chartData}
          width={350}
          height={220}
          yAxisLabel="₹"
          yAxisSuffix=""
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
            barPercentage: 0.7,
          }}
          style={{
            marginVertical: 8,
            borderRadius: 16
          }}
        />
      </Card>
    );
  };

  const renderComparisonTable = () => {
    if (!selectedGoal || projections.length === 0) return null;

    const savingOnlyValue = contribution * selectedHorizon;

    return (
      <Card className="mb-4">
        <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Investment Comparison
        </Text>
        <View className="space-y-3">
          {/* Header */}
          <View className="flex-row py-2 border-b border-gray-200 dark:border-gray-700">
            <Text className="flex-1 font-semibold text-gray-700 dark:text-gray-300">Instrument</Text>
            <Text className="w-20 text-center font-semibold text-gray-700 dark:text-gray-300">Rate</Text>
            <Text className="w-24 text-center font-semibold text-gray-700 dark:text-gray-300">Final Value</Text>
            <Text className="w-20 text-center font-semibold text-gray-700 dark:text-gray-300">Gain</Text>
          </View>
          
          {/* Saving Only Row */}
          <View className="flex-row py-2 border-b border-gray-200 dark:border-gray-700">
            <Text className="flex-1 font-medium text-gray-900 dark:text-white">Saving Only</Text>
            <Text className="w-20 text-center text-gray-600 dark:text-gray-400">0%</Text>
            <Text className="w-24 text-center font-medium text-gray-900 dark:text-white">
              {formatCurrency(savingOnlyValue)}
            </Text>
            <Text className="w-20 text-center text-gray-600 dark:text-gray-400">-</Text>
          </View>
          
          {/* Investment Rows */}
          {projections.map((projection) => (
            <View key={projection.instrumentId} className="flex-row py-2 border-b border-gray-200 dark:border-gray-700">
              <Text className="flex-1 font-medium text-gray-900 dark:text-white">
                {projection.instrumentName}
              </Text>
              <Text className="w-20 text-center text-gray-600 dark:text-gray-400">
                {formatPercentage(instruments.find(i => i.id === projection.instrumentId)?.annualRate || 0)}
              </Text>
              <Text className="w-24 text-center font-medium text-gray-900 dark:text-white">
                {formatCurrency(projection.finalValue)}
              </Text>
              <Text className={`w-20 text-center font-medium ${
                projection.gainVsSavingOnly > 0 ? 'text-success-600' : 'text-gray-600'
              }`}>
                +{formatCurrency(projection.gainVsSavingOnly)}
              </Text>
            </View>
          ))}
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 py-4">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            Compare Investments
          </Text>
          <Text className="text-base text-gray-600 dark:text-gray-400">
            See how different investment options can accelerate your goals
          </Text>
        </View>

        {/* Configuration Section */}
        <View className="px-6 mb-6">
          <Card>
            <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              <Target size={20} color="#2563eb" className="inline mr-2" />
              Goal & Parameters
            </Text>
            
            {/* Goal Selection */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Goal
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {goals.map((goal) => (
                  <TouchableOpacity
                    key={goal.id}
                    onPress={() => setSelectedGoalId(goal.id)}
                    className={`px-3 py-2 rounded-lg border ${
                      selectedGoalId === goal.id
                        ? 'border-primary-600 bg-primary-100 dark:bg-primary-900/20'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <Text className={`text-sm ${
                      selectedGoalId === goal.id
                        ? 'text-primary-600 dark:text-primary-400 font-medium'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {goal.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Monthly Contribution */}
            <View className="mb-4">
              <Input
                label="Monthly Contribution"
                placeholder={`Current surplus: ${formatCurrency(monthlySurplus)}`}
                value={monthlyContribution}
                onChangeText={setMonthlyContribution}
                keyboardType="numeric"
                leftIcon={<DollarSign size={20} color="#6b7280" />}
                helperText="Leave empty to use your current monthly surplus"
              />
            </View>

            {/* Time Horizon */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Time Horizon
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {HORIZON_OPTIONS.map((horizon) => (
                  <TouchableOpacity
                    key={horizon}
                    onPress={() => setSelectedHorizon(horizon)}
                    className={`px-3 py-2 rounded-lg border ${
                      selectedHorizon === horizon
                        ? 'border-primary-600 bg-primary-100 dark:bg-primary-900/20'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <Text className={`text-sm ${
                      selectedHorizon === horizon
                        ? 'text-primary-600 dark:text-primary-400 font-medium'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {horizon} months
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Instrument Selection */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Investment Options
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {instruments.filter(inst => inst.enabled).map((instrument) => (
                  <TouchableOpacity
                    key={instrument.id}
                    onPress={() => handleInstrumentToggle(instrument.id)}
                    className={`px-3 py-2 rounded-lg border ${
                      selectedInstruments.includes(instrument.id)
                        ? 'border-primary-600 bg-primary-100 dark:bg-primary-900/20'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <Text className={`text-sm ${
                      selectedInstruments.includes(instrument.id)
                        ? 'text-primary-600 dark:text-primary-400 font-medium'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {instrument.name}
                    </Text>
                    <Text className={`text-xs ${
                      selectedInstruments.includes(instrument.id)
                        ? 'text-primary-500 dark:text-primary-300'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {formatPercentage(instrument.annualRate)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Card>
        </View>

        {/* Results Section */}
        {selectedGoal && selectedInstruments.length > 0 && contribution > 0 && (
          <View className="px-6 mb-6">
            <Text className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Results for {selectedGoal.title}
            </Text>
            
            {renderLineChart()}
            {renderBarChart()}
            {renderComparisonTable()}

            <Button
              title="Set as Plan"
              onPress={handleSetAsPlan}
              fullWidth
              className="mt-4"
            />
          </View>
        )}

        {/* No Selection State */}
        {(!selectedGoal || selectedInstruments.length === 0) && (
          <View className="px-6 mb-6">
            <Card>
              <View className="items-center py-8">
                <TrendingUp size={48} color="#9ca3af" />
                <Text className="text-lg font-medium text-gray-600 dark:text-gray-400 text-center mt-4">
                  Select a goal and investment options to see comparisons
                </Text>
              </View>
            </Card>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default CompareScreen;