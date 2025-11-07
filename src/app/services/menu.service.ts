import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Menu, ApiResponse } from '../models/menu.model';
import { ApiResponse as UserApiResponse } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private apiUrl = `${environment.apiUrl}/menus`;

  constructor(private http: HttpClient) { }

  /**
   * Get all menus
   */
  getMenus(): Observable<Menu[]> {
    return this.http.get<ApiResponse<Menu[]>>(this.apiUrl).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get user menus based on privileges (allowed=true)
   * This endpoint filters menus based on user's privilege settings
   */
  getUserMenus(): Observable<Menu[]> {
    return this.http.get<UserApiResponse<any>>(`${environment.apiUrl}/user/privileges`).pipe(
      map(response => response.data.menus)
    );
  }

  /**
   * Get menu tree (hierarchical structure)
   */
  getMenuTree(): Observable<Menu[]> {
    return this.http.get<ApiResponse<Menu[]>>(`${this.apiUrl}/tree`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get menu by ID
   */
  getMenuById(id: number): Observable<Menu> {
    return this.http.get<ApiResponse<Menu>>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Create new menu
   */
  createMenu(menu: Partial<Menu>): Observable<Menu> {
    return this.http.post<ApiResponse<Menu>>(this.apiUrl, menu).pipe(
      map(response => response.data)
    );
  }

  /**
   * Update menu
   */
  updateMenu(id: number, menu: Partial<Menu>): Observable<Menu> {
    return this.http.put<ApiResponse<Menu>>(`${this.apiUrl}/${id}`, menu).pipe(
      map(response => response.data)
    );
  }

  /**
   * Delete menu
   */
  deleteMenu(id: number): Observable<any> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`);
  }
}
