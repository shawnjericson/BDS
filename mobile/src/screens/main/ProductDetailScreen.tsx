import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';

import { apiService } from '../../services/api';
import { Product } from '../../types';

const ProductDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { productId } = route.params as { productId: number };
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // Booking form states
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  // Hide tab bar when this screen is focused
  useFocusEffect(
    React.useCallback(() => {
      const parent = navigation.getParent();
      if (parent) {
        parent.setOptions({
          tabBarStyle: { display: 'none' }
        });
      }
      return () => {
        if (parent) {
          parent.setOptions({
            tabBarStyle: {
              display: 'flex',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 60,
              backgroundColor: 'white',
              borderTopWidth: 1,
              borderTopColor: '#e5e7eb',
              paddingBottom: 8,
              paddingTop: 8,
            }
          });
        }
      };
    }, [navigation])
  );

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await apiService.getProduct(productId);
      setProduct(data);
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBooking = async () => {
    if (!product) return;

    // Validation
    if (!customerName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập họ tên khách hàng');
      return;
    }

    if (!customerPhone.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại khách hàng');
      return;
    }

    if (!customerEmail.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập email khách hàng');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail.trim())) {
      Alert.alert('Lỗi', 'Email không đúng định dạng. Vui lòng nhập email hợp lệ (ví dụ: user@example.com)');
      return;
    }

    try {
      setBookingLoading(true);

      const bookingData = {
        productId: product.id,
        price: product.price, // Fixed price - không cho đổi
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
      };

      console.log('🔍 Creating booking with data:', bookingData);
      const response = await apiService.createBooking(bookingData);
      console.log('✅ Booking created:', response);

      Alert.alert(
        'Thành công',
        `Đã tạo booking cho sản phẩm "${product.name}" với giá ${product.price.toLocaleString('vi-VN')} VND`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setCustomerName('');
              setCustomerPhone('');
              setCustomerEmail('');
              setEmailError('');
              setShowBookingForm(false);
              // Navigate back or to bookings
              navigation.goBack();
            }
          }
        ]
      );
    } catch (error) {
      console.error('❌ Error creating booking:', error);
      Alert.alert('Lỗi', 'Không thể tạo booking. Vui lòng thử lại.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Loading product...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Product not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: '#007AFF', marginTop: 10 }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Product Info */}
        <View style={styles.productSection}>
          <Text style={styles.productName}>{product.name}</Text>

          <Text style={styles.productStatus}>
            Trạng thái: {product.status}
          </Text>

          {product.price && (
            <Text style={styles.productPrice}>
              Giá: {product.price.toLocaleString('vi-VN')} VND
            </Text>
          )}

          <Text style={styles.productDescription}>
            {product.description}
          </Text>

          {product.images && (
            <View style={styles.imageSection}>
              <Text style={styles.sectionTitle}>Hình ảnh</Text>
              <Text style={styles.imageText}>{product.images}</Text>
            </View>
          )}

          {product.owner && (
            <View style={styles.ownerSection}>
              <Text style={styles.sectionTitle}>Chủ sở hữu</Text>
              <Text style={styles.ownerText}>{product.owner.fullName}</Text>
              <Text style={styles.ownerText}>{product.owner.email}</Text>
            </View>
          )}

          <View style={styles.timeSection}>
            <Text style={styles.sectionTitle}>Thông tin thời gian</Text>
            <Text style={styles.timeText}>Tạo lúc: {new Date(product.createdAt).toLocaleString('vi-VN')}</Text>
            <Text style={styles.timeText}>Cập nhật: {new Date(product.updatedAt).toLocaleString('vi-VN')}</Text>
          </View>
        </View>

        {/* Create Booking Button */}
        {!showBookingForm && (
          <TouchableOpacity
            style={styles.createBookingButton}
            onPress={() => setShowBookingForm(true)}
          >
            <Text style={styles.createBookingButtonText}>
              Tạo booking cho sản phẩm này
            </Text>
          </TouchableOpacity>
        )}

        {/* Booking Form */}
        {showBookingForm && (
          <View style={styles.bookingForm}>
            <Text style={styles.formTitle}>Tạo Booking</Text>
            <Text style={styles.formSubtitle}>
              Sản phẩm: {product.name} - Giá: {product.price.toLocaleString('vi-VN')} VND (không thể thay đổi)
            </Text>

            {/* Customer Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Họ tên khách hàng *</Text>
              <TextInput
                style={styles.input}
                value={customerName}
                onChangeText={setCustomerName}
                placeholder="Nhập họ tên"
                placeholderTextColor="#999"
              />
            </View>

            {/* Customer Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Số điện thoại *</Text>
              <TextInput
                style={styles.input}
                value={customerPhone}
                onChangeText={setCustomerPhone}
                placeholder="Nhập số điện thoại"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
              />
            </View>

            {/* Customer Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={[styles.input, emailError ? styles.inputError : null]}
                value={customerEmail}
                onChangeText={(text) => {
                  setCustomerEmail(text);
                  // Real-time email validation
                  if (text.trim() === '') {
                    setEmailError('');
                  } else {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(text.trim())) {
                      setEmailError('Email không đúng định dạng');
                    } else {
                      setEmailError('');
                    }
                  }
                }}
                placeholder="Nhập email (ví dụ: user@example.com)"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {emailError ? (
                <Text style={styles.errorText}>{emailError}</Text>
              ) : null}
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowBookingForm(false);
                  setCustomerName('');
                  setCustomerPhone('');
                  setCustomerEmail('');
                  setEmailError('');
                }}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitButton, bookingLoading && styles.submitButtonDisabled]}
                onPress={handleCreateBooking}
                disabled={bookingLoading}
              >
                {bookingLoading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Tạo Booking</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  productSection: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  productStatus: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 12,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 16,
  },
  productDescription: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  imageSection: {
    marginBottom: 20,
  },
  imageText: {
    color: '#6b7280',
    fontSize: 14,
  },
  ownerSection: {
    marginBottom: 20,
  },
  ownerText: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 4,
  },
  timeSection: {
    marginBottom: 20,
  },
  timeText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  createBookingButton: {
    backgroundColor: '#3b82f6',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  createBookingButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bookingForm: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#ef4444',
    borderWidth: 2,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProductDetailScreen;
