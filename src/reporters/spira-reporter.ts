import type { Reporter, TestCase, TestResult, FullResult } from '@playwright/test/reporter';
import { SpiraClient, SpiraTestStatus } from '../utils/spira-client';
import * as fs from 'fs';
import * as path from 'path';

interface SpiraMapping {
  [testTitle: string]: number;
}

export default class SpiraReporter implements Reporter {
  private client: SpiraClient | null = null;
  private missingSettings: string[] = [];
  private mappings: SpiraMapping = {};
  private mappingFilePath: string = path.resolve(process.cwd(), 'spira-mapping.json');

  onBegin(): void {
    const required = [
      'SPIRA_BASE_URL',
      'SPIRA_USERNAME',
      'SPIRA_API_KEY',
      'SPIRA_PROJECT_ID',
      'SPIRA_RELEASE_ID',
    ];

    this.missingSettings = required.filter((key) => !process.env[key]);

    if (this.missingSettings.length > 0) {
      this.client = null;
      return;
    }

    this.client = new SpiraClient({
      baseUrl: process.env.SPIRA_BASE_URL!,
      username: process.env.SPIRA_USERNAME!,
      apiKey: process.env.SPIRA_API_KEY!,
      projectId: parseInt(process.env.SPIRA_PROJECT_ID!, 10),
      releaseId: parseInt(process.env.SPIRA_RELEASE_ID!, 10),
    });

    // Load existing mappings if available
    this.loadMappings();
  }

  async onTestEnd(test: TestCase, result: TestResult): Promise<void> {
    if (!this.client) return;

    const testKey = test.titlePath().join(' > ');
    let spiraTestCaseId = this.extractSpiraId(test);

    // Check the mapping file for a previously created ID
    if (!spiraTestCaseId && this.mappings[testKey]) {
      spiraTestCaseId = this.mappings[testKey];
    }

    // If still no ID, create a new test case in Spira
    if (!spiraTestCaseId) {
      spiraTestCaseId = await this.client.createTestCase(testKey);
      if (!spiraTestCaseId) return;
      // Save the mapping for future runs
      this.mappings[testKey] = spiraTestCaseId;
    }

    const status = this.mapStatus(result.status);
    await this.client.recordTestResult(spiraTestCaseId, status, test.title, result.duration);
  }

  async onEnd(_result: FullResult): Promise<void> {
    if (this.missingSettings.length > 0) {
      console.warn(
        `[Spira Reporter] Skipping submission. Missing settings: ${this.missingSettings.join(', ')}`
      );
      return;
    }

    // Save mappings to file so IDs are reused on subsequent runs
    this.saveMappings();
  }

  private loadMappings(): void {
    try {
      if (fs.existsSync(this.mappingFilePath)) {
        const content = fs.readFileSync(this.mappingFilePath, 'utf-8');
        this.mappings = JSON.parse(content);
        console.log(`[Spira Reporter] Loaded ${Object.keys(this.mappings).length} test case mappings from spira-mapping.json`);
      }
    } catch {
      this.mappings = {};
    }
  }

  private saveMappings(): void {
    if (Object.keys(this.mappings).length === 0) return;
    try {
      fs.writeFileSync(this.mappingFilePath, JSON.stringify(this.mappings, null, 2));
      console.log(`[Spira Reporter] Saved ${Object.keys(this.mappings).length} test case mappings to spira-mapping.json`);
    } catch (error) {
      console.error(`[Spira Reporter] Failed to save mappings: ${(error as Error).message}`);
    }
  }

  private extractSpiraId(test: TestCase): number | null {
    const annotation = test.annotations.find((a) => a.type === 'spira');
    if (!annotation || !annotation.description) return null;
    const id = parseInt(annotation.description, 10);
    return isNaN(id) ? null : id;
  }

  private mapStatus(status: string): SpiraTestStatus {
    switch (status) {
      case 'passed':
        return SpiraTestStatus.Passed;
      case 'failed':
        return SpiraTestStatus.Failed;
      default:
        return SpiraTestStatus.Blocked;
    }
  }
}
