export enum SpiraTestStatus {
  Failed = 1,
  Passed = 2,
  NotRun = 3,
  NotApplicable = 4,
  Blocked = 5,
  Caution = 6,
}

interface SpiraConfig {
  baseUrl: string;
  username: string;
  apiKey: string;
  projectId: number;
  releaseId: number;
}

export class SpiraClient {
  private readonly timeout = 30_000;

  constructor(private readonly config: SpiraConfig) {
    // Strip trailing slash from baseUrl to avoid double slashes
    this.config.baseUrl = this.config.baseUrl.replace(/\/+$/, '');
  }

  async createTestCase(name: string): Promise<number | null> {
    const url = `${this.config.baseUrl}/services/v7_0/projects/${this.config.projectId}/test-cases`;

    const body = {
      Name: name,
      TestCaseTypeId: 3, // Automated
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'username': this.config.username,
          'api-key': this.config.apiKey,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        console.error(`[Spira] Failed to create test case "${name}" - HTTP ${response.status}`);
        return null;
      }

      const data = await response.json() as { TestCaseId?: number };
      console.log(`[Spira] Created test case "${name}" with ID: ${data.TestCaseId}`);
      return data.TestCaseId ?? null;
    } catch (error) {
      console.error(`[Spira] Connection error creating test case: ${(error as Error).message}`);
      return null;
    }
  }

  async recordTestResult(
    testCaseId: number,
    status: SpiraTestStatus,
    testName: string,
    durationMs: number
  ): Promise<void> {
    const url = `${this.config.baseUrl}/services/v7_0/projects/${this.config.projectId}/test-runs/record`;

    const body = {
      TestCaseId: testCaseId,
      ReleaseId: this.config.releaseId,
      ExecutionStatusId: status,
      RunnerName: 'Playwright',
      RunnerTestName: testName,
      StartDate: new Date(Date.now() - durationMs).toISOString(),
      EndDate: new Date().toISOString(),
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'username': this.config.username,
          'api-key': this.config.apiKey,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        console.error(`[Spira] Failed to record result for TC:${testCaseId} - HTTP ${response.status}`);
      }
    } catch (error) {
      console.error(`[Spira] Connection error for TC:${testCaseId}: ${(error as Error).message}`);
    }
  }
}
