import { Controller } from '@nestjs/common';
import { OneSignalService } from './one-signal.service';

@Controller('one-signal')
export class OneSignalController {
  constructor(private readonly oneSignalService: OneSignalService) {}
}
