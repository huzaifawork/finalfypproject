# 🍽️ MENU ITEMS WITH PROPER IMAGE URLS FOR DATABASE

## **📋 COPY THESE URLS TO YOUR DATABASE:**

### **🍛 MAIN COURSE ITEMS:**

1. **Chicken Biryani**
   - Image URL: `https://images.unsplash.com/photo-1563379091339-03246963d96c?w=800&h=600&fit=crop&crop=center&auto=format&q=80`
   - Description: Aromatic basmati rice cooked with tender chicken pieces, traditional spices, and saffron

2. **Mutton Karahi**
   - Image URL: `https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop&crop=center&auto=format&q=80`
   - Description: Tender mutton cooked in traditional karahi with tomatoes, green chilies, and aromatic spices

3. **Beef Nihari**
   - Image URL: `https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&h=600&fit=crop&crop=center&auto=format&q=80`
   - Description: Slow-cooked beef stew with traditional spices, served with naan and garnished with ginger

4. **Chicken Haleem**
   - Image URL: `https://images.unsplash.com/photo-1574653853027-5d3ac9b9a6e7?w=800&h=600&fit=crop&crop=center&auto=format&q=80`
   - Description: Hearty lentil and chicken stew slow-cooked to perfection with aromatic spices

5. **Chicken Pulao**
   - Image URL: `https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&h=600&fit=crop&crop=center&auto=format&q=80`
   - Description: Fragrant rice dish cooked with chicken, whole spices, and caramelized onions

6. **Dal Makhani**
   - Image URL: `https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&h=600&fit=crop&crop=center&auto=format&q=80`
   - Description: Creamy black lentils slow-cooked with butter, cream, and aromatic spices

### **🍢 APPETIZERS:**

7. **Seekh Kebab**
   - Image URL: `https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&h=600&fit=crop&crop=center&auto=format&q=80`
   - Description: Grilled minced meat skewers seasoned with traditional Pakistani spices

8. **Chicken Tikka**
   - Image URL: `https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&h=600&fit=crop&crop=center&auto=format&q=80`
   - Description: Marinated chicken pieces grilled to perfection with yogurt and spices

### **🫓 BREAD:**

9. **Garlic Naan**
   - Image URL: `https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&h=600&fit=crop&crop=center&auto=format&q=80`
   - Description: Soft, fluffy bread topped with fresh garlic and herbs, baked in tandoor

### **🥤 BEVERAGES:**

10. **Mango Lassi**
    - Image URL: `https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&h=600&fit=crop&crop=center&auto=format&q=80`
    - Description: Refreshing yogurt-based drink blended with sweet mango pulp and cardamom

---

## **🔧 HOW TO UPDATE IN DATABASE:**

### **Option 1: Using Admin Panel (Recommended)**
1. Go to Admin → Menu Management → Update Menu
2. Select each item
3. Copy the image URL from above
4. Paste in the image field
5. Save changes

### **Option 2: Direct Database Update**
Use this SQL-like update format:

```sql
UPDATE menu_items SET image = 'IMAGE_URL_HERE' WHERE name = 'ITEM_NAME_HERE';
```

### **Option 3: API Update**
Use the fix-images endpoint we created:
```
POST http://localhost:8080/api/fix/fix-images
```

---

## **✅ BENEFITS OF THESE URLS:**

1. **High Quality**: 800x600 resolution for crisp display
2. **Optimized**: Auto-format and quality optimization
3. **Consistent**: Same aspect ratio for all images
4. **Fast Loading**: Optimized for web performance
5. **Reliable**: Hosted on Unsplash CDN
6. **Professional**: High-quality food photography

---

## **🎯 RECOMMENDED APPROACH:**

1. **Save these URLs to your database** using the admin panel
2. **Test image loading** in both admin and user interfaces
3. **Verify currency display** shows Rs. instead of $
4. **Check all menu management functions** work properly

This approach will give you:
- ✅ Better image management
- ✅ Consistent image quality
- ✅ Faster loading times
- ✅ Professional appearance
- ✅ Easy updates through admin panel
