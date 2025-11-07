import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BusinessUnit, ApiResponse } from '../models/business-unit.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BusinessUnitService {
  private apiUrl = `${environment.apiUrl}/business-units`;

  constructor(private http: HttpClient) { }

  /**
   * Get all business units
   */
  getBusinessUnits(): Observable<BusinessUnit[]> {
    return this.http.get<ApiResponse<BusinessUnit[]>>(this.apiUrl).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get active business units only
   */
  getActiveBusinessUnits(): Observable<BusinessUnit[]> {
    return this.http.get<ApiResponse<BusinessUnit[]>>(`${this.apiUrl}?active=y`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get business unit by ID
   */
  getBusinessUnitById(id: number): Observable<BusinessUnit> {
    return this.http.get<ApiResponse<BusinessUnit>>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get business units by user ID
   */
  getBusinessUnitsByUserId(userId: number): Observable<BusinessUnit[]> {
    return this.http.get<ApiResponse<BusinessUnit[]>>(`${this.apiUrl}?user_id=${userId}`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Create new business unit
   */
  createBusinessUnit(businessUnit: Partial<BusinessUnit>): Observable<BusinessUnit> {
    return this.http.post<ApiResponse<BusinessUnit>>(this.apiUrl, businessUnit).pipe(
      map(response => response.data)
    );
  }

  /**
   * Update business unit
   */
  updateBusinessUnit(id: number, businessUnit: Partial<BusinessUnit>): Observable<BusinessUnit> {
    return this.http.put<ApiResponse<BusinessUnit>>(`${this.apiUrl}/${id}`, businessUnit).pipe(
      map(response => response.data)
    );
  }

  /**
   * Delete business unit
   */
  deleteBusinessUnit(id: number): Observable<any> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Activate business unit
   */
  activateBusinessUnit(id: number): Observable<BusinessUnit> {
    return this.http.post<ApiResponse<BusinessUnit>>(`${this.apiUrl}/${id}/activate`, {}).pipe(
      map(response => response.data)
    );
  }

  /**
   * Deactivate business unit
   */
  deactivateBusinessUnit(id: number): Observable<BusinessUnit> {
    return this.http.post<ApiResponse<BusinessUnit>>(`${this.apiUrl}/${id}/deactivate`, {}).pipe(
      map(response => response.data)
    );
  }
}
