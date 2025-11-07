import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User, LoginRequest, LoginResponse, UserPrivileges, ApiResponse, MenuPermission } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  
  private userPrivilegesSubject: BehaviorSubject<UserPrivileges | null>;
  public userPrivileges: Observable<UserPrivileges | null>;
  
  private permissionsMap: Map<number, MenuPermission> = new Map();
  
  private apiUrl = environment.apiUrl;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    this.loadUserFromStorage();
    this.currentUserSubject = new BehaviorSubject<User | null>(null);
    this.currentUser = this.currentUserSubject.asObservable();
    
    this.userPrivilegesSubject = new BehaviorSubject<UserPrivileges | null>(null);
    this.userPrivileges = this.userPrivilegesSubject.asObservable();
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
        localStorage.removeItem('business_unit');
        
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
   * Get user privileges and business unit from API
   * This will be used to build sidebar and check permissions
   */
  getUserPrivileges(): Observable<ApiResponse<UserPrivileges>> {
    return this.http.get<ApiResponse<UserPrivileges>>(
      `${this.apiUrl}/user/privileges`
    ).pipe(
      tap(response => {
        if (response.success) {
          this.userPrivilegesSubject.next(response.data);
          
          // Build permissions map for quick access
          this.permissionsMap.clear();
          response.data.menus.forEach(menu => {
            this.permissionsMap.set(menu.id, menu.permissions);
          });
        }
      })
    );
  }

  /**
   * Check if user has permission for specific menu
   */
  hasPermission(menuId: number, permission: 'c' | 'r' | 'u' | 'd'): boolean {
    const menuPermissions = this.permissionsMap.get(menuId);
    if (!menuPermissions) return false;
    return menuPermissions[permission];
  }

  /**
   * Check if user can create on specific menu
   */
  canCreate(menuId: number): boolean {
    return this.hasPermission(menuId, 'c');
  }

  /**
   * Check if user can read/view on specific menu
   */
  canRead(menuId: number): boolean {
    return this.hasPermission(menuId, 'r');
  }

  /**
   * Check if user can update on specific menu
   */
  canUpdate(menuId: number): boolean {
    return this.hasPermission(menuId, 'u');
  }

  /**
   * Check if user can delete on specific menu
   */
  canDelete(menuId: number): boolean {
    return this.hasPermission(menuId, 'd');
  }

  /**
   * Get current business unit from localStorage
   */
  getCurrentBusinessUnit() {
    try {
      const buStr = localStorage.getItem('business_unit');
      if (buStr) {
        return JSON.parse(buStr);
      }
    } catch (error) {
      console.error('Error loading business unit from storage:', error);
    }
    return null;
  }

  /**
   * Switch business unit (requires re-authentication with new BU)
   */
  switchBusinessUnit(businessUnitId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/switch-business-unit`, {
      business_unit_id: businessUnitId
    });
  }
}
