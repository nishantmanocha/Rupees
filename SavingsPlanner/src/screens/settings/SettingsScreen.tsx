import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Switch, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, Moon, Sun, Monitor, Download, Upload, Trash2, Edit3, Save } from 'lucide-react-native';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { useStore } from '../../store/useStore';
import { formatPercentage } from '../../utils/calculations';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen: React.FC = () => {
  const { 
    theme, 
    setTheme, 
    instruments, 
    updateInstrument, 
    resetData,
    income,
    expenses,
    goals
  } = useStore();
  
  const [editingInstrument, setEditingInstrument] = useState<string | null>(null);
  const [tempRate, setTempRate] = useState('');
  const [showBackupModal, setShowBackupModal] = useState(false);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
  };

  const handleRateEdit = (instrumentId: string) => {
    const instrument = instruments.find(inst => inst.id === instrumentId);
    if (instrument) {
      setEditingInstrument(instrumentId);
      setTempRate((instrument.annualRate * 100).toString());
    }
  };

  const handleRateSave = () => {
    if (!editingInstrument || !tempRate) return;
    
    const newRate = parseFloat(tempRate) / 100;
    if (isNaN(newRate) || newRate < 0 || newRate > 1) {
      Alert.alert('Invalid Rate', 'Please enter a valid percentage between 0 and 100.');
      return;
    }

    updateInstrument(editingInstrument, { annualRate: newRate });
    setEditingInstrument(null);
    setTempRate('');
  };

  const handleBackup = async () => {
    try {
      const data = {
        income,
        expenses,
        goals,
        instruments,
        timestamp: new Date().toISOString()
      };
      
      const jsonString = JSON.stringify(data, null, 2);
      // In a real app, you'd use a file system library to save this
      Alert.alert(
        'Backup Created',
        'Your data has been exported. In a production app, this would save to your device.',
        [{ text: 'OK' }]
      );
      
      console.log('Backup data:', jsonString);
    } catch (error) {
      Alert.alert('Backup Failed', 'There was an error creating the backup.');
    }
  };

  const handleRestore = async () => {
    Alert.alert(
      'Restore Data',
      'This will replace all your current data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: () => {
            // In a real app, you'd read from a file and restore
            Alert.alert('Restore', 'In a production app, this would restore from a backup file.');
          }
        }
      ]
    );
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'This will permanently delete all your data including income, expenses, goals, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetData();
            Alert.alert('Data Reset', 'All data has been reset to default values.');
          }
        }
      ]
    );
  };

  const renderThemeSection = () => (
    <Card className="mb-4">
      <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Appearance
      </Text>
      
      <View className="space-y-4">
        <TouchableOpacity
          onPress={() => handleThemeChange('light')}
          className={`flex-row items-center justify-between p-3 rounded-lg border ${
            theme === 'light' 
              ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20' 
              : 'border-gray-200 dark:border-gray-700'
          }`}
        >
          <View className="flex-row items-center">
            <Sun size={20} color={theme === 'light' ? '#2563eb' : '#6b7280'} />
            <Text className={`ml-3 text-base ${
              theme === 'light' ? 'text-primary-600 font-medium' : 'text-gray-700 dark:text-gray-300'
            }`}>
              Light Mode
            </Text>
          </View>
          {theme === 'light' && (
            <View className="w-4 h-4 bg-primary-600 rounded-full" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleThemeChange('dark')}
          className={`flex-row items-center justify-between p-3 rounded-lg border ${
            theme === 'dark' 
              ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20' 
              : 'border-gray-200 dark:border-gray-700'
          }`}
        >
          <View className="flex-row items-center">
            <Moon size={20} color={theme === 'dark' ? '#2563eb' : '#6b7280'} />
            <Text className={`ml-3 text-base ${
              theme === 'dark' ? 'text-primary-600 font-medium' : 'text-gray-700 dark:text-gray-300'
            }`}>
              Dark Mode
            </Text>
          </View>
          {theme === 'dark' && (
            <View className="w-4 h-4 bg-primary-600 rounded-full" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleThemeChange('system')}
          className={`flex-row items-center justify-between p-3 rounded-lg border ${
            theme === 'system' 
              ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20' 
              : 'border-gray-200 dark:border-gray-700'
          }`}
        >
          <View className="flex-row items-center">
            <Monitor size={20} color={theme === 'system' ? '#2563eb' : '#6b7280'} />
            <Text className={`ml-3 text-base ${
              theme === 'system' ? 'text-primary-600 font-medium' : 'text-gray-700 dark:text-gray-300'
            }`}>
              System Default
            </Text>
          </View>
          {theme === 'system' && (
            <View className="w-4 h-4 bg-primary-600 rounded-full" />
          )}
        </TouchableOpacity>
      </View>
    </Card>
  );

  const renderInvestmentRatesSection = () => (
    <Card className="mb-4">
      <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Investment Rates
      </Text>
      <Text className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Customize the annual return rates for different investment options
      </Text>
      
      <View className="space-y-3">
        {instruments.map((instrument) => (
          <View key={instrument.id} className="flex-row items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <View className="flex-1">
              <Text className="font-medium text-gray-900 dark:text-white">
                {instrument.name}
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                Current: {formatPercentage(instrument.annualRate)}
              </Text>
            </View>
            
            {editingInstrument === instrument.id ? (
              <View className="flex-row items-center space-x-2">
                <Input
                  value={tempRate}
                  onChangeText={setTempRate}
                  placeholder="Rate %"
                  keyboardType="numeric"
                  className="w-20"
                />
                <TouchableOpacity
                  onPress={handleRateSave}
                  className="p-2 bg-success-100 rounded-lg"
                >
                  <Save size={16} color="#16a34a" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => handleRateEdit(instrument.id)}
                className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg"
              >
                <Edit3 size={16} color="#2563eb" />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    </Card>
  );

  const renderDataSection = () => (
    <Card className="mb-4">
      <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Data Management
      </Text>
      
      <View className="space-y-3">
        <Button
          title="Export Data"
          onPress={handleBackup}
          variant="outline"
          icon={<Download size={20} color="#2563eb" />}
          fullWidth
        />
        
        <Button
          title="Import Data"
          onPress={handleRestore}
          variant="outline"
          icon={<Upload size={20} color="#2563eb" />}
          fullWidth
        />
        
        <Button
          title="Reset All Data"
          onPress={handleResetData}
          variant="danger"
          icon={<Trash2 size={20} color="#ffffff" />}
          fullWidth
        />
      </View>
    </Card>
  );

  const renderAppInfoSection = () => (
    <Card className="mb-4">
      <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        App Information
      </Text>
      
      <View className="space-y-3">
        <View className="flex-row justify-between items-center py-2">
          <Text className="text-gray-600 dark:text-gray-400">Version</Text>
          <Text className="text-gray-900 dark:text-white font-medium">1.0.0</Text>
        </View>
        
        <View className="flex-row justify-between items-center py-2">
          <Text className="text-gray-600 dark:text-gray-400">Total Goals</Text>
          <Text className="text-gray-900 dark:text-white font-medium">{goals.length}</Text>
        </View>
        
        <View className="flex-row justify-between items-center py-2">
          <Text className="text-gray-600 dark:text-gray-400">Total Expenses</Text>
          <Text className="text-gray-900 dark:text-white font-medium">{expenses.length}</Text>
        </View>
        
        <View className="flex-row justify-between items-center py-2">
          <Text className="text-gray-600 dark:text-gray-400">Monthly Income</Text>
          <Text className="text-gray-900 dark:text-white font-medium">₹{income.toLocaleString()}</Text>
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 py-4">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            Settings
          </Text>
          <Text className="text-base text-gray-600 dark:text-gray-400">
            Customize your app experience and manage your data
          </Text>
        </View>

        {/* Settings Sections */}
        <View className="px-6 mb-6">
          {renderThemeSection()}
          {renderInvestmentRatesSection()}
          {renderDataSection()}
          {renderAppInfoSection()}
        </View>

        {/* Footer */}
        <View className="px-6 mb-6">
          <Card>
            <Text className="text-center text-sm text-gray-500 dark:text-gray-400">
              Made with ❤️ for better financial planning
            </Text>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;