import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ namespace: '/notifications', cors: { origin: '*' } })
export class NotificationsGateway {
  @WebSocketServer()
  server!: Server;

  pushToUser(userId: string, payload: Record<string, unknown>): void {
    this.server.to(`user:${userId}`).emit('notification', payload);
  }

  broadcast(payload: Record<string, unknown>): void {
    this.server.emit('notification', payload);
  }
}
