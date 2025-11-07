import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Transaksi {
  id: number;
  business_unit_id: number;
  kode_transaksi: string;
  nama_transaksi: string;
  jumlah: number;
  tanggal: string;
  status: string;
  keterangan?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TransaksiResponse {
  success: boolean;
  message: string;
  data: Transaksi[];
}

export interface TransaksiDetailResponse {
  success: boolean;
  message: string;
  data: Transaksi;
}

@Injectable({
  providedIn: 'root'
})
export class TransaksiService {
  private apiUrl = `${environment.apiUrl}/transaksis`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<TransaksiResponse> {
    return this.http.get<TransaksiResponse>(this.apiUrl);
  }

  getById(id: number): Observable<TransaksiDetailResponse> {
    return this.http.get<TransaksiDetailResponse>(`${this.apiUrl}/${id}`);
  }

  create(transaksi: Partial<Transaksi>): Observable<TransaksiDetailResponse> {
    return this.http.post<TransaksiDetailResponse>(this.apiUrl, transaksi);
  }

  update(id: number, transaksi: Partial<Transaksi>): Observable<TransaksiDetailResponse> {
    return this.http.put<TransaksiDetailResponse>(`${this.apiUrl}/${id}`, transaksi);
  }

  delete(id: number): Observable<{success: boolean, message: string}> {
    return this.http.delete<{success: boolean, message: string}>(`${this.apiUrl}/${id}`);
  }
}
