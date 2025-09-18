import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Product } from '../types';
import { apiService } from '../services/api';

const { width, height } = Dimensions.get('window');

interface ProductDetailModalProps {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
  onCreateBooking?: (productId: number, price: number, customerData?: {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
  }) => Promise<void>;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  visible,
  product,
  onClose,
  onCreateBooking,
}) => {
  const [showBookingForm, setShowBookingForm] = useState(false);

  // Booking form states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  if (!product) return null;

  const formatPrice = (price: number | null | undefined) => {
    if (!price || price === 0) return '0 VND';

    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)} tỷ VND`;
    } else if (price >= 1000000) {
      return `${(price / 1000000).toFixed(0)} triệu VND`;
    } else {
      return `${price.toLocaleString()} VND`;
    }
  };

  const getImages = () => {
    if (!product.images) return [];
    try {
      return typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
    } catch {
      return [];
    }
  };

  const images = getImages();

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

    if (!product.price || product.price <= 0) {
      Alert.alert('Lỗi', 'Sản phẩm chưa có giá hợp lệ');
      return;
    }

    try {
      setBookingLoading(true);

      const bookingData = {
        productId: product.id,
        price: product.price,
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
              onClose();
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết sản phẩm</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Images */}
          {images.length > 0 && (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={styles.imageContainer}
            >
              {images.map((imageUrl: string, index: number) => (
                <Image
                  key={index}
                  source={{ uri: imageUrl }}
                  style={styles.image}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          )}

          {/* Product Info */}
          <View style={styles.infoContainer}>
            <Text style={styles.productName}>{product.name}</Text>
            
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Giá:</Text>
              <Text style={styles.price}>{formatPrice(product.price)}</Text>
            </View>

            <Text style={styles.description}>{product.description || 'Không có mô tả'}</Text>

            {/* Owner Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thông tin chủ sở hữu</Text>
              <Text style={styles.ownerName}>{product.owner?.fullName || 'Không xác định'}</Text>
              <Text style={styles.ownerEmail}>{product.owner?.email || ''}</Text>
            </View>

            {/* Commission Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thông tin hoa hồng</Text>
              <Text style={styles.commissionText}>
                Hoa hồng: {(parseFloat(product.commissionPct.toString()) * 100).toFixed(2)}%
              </Text>
              <Text style={styles.statusText}>
                Trạng thái: {product.status === 'APPROVED' ? 'Đã duyệt' : 'Chờ duyệt'}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          {!showBookingForm ? (
            <TouchableOpacity
              style={styles.bookingButton}
              onPress={() => setShowBookingForm(true)}
            >
              <Text style={styles.bookingButtonText}>Tạo Booking</Text>
            </TouchableOpacity>
          ) : (
            <ScrollView style={styles.bookingForm} showsVerticalScrollIndicator={false}>
              <Text style={styles.formTitle}>Tạo Booking</Text>
              <Text style={styles.priceDisplay}>
                Sản phẩm: {product.name} - Giá: {product.price?.toLocaleString('vi-VN') || '0'} VND
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
              <View style={styles.formButtons}>
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
                  style={[styles.confirmButton, bookingLoading && styles.confirmButtonDisabled]}
                  onPress={handleCreateBooking}
                  disabled={bookingLoading}
                >
                  {bookingLoading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.confirmButtonText}>Tạo Booking</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    height: 250,
  },
  image: {
    width: width,
    height: 250,
  },
  infoContainer: {
    padding: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 16,
    color: '#666',
    marginRight: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  ownerName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  ownerEmail: {
    fontSize: 14,
    color: '#666',
  },
  commissionText: {
    fontSize: 16,
    color: '#4CAF50',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  actionContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  bookingButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookingButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bookingForm: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  priceInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#E0E0E0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  priceDisplay: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    marginBottom: 20,
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
  confirmButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
});
