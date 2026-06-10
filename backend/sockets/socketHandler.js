const socketHandler = (io) => {
  const connectedUsers = new Map();

  io.on('connection', (socket) => {
    console.log(`Socket user connected: ${socket.id}`);

    socket.on('join', (userId) => {
      connectedUsers.set(userId, socket.id);
      socket.userId = userId;
      console.log(`Socket join registered for user ${userId}`);
    });

    socket.on('join-attendance-scope', ({ schoolId, classId, role }) => {
      if (schoolId) {
        socket.join(`attendance-school-${schoolId}`);
      }
      if (classId) {
        socket.join(`attendance-class-${classId}`);
      }
      if (role) {
        socket.join(`attendance-role-${role}`);
      }
    });

    socket.on('disconnect', () => {
      if (socket.userId) {
        connectedUsers.delete(socket.userId);
        console.log(`Socket user disconnected: ${socket.userId}`);
      }
    });
  });

  const broadcastToAll = (event, data) => {
    io.emit(event, data);
  };

  const sendToUser = (userId, event, data) => {
    const socketId = connectedUsers.get(userId);
    if (socketId) {
      io.to(socketId).emit(event, data);
    }
  };

  const emitAttendanceEvent = ({ event, payload, classId, schoolId }) => {
    if (schoolId) {
      io.to(`attendance-school-${schoolId}`).emit(event, payload);
    } else {
      io.emit(event, payload);
    }

    if (classId) {
      io.to(`attendance-class-${classId}`).emit(event, payload);
    }
  };

  const getConnectedUsersCount = () => connectedUsers.size;

  return {
    broadcastToAll,
    sendToUser,
    emitAttendanceEvent,
    getConnectedUsersCount,
    connectedUsers,
  };
};

module.exports = socketHandler;
