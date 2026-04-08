import { customAlphabet } from 'nanoid';
import { IEncodingStrategy } from '@/core/encoding/encoding.interface';
import { config } from '@/core/config';

const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export class NanoIdStrategy implements IEncodingStrategy {
    private generator: () => string;

    constructor(length?: number) {
        this.generator = customAlphabet(ALPHABET, length ?? config.shortCodeLength);
    }

    encode(): string {
        return this.generator();
    }
}
