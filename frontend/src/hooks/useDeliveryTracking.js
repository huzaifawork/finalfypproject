import { useEffect, useState } from 'react';
import {
  initializeSocket,
  disconnectSocket,
  joinOrderRoom,
  leaveOrderRoom,
} from '../services/socketService';

const useDeliveryTracking = (orderId) => {
  const [orderStatus, setOrderStatus] = useState('Connecting...');
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const [socketError, setSocketError] = useState(null);

  useEffect(() => {
    if (!orderId) return;

    const socket = initializeSocket(localStorage.getItem('token'));

    const handleOrderUpdate = (data) => {
      if (data.orderId === orderId) {
        setOrderStatus(data.status);

        if (data.status !== 'Order Received' && data.status !== 'Delivered') {
          const randomOffset = () => (Math.random() - 0.5) * 0.01;
          setDeliveryLocation({
            lng: 73.2100 + randomOffset(),
            lat: 34.1600 + randomOffset(),
          });
        }
      }
    };

    joinOrderRoom(orderId, handleOrderUpdate);

    socket.on('connect_error', (err) => {
      setSocketError('Connection error. Trying to reconnect...');
      console.error('Connection error:', err);
    });

    return () => {
      leaveOrderRoom(orderId, handleOrderUpdate);
      socket.off('connect_error');
      disconnectSocket();
    };
  }, [orderId]);

  return { orderStatus, deliveryLocation, socketError };
};

export default useDeliveryTracking;
