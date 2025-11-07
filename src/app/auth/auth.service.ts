import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User, LoginRequest, LoginResponse } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private apiUrl = environment.apiUrl;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    this.loadUserFromStorage();
    this.currentUserSubject = new BehaviorSubject<User | null>(null);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  /**
   * Load user data dari localStorage saat service diinisialisasi
   */
  private loadUserFromStorage(): void {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        this.currentUserSubject = new BehaviorSubject<User | null>(user);
      } else {
        this.currentUserSubject = new BehaviorSubject<User | null>(null);
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
      this.currentUserSubject = new BehaviorSubject<User | null>(null);
    }
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Login via Laravel API
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login`,
      credentials
    ).pipe(
      tap(response => {
        if (response.success) {
          // Simpan token dan user data dengan key 'auth_token' dan 'user'
          localStorage.setItem('auth_token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          this.currentUserSubject.next(response.data.user);
        }
      })
    );
  }

  /**
   * Logout user via API
   */
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        // Hapus dari localStorage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        
        // Update subject
        this.currentUserSubject.next(null);
        
        // Redirect ke login
        this.router.navigate(['/login']);
      })
    );
  }

  /**
   * Get current user info from API
   */
  getCurrentUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user`);
  }

  /**
   * Check apakah user sudah login
   */
  isLoggedIn(): boolean {
    const token = localStorage.getItem('auth_token');
    return !!token;
  }

  /**
   * Check apakah user adalah admin
   */
  isAdmin(): boolean {
    const user = this.currentUserValue;
    return user?.level === 'admin';
  }

  /**
   * Get token dari localStorage
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * Get user privileges and menus for sidebar
   */
  getUserPrivileges(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/privileges`);
  }
}
