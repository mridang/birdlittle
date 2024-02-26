import { expect } from '@jest/globals';
import { Context, Probot } from 'probot';
import CanaryService from '../../../src/services/finch/canary.service';
import ProbotHandler from '../../../src/services/finch/probot.handler';
import { Logger } from '@nestjs/common';
import { EmitterWebhookEvent } from '@octokit/webhooks';

class MockCanaryService implements Partial<CanaryService> {
  runCanary = jest.fn();
  handleGate = jest.fn();
  logger = { log: jest.fn(), error: jest.fn() }; // Mock any other properties as needed
}

describe('probot.handler test', () => {
  let probotHandler: ProbotHandler;
  let mockCanaryService: MockCanaryService;
  let mockProbot: Probot;

  beforeEach(() => {
    mockCanaryService = new MockCanaryService();

    probotHandler = new ProbotHandler(mockCanaryService as never);
    mockProbot = new Probot({
      appId: 'test',
      githubToken: 'test',
    });
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
  });

  it('handles workflow_run.completed event', async () => {
    const initApp = probotHandler.init();
    initApp(mockProbot);

    const context = {
      payload: {
        action: 'completed',
        installation: { id: 123 },
        repository: { full_name: 'testOrg/testRepo' },
        workflow_run: {
          id: 456,
          actor: { login: 'birdlittle[bot]' },
          conclusion: 'success',
        },
      },
      event: 'deployment_protection_rule.requested',
    } as unknown as Context;

    await mockProbot.receive(<EmitterWebhookEvent>{
      name: 'workflow_run',
      id: 'test',
      payload: context.payload,
    });

    expect(mockCanaryService.handleGate).toHaveBeenCalledWith(
      123,
      456,
      'testOrg',
      'testRepo',
      'approved',
    );
  });

  it('handles deployment_protection_rule.requested event', async () => {
    const initApp = probotHandler.init();
    initApp(mockProbot);

    const context = {
      payload: {
        action: 'requested',
        environment: 'production',
        deployment_callback_url:
          'https://api.github.com/repos/mridang/testing/actions/runs/7971033382/deployment_protection_rule',
        installation: { id: 123 },
        repository: { full_name: 'testOrg/testRepo' },
      },
      event: 'deployment_protection_rule',
    } as unknown as Context;

    await mockProbot.receive(<EmitterWebhookEvent>{
      name: 'deployment_protection_rule',
      id: 'test',
      payload: context.payload,
    });

    expect(mockCanaryService.runCanary).toHaveBeenCalledWith(
      123,
      7971033382,
      'production',
      'testOrg',
      'testRepo',
    );
  });
});
