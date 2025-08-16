import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Target, Plus, Edit3, Trash2, Star, Calendar, DollarSign } from 'lucide-react-native';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { useStore } from '../../store/useStore';
import { calculateMonthlySurplus, calculateSavingProjection, formatCurrency } from '../../utils/calculations';
import { dayjs } from '../../utils/dayjs';
import { Goal } from '../../types';

const GoalsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { goals, income, expenses, primaryGoalId, addGoal, updateGoal, removeGoal, setPrimaryGoal } = useStore();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    targetAmount: '',
    targetDate: ''
  });

  const monthlySurplus = calculateMonthlySurplus(income, expenses);

  const handleAddGoal = () => {
    if (!formData.title || !formData.targetAmount) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    const amount = parseFloat(formData.targetAmount);
    if (amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid target amount.');
      return;
    }

    const newGoal: Goal = {
      id: Date.now().toString() + Math.random(),
      title: formData.title,
      targetAmount: amount,
      targetDate: formData.targetDate || undefined,
      createdAt: new Date().toISOString()
    };

    addGoal(newGoal);
    setFormData({ title: '', targetAmount: '', targetDate: '' });
    setShowAddModal(false);
  };

  const handleEditGoal = () => {
    if (!editingGoal || !formData.title || !formData.targetAmount) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    const amount = parseFloat(formData.targetAmount);
    if (amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid target amount.');
      return;
    }

    updateGoal(editingGoal.id, {
      title: formData.title,
      targetAmount: amount,
      targetDate: formData.targetDate || undefined
    });

    setFormData({ title: '', targetAmount: '', targetDate: '' });
    setEditingGoal(null);
  };

  const handleDeleteGoal = (goal: Goal) => {
    Alert.alert(
      'Delete Goal',
      `Are you sure you want to delete "${goal.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => removeGoal(goal.id)
        }
      ]
    );
  };

  const openEditModal = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      targetAmount: goal.targetAmount.toString(),
      targetDate: goal.targetDate || ''
    });
  };

  const closeModals = () => {
    setShowAddModal(false);
    setEditingGoal(null);
    setFormData({ title: '', targetAmount: '', targetDate: '' });
  };

  const renderGoalCard = (goal: Goal) => {
    const savingProjection = calculateSavingProjection(goal.targetAmount, monthlySurplus);
    const isPrimary = primaryGoalId === goal.id;
    const monthsToGoal = savingProjection.monthsToGoal;
    const estimatedInvestingMonths = Math.ceil(monthsToGoal * 0.7);

    return (
      <Card key={goal.id} className="mb-4">
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1">
            <View className="flex-row items-center mb-2">
              <Target size={20} color="#2563eb" />
              <Text className="text-lg font-semibold text-gray-900 dark:text-white ml-2">
                {goal.title}
              </Text>
              {isPrimary && (
                <View className="ml-2 bg-primary-100 dark:bg-primary-900/20 px-2 py-1 rounded-full">
                  <Star size={12} color="#2563eb" />
                </View>
              )}
            </View>
            
            <View className="flex-row items-center mb-2">
              <DollarSign size={16} color="#6b7280" />
              <Text className="text-lg font-bold text-gray-900 dark:text-white ml-1">
                {formatCurrency(goal.targetAmount)}
              </Text>
            </View>
            
            {goal.targetDate && (
              <View className="flex-row items-center mb-3">
                <Calendar size={16} color="#6b7280" />
                <Text className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                  Due: {dayjs(goal.targetDate).format('MMM YYYY')}
                </Text>
              </View>
            )}
          </View>
          
          <View className="flex-row space-x-2">
            <TouchableOpacity
              onPress={() => openEditModal(goal)}
              className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg"
            >
              <Edit3 size={16} color="#6b7280" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDeleteGoal(goal)}
              className="p-2 bg-danger-100 dark:bg-danger-900/20 rounded-lg"
            >
              <Trash2 size={16} color="#dc2626" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress Info */}
        <View className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-3">
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Time to reach goal:
          </Text>
          <View className="flex-row space-x-4">
            <View className="flex-1">
              <Text className="text-xs text-gray-500 dark:text-gray-400">Saving Only</Text>
              <Text className="text-sm font-bold text-gray-900 dark:text-white">
                {monthsToGoal === Infinity ? '∞' : `${monthsToGoal} months`}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-xs text-primary-500 dark:text-primary-400">With Investing</Text>
              <Text className="text-sm font-bold text-primary-600 dark:text-primary-400">
                ~{estimatedInvestingMonths} months
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View className="flex-row space-x-2">
          <Button
            title={isPrimary ? 'Primary Goal' : 'Set as Primary'}
            onPress={() => setPrimaryGoal(isPrimary ? undefined : goal.id)}
            variant={isPrimary ? 'secondary' : 'outline'}
            size="sm"
            fullWidth
          />
                        <Button
                title="View Details"
                onPress={() => navigation.navigate('Goals' as never)}
                variant="outline"
                size="sm"
                fullWidth
              />
        </View>
      </Card>
    );
  };

  const renderAddEditModal = () => {
    const isEditing = !!editingGoal;
    const modalTitle = isEditing ? 'Edit Goal' : 'Add New Goal';
    const submitTitle = isEditing ? 'Update Goal' : 'Add Goal';

    return (
      <Modal
        visible={showAddModal || !!editingGoal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModals}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white dark:bg-gray-800 rounded-xl p-6 mx-4 w-full max-w-sm">
            <Text className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
              {modalTitle}
            </Text>
            
            <Input
              label="Goal Title"
              placeholder="e.g., Down Payment, Emergency Fund"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />
            
            <Input
              label="Target Amount"
              placeholder="Enter amount"
              value={formData.targetAmount}
              onChangeText={(text) => setFormData({ ...formData, targetAmount: text })}
              keyboardType="numeric"
              leftIcon={<DollarSign size={20} color="#6b7280" />}
            />
            
            <Input
              label="Target Date (Optional)"
              placeholder="YYYY-MM-DD"
              value={formData.targetDate}
              onChangeText={(text) => setFormData({ ...formData, targetDate: text })}
              helperText="Leave empty if no specific deadline"
            />
            
            <View className="flex-row space-x-3 mt-4">
              <Button
                title="Cancel"
                onPress={closeModals}
                variant="outline"
                fullWidth
              />
              <Button
                title={submitTitle}
                onPress={isEditing ? handleEditGoal : handleAddGoal}
                fullWidth
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 py-4">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            Savings Goals
          </Text>
          <Text className="text-base text-gray-600 dark:text-gray-400">
            Track your progress towards financial milestones
          </Text>
        </View>

        {/* Add Goal Button */}
        <View className="px-6 mb-6">
          <Button
            title="Add New Goal"
            onPress={() => setShowAddModal(true)}
            icon={<Plus size={20} color="#ffffff" />}
            fullWidth
          />
        </View>

        {/* Goals List */}
        <View className="px-6 mb-6">
          {goals.length === 0 ? (
            <Card>
              <View className="items-center py-12">
                <Target size={48} color="#9ca3af" />
                <Text className="text-lg font-medium text-gray-600 dark:text-gray-400 text-center mt-4 mb-2">
                  No goals yet
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
                  Create your first savings goal to get started
                </Text>
                <Button
                  title="Create Your First Goal"
                  onPress={() => setShowAddModal(true)}
                  variant="outline"
                />
              </View>
            </Card>
          ) : (
            goals.map(renderGoalCard)
          )}
        </View>

        {/* Tips Section */}
        {goals.length > 0 && (
          <View className="px-6 mb-6">
            <Card>
              <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                💡 Goal Setting Tips
              </Text>
              <View className="space-y-2">
                <Text className="text-sm text-gray-700 dark:text-gray-300">
                  • Set specific, measurable goals with clear deadlines
                </Text>
                <Text className="text-sm text-gray-700 dark:text-gray-300">
                  • Prioritize goals by importance and urgency
                </Text>
                <Text className="text-sm text-gray-700 dark:text-gray-300">
                  • Consider using a mix of saving and investing for long-term goals
                </Text>
                <Text className="text-sm text-gray-700 dark:text-gray-300">
                  • Review and adjust your goals regularly as circumstances change
                </Text>
              </View>
            </Card>
          </View>
        )}
      </ScrollView>

      {renderAddEditModal()}
    </SafeAreaView>
  );
};

export default GoalsScreen;