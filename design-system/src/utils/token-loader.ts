/**
 * Token loader utilities
 */

import { DesignTokens } from '../types/tokens';
import * as fs from 'fs';
import * as path from 'path';

export function loadTokens(tokenFile: string): DesignTokens {
  // Reject anything that isn't a plain basename with a .json extension
  if (!/^[^/\\]+\.json$/.test(tokenFile)) {
    throw new Error(`Invalid token file name: "${tokenFile}"`);
  }

  const tokensDir = path.resolve(process.cwd(), 'tokens');
  const tokenPath = path.resolve(tokensDir, tokenFile);

  // Ensure resolved path stays within the tokens directory
  if (!tokenPath.startsWith(tokensDir + path.sep) && tokenPath !== tokensDir) {
    throw new Error(`Path traversal detected for token file: "${tokenFile}"`);
  }

  const tokenData = fs.readFileSync(tokenPath, 'utf-8');
  return JSON.parse(tokenData) as DesignTokens;
}

export function getAllTokens(): DesignTokens {
  const tokenFiles = ['colors.json', 'typography.json', 'spacing.json', 'shadows.json', 'motion.json', 'borders.json'];
  const allTokens: DesignTokens = {};
  
  tokenFiles.forEach(file => {
    try {
      const tokens = loadTokens(file);
      Object.assign(allTokens, tokens);
    } catch (error) {
      console.warn(`Failed to load ${file}:`, error);
    }
  });
  
  return allTokens;
}
