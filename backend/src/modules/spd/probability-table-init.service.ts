import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProbabilityTable } from 'src/schemas/ProbabilityTable.schema';
import { getInitialTables } from './initial-tables';

@Injectable()
export class ProbabilityTableInitService implements OnModuleInit {
  constructor(@InjectModel(ProbabilityTable.name) private probabilityTableModel: Model<ProbabilityTable>) {}

  async onModuleInit() {
    await this.initializeProbabilityTables();
  }

  private async initializeProbabilityTables(): Promise<void> {
    try {
      // delete all probability tables
      await this.probabilityTableModel.deleteMany({});

      const initialTables = getInitialTables();
      console.log('initialTables', initialTables);

      // Create sample probability tables for different output tokens

      // Insert the initial tables
      await this.probabilityTableModel.insertMany(initialTables);

      console.log(`Successfully initialized ${initialTables.length} probability tables`);
    } catch (error) {
      console.error('Error initializing probability tables:', error);
    }
  }
}
