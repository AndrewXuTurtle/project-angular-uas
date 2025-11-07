import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Privilege, ApiResponse } from '../models/privilege.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PrivilegeService {
  private apiUrl = `${environment.apiUrl}/privilege-users`;

  constructor(private http: HttpClient) { }

  /**
   * Get all privileges
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
  createPrivilege(privilege: Partial<Privilege>): Observable<Privilege> {
    return this.http.post<ApiResponse<Privilege>>(this.apiUrl, privilege).pipe(
      map(response => response.data)
    );
  }

  /**
   * Update privilege
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
