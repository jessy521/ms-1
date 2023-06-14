import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseArrayJsonPipe
  implements PipeTransform<string, Record<string, any>>
{
  keys: string[];
  constructor(keys: Array<string>) {
    this.keys = keys;
  }
  transform(value: any): Record<string, any> {
    let propertyName;
    try {
      const retVal = {};
      for (const key in value) {
        propertyName = key;
        retVal[key] =
          this.keys.indexOf(key) > -1 ? JSON.parse(value[key]) : value[key];
      }
      return retVal;
    } catch (e) {
      throw new BadRequestException(`${propertyName} contains invalid JSON `);
    }
  }
}
