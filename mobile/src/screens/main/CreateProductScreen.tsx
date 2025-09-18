import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { apiService } from '../../services/api';

const CreateProductScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    images: '',
    commissionPercentage: '',
    providerDesiredPercentage: '',
  });

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.description.trim() || !formData.price.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền tên, mô tả và giá');
      return;
    }

    try {
      setLoading(true);

      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price) || 0,
        images: formData.images.trim() || '',
        commissionPercentage: parseFloat(formData.commissionPercentage) || 0,
        providerDesiredPercentage: parseFloat(formData.providerDesiredPercentage) || 0,
      };

      await apiService.createProduct(productData);

      Alert.alert(
        'Thành công',
        'Tạo sản phẩm thành công!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể tạo sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        Tạo sản phẩm bất động sản
      </Text>

      <Text style={{ fontSize: 16, marginBottom: 5 }}>Tên bất động sản *</Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 10,
          borderRadius: 5,
          marginBottom: 15,
        }}
        value={formData.name}
        onChangeText={(text) => setFormData({ ...formData, name: text })}
        placeholder="VD: Villa cao cấp Quận 2"
      />

      <Text style={{ fontSize: 16, marginBottom: 5 }}>Mô tả *</Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 10,
          borderRadius: 5,
          marginBottom: 15,
          height: 100,
          textAlignVertical: 'top',
        }}
        value={formData.description}
        onChangeText={(text) => setFormData({ ...formData, description: text })}
        placeholder="Mô tả bất động sản: vị trí, diện tích, tiện ích..."
        multiline
      />

      <Text style={{ fontSize: 16, marginBottom: 5 }}>Giá (VND) *</Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 10,
          borderRadius: 5,
          marginBottom: 15,
        }}
        value={formData.price}
        onChangeText={(text) => setFormData({ ...formData, price: text })}
        placeholder="VD: 5000000000"
        keyboardType="numeric"
      />

      <Text style={{ fontSize: 16, marginBottom: 5 }}>Hình ảnh (URLs)</Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 10,
          borderRadius: 5,
          marginBottom: 15,
          height: 80,
          textAlignVertical: 'top',
        }}
        value={formData.images}
        onChangeText={(text) => setFormData({ ...formData, images: text })}
        placeholder="Nhập URLs hình ảnh, cách nhau bằng dấu phẩy"
        multiline
      />

      <Text style={{ fontSize: 16, marginBottom: 5 }}>Hoa hồng (%) *</Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 10,
          borderRadius: 5,
          marginBottom: 15,
        }}
        value={formData.commissionPercentage}
        onChangeText={(text) => setFormData({ ...formData, commissionPercentage: text })}
        placeholder="VD: 3.0 (cho 3%)"
        keyboardType="numeric"
      />

      <Text style={{ fontSize: 16, marginBottom: 5 }}>Hoa hồng muốn nhận (%) *</Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 10,
          borderRadius: 5,
          marginBottom: 30,
        }}
        value={formData.providerDesiredPercentage}
        onChangeText={(text) => setFormData({ ...formData, providerDesiredPercentage: text })}
        placeholder="VD: 2.0 (cho 2%)"
        keyboardType="numeric"
      />

      <TouchableOpacity
        style={{
          backgroundColor: loading ? '#ccc' : '#007AFF',
          padding: 15,
          borderRadius: 8,
          marginBottom: 10,
        }}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={{
          color: '#fff',
          textAlign: 'center',
          fontSize: 16,
          fontWeight: 'bold',
        }}>
          {loading ? 'Đang tạo...' : 'Tạo sản phẩm bất động sản'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          backgroundColor: '#f0f0f0',
          padding: 15,
          borderRadius: 8,
        }}
        onPress={() => navigation.goBack()}
      >
        <Text style={{
          color: '#333',
          textAlign: 'center',
          fontSize: 16,
        }}>
          Hủy
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CreateProductScreen;
