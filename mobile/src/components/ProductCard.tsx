import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Product } from '../types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32; // 16px margin on each side

interface ProductCardProps {
  product: Product;
  onPress?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
  const formatPrice = (price: number | null | undefined) => {
    if (!price || price === 0) return '0 VND';

    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)} tỷ`;
    } else if (price >= 1000000) {
      return `${(price / 1000000).toFixed(0)} triệu`;
    } else {
      return `${price.toLocaleString()} VND`;
    }
  };

  // Parse images from JSON string or use empty array
  const getImages = () => {
    if (!product.images) return [];
    try {
      return typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
    } catch {
      return [];
    }
  };

  const images = getImages();
  const backgroundImage = images && images.length > 0
    ? { uri: images[0] }
    : { uri: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop' }; // Default property image

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress?.(product)}
      activeOpacity={0.9}
    >
      <ImageBackground
        source={backgroundImage}
        style={styles.backgroundImage}
        imageStyle={styles.imageStyle}
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        >
          <View style={styles.content}>
            {/* Price Badge */}
            <View style={styles.priceBadge}>
              <Text style={styles.priceText}>{formatPrice(product.price)}</Text>
            </View>

            {/* Product Info */}
            <View style={styles.infoContainer}>
              <Text style={styles.productName} numberOfLines={2}>
                {product.name}
              </Text>

              <Text style={styles.productDescription} numberOfLines={2}>
                {product.description || 'Không có mô tả'}
              </Text>

              {/* Owner Info */}
              <View style={styles.ownerContainer}>
                <Text style={styles.ownerLabel}>Chủ sở hữu:</Text>
                <Text style={styles.ownerName}>{product.owner?.fullName || 'Không xác định'}</Text>
              </View>

              {/* Commission Info */}
              <View style={styles.commissionContainer}>
                <Text style={styles.commissionText}>
                  Hoa hồng: {(parseFloat(product.commissionPct.toString()) * 100).toFixed(2)}%
                </Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>
                    {product.status === 'APPROVED' ? 'Đã duyệt' : 'Chờ duyệt'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: 280,
    alignSelf: 'center', // Center the card
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  imageStyle: {
    borderRadius: 16,
  },
  gradient: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  priceBadge: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  productDescription: {
    fontSize: 14,
    color: '#E0E0E0',
    marginBottom: 8,
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  ownerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ownerLabel: {
    fontSize: 12,
    color: '#B0B0B0',
    marginRight: 4,
  },
  ownerName: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  commissionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commissionText: {
    fontSize: 12,
    color: '#81C784',
    fontWeight: '500',
  },
  statusBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});
