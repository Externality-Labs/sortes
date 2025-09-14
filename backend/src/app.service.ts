import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class AppService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async resetDatabase(): Promise<void> {
    try {
      const db = this.connection.db;
      const collections = await db.listCollections().toArray();

      for (const collection of collections) {
        await db.dropCollection(collection.name);
        console.log(`Dropped collection: ${collection.name}`);
      }

      console.log('Database reset complete');
    } catch (error) {
      console.error('Error resetting database:', error);
      throw error;
    }
  }
  getHello(): string {
    return 'Hello World!';
  }
}
