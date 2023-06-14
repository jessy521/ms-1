import { Module } from '@nestjs/common';
import { CaslAbilityFactory } from './casl-ability.factor';

@Module({
  providers: [CaslAbilityFactory],
  exports: [CaslAbilityFactory],
})
export class CaslModule {}
