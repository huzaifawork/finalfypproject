# 🏨 ROOM RECOMMENDATION SYSTEM - GOOGLE COLAB CODE

## **Complete Implementation for Hotel Room Recommendations with 1-Month User History**

Copy and paste this code into Google Colab cells sequentially:

---

## **📋 CELL 1: Setup and Imports**

```python
# Install required packages
!pip install scikit-learn pandas numpy matplotlib seaborn pickle5

# Import libraries
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.decomposition import TruncatedSVD
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error
from sklearn.preprocessing import LabelEncoder, StandardScaler
from scipy.sparse import csr_matrix
import pickle
import warnings
warnings.filterwarnings('ignore')

print("🏨 Room Recommendation System Setup Complete!")
print("📊 All libraries imported successfully")
```

---

## **📋 CELL 2: Load and Explore Dataset**

```python
# Upload and extract the hotel booking dataset
from google.colab import files
import zipfile
import os

print("📁 Please upload your hotel_bookings zip file:")
uploaded = files.upload()

# Extract the zip file
zip_name = list(uploaded.keys())[0]
with zipfile.ZipFile(zip_name, 'r') as zip_ref:
    zip_ref.extractall()
    print(f"✅ Extracted files: {zip_ref.namelist()}")

# Find the CSV file
csv_files = [f for f in os.listdir() if f.endswith('.csv')]
if csv_files:
    csv_file = csv_files[0]
    print(f"📄 Found CSV file: {csv_file}")
else:
    print("❌ No CSV file found in the zip archive")

# Load the dataset
df = pd.read_csv(csv_file)

print(f"📊 Dataset Shape: {df.shape}")
print(f"📋 Columns: {df.columns.tolist()}")
print("\n🔍 First 5 rows:")
print(df.head())

print("\n📈 Dataset Info:")
print(df.info())

print("\n📊 Missing Values:")
print(df.isnull().sum())
```

---

## **📋 CELL 3: Data Preprocessing and Feature Engineering**

```python
# Data cleaning and preprocessing
print("🧹 Starting data preprocessing...")

# Handle missing values
df['children'].fillna(0, inplace=True)
df['agent'].fillna(0, inplace=True)
df['company'].fillna(0, inplace=True)
df['country'].fillna('Unknown', inplace=True)

# Remove cancelled bookings for recommendation training
df_active = df[df['is_canceled'] == 0].copy()
print(f"📊 Active bookings (non-cancelled): {len(df_active)}")

# Create user ID (combining relevant fields for unique identification)
df_active['user_id'] = (
    df_active['country'].astype(str) + '_' +
    df_active['market_segment'].astype(str) + '_' +
    df_active['customer_type'].astype(str) + '_' +
    df_active.index.astype(str)
)

# Create room ID (combining hotel and room type)
df_active['room_id'] = (
    df_active['hotel'].astype(str) + '_' +
    df_active['assigned_room_type'].astype(str)
)

# Create booking date for 1-month history simulation
df_active['booking_date'] = pd.to_datetime(
    df_active['arrival_date_year'].astype(str) + '-' +
    df_active['arrival_date_month'].astype(str) + '-' +
    df_active['arrival_date_day_of_month'].astype(str)
)

# Sort by booking date
df_active = df_active.sort_values('booking_date')

# Create rating based on multiple factors (synthetic rating 1-5)
np.random.seed(42)
df_active['rating'] = np.random.choice([3, 4, 5], size=len(df_active), p=[0.2, 0.5, 0.3])

# Adjust rating based on factors
# Higher rating for repeated guests
df_active.loc[df_active['is_repeated_guest'] == 1, 'rating'] += np.random.choice([0, 1], size=sum(df_active['is_repeated_guest'] == 1), p=[0.3, 0.7])

# Lower rating for high booking changes
df_active.loc[df_active['booking_changes'] > 2, 'rating'] -= np.random.choice([0, 1], size=sum(df_active['booking_changes'] > 2), p=[0.5, 0.5])

# Ensure rating is between 1-5
df_active['rating'] = np.clip(df_active['rating'], 1, 5)

print("✅ Data preprocessing completed!")
print(f"📊 Final dataset shape: {df_active.shape}")
print(f"👥 Unique users: {df_active['user_id'].nunique()}")
print(f"🏨 Unique rooms: {df_active['room_id'].nunique()}")
```

---

## **📋 CELL 4: Create 1-Month User History**

```python
# Simulate 1-month user history
print("📅 Creating 1-month user history simulation...")

# Get the last 1 month of data for recent history
latest_date = df_active['booking_date'].max()
one_month_ago = latest_date - pd.DateOffset(months=1)

# Filter for 1-month history
recent_bookings = df_active[df_active['booking_date'] >= one_month_ago].copy()

print(f"📊 Recent bookings (last 1 month): {len(recent_bookings)}")
print(f"📅 Date range: {one_month_ago.date()} to {latest_date.date()}")

# Create user-room interaction matrix
user_room_matrix = recent_bookings.pivot_table(
    index='user_id',
    columns='room_id',
    values='rating',
    fill_value=0
)

print(f"📊 User-Room Matrix Shape: {user_room_matrix.shape}")
print(f"👥 Users in matrix: {user_room_matrix.shape[0]}")
print(f"🏨 Rooms in matrix: {user_room_matrix.shape[1]}")

# Calculate sparsity
total_cells = user_room_matrix.shape[0] * user_room_matrix.shape[1]
non_zero_cells = (user_room_matrix > 0).sum().sum()
sparsity = (1 - non_zero_cells / total_cells) * 100

print(f"📈 Matrix sparsity: {sparsity:.2f}%")
print(f"🔢 Non-zero interactions: {non_zero_cells}")
```

---

## **📋 CELL 5: Train-Test Split**

```python
# Prepare data for training
print("🔄 Preparing train-test split...")

# Convert to sparse matrix for memory efficiency
sparse_matrix = csr_matrix(user_room_matrix.values)

# Create train-test split (80-20)
train_data = user_room_matrix.copy()
test_data = user_room_matrix.copy()

# Check if we have enough interactions for a meaningful split
total_interactions = (user_room_matrix > 0).sum().sum()
interactions_per_user = total_interactions / user_room_matrix.shape[0]

if interactions_per_user <= 1:
    print("⚠️ Warning: Users have only 1 interaction on average. Using artificial split.")
    # Create artificial test set by randomly selecting 20% of all interactions
    non_zero_mask = user_room_matrix.values > 0
    indices = np.where(non_zero_mask)
    all_indices = list(zip(indices[0], indices[1]))

    # Randomly select 20% of interactions for test set
    np.random.seed(42)
    test_size = int(0.2 * len(all_indices))
    test_indices = np.random.choice(len(all_indices), size=test_size, replace=False)

    # Set selected interactions to 0 in training data
    for idx in test_indices:
        i, j = all_indices[idx]
        train_data.iloc[i, j] = 0
else:
    # Original code for users with multiple interactions
    np.random.seed(42)
    for user_idx in range(user_room_matrix.shape[0]):
        user_ratings = user_room_matrix.iloc[user_idx]
        non_zero_indices = user_ratings[user_ratings > 0].index

        if len(non_zero_indices) > 1:  # Only if user has multiple ratings
            test_size = max(1, int(0.2 * len(non_zero_indices)))
            test_indices = np.random.choice(non_zero_indices, size=test_size, replace=False)

            # Set test indices to 0 in training data
            train_data.loc[user_room_matrix.index[user_idx], test_indices] = 0

print("✅ Train-test split completed!")
print(f"📊 Training interactions: {(train_data > 0).sum().sum()}")
print(f"📊 Test interactions: {(test_data > 0).sum().sum() - (train_data > 0).sum().sum()}")
```

---

## **📋 CELL 6: SVD Model Training**

```python
# Train SVD model
print("🤖 Training SVD model for room recommendations...")

# Convert training data to sparse matrix
train_sparse = csr_matrix(train_data.values)

# Get the maximum possible components (number of features)
max_components = min(train_sparse.shape[1], 15)  # Cap at 15 or number of features, whichever is smaller

# Test different numbers of components
components_range = [2, 5, 8, 10, min(15, max_components)]
components_range = sorted(list(set(components_range)))  # Remove duplicates and sort
results = []

for n_components in components_range:
    # Train SVD model
    svd = TruncatedSVD(n_components=n_components, random_state=42)
    svd.fit(train_sparse)

    # Transform data
    train_transformed = svd.transform(train_sparse)

    # Reconstruct the matrix
    train_reconstructed = svd.inverse_transform(train_transformed)

    # Calculate error metrics
    mask = (test_data.values > 0) & (train_data.values == 0)  # Only test cells
    if mask.sum() > 0:
        y_true = test_data.values[mask]
        y_pred = train_reconstructed[mask]

        rmse = np.sqrt(mean_squared_error(y_true, y_pred))
        mae = mean_absolute_error(y_true, y_pred)

        explained_variance = svd.explained_variance_ratio_.sum()

        results.append({
            'n_components': n_components,
            'rmse': rmse,
            'mae': mae,
            'explained_variance': explained_variance
        })

        print(f"Components: {n_components}, RMSE: {rmse:.4f}, MAE: {mae:.4f}, Explained Variance: {explained_variance:.4f}")

# Find best model
best_model = min(results, key=lambda x: x['rmse'])
best_components = best_model['n_components']
print(f"\n✅ Best model: {best_components} components with RMSE: {best_model['rmse']:.4f}")

# Train final model with best components
final_svd = TruncatedSVD(n_components=best_components, random_state=42)
final_svd.fit(train_sparse)

# Transform data
user_factors = final_svd.transform(train_sparse)

# Reconstruct the matrix
final_predictions = final_svd.inverse_transform(user_factors)

# Calculate final error metrics
mask = (test_data.values > 0) & (train_data.values == 0)
if mask.sum() > 0:
    y_true = test_data.values[mask]
    y_pred = final_predictions[mask]

    final_rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    final_mae = mean_absolute_error(y_true, y_pred)

    print(f"Final RMSE: {final_rmse:.4f}")
    print(f"Final MAE: {final_mae:.4f}")
```

---

## **📋 CELL 7: Visualize Model Performance**

```python
# Visualize model performance
plt.figure(figsize=(15, 5))

# Plot RMSE
plt.subplot(1, 3, 1)
plt.plot([r['n_components'] for r in results], [r['rmse'] for r in results], 'o-', color='blue')
plt.axvline(x=best_components, color='red', linestyle='--')
plt.title('RMSE vs Components')
plt.xlabel('Number of Components')
plt.ylabel('RMSE')
plt.grid(True)

# Plot MAE
plt.subplot(1, 3, 2)
plt.plot([r['n_components'] for r in results], [r['mae'] for r in results], 'o-', color='green')
plt.axvline(x=best_components, color='red', linestyle='--')
plt.title('MAE vs Components')
plt.xlabel('Number of Components')
plt.ylabel('MAE')
plt.grid(True)

# Plot Explained Variance
plt.subplot(1, 3, 3)
plt.plot([r['n_components'] for r in results], [r['explained_variance'] for r in results], 'o-', color='purple')
plt.axvline(x=best_components, color='red', linestyle='--')
plt.title('Explained Variance vs Components')
plt.xlabel('Number of Components')
plt.ylabel('Explained Variance')
plt.grid(True)

plt.tight_layout()
plt.show()

# Visualize rating distribution
plt.figure(figsize=(15, 5))

# Original ratings
plt.subplot(1, 3, 1)
sns.histplot(df_active['rating'], bins=5, kde=True)
plt.title('Original Rating Distribution')
plt.xlabel('Rating')
plt.ylabel('Count')

# Predicted ratings
plt.subplot(1, 3, 2)
sns.histplot(final_predictions.flatten(), bins=20, kde=True)
plt.title('Predicted Rating Distribution')
plt.xlabel('Rating')
plt.ylabel('Count')

# Error distribution
plt.subplot(1, 3, 3)
if mask.sum() > 0:
    errors = y_true - y_pred
    sns.histplot(errors, bins=20, kde=True)
    plt.title('Error Distribution')
    plt.xlabel('Error')
    plt.ylabel('Count')
    plt.axvline(x=0, color='red', linestyle='--')

plt.tight_layout()
plt.show()
```

---

## **📋 CELL 8: Create Recommendation Function**

```python
# Create recommendation function
def get_room_recommendations(user_id, top_n=10):
    """Generate room recommendations for a specific user"""

    if user_id not in user_room_matrix.index:
        print(f"❌ User {user_id} not found in training data")
        return []

    user_idx = user_room_matrix.index.get_loc(user_id)
    user_ratings = final_predictions[user_idx]

    # Get rooms user hasn't rated
    unrated_rooms = user_room_matrix.columns[user_room_matrix.loc[user_id] == 0]

    if len(unrated_rooms) == 0:
        print(f"ℹ️ User {user_id} has rated all available rooms")
        return []

    # Get predictions for unrated rooms
    room_scores = []
    for room_id in unrated_rooms:
        room_idx = user_room_matrix.columns.get_loc(room_id)
        predicted_rating = user_ratings[room_idx]
        room_scores.append((room_id, predicted_rating))

    # Sort by predicted rating
    room_scores.sort(key=lambda x: x[1], reverse=True)

    return room_scores[:top_n]

# Test recommendations for sample users
print("🏨 Generating sample room recommendations...")

sample_users = user_room_matrix.index[:5]  # First 5 users

for user_id in sample_users:
    print(f"\n👤 Recommendations for User: {user_id}")
    recommendations = get_room_recommendations(user_id, top_n=5)

    for i, (room_id, score) in enumerate(recommendations, 1):
        print(f"  {i}. Room: {room_id} | Predicted Rating: {score:.2f}")

    # Show user's actual ratings for context
    user_actual_ratings = user_room_matrix.loc[user_id]
    rated_rooms = user_actual_ratings[user_actual_ratings > 0]

    if len(rated_rooms) > 0:
        print(f"  📊 User's actual ratings: {len(rated_rooms)} rooms rated")
        print(f"  📈 Average rating given: {rated_rooms.mean():.2f}")
```

---

## **📋 CELL 9: Room Features Analysis**

```python
# Analyze room features for content-based recommendations
print("🔍 Analyzing room features...")

# Create room features dataset
room_features = df_active.groupby('room_id').agg({
    'hotel': 'first',
    'assigned_room_type': 'first',
    'adults': 'mean',
    'children': 'mean',
    'adr': 'mean',  # Average daily rate
    'total_of_special_requests': 'mean',
    'required_car_parking_spaces': 'mean',
    'rating': 'mean'
}).round(2)

room_features['avg_group_size'] = room_features['adults'] + room_features['children']
room_features['price_category'] = pd.cut(room_features['adr'],
                                       bins=[0, 75, 150, 300, float('inf')],
                                       labels=['Budget', 'Standard', 'Premium', 'Luxury'])

print("🏨 Room Features Summary:")
print(room_features.head(10))

print(f"\n📊 Room Statistics:")
print(f"🏨 Total unique rooms: {len(room_features)}")
print(f"💰 Price categories: {room_features['price_category'].value_counts()}")
print(f"⭐ Average room rating: {room_features['rating'].mean():.2f}")

# Visualize room features
plt.figure(figsize=(15, 10))

# Plot 1: Price distribution by hotel type
plt.subplot(2, 3, 1)
for hotel in room_features['hotel'].unique():
    hotel_data = room_features[room_features['hotel'] == hotel]['adr']
    plt.hist(hotel_data, alpha=0.7, label=hotel, bins=20)
plt.xlabel('Average Daily Rate')
plt.ylabel('Frequency')
plt.title('Price Distribution by Hotel Type')
plt.legend()

# Plot 2: Rating distribution by hotel type
plt.subplot(2, 3, 2)
for hotel in room_features['hotel'].unique():
    hotel_data = room_features[room_features['hotel'] == hotel]['rating']
    plt.hist(hotel_data, alpha=0.7, label=hotel, bins=5)
plt.xlabel('Average Rating')
plt.ylabel('Frequency')
plt.title('Rating Distribution by Hotel Type')
plt.legend()

# Plot 3: Group size by room type
plt.subplot(2, 3, 3)
sns.boxplot(x='assigned_room_type', y='avg_group_size', data=room_features.reset_index())
plt.xlabel('Room Type')
plt.ylabel('Average Group Size')
plt.title('Group Size by Room Type')
plt.xticks(rotation=45)

# Plot 4: Special requests by price category
plt.subplot(2, 3, 4)
sns.boxplot(x='price_category', y='total_of_special_requests', data=room_features.reset_index())
plt.xlabel('Price Category')
plt.ylabel('Average Special Requests')
plt.title('Special Requests by Price Category')

# Plot 5: Rating by price category
plt.subplot(2, 3, 5)
sns.boxplot(x='price_category', y='rating', data=room_features.reset_index())
plt.xlabel('Price Category')
plt.ylabel('Average Rating')
plt.title('Rating by Price Category')

# Plot 6: Parking spaces by hotel type
plt.subplot(2, 3, 6)
sns.boxplot(x='hotel', y='required_car_parking_spaces', data=room_features.reset_index())
plt.xlabel('Hotel Type')
plt.ylabel('Average Parking Spaces')
plt.title('Parking Spaces by Hotel Type')

plt.tight_layout()
plt.show()
```

---

## **📋 CELL 10: Enhanced Recommendation System**

```python
# Enhanced recommendation system with content-based filtering
def get_enhanced_room_recommendations(user_id, top_n=10, include_features=True):
    """Enhanced room recommendations with content-based filtering"""

    if user_id not in user_room_matrix.index:
        return []

    # Get collaborative filtering recommendations
    cf_recommendations = get_room_recommendations(user_id, top_n=top_n*2)

    if not cf_recommendations:
        return []

    # Get user's preferences from history
    user_ratings = user_room_matrix.loc[user_id]
    liked_rooms = user_ratings[user_ratings >= 4].index.tolist()

    enhanced_recommendations = []

    for room_id, cf_score in cf_recommendations:
        recommendation = {
            'room_id': room_id,
            'collaborative_score': cf_score,
            'reason': 'collaborative_filtering'
        }

        if include_features and room_id in room_features.index:
            room_info = room_features.loc[room_id]
            recommendation.update({
                'hotel': room_info['hotel'],
                'room_type': room_info['assigned_room_type'],
                'avg_price': room_info['adr'],
                'price_category': room_info['price_category'],
                'avg_rating': room_info['rating'],
                'avg_group_size': room_info['avg_group_size']
            })

            # Content-based scoring
            content_score = 0
            if liked_rooms:
                # Calculate similarity to liked rooms
                liked_features = room_features.loc[
                    room_features.index.intersection(liked_rooms)
                ]

                if len(liked_features) > 0:
                    # Price similarity
                    price_diff = abs(room_info['adr'] - liked_features['adr'].mean())
                    price_similarity = max(0, 1 - price_diff / 200)  # Normalize

                    # Group size similarity
                    size_diff = abs(room_info['avg_group_size'] - liked_features['avg_group_size'].mean())
                    size_similarity = max(0, 1 - size_diff / 5)  # Normalize

                    content_score = (price_similarity + size_similarity) / 2

            # Hybrid score (70% collaborative, 30% content-based)
            hybrid_score = 0.7 * cf_score + 0.3 * content_score * 5  # Scale content score to 1-5
            recommendation['hybrid_score'] = hybrid_score
            recommendation['content_score'] = content_score

        enhanced_recommendations.append(recommendation)

    # Sort by hybrid score if available, otherwise by collaborative score
    sort_key = 'hybrid_score' if include_features else 'collaborative_score'
    enhanced_recommendations.sort(key=lambda x: x.get(sort_key, 0), reverse=True)

    return enhanced_recommendations[:top_n]

# Test enhanced recommendations
print("🚀 Testing Enhanced Room Recommendation System...")

sample_user = user_room_matrix.index[0]
print(f"\n👤 Enhanced Recommendations for User: {sample_user}")

enhanced_recs = get_enhanced_room_recommendations(sample_user, top_n=5)

for i, rec in enumerate(enhanced_recs, 1):
    print(f"\n{i}. Room: {rec['room_id']}")
    print(f"   🏨 Hotel: {rec.get('hotel', 'N/A')}")
    print(f"   🏠 Type: {rec.get('room_type', 'N/A')}")
    print(f"   💰 Price: ${rec.get('avg_price', 0):.0f} ({rec.get('price_category', 'N/A')})")
    print(f"   ⭐ Avg Rating: {rec.get('avg_rating', 0):.2f}")
    print(f"   👥 Avg Group Size: {rec.get('avg_group_size', 0):.1f}")
    print(f"   🤖 CF Score: {rec['collaborative_score']:.2f}")
    if 'hybrid_score' in rec:
        print(f"   🔀 Hybrid Score: {rec['hybrid_score']:.2f}")
```

---

## **📋 CELL 11: Save Model and Generate Deployment Files**

```python
# Save the trained model and data for deployment
print("💾 Saving model and data for deployment...")

# Extract user and room factors from the final model
final_user_factors = final_svd.transform(train_sparse)
final_room_factors = final_svd.components_

# Create deployment package
deployment_data = {
    'svd_model': final_svd,
    'user_factors': final_user_factors,
    'room_factors': final_room_factors,
    'user_room_matrix': user_room_matrix,
    'room_features': room_features,
    'model_performance': {
        'rmse': final_rmse if 'final_rmse' in locals() else 0,
        'mae': final_mae if 'final_mae' in locals() else 0,
        'components': best_components,
        'training_date': pd.Timestamp.now().isoformat()
    },
    'user_profiles': {}
}

# Create user profiles for quick lookup
for user_id in user_room_matrix.index[:100]:  # Save top 100 users
    user_ratings = user_room_matrix.loc[user_id]
    rated_rooms = user_ratings[user_ratings > 0]

    if len(rated_rooms) > 0:
        deployment_data['user_profiles'][user_id] = {
            'avg_rating': rated_rooms.mean(),
            'total_ratings': len(rated_rooms),
            'preferred_rooms': rated_rooms.nlargest(5).to_dict(),
            'last_activity': '2024-06-01'  # Simulated
        }

# Save to pickle file
with open('room_recommendation_model.pkl', 'wb') as f:
    pickle.dump(deployment_data, f)

print("✅ Model saved successfully!")

# Generate API integration code
api_code = '''
# Room Recommendation API Integration Code
import pickle
import numpy as np
import pandas as pd

class RoomRecommendationEngine:
    def __init__(self, model_path):
        with open(model_path, 'rb') as f:
            self.data = pickle.load(f)

        self.svd_model = self.data['svd_model']
        self.user_factors = self.data['user_factors']
        self.room_factors = self.data['room_factors']
        self.user_room_matrix = self.data['user_room_matrix']
        self.room_features = self.data['room_features']
        self.user_profiles = self.data['user_profiles']

    def get_recommendations(self, user_id, top_n=10):
        """Get room recommendations for a user"""
        if user_id not in self.user_room_matrix.index:
            return self.get_popular_rooms(top_n)

        user_idx = self.user_room_matrix.index.get_loc(user_id)
        user_ratings = np.dot(self.user_factors[user_idx:user_idx+1], self.room_factors.T)[0]

        # Get unrated rooms
        unrated_rooms = self.user_room_matrix.columns[self.user_room_matrix.loc[user_id] == 0]

        recommendations = []
        for room_id in unrated_rooms:
            room_idx = self.user_room_matrix.columns.get_loc(room_id)
            score = user_ratings[room_idx]

            room_info = {
                'room_id': room_id,
                'predicted_rating': float(score),
                'reason': 'collaborative_filtering'
            }

            if room_id in self.room_features.index:
                features = self.room_features.loc[room_id]
                room_info.update({
                    'hotel': features['hotel'],
                    'room_type': features['assigned_room_type'],
                    'price': float(features['adr']),
                    'price_category': str(features['price_category']),
                    'avg_rating': float(features['rating'])
                })

            recommendations.append(room_info)

        # Sort by predicted rating
        recommendations.sort(key=lambda x: x['predicted_rating'], reverse=True)
        return recommendations[:top_n]

    def get_popular_rooms(self, top_n=10):
        """Get popular rooms for new users"""
        popular_rooms = self.room_features.nlargest(top_n, 'rating')

        recommendations = []
        for room_id, features in popular_rooms.iterrows():
            recommendations.append({
                'room_id': room_id,
                'predicted_rating': float(features['rating']),
                'reason': 'popularity',
                'hotel': features['hotel'],
                'room_type': features['assigned_room_type'],
                'price': float(features['adr']),
                'price_category': str(features['price_category']),
                'avg_rating': float(features['rating'])
            })

        return recommendations

# Usage example:
# engine = RoomRecommendationEngine('room_recommendation_model.pkl')
# recommendations = engine.get_recommendations('user_123', top_n=5)
'''

# Save API code to file
with open('room_recommendation_api.py', 'w') as f:
    f.write(api_code)

print("📁 Files created:")
print("  ✅ room_recommendation_model.pkl - Trained model")
print("  ✅ room_recommendation_api.py - API integration code")

# Download files
from google.colab import files
files.download('room_recommendation_model.pkl')
files.download('room_recommendation_api.py')

print("\n🎉 Room Recommendation System Complete!")
print(f"📊 Model Performance Summary:")
if 'final_rmse' in locals():
    print(f"   RMSE: {final_rmse:.4f}")
    print(f"   MAE: {final_mae:.4f}")
print(f"   Components: {best_components}")
print(f"   Users: {user_room_matrix.shape[0]}")
print(f"   Rooms: {user_room_matrix.shape[1]}")
print(f"   Interactions: {(user_room_matrix > 0).sum().sum()}")
```

---

## **🎯 SUMMARY**

This complete Google Colab implementation provides:

✅ **Hotel booking data preprocessing** with 1-month user history
✅ **SVD-based collaborative filtering** for personalized recommendations
✅ **Content-based filtering** using room features
✅ **Hybrid recommendation system** combining both approaches
✅ **Model evaluation** with RMSE and MAE metrics
✅ **Visualization** of model performance and data insights
✅ **Deployment-ready files** for backend integration
✅ **API integration code** for your HRMS system

**Ready to integrate with your existing food recommendation system!** 🏨🤖✨
