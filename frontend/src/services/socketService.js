class SocketService {
  constructor() {
    this.socket = null;
  }

  setSocket(socket) {
    this.socket = socket;
  }

  // Notification events
  sendNotification(userId, notification) {
    if (this.socket) {
      this.socket.emit('send-notification', { userId, notification });
    }
  }

  // Booking events
  bookingCreated(booking) {
    if (this.socket) {
      this.socket.emit('booking-created', booking);
    }
  }

  bookingAccepted(booking) {
    if (this.socket) {
      this.socket.emit('booking-accepted', booking);
    }
  }

  bookingRejected(booking) {
    if (this.socket) {
      this.socket.emit('booking-rejected', booking);
    }
  }

  // Order events
  orderCreated(order) {
    if (this.socket) {
      this.socket.emit('order-created', order);
    }
  }

  orderStatusUpdated(order) {
    if (this.socket) {
      this.socket.emit('order-status-updated', order);
    }
  }

  // Admin events
  designerApplicationSubmitted(designer) {
    if (this.socket) {
      this.socket.emit('designer-application-submitted', designer);
    }
  }

  designerApproved(designer) {
    if (this.socket) {
      this.socket.emit('designer-approved', designer);
    }
  }

  designerRejected(designer) {
    if (this.socket) {
      this.socket.emit('designer-rejected', designer);
    }
  }
}

export default new SocketService();
