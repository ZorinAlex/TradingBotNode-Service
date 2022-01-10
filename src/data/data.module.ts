import { Module } from '@nestjs/common';
import { DataService } from './data.service';
import { DataController } from './data.controller';

@Module({
  imports: [],
  providers: [DataService],
  controllers: [DataController],
  exports: [DataService]
})
export class DataModule {}
