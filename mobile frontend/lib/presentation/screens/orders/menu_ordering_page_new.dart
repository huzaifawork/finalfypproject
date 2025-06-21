import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

import '../../providers/cart_provider.dart';
import '../../../data/models/menu_item_model.dart';
import '../../widgets/loading_widget.dart';
import 'cart_screen.dart';

class MenuOrderingPage extends StatefulWidget {
  const MenuOrderingPage({super.key});

  @override
  State<MenuOrderingPage> createState() => _MenuOrderingPageState();
}

class _MenuOrderingPageState extends State<MenuOrderingPage>
    with TickerProviderStateMixin {
  List<Map<String, dynamic>> _allMenuItems = [];
  List<Map<String, dynamic>> _trendingItems = [];
  List<String> _categories = [];
  String _selectedCategory = 'All';
  bool _isLoadingAll = true;
  bool _isLoadingTrending = true;
  String _searchQuery = '';
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadAllMenuItems();
    _loadTrendingItems();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadAllMenuItems() async {
    try {
      setState(() {
        _isLoadingAll = true;
      });

      final response = await http.get(
        Uri.parse('http://localhost:8080/api/menus'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final List<dynamic> items = json.decode(response.body);
        setState(() {
          _allMenuItems = items
              .map<Map<String, dynamic>>((item) => {
                    '_id': item['_id'] ?? '',
                    'name': item['name'] ?? '',
                    'price': item['price'] ?? 0,
                    'image': item['image'] ?? '',
                    'category': item['category'] ?? '',
                    'description': item['description'] ?? '',
                    'avgRating': item['averageRating'] ?? 4.5,
                    'isAvailable': item['availability'] ?? true,
                    'cuisine': item['cuisine'] ?? '',
                    'spiceLevel': item['spiceLevel'] ?? '',
                    'dietaryTags': item['dietaryTags'] ?? [],
                    'preparationTime': item['preparationTime'] ?? 15,
                  })
              .toList();

          // Extract categories
          _categories = ['All'];
          final uniqueCategories = _allMenuItems
              .map((item) => item['category'] as String)
              .where((category) => category.isNotEmpty)
              .toSet()
              .toList();
          _categories.addAll(uniqueCategories);
        });
      }
    } catch (e) {
      print('Error loading menu items: $e');
    } finally {
      setState(() {
        _isLoadingAll = false;
      });
    }
  }

  Future<void> _loadTrendingItems() async {
    try {
      setState(() {
        _isLoadingTrending = true;
      });

      final response = await http.get(
        Uri.parse(
            'http://localhost:8080/api/food-recommendations/popular?count=6'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final List<dynamic> items = data['popularItems'] ?? data['items'] ?? [];
        setState(() {
          _trendingItems = items.map<Map<String, dynamic>>((item) {
            final menuItem = item['menuItem'] ?? item;
            return {
              '_id': menuItem['_id'] ?? '',
              'name': menuItem['name'] ?? '',
              'price': menuItem['price'] ?? 0,
              'image': menuItem['image'] ?? '',
              'category': menuItem['category'] ?? '',
              'description': menuItem['description'] ?? '',
              'avgRating':
                  menuItem['averageRating'] ?? menuItem['avgRating'] ?? 4.5,
              'isAvailable':
                  menuItem['availability'] ?? menuItem['isAvailable'] ?? true,
            };
          }).toList();
        });
      }
    } catch (e) {
      print('Error loading trending items: $e');
    } finally {
      setState(() {
        _isLoadingTrending = false;
      });
    }
  }

  String _getImageUrl(String? imagePath) {
    if (imagePath == null || imagePath.isEmpty) {
      return 'https://via.placeholder.com/300x200?text=Food';
    }
    if (imagePath.startsWith('http')) return imagePath;
    final cleanPath = imagePath.replaceAll(RegExp(r'^/+'), '');
    return cleanPath.contains('uploads')
        ? 'http://localhost:8080/$cleanPath'
        : 'http://localhost:8080/uploads/$cleanPath';
  }

  List<Map<String, dynamic>> _getFilteredItems(
      List<Map<String, dynamic>> items) {
    var filtered = items;

    // Filter by category
    if (_selectedCategory != 'All') {
      filtered = filtered
          .where((item) => item['category'] == _selectedCategory)
          .toList();
    }

    // Filter by search query
    if (_searchQuery.isNotEmpty) {
      filtered = filtered.where((item) {
        final name = (item['name'] ?? '').toString().toLowerCase();
        final description =
            (item['description'] ?? '').toString().toLowerCase();
        final category = (item['category'] ?? '').toString().toLowerCase();
        final query = _searchQuery.toLowerCase();
        return name.contains(query) ||
            description.contains(query) ||
            category.contains(query);
      }).toList();
    }

    return filtered;
  }

  void _handleAddToCart(Map<String, dynamic> menuItem) {
    final cartProvider = Provider.of<CartProvider>(context, listen: false);
    final menuItemModel = MenuItemModel(
      id: menuItem['_id'],
      name: menuItem['name'],
      price: (menuItem['price'] ?? 0).toDouble(),
      imageUrl: _getImageUrl(menuItem['image']),
      category: menuItem['category'] ?? 'Main Course',
      description: menuItem['description'] ?? '',
      ingredients: [],
      isAvailable: menuItem['isAvailable'] ?? true,
    );

    cartProvider.addItem(
      menuItem: menuItemModel,
      quantity: 1,
    );

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('${menuItem['name']} added to cart'),
        backgroundColor: Colors.green,
        duration: const Duration(seconds: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A192F),
      body: SafeArea(
        child: Column(
          children: [
            // Custom App Bar with gradient
            Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [Color(0xFF0A192F), Color(0xFF1E293B)],
                ),
              ),
              child: Column(
                children: [
                  // Header Row
                  Row(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.arrow_back, color: Colors.white),
                        onPressed: () => Navigator.pop(context),
                      ),
                      Expanded(
                        child: Text(
                          '🍽️ Order Food',
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            foreground: Paint()
                              ..shader = const LinearGradient(
                                colors: [Color(0xFF64FFDA), Color(0xFFBB86FC)],
                              ).createShader(
                                  const Rect.fromLTWH(0.0, 0.0, 200.0, 70.0)),
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                      // Cart Icon
                      Consumer<CartProvider>(
                        builder: (context, cart, child) {
                          return Stack(
                            children: [
                              Container(
                                decoration: BoxDecoration(
                                  gradient: const LinearGradient(
                                    colors: [
                                      Color(0xFF64FFDA),
                                      Color(0xFF4FD1C7)
                                    ],
                                  ),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: IconButton(
                                  icon: const Icon(Icons.shopping_cart,
                                      color: Color(0xFF0A192F)),
                                  onPressed: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                          builder: (context) =>
                                              const CartScreen()),
                                    );
                                  },
                                ),
                              ),
                              if (cart.itemCount > 0)
                                Positioned(
                                  right: 0,
                                  top: 0,
                                  child: Container(
                                    padding: const EdgeInsets.all(6),
                                    decoration: const BoxDecoration(
                                      color: Color(0xFFFF6B9D),
                                      shape: BoxShape.circle,
                                    ),
                                    child: Text(
                                      '${cart.itemCount}',
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ),
                            ],
                          );
                        },
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  // Search Bar
                  Container(
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E293B),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                          color: const Color(0xFF64FFDA).withOpacity(0.3)),
                    ),
                    child: TextField(
                      onChanged: (value) {
                        setState(() {
                          _searchQuery = value;
                        });
                      },
                      style: const TextStyle(color: Colors.white),
                      decoration: const InputDecoration(
                        hintText: 'Search delicious food...',
                        hintStyle: TextStyle(color: Colors.white54),
                        prefixIcon:
                            Icon(Icons.search, color: Color(0xFF64FFDA)),
                        border: InputBorder.none,
                        contentPadding: EdgeInsets.all(16),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  // Beautiful Tab Bar
                  Container(
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E293B),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: TabBar(
                      controller: _tabController,
                      indicator: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF64FFDA), Color(0xFF4FD1C7)],
                        ),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      labelColor: const Color(0xFF0A192F),
                      unselectedLabelColor: const Color(0xFF64FFDA),
                      labelStyle: const TextStyle(fontWeight: FontWeight.bold),
                      tabs: const [
                        Tab(text: '🔥 Trending'),
                        Tab(text: '📋 All Items'),
                        Tab(text: '🏷️ Categories'),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            // Tab Content
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  _buildTrendingTab(),
                  _buildAllItemsTab(),
                  _buildCategoriesTab(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTrendingTab() {
    if (_isLoadingTrending) {
      return const Center(child: LoadingWidget());
    }

    if (_trendingItems.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.trending_up, color: Color(0xFF64FFDA), size: 48),
            SizedBox(height: 16),
            Text(
              'No trending items found',
              style: TextStyle(color: Colors.white54, fontSize: 16),
            ),
          ],
        ),
      );
    }

    return Container(
      color: const Color(0xFF0A192F),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: GridView.builder(
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            childAspectRatio: 0.8,
            crossAxisSpacing: 16,
            mainAxisSpacing: 16,
          ),
          itemCount: _trendingItems.length,
          itemBuilder: (context, index) {
            final item = _trendingItems[index];
            return _buildBeautifulMenuCard(item);
          },
        ),
      ),
    );
  }

  Widget _buildAllItemsTab() {
    return Container(
      color: const Color(0xFF0A192F),
      child: _buildAllMenuItemsGrid(),
    );
  }

  Widget _buildCategoriesTab() {
    return Container(
      color: const Color(0xFF0A192F),
      child: Column(
        children: [
          // Category Filter
          Container(
            height: 60,
            margin: const EdgeInsets.all(16),
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: _categories.length,
              itemBuilder: (context, index) {
                final category = _categories[index];
                final isSelected = _selectedCategory == category;
                return Container(
                  margin: const EdgeInsets.only(right: 12),
                  child: FilterChip(
                    label: Text(
                      category,
                      style: TextStyle(
                        color: isSelected
                            ? const Color(0xFF0A192F)
                            : const Color(0xFF64FFDA),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    selected: isSelected,
                    selectedColor: const Color(0xFF64FFDA),
                    backgroundColor: const Color(0xFF1E293B),
                    side: BorderSide(
                        color: const Color(0xFF64FFDA).withValues(alpha: 0.3)),
                    onSelected: (selected) {
                      setState(() {
                        _selectedCategory = category;
                      });
                    },
                  ),
                );
              },
            ),
          ),
          // Filtered Items
          Expanded(
            child: _buildAllMenuItemsGrid(),
          ),
        ],
      ),
    );
  }

  Widget _buildAllMenuItemsGrid() {
    final filteredItems = _getFilteredItems(_allMenuItems);

    if (_isLoadingAll) {
      return const Center(child: LoadingWidget());
    }

    if (filteredItems.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.restaurant_menu, color: Color(0xFF64FFDA), size: 48),
            SizedBox(height: 16),
            Text(
              'No menu items found',
              style: TextStyle(color: Colors.white54, fontSize: 16),
            ),
          ],
        ),
      );
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: GridView.builder(
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          childAspectRatio: 0.85,
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
        ),
        itemCount: filteredItems.length,
        itemBuilder: (context, index) {
          final item = filteredItems[index];
          return _buildBeautifulMenuCard(item);
        },
      ),
    );
  }

  Widget _buildBeautifulMenuCard(Map<String, dynamic> menuItem) {
    final imageUrl = _getImageUrl(menuItem['image']);
    final rating = (menuItem['avgRating'] ?? 4.5).toDouble();
    final isAvailable = menuItem['isAvailable'] ?? true;
    final price = (menuItem['price'] ?? 0).toDouble();

    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF1E293B), Color(0xFF334155)],
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF64FFDA).withValues(alpha: 0.2),
            blurRadius: 15,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image with overlays
            Expanded(
              flex: 3,
              child: Stack(
                children: [
                  Container(
                    width: double.infinity,
                    decoration: BoxDecoration(
                      image: DecorationImage(
                        image: NetworkImage(imageUrl),
                        fit: BoxFit.cover,
                        onError: (exception, stackTrace) {
                          // Handle error silently
                        },
                      ),
                    ),
                    child: Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            Colors.transparent,
                            Colors.black.withValues(alpha: 0.3),
                          ],
                        ),
                      ),
                    ),
                  ),
                  // Favorite button with animation
                  Positioned(
                    top: 8,
                    right: 8,
                    child: Container(
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E293B).withValues(alpha: 0.8),
                        shape: BoxShape.circle,
                        border: Border.all(
                            color: const Color(0xFF64FFDA), width: 1),
                      ),
                      child: IconButton(
                        icon: const Icon(Icons.favorite_border,
                            color: Color(0xFFFF6B9D), size: 18),
                        onPressed: () {
                          _handleAddToFavorites(menuItem);
                        },
                        padding: const EdgeInsets.all(6),
                        constraints: const BoxConstraints(),
                      ),
                    ),
                  ),
                  // Rating badge with glow effect
                  Positioned(
                    top: 8,
                    left: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF64FFDA), Color(0xFF4FD1C7)],
                        ),
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: [
                          BoxShadow(
                            color:
                                const Color(0xFF64FFDA).withValues(alpha: 0.4),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.star,
                              color: Color(0xFF0A192F), size: 12),
                          const SizedBox(width: 2),
                          Text(
                            rating.toStringAsFixed(1),
                            style: const TextStyle(
                              color: Color(0xFF0A192F),
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  // User rating stars
                  Positioned(
                    bottom: 8,
                    left: 8,
                    child: _buildUserRatingStars(menuItem),
                  ),
                ],
              ),
            ),
            // Content section - Fixed height to prevent overflow
            Container(
              height: 100, // Fixed height to prevent overflow
              padding: const EdgeInsets.all(8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Name
                  Text(
                    menuItem['name'] ?? 'Menu Item',
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                      color: Colors.white,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  // Price and spice level
                  Row(
                    children: [
                      Text(
                        'Rs. ${price.toStringAsFixed(0)}',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF64FFDA),
                          fontSize: 13,
                        ),
                      ),
                      const Spacer(),
                      if (menuItem['spiceLevel'] != null)
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 4, vertical: 1),
                          decoration: BoxDecoration(
                            color: _getSpiceLevelColor(menuItem['spiceLevel']),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            menuItem['spiceLevel']
                                .toString()
                                .substring(0, 1)
                                .toUpperCase(),
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 8,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  // Add to cart button
                  Expanded(
                    child: SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: isAvailable
                            ? () => _handleAddToCart(menuItem)
                            : null,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: isAvailable
                              ? const Color(0xFF64FFDA)
                              : Colors.grey,
                          foregroundColor: const Color(0xFF0A192F),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                          elevation: 0,
                          padding: const EdgeInsets.symmetric(vertical: 2),
                        ),
                        child: Text(
                          isAvailable ? 'Add to Cart' : 'Unavailable',
                          style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildUserRatingStars(Map<String, dynamic> menuItem) {
    return GestureDetector(
      onTap: () => _showRatingDialog(menuItem),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
        decoration: BoxDecoration(
          color: const Color(0xFF1E293B).withValues(alpha: 0.8),
          borderRadius: BorderRadius.circular(8),
          border:
              Border.all(color: const Color(0xFF64FFDA).withValues(alpha: 0.3)),
        ),
        child: const Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.star_border, color: Color(0xFF64FFDA), size: 12),
            SizedBox(width: 2),
            Text(
              'Rate',
              style: TextStyle(
                color: Color(0xFF64FFDA),
                fontSize: 10,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _handleAddToFavorites(Map<String, dynamic> menuItem) {
    // Add to favorites functionality
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('❤️ ${menuItem['name']} added to favorites'),
        backgroundColor: const Color(0xFF64FFDA),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  void _showRatingDialog(Map<String, dynamic> menuItem) {
    int selectedRating = 0;

    showDialog(
      context: context,
      builder: (BuildContext context) {
        return StatefulBuilder(
          builder: (context, setState) {
            return AlertDialog(
              backgroundColor: const Color(0xFF1E293B),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20)),
              title: Text(
                'Rate ${menuItem['name']}',
                style: const TextStyle(
                    color: Colors.white, fontWeight: FontWeight.bold),
              ),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text(
                    'How would you rate this dish?',
                    style: TextStyle(color: Colors.white70),
                  ),
                  const SizedBox(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(5, (index) {
                      return GestureDetector(
                        onTap: () {
                          setState(() {
                            selectedRating = index + 1;
                          });
                        },
                        child: Icon(
                          index < selectedRating
                              ? Icons.star
                              : Icons.star_border,
                          color: const Color(0xFF64FFDA),
                          size: 32,
                        ),
                      );
                    }),
                  ),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Cancel',
                      style: TextStyle(color: Colors.white54)),
                ),
                ElevatedButton(
                  onPressed: selectedRating > 0
                      ? () {
                          Navigator.pop(context);
                          _submitRating(menuItem, selectedRating);
                        }
                      : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF64FFDA),
                    foregroundColor: const Color(0xFF0A192F),
                  ),
                  child: const Text('Submit'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  void _submitRating(Map<String, dynamic> menuItem, int rating) {
    // Submit rating functionality
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('⭐ Rated ${menuItem['name']} $rating stars'),
        backgroundColor: const Color(0xFF64FFDA),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  Color _getSpiceLevelColor(String? spiceLevel) {
    switch (spiceLevel?.toLowerCase()) {
      case 'mild':
        return Colors.green;
      case 'medium':
        return Colors.orange;
      case 'hot':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }
}
