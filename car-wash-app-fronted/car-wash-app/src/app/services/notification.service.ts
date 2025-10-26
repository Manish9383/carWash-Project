

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface Notification {
  id: string;
  recipient: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = '/api/notifications';
  private wsUrl = '/ws';
  private stompClient: Client | null = null;
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  connect(userId: string): void {
    if (this.stompClient?.active) return;

    const socket = new SockJS(this.wsUrl);
    this.stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('WebSocket connected for user: ' + userId);
        this.stompClient!.subscribe(`/topic/notifications/${userId}`, (message: IMessage) => {
          if (message.body) {
            const notification: Notification = JSON.parse(message.body);
            console.log('Received WebSocket notification:', notification);
            this.pushNotification(notification);
          }
        });
      },
      onStompError: (error) => console.error('WebSocket STOMP error:', error),
      onWebSocketError: (error) => console.error('WebSocket error:', error)
    });
    this.stompClient.activate();
  }

  disconnect(): void {
    if (this.stompClient?.active) {
      this.stompClient.deactivate();
      this.stompClient = null;
    }
  }

  getNotifications(): Observable<Notification[]> {
    return this.notificationsSubject.asObservable();
  }

  getUserNotifications(userId: string): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/${userId}`, { headers: this.getHeaders() })
      .pipe(
        tap(notifications => console.log('Fetched notifications from API:', notifications)),
        catchError(this.handleError)
      );
  }

  pushNotification(notification: Notification): void {
    const currentNotifications = this.notificationsSubject.getValue() || [];
    this.notificationsSubject.next([notification, ...currentNotifications]);
  }

  private handleError(error: any): Observable<never> {
    console.error('Notification Service Error:', error);
    return throwError(() => new Error('Failed to fetch notifications'));
  }
}