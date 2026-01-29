import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
  Share,
  I18nManager,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Updates from 'expo-updates';

interface SettingRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value?: string;
  onPress?: () => void;
  showSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  isLast?: boolean;
  color?: string;
}

const SettingRow: React.FC<SettingRowProps> = ({
  icon,
  title,
  value,
  onPress,
  showSwitch,
  switchValue,
  onSwitchChange,
  isLast,
  color = '#007AFF',
}) => (
  <TouchableOpacity
    style={[styles.row, isLast && styles.noBorder]}
    onPress={onPress}
    disabled={showSwitch}
    activeOpacity={0.7}
  >
    <View style={[styles.iconContainer, { backgroundColor: color }]}>
      <Ionicons name={icon} size={20} color="#FFF" />
    </View>
    <View style={styles.rowContent}>
      <Text style={styles.rowTitle}>{title}</Text>
      <View style={styles.rowRight}>
        {value && <Text style={styles.rowValue}>{value}</Text>}
        {showSwitch ? (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{ false: '#D1D1D6', true: '#34C759' }}
            ios_backgroundColor="#D1D1D6"
          />
        ) : (
          <Ionicons
            name={I18nManager.isRTL ? 'chevron-back' : 'chevron-forward'}
            size={18}
            color="#C7C7CC"
          />
        )}
      </View>
    </View>
  </TouchableOpacity>
);

const SettingsScreen: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);

  const handleToggleRTL = async () => {
    Alert.alert(
      'تغيير اللغة',
      'سيتم إعادة تشغيل التطبيق لتطبيق التغييرات.',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'موافق',
          onPress: async () => {
            const isCurrentlyRTL = I18nManager.isRTL;
            I18nManager.forceRTL(!isCurrentlyRTL);
            await Updates.reloadAsync();
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleClearCache = () => {
    Alert.alert('مسح التخزين المؤقت', 'هل أنت متأكد من مسح جميع الملفات المؤقتة؟', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'مسح', style: 'destructive', onPress: () => Alert.alert('تم المسح بنجاح') },
    ]);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'تحقق من تطبيق مكتبة الأنمي الخاص بي! تطبيق رائع لمتابعة الأنمي المفضل لديك.',
      });
    } catch (error) {
      console.error(error);
    }
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => Alert.alert('خطأ', 'لا يمكن فتح الرابط حالياً'));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>الإعدادات</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>تفضيلات العرض</Text>
          <View style={styles.card}>
            <SettingRow
              icon="moon"
              title="الوضع الليلي"
              showSwitch
              switchValue={isDarkMode}
              onSwitchChange={setIsDarkMode}
              color="#5856D6"
            />
            <SettingRow
              icon="language"
              title="تغيير اتجاه اللغة (RTL/LTR)"
              onPress={handleToggleRTL}
              color="#007AFF"
            />
            <SettingRow
              icon="play-circle"
              title="التشغيل التلقائي"
              showSwitch
              switchValue={autoPlay}
              onSwitchChange={setAutoPlay}
              isLast
              color="#FF9500"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>التنبيهات والمكتبة</Text>
          <View style={styles.card}>
            <SettingRow
              icon="notifications"
              title="تنبيهات الحلقات الجديدة"
              showSwitch
              switchValue={notificationsEnabled}
              onSwitchChange={setNotificationsEnabled}
              color="#FF3B30"
            />
            <SettingRow
              icon="trash-outline"
              title="مسح التخزين المؤقت"
              value="124 MB"
              onPress={handleClearCache}
              isLast
              color="#8E8E93"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>حول التطبيق</Text>
          <View style={styles.card}>
            <SettingRow
              icon="share-social"
              title="مشاركة التطبيق"
              onPress={handleShare}
              color="#34C759"
            />
            <SettingRow
              icon="star"
              title="تقييم التطبيق"
              onPress={() => openLink('https://apps.apple.com')}
              color="#FFCC00"
            />
            <SettingRow
              icon="shield-checkmark"
              title="سياسة الخصوصية"
              onPress={() => openLink('https://example.com/privacy')}
              color="#5AC8FA"
            />
            <SettingRow
              icon="information-circle"
              title="إصدار التطبيق"
              value="1.0.0"
              isLast
              color="#AF52DE"
            />
          </View>
        </View>

        <TouchableOpacity 
            style={styles.logoutButton}
            onPress={() => Alert.alert('خروج', 'تم تسجيل الخروج بنجاح')}
        >
          <Text style={styles.logoutText}>تسجيل الخروج</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>صنع بكل حب لمحبي الأنمي ❤️</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    alignItems: I18nManager.isRTL ? 'flex-start' : 'flex-end',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000',
    textAlign: 'right',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    marginTop: 25,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 8,
    marginHorizontal: 10,
    textAlign: 'right',
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  row: {
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8',
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: I18nManager.isRTL ? 0 : 12,
    marginRight: I18nManager.isRTL ? 12 : 0,
  },
  rowContent: {
    flex: 1,
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowTitle: {
    fontSize: 17,
    color: '#000',
    textAlign: 'right',
  },
  rowRight: {
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
    alignItems: 'center',
  },
  rowValue: {
    fontSize: 17,
    color: '#8E8E93',
    marginLeft: I18nManager.isRTL ? 0 : 8,
    marginRight: I18nManager.isRTL ? 8 : 0,
  },
  logoutButton: {
    marginTop: 35,
    marginHorizontal: 16,
    backgroundColor: '#FFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 17,
    fontWeight: '600',
  },
  footerText: {
    textAlign: 'center',
    marginTop: 25,
    color: '#8E8E93',
    fontSize: 13,
  },
});

export default SettingsScreen;