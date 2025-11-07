import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Privilege, ApiResponse } from '../models/privilege.model';
import { environment } from '../../environments/environment';

export interface PrivilegeUser {
  id?: number;
  user_id: number;
  menu_id: number;
  allowed: boolean;
  c: boolean;
  r: boolean;
  u: boolean;
  d: boolean;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PrivilegeService {
  private apiUrl = `${environment.apiUrl}/privilege-users`;

  constructor(private http: HttpClient) { }

  /**
   * Get all privileges
   */
  getAll(): Observable<ApiResponse<PrivilegeUser[]>> {
    return this.http.get<ApiResponse<PrivilegeUser[]>>(this.apiUrl);
  }

  /**
   * Get privileges (legacy method)
   */
  getPrivileges(): Observable<Privilege[]> {
    return this.http.get<ApiResponse<Privilege[]>>(this.apiUrl).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get privileges by user ID
   */
  getPrivilegesByUserId(userId: number): Observable<Privilege[]> {
    return this.http.get<ApiResponse<Privilege[]>>(`${this.apiUrl}?user_id=${userId}`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get privilege by ID
   */
  getPrivilegeById(id: number): Observable<Privilege> {
    return this.http.get<ApiResponse<Privilege>>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Create new privilege
   */
  create(privilege: Partial<PrivilegeUser>): Observable<ApiResponse<PrivilegeUser>> {
    return this.http.post<ApiResponse<PrivilegeUser>>(this.apiUrl, privilege);
  }

  /**
   * Create new privilege (legacy method)
   */
  createPrivilege(privilege: Partial<Privilege>): Observable<Privilege> {
    return this.http.post<ApiResponse<Privilege>>(this.apiUrl, privilege).pipe(
      map(response => response.data)
    );
  }

  /**
   * Update privilege
   */
  update(id: number, privilege: Partial<PrivilegeUser>): Observable<ApiResponse<PrivilegeUser>> {
    return this.http.put<ApiResponse<PrivilegeUser>>(`${this.apiUrl}/${id}`, privilege);
  }

  /**
   * Update privilege (legacy method)
   */
  updatePrivilege(id: number, privilege: Partial<Privilege>): Observable<Privilege> {
    return this.http.put<ApiResponse<Privilege>>(`${this.apiUrl}/${id}`, privilege).pipe(
      map(response => response.data)
    );
  }

  /**
   * Delete privilege
   */
  deletePrivilege(id: number): Observable<any> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Check if user has privilege for specific menu
   */
  checkPrivilege(userId: number, menuId: number): Observable<Privilege> {
    return this.http.get<ApiResponse<Privilege>>(
      `${this.apiUrl}/check?user_id=${userId}&menu_id=${menuId}`
    ).pipe(
      map(response => response.data)
    );
  }
}
