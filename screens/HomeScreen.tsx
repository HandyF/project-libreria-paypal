import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
  Animated,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const CATEGORIES = [
  { id: '1', name: 'Literatura', icon: 'book-open' },
  { id: '2', name: 'Académicos', icon: 'graduation-cap' },
  { id: '3', name: 'Infantil', icon: 'child' },
  { id: '4', name: 'Arte', icon: 'paint-brush' },
];

const FEATURED_BOOKS = [
  {
    id: '1',
    title: 'El Principito',
    author: 'Antoine de Saint-Exupéry',
    price: 24.99,
    discount: 15,
    rating: 4.8,
    reviews: [
      { 
        id: '1', 
        user: 'María G.', 
        rating: 5, 
        comment: 'Un clásico imprescindible', 
        date: '2024-02-15',
        likes: 24,
        userLiked: false,
        photos: [
          'https://api.a0.dev/assets/image?text=reading%20book%20cozy%20atmosphere&aspect=16:9',
          'https://api.a0.dev/assets/image?text=book%20review%20photo%20aesthetic&aspect=16:9'
        ],
        userPhoto: 'https://api.a0.dev/assets/image?text=profile%20photo%20young%20woman&aspect=1:1'
      },
      { 
        id: '2', 
        user: 'Juan P.', 
        rating: 4.5, 
        comment: 'Excelente edición', 
        date: '2024-02-10',
        likes: 12,
        userLiked: true,
        photos: [
          'https://api.a0.dev/assets/image?text=book%20collection%20shelf&aspect=16:9'
        ],
        userPhoto: 'https://api.a0.dev/assets/image?text=profile%20photo%20young%20man&aspect=1:1'
      }
    ],
    tags: ['Clásico', 'Infantil', 'Filosofía'],
    genre: 'Literatura Infantil',
    language: 'Español',
    pages: 96,
    isbn: '978-0156012195',
    image: 'https://api.a0.dev/assets/image?text=magical%20little%20prince%20book%20cover%20illustration%20children%20book&aspect=4:5'
  },
  {
    id: '2',
    title: 'Cien años de soledad',
    author: 'Gabriel García Márquez',
    price: 29.99,
    discount: 20,
    image: 'https://api.a0.dev/assets/image?text=magical%20realism%20book%20cover%20butterflies%20and%20old%20house&aspect=4:5'
  },
];

const NEW_ARRIVALS = [
  {
    id: '3',
    title: 'La Ciudad y los Perros',
    author: 'Mario Vargas Llosa',
    price: 19.99,
    image: 'https://api.a0.dev/assets/image?text=dramatic%20urban%20scene%20with%20dogs%20book%20cover&aspect=4:5'
  },
  {
    id: '4',
    title: 'Rayuela',
    author: 'Julio Cortázar',
    price: 22.99,
    image: 'https://api.a0.dev/assets/image?text=abstract%20hopscotch%20pattern%20artistic%20book%20cover&aspect=4:5'
  },
];

export default function BookstoreApp() {
  const [selectedCategory, setSelectedCategory] = useState('1');
  const [cartItems, setCartItems] = useState([]);
  const [showCart, setShowCart] = useState(false);
const [cartBounce] = useState(new Animated.Value(1));
const [showFilters, setShowFilters] = useState(false);
const [showReviewModal, setShowReviewModal] = useState(false);
const [selectedBook, setSelectedBook] = useState(null);
const [isProcessingPayment, setIsProcessingPayment] = useState(false);
const [selectedCurrency, setSelectedCurrency] = useState('USD');

const handlePaypalCheckout = async () => {
  try {
    setIsProcessingPayment(true);
    
    // Preparar los datos del pedido
    const orderData = {
      items: cartItems.map(item => ({
        id: item.id,
        title: item.title,
        quantity: item.quantity,
        price: getDiscountedPrice(item.price, item.discount),
      })),
      currency: selectedCurrency,
      total: calculateTotal(),
    };

    // Simular proceso de pago (aquí iría la integración real con PayPal)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generar número de orden único
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Simular respuesta exitosa
    const paymentResponse = {
      status: 'success',
      orderNumber: orderNumber,
      transactionId: `TR-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };

    // Si el pago es exitoso
    if (paymentResponse.status === 'success') {
      // Limpiar carrito
      setCartItems([]);
      // Cerrar modal del carrito
      setShowCart(false);
      // Mostrar mensaje de éxito
      Alert.alert(
        '¡Pago Exitoso!',
        `Orden #${paymentResponse.orderNumber} procesada correctamente.`,
        [{ text: 'OK' }]
      );
    }
  } catch (error) {
    Alert.alert(
      'Error en el Pago',
      'Hubo un problema procesando tu pago. Por favor intenta nuevamente.',
      [{ text: 'OK' }]
    );
  } finally {
    setIsProcessingPayment(false);
  }
};


const [filters, setFilters] = useState({
  priceRange: [0, 100],
  rating: 0,
  genres: [],
  language: 'all',
});
const [searchQuery, setSearchQuery] = useState('');
const [sliderValue, setSliderValue] = useState(0);

  const addToCart = (book) => {
    const existingItem = cartItems.find(item => item.id === book.id);
    
    if (existingItem) {
      setCartItems(
        cartItems.map(item =>
          item.id === book.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCartItems([...cartItems, { ...book, quantity: 1 }]);
    }

    // Animación de rebote del carrito
    Animated.sequence([
      Animated.spring(cartBounce, {
        toValue: 1.2,
        friction: 2,
        tension: 140,
        useNativeDriver: true,
      }),
      Animated.spring(cartBounce, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const removeFromCart = (bookId) => {
    setCartItems(cartItems.filter(item => item.id !== bookId));
  };

  const updateQuantity = (bookId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(bookId);
      return;
    }
    
    setCartItems(
      cartItems.map(item =>
        item.id === bookId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const getDiscountedPrice = (price, discount) => {
    return discount ? price * (1 - discount / 100) : price;
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = getDiscountedPrice(item.price, item.discount);
      return total + price * item.quantity;
    }, 0);
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item.id && styles.categoryItemSelected,
      ]}
      onPress={() => setSelectedCategory(item.id)}>
      <FontAwesome5
        name={item.icon}
        size={24}
        color={selectedCategory === item.id ? '#fff' : '#666'}
      />
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item.id && styles.categoryTextSelected,
        ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderFeaturedBook = ({ item }) => (
    <TouchableOpacity style={styles.featuredBookCard}>
      <Image source={{ uri: item.image }} style={styles.featuredBookImage} />
      <View style={styles.featuredBookInfo}>
        {item.discount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{item.discount}% OFF</Text>
          </View>
        )}
        <Text style={styles.bookTitle}>{item.title}</Text>
        <Text style={styles.bookAuthor}>{item.author}</Text>
        <View style={styles.priceContainer}>
          {item.discount && (
            <Text style={styles.originalPrice}>${item.price}</Text>
          )}
          <Text style={styles.discountedPrice}>
            ${getDiscountedPrice(item.price, item.discount).toFixed(2)}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.addToCartButton}
          onPress={() => addToCart(item)}>
          <Ionicons name="cart-outline" size={16} color="#fff" />
          <Text style={styles.addToCartButtonText}>Agregar al carrito</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderNewArrival = ({ item }) => (
    <TouchableOpacity style={styles.newArrivalCard}>
      <Image source={{ uri: item.image }} style={styles.newArrivalImage} />
      <Text style={styles.newArrivalTitle}>{item.title}</Text>
      <Text style={styles.newArrivalAuthor}>{item.author}</Text>
      <Text style={styles.newArrivalPrice}>${item.price}</Text>
      <TouchableOpacity 
        style={styles.smallAddToCartButton}
        onPress={() => addToCart(item)}>
        <Ionicons name="cart-outline" size={16} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.image }} style={styles.cartItemImage} />
      <View style={styles.cartItemInfo}>
        <Text style={styles.cartItemTitle}>{item.title}</Text>
        <Text style={styles.cartItemAuthor}>{item.author}</Text>
        <Text style={styles.cartItemPrice}>
          ${getDiscountedPrice(item.price, item.discount).toFixed(2)}
        </Text>
      </View>
      <View style={styles.cartItemQuantity}>
        <TouchableOpacity 
          onPress={() => updateQuantity(item.id, item.quantity - 1)}
          style={styles.quantityButton}>
          <Text style={styles.quantityButtonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.quantity}</Text>
        <TouchableOpacity 
          onPress={() => updateQuantity(item.id, item.quantity + 1)}
          style={styles.quantityButton}>
          <Text style={styles.quantityButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (    <View style={styles.container}>
      {/* Filtros Avanzados Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showFilters}
        onRequestClose={() => setShowFilters(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtros Avanzados</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.filtersContainer}>
              {/* Rango de Precio */}              <View style={styles.filterSection}>
                <Text style={styles.filterTitle}>Rango de Precio</Text>
                <View style={styles.priceRangeContainer}>
                  <Text>${filters.priceRange[0]}</Text>
                  <View style={styles.sliderContainer}>
                    <View style={styles.sliderTrack} />
                    <View 
                      style={[
                        styles.sliderThumb,
                        {
                          left: `${(sliderValue / 100) * 100}%`,
                        }
                      ]}
                    >
                      <TouchableOpacity
                        onPress={() => {}}
                        onPanResponderMove={(event) => {
                          const touch = event.nativeEvent.touches[0];
                          const newValue = Math.max(0, Math.min(100, (touch.pageX / 300) * 100));
                          setSliderValue(newValue);
                          setFilters({...filters, priceRange: [filters.priceRange[0], newValue]});
                        }}
                      />
                    </View>
                  </View>
                  <Text>${Math.round(sliderValue)}</Text>
                </View>
              </View>

              {/* Calificación Mínima */}
              <View style={styles.filterSection}>
                <Text style={styles.filterTitle}>Calificación Mínima</Text>
                <View style={styles.ratingContainer}>
                  {[1,2,3,4,5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setFilters({...filters, rating: star})}>
                      <Ionicons
                        name={star <= filters.rating ? "star" : "star-outline"}
                        size={30}
                        color="#FFD700"
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Géneros */}
              <View style={styles.filterSection}>
                <Text style={styles.filterTitle}>Géneros</Text>
                <View style={styles.genreContainer}>
                  {['Literatura', 'Infantil', 'Académico', 'Arte'].map((genre) => (
                    <TouchableOpacity
                      key={genre}
                      style={[
                        styles.genreButton,
                        filters.genres.includes(genre) && styles.genreButtonSelected
                      ]}
                      onPress={() => {
                        const newGenres = filters.genres.includes(genre)
                          ? filters.genres.filter(g => g !== genre)
                          : [...filters.genres, genre];
                        setFilters({...filters, genres: newGenres});
                      }}>
                      <Text style={[
                        styles.genreButtonText,
                        filters.genres.includes(genre) && styles.genreButtonTextSelected
                      ]}>{genre}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Idioma */}
              <View style={styles.filterSection}>
                <Text style={styles.filterTitle}>Idioma</Text>
                <View style={styles.languageContainer}>
                  {['Todos', 'Español', 'Inglés'].map((lang) => (
                    <TouchableOpacity
                      key={lang}
                      style={[
                        styles.languageButton,
                        filters.language === lang.toLowerCase() && styles.languageButtonSelected
                      ]}
                      onPress={() => setFilters({...filters, language: lang.toLowerCase()})}>
                      <Text style={[
                        styles.languageButtonText,
                        filters.language === lang.toLowerCase() && styles.languageButtonTextSelected
                      ]}>{lang}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity 
              style={styles.applyFiltersButton}
              onPress={() => setShowFilters(false)}>
              <Text style={styles.applyFiltersButtonText}>Aplicar Filtros</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de Reseñas */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showReviewModal && selectedBook !== null}
        onRequestClose={() => setShowReviewModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reseñas</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowReviewModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {selectedBook && (
              <View style={styles.reviewsContainer}>
                <View style={styles.bookReviewHeader}>
                  <Image 
                    source={{ uri: selectedBook.image }} 
                    style={styles.reviewBookImage} 
                  />
                  <View style={styles.bookReviewInfo}>
                    <Text style={styles.reviewBookTitle}>{selectedBook.title}</Text>
                    <Text style={styles.reviewBookAuthor}>{selectedBook.author}</Text>
                    <View style={styles.ratingContainer}>
                      {[1,2,3,4,5].map((star) => (
                        <Ionicons
                          key={star}
                          name={star <= selectedBook.rating ? "star" : "star-outline"}
                          size={20}
                          color="#FFD700"
                        />
                      ))}
                      <Text style={styles.ratingText}>
                        {selectedBook.rating} ({selectedBook.reviews.length} reseñas)
                      </Text>
                    </View>
                  </View>
                </View>

                <FlatList
                  data={selectedBook.reviews}
                  renderItem={({ item }) => (
                    <View style={styles.reviewItem}>
                      <View style={styles.reviewHeader}>
                        <View style={styles.reviewUser}>
                          <Text style={styles.reviewUserName}>{item.user}</Text>
                          <View style={styles.reviewRating}>
                            {[1,2,3,4,5].map((star) => (
                              <Ionicons
                                key={star}
                                name={star <= item.rating ? "star" : "star-outline"}
                                size={16}
                                color="#FFD700"
                              />
                            ))}
                          </View>
                        </View>
                        <Text style={styles.reviewDate}>{item.date}</Text>
                      </View>
                      <Text style={styles.reviewComment}>{item.comment}</Text>
                    </View>
                  )}
                  keyExtractor={(item) => item.id}
                  style={styles.reviewsList}
                />

                <TouchableOpacity 
                  style={styles.addReviewButton}
                  onPress={() => {
                    // Aquí iría la lógica para agregar una nueva reseña
                    alert('Funcionalidad de agregar reseña en desarrollo');
                  }}>
                  <Text style={styles.addReviewButtonText}>Escribir una reseña</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      <ScrollView>
        <LinearGradient
          colors={['#4c669f', '#3b5998', '#192f6a']}
          style={styles.header}>          <View style={styles.headerContent}>
            <View style={styles.searchContainer}>
              <MaterialIcons name="search" size={24} color="#fff" />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar libros..."
                placeholderTextColor="#fff"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <TouchableOpacity 
                style={styles.filterButton}
                onPress={() => setShowFilters(true)}>
                <MaterialIcons name="filter-list" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.categoriesContainer}>
          <FlatList
            data={CATEGORIES}
            renderItem={renderCategoryItem}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ofertas Destacadas</Text>
          <FlatList
            data={FEATURED_BOOKS}
            renderItem={renderFeaturedBook}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nuevos Lanzamientos</Text>
          <FlatList
            data={NEW_ARRIVALS}
            renderItem={renderNewArrival}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
          />
        </View>
      </ScrollView>

      {/* Botón flotante del carrito */}
      <TouchableOpacity 
        style={styles.cartButton}
        onPress={() => setShowCart(true)}>
        <Animated.View style={[styles.cartButtonInner, { transform: [{ scale: cartBounce }] }]}>
          <Ionicons name="cart-outline" size={24} color="#fff" />
          {cartItems.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>
                {cartItems.reduce((total, item) => total + item.quantity, 0)}
              </Text>
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>

      {/* Modal del carrito */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showCart}
        onRequestClose={() => setShowCart(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Carrito de Compras</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowCart(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {cartItems.length > 0 ? (
              <>
                <FlatList
                  data={cartItems}
                  renderItem={renderCartItem}
                  keyExtractor={(item) => item.id}
                  style={styles.cartList}
                />
                <View style={styles.cartFooter}>
                  <Text style={styles.totalText}>
                    Total: ${calculateTotal().toFixed(2)}
                  </Text>              <TouchableOpacity 
                style={styles.checkoutButton}
                onPress={handlePaypalCheckout}>
                <FontAwesome5 name="paypal" size={16} color="#fff" />
                <Text style={styles.checkoutButtonText}>
                  Pagar con PayPal
                </Text>
                {isProcessingPayment && (
                  <ActivityIndicator 
                    size="small" 
                    color="#fff" 
                    style={styles.loadingIndicator} 
                  />
                )}
              </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.emptyCart}>
                <Ionicons name="cart-outline" size={64} color="#ccc" />
                <Text style={styles.emptyCartText}>
                  Tu carrito está vacío
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // ... (estilos existentes) ...
  
  // Estilos para el Resumen de Orden
  orderSummaryContent: {
    padding: 20,
  },
  summaryItem: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
  },
  summaryItemImage: {
    width: 60,
    height: 80,
    borderRadius: 8,
  },
  summaryItemInfo: {
    marginLeft: 15,
    flex: 1,
  },
  summaryItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  summaryItemQuantity: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  summaryItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4c669f',
    marginTop: 5,
  },
  currencySelector: {
    marginVertical: 20,
  },
  currencyButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4c669f',
    marginRight: 10,
  },
  currencyButtonSelected: {
    backgroundColor: '#4c669f',
  },
  currencyButtonText: {
    color: '#4c669f',
  },
  currencyButtonTextSelected: {
    color: '#fff',
  },
  shippingSection: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  savedAddressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
  },
  savedAddress: {
    flex: 1,
    fontSize: 14,
  },
  changeAddressButton: {
    marginLeft: 10,
  },
  changeAddressButtonText: {
    color: '#4c669f',
    fontWeight: 'bold',
  },
  addAddressButton: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  addAddressButtonText: {
    color: '#4c669f',
    fontWeight: 'bold',
  },
  costSummary: {
    marginTop: 20,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  costLabel: {
    fontSize: 14,
    color: '#666',
  },
  costValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  totalRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4c669f',
  },
  orderActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  confirmOrderButton: {
    backgroundColor: '#0070ba',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
  },
  confirmOrderButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 10,
  },

  // Estilos para la Factura
  invoiceContent: {
    padding: 20,
  },
  invoiceHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  invoiceNumber: {
    fontSize: 16,
    color: '#666',
  },
  invoiceDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  invoiceItems: {
    marginTop: 20,
  },
  invoiceItemHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  invoiceItemHeaderText: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 14,
  },
  invoiceItem: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  invoiceItemDescription: {
    flex: 2,
    fontSize: 14,
  },
  invoiceItemQuantity: {
    flex: 1,
    fontSize: 14,
    textAlign: 'center',
  },
  invoiceItemPrice: {
    flex: 1,
    fontSize: 14,
    textAlign: 'right',
  },
  invoiceItemTotal: {
    flex: 1,
    fontSize: 14,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  invoiceTotals: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 20,
  },
  invoiceTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  invoiceTotalLabel: {
    fontSize: 14,
    color: '#666',
  },
  invoiceTotalValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  invoiceGrandTotal: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  invoiceGrandTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  invoiceGrandTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4c669f',
  },
  paymentInfo: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  paymentInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  paymentInfoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  invoiceActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  downloadButton: {
    backgroundColor: '#4c669f',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
  },
  downloadButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  shareButton: {
    backgroundColor: '#666',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
  },
  shareButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  loadingIndicator: {
    marginLeft: 10,
  },
  // ... (estilos existentes) ...  // Estilos para Filtros
  filtersContainer: {
    padding: 20,
  },
  sliderContainer: {
    width: '80%',
    height: 40,
    justifyContent: 'center',
    position: 'relative',
  },
  sliderTrack: {
    height: 2,
    backgroundColor: '#e0e0e0',
    width: '100%',
  },
  sliderThumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4c669f',
    top: '50%',
    marginTop: -10,
    marginLeft: -10,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  priceRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  genreButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4c669f',
  },
  genreButtonSelected: {
    backgroundColor: '#4c669f',
  },
  genreButtonText: {
    color: '#4c669f',
  },
  genreButtonTextSelected: {
    color: '#fff',
  },
  languageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  languageButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4c669f',
  },
  languageButtonSelected: {
    backgroundColor: '#4c669f',
  },
  languageButtonText: {
    color: '#4c669f',
  },
  languageButtonTextSelected: {
    color: '#fff',
  },
  applyFiltersButton: {
    backgroundColor: '#4c669f',
    padding: 15,
    borderRadius: 8,
    margin: 20,
  },
  applyFiltersButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Estilos para Reseñas
  reviewsContainer: {
    flex: 1,
  },
  bookReviewHeader: {
    flexDirection: 'row',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  reviewBookImage: {
    width: 80,
    height: 120,
    borderRadius: 8,
  },
  bookReviewInfo: {
    marginLeft: 15,
    flex: 1,
  },
  reviewBookTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  reviewBookAuthor: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  ratingText: {
    marginLeft: 10,
    color: '#666',
  },
  reviewsList: {
    padding: 20,
  },
  reviewItem: {
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  reviewUser: {
    flex: 1,
  },
  reviewUserName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  reviewRating: {
    flexDirection: 'row',
    marginTop: 5,
  },
  reviewDate: {
    color: '#666',
    fontSize: 12,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
  },
  addReviewButton: {
    backgroundColor: '#4c669f',
    padding: 15,
    borderRadius: 8,
    margin: 20,
  },
  addReviewButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Estilos actualizados del header
  headerContent: {
    paddingHorizontal: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 10,
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
  },
  filterButton: {
    marginLeft: 10,
    padding: 5,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 10,
    borderRadius: 10,
  },
  searchText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
  },
  categoriesContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  categoryItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 12,
    backgroundColor: '#fff',
    width: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryItemSelected: {
    backgroundColor: '#4c669f',
  },
  categoryText: {
    marginTop: 5,
    color: '#666',
    fontSize: 12,
  },
  categoryTextSelected: {
    color: '#fff',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  featuredBookCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginRight: 15,
    width: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featuredBookImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  featuredBookInfo: {
    padding: 15,
  },
  discountBadge: {
    position: 'absolute',
    top: -10,
    right: 10,
    backgroundColor: '#ff4757',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  discountText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  },
  bookAuthor: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  originalPrice: {
    fontSize: 16,
    color: '#666',
    textDecorationLine: 'line-through',
    marginRight: 10,
  },
  discountedPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4c669f',
  },
  addToCartButton: {
    backgroundColor: '#4c669f',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
  },
  addToCartButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  newArrivalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 15,
    width: 150,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  newArrivalImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  newArrivalTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
  },
  newArrivalAuthor: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  newArrivalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4c669f',
    marginTop: 5,
  },
  smallAddToCartButton: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    backgroundColor: '#4c669f',
    padding: 8,
    borderRadius: 20,
  },
  cartButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#4c669f',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  cartButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadge: {
    position: 'absolute',
    right: -5,
    top: -5,
    backgroundColor: '#ff4757',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  reviewUserPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  reviewUserContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewPhotosContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  reviewPhoto: {
    width: 200,
    height: 120,
    borderRadius: 8,
    marginRight: 10,
  },
  reviewActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  likeCount: {
    marginLeft: 5,
    color: '#666',
    fontSize: 14,
  },
  reviewsHeader: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  reviewsCount: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortLabel: {
    marginRight: 10,
    color: '#666',
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginHorizontal: 5,
    backgroundColor: '#f0f0f0',
  },
  sortButtonActive: {
    backgroundColor: '#4c669f',
  },
  sortButtonText: {
    color: '#666',
    fontSize: 12,
  },
  sortButtonTextActive: {
    color: '#fff',
  },
  closeButton: {
    padding: 5,
  },
  cartList: {
    maxHeight: '60%',
  },
  cartItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cartItemImage: {
    width: 60,
    height: 80,
    borderRadius: 8,
  },
  cartItemInfo: {
    flex: 1,
    marginLeft: 15,
  },
  cartItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartItemAuthor: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  cartItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4c669f',
    marginTop: 5,
  },
  cartItemQuantity: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  quantityButton: {
    backgroundColor: '#f0f0f0',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  cartFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  checkoutButton: {
    backgroundColor: '#0070ba',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
  },
  checkoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  emptyCart: {
    padding: 40,
    alignItems: 'center',
  },
  emptyCartText: {
    fontSize: 18,
    color: '#666',
    marginTop: 10,
  },
});