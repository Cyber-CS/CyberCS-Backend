import { Injectable } from '@nestjs/common';
import * as CryptoJS from 'crypto-js';
import { Result } from 'src/types/Result';

@Injectable()
export class EncryptionService {
  private readonly secretKey = 'a';

  encryptArray(data: Result[]): string {
    const jsonString = JSON.stringify(data);
    return CryptoJS.AES.encrypt(jsonString, this.secretKey).toString();
  }

  decryptArray(encryptedData: string): string[] {
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.secretKey);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedString);
  }
}