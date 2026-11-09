import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;
  private isMock: boolean;

  constructor() {
    const url = process.env.SUPABASE_URL || '';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    this.isMock = !url || !key || url.includes('dummy');

    if (!this.isMock) {
      this.supabase = createClient(url, key);
    } else {
      console.log('⚠️ Using MOCK storage (local filesystem) because SUPABASE_URL is dummy.');
    }
  }

  async uploadFile(bucket: string, filePath: string, fileBuffer: Buffer, contentType: string) {
    if (this.isMock) {
      const uploadDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      
      // Reemplazamos las barras para que sea un archivo plano en el disco
      const safeName = filePath.replace(/\//g, '_');
      fs.writeFileSync(path.join(uploadDir, safeName), fileBuffer);
      return { path: filePath };
    }

    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(filePath, fileBuffer, { contentType, upsert: true });

    if (error) throw new Error(error.message);
    return data;
  }

  async getSignedUrl(bucket: string, filePath: string) {
    if (this.isMock) {
      // En modo mock, devolvemos la URL estática del backend
      const safeName = filePath.replace(/\//g, '_');
      const baseUrl = process.env.API_PUBLIC_URL || process.env.BACKEND_URL || 'http://localhost:3000';
      return `${baseUrl}/uploads/${safeName}`;
    }

    const { data, error } = await this.supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, 60 * 60 * 24);

    if (error) throw new Error(error.message);
    return data.signedUrl;
  }

  async deleteFile(bucket: string, filePath: string) {
    if (this.isMock) {
      // Mock mode flattens the path onto the local uploads/ directory.
      const safeName = filePath.replace(/\//g, '_');
      const p = path.join(process.cwd(), 'uploads', safeName);
      if (fs.existsSync(p)) fs.unlinkSync(p);
      return;
    }
    const { error } = await this.supabase.storage.from(bucket).remove([filePath]);
    if (error) throw new Error(error.message);
  }
}
