import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  createClient,
  SupabaseClient,
} from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly client: SupabaseClient;
  readonly bucket: string;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new InternalServerErrorException('Missing Supabase env vars');
    }
    this.client = createClient(url, key, { auth: { persistSession: false } });
    this.bucket = process.env.SUPABASE_BUCKET ?? 'documents';
  }

  get storage(): ReturnType<SupabaseClient["storage"]["from"]> {
    return this.client.storage.from(this.bucket);
  }
}
