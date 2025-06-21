# 🔗 EXTERNAL APIs ANALYSIS - CONCISE TABLE FORMAT

| **API Name** | **Description** | **Purpose of Usage** | **Functions/Classes Involved** |
|--------------|-----------------|---------------------|-------------------------------|
| **Stripe Payment API** | Online payment gateway for secure transactions | Process payments for bookings, food orders, table reservations | `paymentController.js`, `orderControllers.js`, `utils/payment.js`, `config/stripe.js`, `StripePayment.jsx`, `StripeProvider.jsx`, `BookingPage.js`, `MenuOrder.jsx`, `RoomBooking.jsx`, `TableReservationPage.js` |
| **Google OAuth 2.0** | Google's OAuth system for third-party authentication | Enable social login and user identity management | `GoogleController.js`, `utils.js/config.js`, `Login.js` |
| **Google Maps Distance Matrix API** | Calculates distances and ETA using location data | Estimate food delivery time and routing optimization | `utils/delivery.js` |
| **Mapbox GL JS** | Interactive map rendering and route visualization | Visualize delivery locations, enable map interaction, route planning | `Cart.jsx`, `DeliveryMap.js` |
| **Google Maps Embed API** | Embeds static maps into webpages | Show hotel/restaurant location on contact page | `ContactPage.js` |
| **Nodemailer (SMTP)** | Node.js module to send emails using SMTP | Send booking confirmations, order notifications, delivery updates | `utils/notifications.js` |
| **Twilio SMS API** | Cloud-based service for sending SMS messages | Send SMS updates for orders, deliveries, and notifications | `utils/notifications.js` |
| **MongoDB Atlas** | Cloud-hosted NoSQL database service | Store all application data (users, orders, bookings, rooms, tables, feedback) | `Models/db.js`, `User.js`, `Order.js`, `Booking.js`, `Room.js`, `Table.js`, `Feedback.js` |
| **Natural (NLP Library)** | Node.js library for natural language processing | Analyze customer feedback sentiment, process reviews | `feedbackController.js`, `Feedback.jsx` |
| **Socket.io** | Real-time bidirectional event-based communication | Real-time order tracking, delivery updates, live notifications | `socket.js`, `index.js`, `socketService.js`, `OrderTracking.jsx`, `DeliveryTracking.jsx` |
| **Food.com Dataset** | Public dataset containing recipes and user interactions | Train SVD recommendation model for food suggestions | `ml_models/`, `FoodRecommendationController.js` |
| **Google Colab** | Cloud-based notebook environment for ML training | Train and optimize recommendation algorithms (SVD, collaborative filtering) | `ml_models/`, `rooms_ml_models/`, `table_ml_models/` |
