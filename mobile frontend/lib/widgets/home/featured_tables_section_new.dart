import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../presentation/screens/reservations/table_reservation_page.dart';

class FeaturedTablesSection extends StatefulWidget {
  const FeaturedTablesSection({super.key});

  @override
  State<FeaturedTablesSection> createState() => _FeaturedTablesSectionState();
}

class _FeaturedTablesSectionState extends State<FeaturedTablesSection> {
  List<Map<String, dynamic>> _tables = [];
  bool _isLoading = true;
  String? _error;
  String? _hoveredTable;

  @override
  void initState() {
    super.initState();
    _loadFeaturedTables();
  }

  Future<void> _loadFeaturedTables() async {
    try {
      setState(() {
        _isLoading = true;
        _error = null;
      });

      print('🍽️ Loading featured tables...');

      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');
      final userId = prefs.getString('userId');

      List<Map<String, dynamic>> tables = [];

      // Try to get personalized table recommendations first
      if (token != null && userId != null) {
        try {
          print(
              '👤 User logged in, fetching personalized table recommendations...');

          // Use the same API endpoint as the website for consistency
          final response = await http.get(
            Uri.parse(
                'http://localhost:8080/api/tables/recommendations/$userId?numRecommendations=3&occasion=casual&partySize=2&timeSlot=evening'),
            headers: {
              'Authorization': 'Bearer $token',
              'Content-Type': 'application/json',
            },
          );

          if (response.statusCode == 200) {
            final data = json.decode(response.body);
            if (data['success'] == true && data['recommendations'] != null) {
              final recommendations = data['recommendations'] as List;

              // Check if these are actual AI recommendations
              bool hasActualRecommendations = recommendations.any((item) =>
                  item['reason'] != null ||
                  item['score'] != null ||
                  item['explanation'] != null);

              if (hasActualRecommendations) {
                print(
                    '✅ Got ${recommendations.length} AI table recommendations');
                tables =
                    recommendations.take(3).map<Map<String, dynamic>>((item) {
                  final table = item['table'] ?? item;
                  return {
                    '_id': table['_id'] ?? '',
                    'tableName': table['tableName'] ?? '',
                    'tableType': table['tableType'] ?? '',
                    'capacity': table['capacity'] ?? 0,
                    'status': table['status'] ?? 'Available',
                    'location': table['location'] ?? '',
                    'image': table['image'] ?? '',
                    'avgRating': table['avgRating'] ?? 4.5,
                    'recommendationReason': item['reason'] ?? 'ai_recommended',
                    'explanation':
                        item['explanation'] ?? 'AI recommended for you',
                    'score': item['score'] ?? 0.8,
                  };
                }).toList();
              }
            }
          }
        } catch (e) {
          print('❌ Error fetching personalized table recommendations: $e');
        }
      }

      // Fallback to popular tables if no personalized recommendations
      if (tables.isEmpty) {
        try {
          print('📈 Fetching popular tables as fallback...');
          final response = await http.get(
            Uri.parse('http://localhost:8080/api/tables/popular?count=3'),
            headers: {'Content-Type': 'application/json'},
          );

          if (response.statusCode == 200) {
            final data = json.decode(response.body);
            final popularTables = data['popularTables'] ?? data['tables'] ?? [];

            if (popularTables.isNotEmpty) {
              print('✅ Got ${popularTables.length} popular tables');
              tables = popularTables
                  .take(3)
                  .map<Map<String, dynamic>>((table) => {
                        '_id': table['_id'] ?? '',
                        'tableName': table['tableName'] ?? '',
                        'tableType': table['tableType'] ?? '',
                        'capacity': table['capacity'] ?? 0,
                        'status': table['status'] ?? 'Available',
                        'location': table['location'] ?? '',
                        'image': table['image'] ?? '',
                        'avgRating': table['avgRating'] ?? 4.5,
                        'recommendationReason': 'popularity',
                      })
                  .toList();
            }
          }
        } catch (e) {
          print('❌ Error fetching popular tables: $e');
        }
      }

      // Final fallback to all tables
      if (tables.isEmpty) {
        try {
          print('🍽️ Fetching all tables as final fallback...');
          final response = await http.get(
            Uri.parse('http://localhost:8080/api/tables'),
            headers: {'Content-Type': 'application/json'},
          );

          if (response.statusCode == 200) {
            final data = json.decode(response.body);
            if (data is List && data.isNotEmpty) {
              print('✅ Got ${data.length} total tables, taking top 3');
              // Sort by rating and take top 3
              final sortedTables = List<Map<String, dynamic>>.from(data);
              sortedTables.sort((a, b) => ((b['avgRating'] ?? 4.0) as num)
                  .compareTo((a['avgRating'] ?? 4.0) as num));

              tables = sortedTables
                  .take(3)
                  .map<Map<String, dynamic>>((table) => {
                        '_id': table['_id'] ?? '',
                        'tableName': table['tableName'] ?? '',
                        'tableType': table['tableType'] ?? '',
                        'capacity': table['capacity'] ?? 0,
                        'status': table['status'] ?? 'Available',
                        'location': table['location'] ?? '',
                        'image': table['image'] ?? '',
                        'avgRating': table['avgRating'] ?? 4.5,
                        'recommendationReason': 'featured',
                      })
                  .toList();
            }
          }
        } catch (e) {
          print('❌ Error fetching all tables: $e');
        }
      }

      print('📊 Final result: ${tables.length} featured tables loaded');
      setState(() {
        _tables = tables;
        _isLoading = false;
      });
    } catch (e) {
      print('❌ Critical error in _loadFeaturedTables: $e');
      setState(() {
        _error = 'Error loading featured tables: $e';
        _isLoading = false;
      });
    }
  }

  String _getImageUrl(String? imagePath) {
    if (imagePath == null || imagePath.isEmpty) {
      return 'https://via.placeholder.com/300x200?text=Table';
    }
    if (imagePath.startsWith('http')) return imagePath;
    final cleanPath = imagePath.replaceAll(RegExp(r'^/+'), '');
    return cleanPath.contains('uploads')
        ? 'http://localhost:8080/$cleanPath'
        : 'http://localhost:8080/uploads/$cleanPath';
  }

  Widget _getRecommendationBadge(String? reason) {
    if (reason == null) return const SizedBox.shrink();

    String badgeText;
    Color badgeColor;
    IconData badgeIcon;

    switch (reason) {
      case 'collaborative_filtering':
        badgeText = 'Similar Users';
        badgeColor = Colors.green;
        badgeIcon = Icons.people;
        break;
      case 'content_based':
        badgeText = 'Your Taste';
        badgeColor = Colors.blue;
        badgeIcon = Icons.favorite;
        break;
      case 'popularity':
        badgeText = 'Trending';
        badgeColor = Colors.orange;
        badgeIcon = Icons.trending_up;
        break;
      case 'contextual':
        badgeText = 'AI Pick';
        badgeColor = Colors.pink;
        badgeIcon = Icons.psychology;
        break;
      default:
        badgeText = 'Featured';
        badgeColor = Colors.indigo;
        badgeIcon = Icons.star;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [badgeColor, badgeColor.withValues(alpha: 0.8)],
        ),
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: badgeColor.withValues(alpha: 0.4),
            blurRadius: 6,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(badgeIcon, size: 10, color: Colors.white),
          const SizedBox(width: 4),
          Text(
            badgeText,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 8,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      margin: EdgeInsets.zero,
      padding: const EdgeInsets.symmetric(vertical: 32),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Color(0xFF0A192F),
            Color(0xFF112240),
            Color(0xFF0A192F),
          ],
        ),
      ),
      child: Column(
        children: [
          // Section Title
          Container(
            margin: const EdgeInsets.only(bottom: 32),
            child: ShaderMask(
              shaderCallback: (bounds) => const LinearGradient(
                colors: [Colors.white, Color(0xFFBB86FC)],
              ).createShader(bounds),
              child: const Text(
                'Featured Tables',
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ),

          // Content
          Container(
            constraints: const BoxConstraints(maxWidth: 1000),
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: _isLoading
                ? _buildLoadingState()
                : _error != null
                    ? _buildErrorState()
                    : _tables.isEmpty
                        ? _buildEmptyState()
                        : _buildTablesGrid(),
          ),
        ],
      ),
    );
  }

  Widget _buildLoadingState() {
    return SizedBox(
      height: 280,
      child: Row(
        children: List.generate(3, (index) {
          return Expanded(
            child: Container(
              margin: EdgeInsets.only(
                left: index == 0 ? 0 : 8,
                right: index == 2 ? 0 : 8,
              ),
              decoration: BoxDecoration(
                color: Colors.grey.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Center(
                child: CircularProgressIndicator(color: Color(0xFFBB86FC)),
              ),
            ),
          );
        }),
      ),
    );
  }

  Widget _buildErrorState() {
    return Container(
      height: 280,
      decoration: BoxDecoration(
        color: Colors.red.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.red.withValues(alpha: 0.3)),
      ),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, color: Colors.red.shade400, size: 48),
            const SizedBox(height: 16),
            Text(
              _error ?? 'Failed to load tables',
              style: TextStyle(color: Colors.red.shade700),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _loadFeaturedTables,
              child: const Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Container(
      height: 280,
      decoration: BoxDecoration(
        color: Colors.grey.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.withValues(alpha: 0.3)),
      ),
      child: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.table_restaurant_outlined, color: Colors.grey, size: 48),
            SizedBox(height: 16),
            Text(
              'No featured tables available',
              style: TextStyle(color: Colors.grey),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTablesGrid() {
    return Column(
      children: [
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            childAspectRatio: 0.7,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
          ),
          itemCount: _tables.length > 3 ? 3 : _tables.length,
          itemBuilder: (context, index) {
            final table = _tables[index];
            return _buildTableCard(table);
          },
        ),

        // View All Button
        const SizedBox(height: 32),
        Container(
          width: double.infinity,
          constraints: const BoxConstraints(maxWidth: 400),
          child: ElevatedButton(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const TableReservationPage(),
                ),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFBB86FC),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 32),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              elevation: 8,
              shadowColor: const Color(0xFFBB86FC).withValues(alpha: 0.4),
            ),
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.psychology, size: 20),
                SizedBox(width: 12),
                Text(
                  'View All Recommended Tables',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                SizedBox(width: 8),
                Icon(Icons.arrow_forward, size: 16),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildTableCard(Map<String, dynamic> table) {
    final isHovered = _hoveredTable == table['_id'];

    return GestureDetector(
      onTap: () {
        Navigator.pushNamed(context, '/reserve-table', arguments: table);
      },
      child: MouseRegion(
        onEnter: (_) => setState(() => _hoveredTable = table['_id']),
        onExit: (_) => setState(() => _hoveredTable = null),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: isHovered
                  ? [
                      const Color(0xFFBB86FC).withOpacity(0.08),
                      const Color(0xFFFF6B9D).withOpacity(0.04),
                    ]
                  : [
                      Colors.white.withOpacity(0.08),
                      Colors.white.withOpacity(0.02),
                    ],
            ),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isHovered
                  ? const Color(0xFFBB86FC).withOpacity(0.5)
                  : Colors.white.withOpacity(0.15),
            ),
            boxShadow: [
              BoxShadow(
                color: isHovered
                    ? const Color(0xFFBB86FC).withOpacity(0.2)
                    : Colors.black.withOpacity(0.1),
                blurRadius: isHovered ? 20 : 10,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Image Section
                Expanded(
                  flex: 3,
                  child: Stack(
                    children: [
                      Container(
                        width: double.infinity,
                        decoration: BoxDecoration(
                          image: DecorationImage(
                            image: NetworkImage(_getImageUrl(table['image'])),
                            fit: BoxFit.cover,
                            onError: (exception, stackTrace) {
                              print('Error loading image: $exception');
                            },
                          ),
                        ),
                      ),
                      // Recommendation Badge
                      Positioned(
                        top: 8,
                        left: 8,
                        child: _getRecommendationBadge(
                            table['recommendationReason']),
                      ),
                      // Rating Badge
                      Positioned(
                        top: 8,
                        right: 8,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.black.withOpacity(0.7),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.star,
                                  color: Colors.amber, size: 12),
                              const SizedBox(width: 4),
                              Text(
                                '${table['avgRating']?.toStringAsFixed(1) ?? '4.5'}',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                // Content Section
                Expanded(
                  flex: 2,
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          table['tableName'] ?? 'Table',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          table['tableType'] ?? 'Standard',
                          style: TextStyle(
                            color: Colors.grey.shade400,
                            fontSize: 11,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Icon(Icons.people,
                                color: Colors.grey.shade400, size: 12),
                            const SizedBox(width: 4),
                            Text(
                              '${table['capacity'] ?? 0} seats',
                              style: TextStyle(
                                color: Colors.grey.shade400,
                                fontSize: 10,
                              ),
                            ),
                            const Spacer(),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: table['status'] == 'Available'
                                    ? Colors.green.withOpacity(0.2)
                                    : Colors.orange.withOpacity(0.2),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                table['status'] ?? 'Available',
                                style: TextStyle(
                                  color: table['status'] == 'Available'
                                      ? Colors.green
                                      : Colors.orange,
                                  fontSize: 8,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
