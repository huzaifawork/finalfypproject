import io from 'socket.io-client';
import { API_BASE_URL } from '../config/api';

const SOCKET_SERVER = API_BASE_URL;

let socketInstance = null;
let activeCallbacks = new Set();
let activeOrderId = null;

// Initialize socket connection
export const initializeSocket = (token) => {
  if (socketInstance) {
    socketInstance.disconnect();
  }

  console.log('🔌 Connecting to socket server:', SOCKET_SERVER);

  socketInstance = io(SOCKET_SERVER, {
    auth: { token },
    transports: ['websocket', 'polling'],
    timeout: 20000,
    forceNew: true
  });

  socketInstance.on('connect', () => {
    console.log('✅ Socket connected:', socketInstance.id);
  });

  socketInstance.on('disconnect', (reason) => {
    console.log('❌ Socket disconnected:', reason);
  });

  socketInstance.on('connect_error', (error) => {
    console.error('🔌 Socket connection error:', error);
  });

  return socketInstance;
};

// Join order room for real-time updates
export const joinOrderRoom = (orderId, callback) => {
  if (!socketInstance) {
    console.error('Socket not initialized');
    return;
  }

  activeOrderId = orderId;
  activeCallbacks.add(callback);

  console.log('🏠 Joining order room:', orderId);
  socketInstance.emit('joinOrderRoom', orderId);

  socketInstance.on('orderStatusUpdate', (data) => {
    console.log('📦 Order status update received:', data);
    activeCallbacks.forEach(cb => cb(data));
  });

  socketInstance.on('deliveryLocationUpdate', (data) => {
    console.log('📍 Delivery location update:', data);
    activeCallbacks.forEach(cb => cb(data));
  });
};

// Leave order room
export const leaveOrderRoom = (orderId, callback) => {
  if (!socketInstance) return;

  console.log('🚪 Leaving order room:', orderId);
  socketInstance.emit('leaveOrderRoom', orderId);

  if (callback) {
    activeCallbacks.delete(callback);
  }

  if (activeCallbacks.size === 0) {
    socketInstance.off('orderStatusUpdate');
    socketInstance.off('deliveryLocationUpdate');
    activeOrderId = null;
  }
};

// Disconnect socket
export const disconnectSocket = () => {
  if (socketInstance) {
    console.log('🔌 Disconnecting socket');
    socketInstance.disconnect();
    socketInstance = null;
    activeCallbacks.clear();
    activeOrderId = null;
  }
};

// Get socket instance
export const getSocket = () => socketInstance;

// Check if socket is connected
export const isSocketConnected = () => {
  return socketInstance && socketInstance.connected;
};
