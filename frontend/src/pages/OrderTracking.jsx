import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { FiMapPin, FiWifi, FiWifiOff } from 'react-icons/fi';
import { MdRestaurant } from 'react-icons/md';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  initializeSocket,
  disconnectSocket,
  joinOrderRoom,
  leaveOrderRoom,
  formatTimestamp,
  formatEstimatedDelivery
} from '../services/socketService';
import './OrderTracking.css';

const defaultTimeline = [
  { status: 'Order Received', description: 'Restaurant has received your order', completed: false },
  { status: 'Preparing', description: 'Your food is being prepared', completed: false },
  { status: 'Ready for Pickup', description: 'Order is ready for delivery pickup', completed: false },
  { status: 'On the Way', description: 'Your order is out for delivery', completed: false },
  { status: 'Arriving Soon', description: 'Driver is near your location', completed: false },
  { status: 'Delivered', description: 'Your order has been delivered', completed: false }
];

const OrderTracking = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [estimatedDelivery, setEstimatedDelivery] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [socketStatus, setSocketStatus] = useState('Initializing...');
  const [socketEvents, setSocketEvents] = useState([]);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(0);
  const [showSocketDebug, setShowSocketDebug] = useState(true);

  useEffect(() => {
    if (order && timeline.length > 0) {
      const currentStatus = order.status?.toLowerCase() || 'pending';
      let percentage = 0;
      const map = {
        'pending': 16,
        'order received': 16,
        'preparing': 33,
        'ready for pickup': 50,
        'on the way': 66,
        'arriving soon': 83,
        'delivered': 100
      };
      percentage = map[currentStatus] || 0;
      setProgressPercentage(percentage);
    }
  }, [order, timeline]);

  useEffect(() => {
    const fetchOrder = async () => {
      let validOrderId = orderId;
      if (!validOrderId || validOrderId === 'undefined') {
        const storedOrderId = localStorage.getItem("lastOrderId");
        if (storedOrderId) {
          validOrderId = storedOrderId;
          navigate(`/track-order/${storedOrderId}`, { state: location.state, replace: true });
          return;
        } else {
          setError('Invalid order ID');
          setLoading(false);
          return;
        }
      }

      if (location.state?.order && location.state.order._id) {
        setOrder(location.state.order);
        setTimeline([{
          status: location.state.order.status?.toLowerCase() === 'pending' ? 'Order Received' : location.state.order.status,
          timestamp: new Date(),
          completed: true
        }]);
        setLoading(false);
        return;
      }

      const storedOrderData = localStorage.getItem("lastOrderData");
      if (storedOrderData) {
        try {
          const parsedOrder = JSON.parse(storedOrderData);
          if (parsedOrder && parsedOrder._id) {
            setOrder(parsedOrder);
            const status = parsedOrder.status?.toLowerCase() || 'pending';
            setTimeline([{
              status: status === 'pending' ? 'Order Received' : status.charAt(0).toUpperCase() + status.slice(1),
              timestamp: new Date(),
              completed: true
            }]);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error("Error parsing stored order data:", err);
        }
      }

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please login to track your order');
          setLoading(false);
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        const response = await axios.get(
          `https://finalfypproject-k248prfl1-huzaifas-projects-eabfae35.vercel.app/api/orders/${validOrderId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data) {
          setOrder(response.data);
          localStorage.setItem("lastOrderData", JSON.stringify(response.data));
          const status = response.data.status?.toLowerCase() || 'pending';
          setTimeline([{
            status: status === 'pending' ? 'Order Received' : status.charAt(0).toUpperCase() + status.slice(1),
            timestamp: new Date(),
            completed: true
          }]);
          if (!estimatedDelivery) {
            const createTime = new Date(response.data.createdAt || new Date());
            const deliveryTime = new Date(createTime.getTime() + (45 * 60 * 1000));
            setEstimatedDelivery(deliveryTime);
          }
        } else {
          setError('No order data returned from server');
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setError('Order not found.');
        } else if (err.response?.status === 401) {
          setError('Please login again.');
          localStorage.removeItem('token');
          setTimeout(() => navigate('/login'), 2000);
        } else {
          setError('Failed to load order details');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, location.state, navigate]);

  useEffect(() => {
    if (!orderId || loading) return;

    setSocketStatus('Connecting...');
    const socket = initializeSocket(orderId);
    setSocketConnected(!!socket);

    const handleOrderUpdate = (data) => {
      toast.success(`Order Status: ${data.status}`, {
        duration: 4000,
        position: 'top-center',
        icon: '🔄'
      });

      setTimeline(prev => {
        const formattedStatus = data.status;
        const exists = prev.find(
          item => item.status.toLowerCase() === formattedStatus.toLowerCase()
        );

        const newItem = {
          status: formattedStatus,
          timestamp: data.timestamp || new Date(),
          completed: true,
          highlight: true,
          description: defaultTimeline.find(
            s => s.status.toLowerCase() === formattedStatus.toLowerCase()
          )?.description || `Order ${formattedStatus}`
        };

        const updated = exists
          ? prev.map(item => item.status.toLowerCase() === formattedStatus.toLowerCase() ? newItem : item)
          : [...prev, newItem];

        const statusOrder = defaultTimeline.map(s => s.status.toLowerCase());
        updated.sort((a, b) => statusOrder.indexOf(a.status.toLowerCase()) - statusOrder.indexOf(b.status.toLowerCase()));
        return updated;
      });

      setOrder(prev => {
        const updated = { ...prev, status: data.status.toLowerCase() };
        localStorage.setItem("lastOrderData", JSON.stringify(updated));
        return updated;
      });

      setTimeout(() => {
        setTimeline(prev => prev.map(item => ({ ...item, highlight: false })));
      }, 2000);
    };

    joinOrderRoom(orderId, handleOrderUpdate);

    return () => {
      leaveOrderRoom(orderId, handleOrderUpdate);
      disconnectSocket();
    };
  }, [orderId, loading]);

  const handleRefreshOrder = () => {
    const now = Date.now();
    if (now - lastRefreshTime < 5000) {
      toast.error('Please wait before refreshing again');
      return;
    }

    setRefreshing(true);
    setLastRefreshTime(now);
    disconnectSocket();

    setTimeout(() => {
      const socket = initializeSocket(orderId);
      setSocketConnected(!!socket?.connected);
      setRefreshing(false);
    }, 1500);
  };

  const toggleSocketDebug = () => setShowSocketDebug(prev => !prev);

  const getOrderStatus = () => {
    if (!order?.status || order.status === 'pending') return 'Order Received';
    return order.status.charAt(0).toUpperCase() + order.status.slice(1);
  };

  const getEstimatedDelivery = () => {
    return estimatedDelivery ? formatEstimatedDelivery(estimatedDelivery) : '15-20 minutes';
  };

  const mergedTimeline = defaultTimeline.map(defaultStatus => {
    const real = timeline.find(item => item.status.toLowerCase() === defaultStatus.status.toLowerCase());
    const orderStatus = order?.status?.toLowerCase() || 'order received';
    const statusIndex = defaultTimeline.findIndex(s => s.status.toLowerCase() === orderStatus);
    const thisIndex = defaultTimeline.findIndex(s => s.status.toLowerCase() === defaultStatus.status.toLowerCase());
    const isCompleted = thisIndex <= statusIndex;

    return {
      ...defaultStatus,
      ...(real || {}),
      completed: isCompleted,
      time: real?.timestamp ? formatTimestamp(real.timestamp) : isCompleted ? formatTimestamp(new Date()) : 'Pending'
    };
  });

  if (loading) return <div className="tracking-container"><div className="loading-spinner">Loading...</div></div>;
  if (error || !order) return (
    <div className="tracking-container">
      <div className="error-message">
        <p>{error || 'Order not found. Please try again later.'}</p>
        <button onClick={() => navigate(-1)} className="back-button">Back</button>
      </div>
    </div>
  );

  return (
    <div className="tracking-container" id="order-tracking-component">
      <div className="tracking-card">
        <div className="tracking-header">
          <MdRestaurant size={24} />
          <h2>{getOrderStatus()}</h2>
          <div className="status-progress">
            <div className="status-progress-bar" style={{ width: `${progressPercentage}%` }} />
          </div>
          <p className="estimated-delivery">Estimated delivery by<br />{getEstimatedDelivery()}</p>

          <div className="delivery-info">
            <FiMapPin className="icon" />
            <div>
              <p>Delivery to: {order.customerName}</p>
              <p className="address">{order.deliveryAddress}</p>
            </div>
          </div>

          <div className="connection-status">
            <span className={socketConnected ? 'connected' : 'disconnected'}>
              {socketConnected ? 'Live Tracking Active' : 'Disconnected'}
            </span>
            {!socketConnected && order.status !== 'delivered' && (
              <button className="refresh-button" onClick={handleRefreshOrder} disabled={refreshing}>
                {refreshing ? 'Reconnecting...' : 'Reconnect'}
              </button>
            )}
          </div>
        </div>

        <div className="timeline-container">
          {mergedTimeline.map((event, index) => (
            <div key={index} className={`timeline-message ${event.completed ? 'completed' : ''} ${event.highlight ? 'highlight-animation' : ''}`}>
              <div className="message-dot" />
              <div className="message-content">
                <h4>{event.status}</h4>
                <p>{event.description}</p>
                <span className="message-time">{event.time || 'Pending'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
