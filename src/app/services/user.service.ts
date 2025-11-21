import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User, ApiResponse, UserAccess, UserAccessForm } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) { }

  /**
   * Get all users
   */
  getAll(): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(this.apiUrl);
  }

  /**
   * Get all users (legacy method)
   */
  getUsers(): Observable<User[]> {
    return this.http.get<ApiResponse<User[]>>(this.apiUrl).pipe(
      map(response => {
        console.log('Users API Response:', response);
        return response.data;
      })
    );
  }

  /**
   * Get user by ID
   */
  getUserById(id: number): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Create new user
   */
  createUser(user: Partial<User>): Observable<User> {
    return this.http.post<ApiResponse<User>>(this.apiUrl, user).pipe(
      map(response => response.data)
    );
  }

  /**
   * Update existing user
   */
  updateUser(id: number, user: Partial<User>): Observable<User> {
    return this.http.put<ApiResponse<User>>(`${this.apiUrl}/${id}`, user).pipe(
      map(response => response.data)
    );
  }

  /**
   * Delete user
   */
  deleteUser(id: number): Observable<any> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Activate user
   */
  activateUser(id: number): Observable<User> {
    return this.http.post<ApiResponse<User>>(`${this.apiUrl}/${id}/activate`, {}).pipe(
      map(response => response.data)
    );
  }

  /**
   * Deactivate user
   */
  deactivateUser(id: number): Observable<User> {
    return this.http.post<ApiResponse<User>>(`${this.apiUrl}/${id}/deactivate`, {}).pipe(
      map(response => response.data)
    );
  }

  /**
   * Change password
   */
  changePassword(id: number, oldPassword: string, newPassword: string): Observable<any> {
    return this.http.post<ApiResponse<null>>(`${this.apiUrl}/${id}/change-password`, {
      old_password: oldPassword,
      new_password: newPassword,
      new_password_confirmation: newPassword
    });
  }

  /**
   * NEW: Get user access (business units + menus)
   * Returns all accessible business units and menus for a user in one call
   * Perfect for populating dropdowns in Angular forms
   * 
   * Example usage:
   * this.userService.getUserAccess(userId).subscribe(access => {
   *   this.businessUnits = access.business_units;
   *   this.menus = access.menus;
   * });
   */
  getUserAccess(userId: number): Observable<UserAccess> {
    return this.http.get<ApiResponse<UserAccess>>(`${this.apiUrl}/${userId}/access`).pipe(
      map(response => response.data)
    );
  }

  /**
   * NEW: Update user access (business units + menus)
   * Send array of BU IDs and menu IDs to grant access
   * 
   * Example usage:
   * const accessForm: UserAccessForm = {
   *   user_id: 1,
   *   business_unit_ids: [1, 2, 3],  // Batam, Jakarta, Surabaya
   *   menu_ids: [1, 2, 5, 6]         // Dashboard, Users, Reports, Settings
   * };
   * this.userService.updateUserAccess(userId, accessForm).subscribe();
   */
  updateUserAccess(userId: number, access: UserAccessForm): Observable<UserAccess> {
    return this.http.put<ApiResponse<UserAccess>>(`${this.apiUrl}/${userId}/access`, access).pipe(
      map(response => response.data)
    );
  }
}
