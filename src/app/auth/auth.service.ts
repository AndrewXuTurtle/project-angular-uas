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
    // Inisialisasi currentUserSubject dengan data dari localStorage
    const storedUser = this.loadUserFromStorage();
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  /**
   * Load user data dari localStorage saat service diinisialisasi
   */
  private loadUserFromStorage(): User | null {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        return JSON.parse(userStr);
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
    }
    return null;
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Login via Laravel API (without business unit)
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login`,
      credentials
    ).pipe(
      tap(response => {
        if (response.success) {
          // Simpan token dan user data
          localStorage.setItem('token', response.data.token);
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
        localStorage.clear();
        
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
    const token = localStorage.getItem('token');
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
    return localStorage.getItem('token');
  }

  /**
   * Get business units yang boleh diakses user
   */
  getBusinessUnits(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/business-units`);
  }

  /**
   * Select business unit untuk session
   */
  selectBusinessUnit(businessUnitId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/select-business-unit`, {
      business_unit_id: businessUnitId
    }).pipe(
      tap((response: any) => {
        if (response.success) {
          localStorage.setItem('selectedBU', businessUnitId.toString());
          localStorage.setItem('currentBU', JSON.stringify(response.data.business_unit));
        }
      })
    );
  }

  /**
   * Get current business unit from localStorage
   */
  getCurrentBusinessUnit(): any {
    try {
      const buStr = localStorage.getItem('currentBU');
      if (buStr) {
        return JSON.parse(buStr);
      }
    } catch (error) {
      console.error('Error loading business unit from storage:', error);
    }
    return null;
  }

  /**
   * Get selected business unit ID
   */
  getSelectedBusinessUnitId(): number | null {
    const id = localStorage.getItem('selectedBU');
    return id ? parseInt(id) : null;
  }

  /**
   * Get current user ID
   */
  getCurrentUserId(): number | null {
    return this.currentUserValue?.id || null;
  }
}
