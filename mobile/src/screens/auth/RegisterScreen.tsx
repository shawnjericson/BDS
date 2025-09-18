import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';

import { useAuthStore } from '../../stores/authStore';
import { RegisterForm, RootStackParamList } from '../../types';

type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

const RegisterScreen = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const { register, isLoading, error, clearError, validateReferralCode } = useAuthStore();
  const [isValidatingReferral, setIsValidatingReferral] = useState(false);
  
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
    clearErrors,
  } = useForm<RegisterForm>({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      referralCode: '',
    },
  });

  const watchedReferralCode = watch('referralCode');

  const validateReferral = async (code: string) => {
    if (!code.trim()) return;
    
    setIsValidatingReferral(true);
    try {
      const isValid = await validateReferralCode(code);
      if (!isValid) {
        setError('referralCode', {
          type: 'manual',
          message: 'Mã giới thiệu không hợp lệ',
        });
      } else {
        clearErrors('referralCode');
      }
    } catch (error) {
      setError('referralCode', {
        type: 'manual',
        message: 'Không thể xác thực mã giới thiệu',
      });
    } finally {
      setIsValidatingReferral(false);
    }
  };

  const onSubmit = async (data: RegisterForm) => {
    try {
      clearError();
      
      // Validate referral code one more time before submitting
      const isValidReferral = await validateReferralCode(data.referralCode);
      if (!isValidReferral) {
        setError('referralCode', {
          type: 'manual',
          message: 'Mã giới thiệu không hợp lệ',
        });
        return;
      }

      await register(data);
      // Navigation will be handled automatically by AppNavigator after login
    } catch (error) {
      // Error is handled in the store
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>Đăng ký</Text>
          <Text style={styles.subtitle}>Tạo tài khoản mới</Text>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.form}>
            <Controller
              control={control}
              name="fullName"
              rules={{
                required: 'Họ tên là bắt buộc',
                minLength: {
                  value: 2,
                  message: 'Họ tên phải có ít nhất 2 ký tự',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Họ và tên</Text>
                  <TextInput
                    style={[styles.input, errors.fullName && styles.inputError]}
                    placeholder="Nhập họ và tên"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="words"
                  />
                  {errors.fullName && (
                    <Text style={styles.fieldError}>{errors.fullName.message}</Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="email"
              rules={{
                required: 'Email là bắt buộc',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email không hợp lệ',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={[styles.input, errors.email && styles.inputError]}
                    placeholder="Nhập email của bạn"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {errors.email && (
                    <Text style={styles.fieldError}>{errors.email.message}</Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="password"
              rules={{
                required: 'Mật khẩu là bắt buộc',
                minLength: {
                  value: 6,
                  message: 'Mật khẩu phải có ít nhất 6 ký tự',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Mật khẩu</Text>
                  <TextInput
                    style={[styles.input, errors.password && styles.inputError]}
                    placeholder="Nhập mật khẩu"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {errors.password && (
                    <Text style={styles.fieldError}>{errors.password.message}</Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="referralCode"
              rules={{
                required: 'Mã giới thiệu là bắt buộc',
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Mã giới thiệu</Text>
                  <View style={styles.referralContainer}>
                    <TextInput
                      style={[styles.input, styles.referralInput, errors.referralCode && styles.inputError]}
                      placeholder="Nhập mã giới thiệu"
                      value={value}
                      onChangeText={onChange}
                      onBlur={(e) => {
                        onBlur();
                        validateReferral(value);
                      }}
                      autoCapitalize="characters"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      style={styles.validateButton}
                      onPress={() => validateReferral(value)}
                      disabled={isValidatingReferral || !value.trim()}
                    >
                      <Text style={styles.validateButtonText}>
                        {isValidatingReferral ? 'Kiểm tra...' : 'Kiểm tra'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {errors.referralCode && (
                    <Text style={styles.fieldError}>{errors.referralCode.message}</Text>
                  )}
                </View>
              )}
            />

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
              </Text>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Đã có tài khoản? </Text>
              <TouchableOpacity onPress={navigateToLogin}>
                <Text style={styles.loginLink}>Đăng nhập ngay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#ff4444',
  },
  fieldError: {
    color: '#ff4444',
    fontSize: 14,
  },
  referralContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  referralInput: {
    flex: 1,
  },
  validateButton: {
    backgroundColor: '#28a745',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  validateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#666',
    fontSize: 16,
  },
  loginLink: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default RegisterScreen;
