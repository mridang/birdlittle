import { expect } from '@jest/globals';
import CanaryService from '../../../src/services/finch/canary.service';
import ProbotHandler from '../../../src/services/finch/probot.handler';
import { Logger } from '@nestjs/common';
import {
  EmitterWebhookEvent,
  EmitterWebhookEventName,
} from '@octokit/webhooks';
import { HandlerFunction } from '@octokit/webhooks/dist-types/types';
import { WebhookHandler } from '../../../src/services/github/webhook/webhook.interfaces';

class MockCanaryService implements Partial<CanaryService> {
  runCanary = jest.fn();
  handleGate = jest.fn();
  logger = { log: jest.fn(), error: jest.fn() }; // Mock any other properties as needed
}

class TestWebhookHandler implements WebhookHandler {
  private readonly handlers: Map<
    EmitterWebhookEventName,
    HandlerFunction<EmitterWebhookEventName, unknown>[]
  > = new Map();

  on<E extends EmitterWebhookEventName>(
    event: E,
    callback: HandlerFunction<E, unknown>,
  ): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers
      .get(event)!
      .push(
        callback as unknown as HandlerFunction<
          EmitterWebhookEventName,
          unknown
        >,
      );
  }

  dispatch<E extends EmitterWebhookEventName>(
    event: E,
    payload: EmitterWebhookEvent<E>,
  ) {
    const callbacks = this.handlers.get(event);
    if (callbacks) {
      for (const callback of callbacks) {
        callback(payload);
      }
    }
  }
}

describe('probot.handler tests', () => {
  let mockCanaryService: MockCanaryService;
  const testHandler = new TestWebhookHandler();

  beforeEach(() => {
    mockCanaryService = new MockCanaryService();

    new ProbotHandler(mockCanaryService as never, testHandler);
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
  });

  test('handles workflow_run.completed event', async () => {
    testHandler.dispatch('workflow_run.completed', {
      id: '11118767062',
      name: 'workflow_run',
      payload: {
        action: 'completed',
        workflow_run: {
          id: 11118767062,
          name: 'Deploy Serverless Application',
          node_id: 'WFR_kwLOLVs-YM8AAAAClrrr1g',
          head_branch: 'master',
          head_sha: 'bcb5bd0886655f5c19a259b562cb3c1291523e9c',
          path: '.github/workflows/deploy.yml',
          display_title: 'Dummy commit to trigger the builds',
          run_number: 114,
          event: 'push',
          status: 'completed',
          conclusion: 'success',
          workflow_id: 86832287,
          check_suite_id: 29049337155,
          check_suite_node_id: 'CS_kwDOLVs-YM8AAAAGw3m1Qw',
          url: 'https://api.github.com/repos/github/octocat/actions/runs/11118767062',
          html_url:
            'https://github.com/github/octocat/actions/runs/11118767062',
          pull_requests: [],
          created_at: '2024-10-01T04:41:57Z',
          updated_at: '2024-10-01T04:45:40Z',
          actor: {
            login: 'birdlittle[bot]',
            id: 160376679,
            node_id: 'BOT_kgDOCY8nZw',
            avatar_url: 'https://avatars.githubusercontent.com/in/831907?v=4',
            gravatar_id: '',
            url: 'https://api.github.com/users/birdlittle%5Bbot%5D',
            html_url: 'https://github.com/apps/birdlittle',
            followers_url:
              'https://api.github.com/users/birdlittle%5Bbot%5D/followers',
            following_url:
              'https://api.github.com/users/birdlittle%5Bbot%5D/following{/other_user}',
            gists_url:
              'https://api.github.com/users/birdlittle%5Bbot%5D/gists{/gist_id}',
            starred_url:
              'https://api.github.com/users/birdlittle%5Bbot%5D/starred{/owner}{/repo}',
            subscriptions_url:
              'https://api.github.com/users/birdlittle%5Bbot%5D/subscriptions',
            organizations_url:
              'https://api.github.com/users/birdlittle%5Bbot%5D/orgs',
            repos_url: 'https://api.github.com/users/birdlittle%5Bbot%5D/repos',
            events_url:
              'https://api.github.com/users/birdlittle%5Bbot%5D/events{/privacy}',
            received_events_url:
              'https://api.github.com/users/birdlittle%5Bbot%5D/received_events',
            type: 'Bot',
            site_admin: false,
          },
          run_attempt: 1,
          referenced_workflows: [],
          run_started_at: '2024-10-01T04:41:57Z',
          triggering_actor: {
            login: 'mridang',
            id: 327432,
            node_id: 'MDQ6VXNlcjMyNzQzMg==',
            avatar_url: 'https://avatars.githubusercontent.com/u/327432?v=4',
            gravatar_id: '',
            url: 'https://api.github.com/users/mridang',
            html_url: 'https://github.com/mridang',
            followers_url: 'https://api.github.com/users/mridang/followers',
            following_url:
              'https://api.github.com/users/mridang/following{/other_user}',
            gists_url: 'https://api.github.com/users/mridang/gists{/gist_id}',
            starred_url:
              'https://api.github.com/users/mridang/starred{/owner}{/repo}',
            subscriptions_url:
              'https://api.github.com/users/mridang/subscriptions',
            organizations_url: 'https://api.github.com/users/mridang/orgs',
            repos_url: 'https://api.github.com/users/mridang/repos',
            events_url: 'https://api.github.com/users/mridang/events{/privacy}',
            received_events_url:
              'https://api.github.com/users/mridang/received_events',
            type: 'User',
            site_admin: false,
          },
          jobs_url:
            'https://api.github.com/repos/github/octocat/actions/runs/11118767062/jobs',
          logs_url:
            'https://api.github.com/repos/github/octocat/actions/runs/11118767062/logs',
          check_suite_url:
            'https://api.github.com/repos/github/octocat/check-suites/29049337155',
          artifacts_url:
            'https://api.github.com/repos/github/octocat/actions/runs/11118767062/artifacts',
          cancel_url:
            'https://api.github.com/repos/github/octocat/actions/runs/11118767062/cancel',
          rerun_url:
            'https://api.github.com/repos/github/octocat/actions/runs/11118767062/rerun',
          previous_attempt_url: null,
          workflow_url:
            'https://api.github.com/repos/github/octocat/actions/workflows/86832287',
          head_commit: {
            id: 'bcb5bd0886655f5c19a259b562cb3c1291523e9c',
            tree_id: 'e53b35032d40293156dfd100463d7c57bb331c4a',
            message: 'Dummy commit to trigger the builds',
            timestamp: '2024-10-01T04:41:48Z',
            author: {
              name: 'Mridang Agarwalla',
              email: 'mridang.agarwalla@gmail.com',
            },
            committer: {
              name: 'Mridang Agarwalla',
              email: 'mridang.agarwalla@gmail.com',
            },
          },
          repository: {
            id: 760954464,
            node_id: 'R_kgDOLVs-YA',
            name: 'octocat',
            full_name: 'github/octocat',
            private: false,
            owner: {
              login: 'mridang',
              id: 327432,
              node_id: 'MDQ6VXNlcjMyNzQzMg==',
              avatar_url: 'https://avatars.githubusercontent.com/u/327432?v=4',
              gravatar_id: '',
              url: 'https://api.github.com/users/mridang',
              html_url: 'https://github.com/mridang',
              followers_url: 'https://api.github.com/users/mridang/followers',
              following_url:
                'https://api.github.com/users/mridang/following{/other_user}',
              gists_url: 'https://api.github.com/users/mridang/gists{/gist_id}',
              starred_url:
                'https://api.github.com/users/mridang/starred{/owner}{/repo}',
              subscriptions_url:
                'https://api.github.com/users/mridang/subscriptions',
              organizations_url: 'https://api.github.com/users/mridang/orgs',
              repos_url: 'https://api.github.com/users/mridang/repos',
              events_url:
                'https://api.github.com/users/mridang/events{/privacy}',
              received_events_url:
                'https://api.github.com/users/mridang/received_events',
              type: 'User',
              site_admin: false,
            },
            html_url: 'https://github.com/github/octocat',
            description:
              'Birdlittle is Github app acts as a deploy-gate and prevents deploying without workflows passing',
            fork: false,
            url: 'https://api.github.com/repos/github/octocat',
            forks_url: 'https://api.github.com/repos/github/octocat/forks',
            keys_url:
              'https://api.github.com/repos/github/octocat/keys{/key_id}',
            collaborators_url:
              'https://api.github.com/repos/github/octocat/collaborators{/collaborator}',
            teams_url: 'https://api.github.com/repos/github/octocat/teams',
            hooks_url: 'https://api.github.com/repos/github/octocat/hooks',
            issue_events_url:
              'https://api.github.com/repos/github/octocat/issues/events{/number}',
            events_url: 'https://api.github.com/repos/github/octocat/events',
            assignees_url:
              'https://api.github.com/repos/github/octocat/assignees{/user}',
            branches_url:
              'https://api.github.com/repos/github/octocat/branches{/branch}',
            tags_url: 'https://api.github.com/repos/github/octocat/tags',
            blobs_url:
              'https://api.github.com/repos/github/octocat/git/blobs{/sha}',
            git_tags_url:
              'https://api.github.com/repos/github/octocat/git/tags{/sha}',
            git_refs_url:
              'https://api.github.com/repos/github/octocat/git/refs{/sha}',
            trees_url:
              'https://api.github.com/repos/github/octocat/git/trees{/sha}',
            statuses_url:
              'https://api.github.com/repos/github/octocat/statuses/{sha}',
            languages_url:
              'https://api.github.com/repos/github/octocat/languages',
            stargazers_url:
              'https://api.github.com/repos/github/octocat/stargazers',
            contributors_url:
              'https://api.github.com/repos/github/octocat/contributors',
            subscribers_url:
              'https://api.github.com/repos/github/octocat/subscribers',
            subscription_url:
              'https://api.github.com/repos/github/octocat/subscription',
            commits_url:
              'https://api.github.com/repos/github/octocat/commits{/sha}',
            git_commits_url:
              'https://api.github.com/repos/github/octocat/git/commits{/sha}',
            comments_url:
              'https://api.github.com/repos/github/octocat/comments{/number}',
            issue_comment_url:
              'https://api.github.com/repos/github/octocat/issues/comments{/number}',
            contents_url:
              'https://api.github.com/repos/github/octocat/contents/{+path}',
            compare_url:
              'https://api.github.com/repos/github/octocat/compare/{base}...{head}',
            merges_url: 'https://api.github.com/repos/github/octocat/merges',
            archive_url:
              'https://api.github.com/repos/github/octocat/{archive_format}{/ref}',
            downloads_url:
              'https://api.github.com/repos/github/octocat/downloads',
            issues_url:
              'https://api.github.com/repos/github/octocat/issues{/number}',
            pulls_url:
              'https://api.github.com/repos/github/octocat/pulls{/number}',
            milestones_url:
              'https://api.github.com/repos/github/octocat/milestones{/number}',
            notifications_url:
              'https://api.github.com/repos/github/octocat/notifications{?since,all,participating}',
            labels_url:
              'https://api.github.com/repos/github/octocat/labels{/name}',
            releases_url:
              'https://api.github.com/repos/github/octocat/releases{/id}',
            deployments_url:
              'https://api.github.com/repos/github/octocat/deployments',
          },
          head_repository: {
            id: 760954464,
            node_id: 'R_kgDOLVs-YA',
            name: 'octocat',
            full_name: 'github/octocat',
            private: false,
            owner: {
              login: 'mridang',
              id: 327432,
              node_id: 'MDQ6VXNlcjMyNzQzMg==',
              avatar_url: 'https://avatars.githubusercontent.com/u/327432?v=4',
              gravatar_id: '',
              url: 'https://api.github.com/users/mridang',
              html_url: 'https://github.com/mridang',
              followers_url: 'https://api.github.com/users/mridang/followers',
              following_url:
                'https://api.github.com/users/mridang/following{/other_user}',
              gists_url: 'https://api.github.com/users/mridang/gists{/gist_id}',
              starred_url:
                'https://api.github.com/users/mridang/starred{/owner}{/repo}',
              subscriptions_url:
                'https://api.github.com/users/mridang/subscriptions',
              organizations_url: 'https://api.github.com/users/mridang/orgs',
              repos_url: 'https://api.github.com/users/mridang/repos',
              events_url:
                'https://api.github.com/users/mridang/events{/privacy}',
              received_events_url:
                'https://api.github.com/users/mridang/received_events',
              type: 'User',
              site_admin: false,
            },
            html_url: 'https://github.com/github/octocat',
            description:
              'Birdlittle is Github app acts as a deploy-gate and prevents deploying without workflows passing',
            fork: false,
            url: 'https://api.github.com/repos/github/octocat',
            forks_url: 'https://api.github.com/repos/github/octocat/forks',
            keys_url:
              'https://api.github.com/repos/github/octocat/keys{/key_id}',
            collaborators_url:
              'https://api.github.com/repos/github/octocat/collaborators{/collaborator}',
            teams_url: 'https://api.github.com/repos/github/octocat/teams',
            hooks_url: 'https://api.github.com/repos/github/octocat/hooks',
            issue_events_url:
              'https://api.github.com/repos/github/octocat/issues/events{/number}',
            events_url: 'https://api.github.com/repos/github/octocat/events',
            assignees_url:
              'https://api.github.com/repos/github/octocat/assignees{/user}',
            branches_url:
              'https://api.github.com/repos/github/octocat/branches{/branch}',
            tags_url: 'https://api.github.com/repos/github/octocat/tags',
            blobs_url:
              'https://api.github.com/repos/github/octocat/git/blobs{/sha}',
            git_tags_url:
              'https://api.github.com/repos/github/octocat/git/tags{/sha}',
            git_refs_url:
              'https://api.github.com/repos/github/octocat/git/refs{/sha}',
            trees_url:
              'https://api.github.com/repos/github/octocat/git/trees{/sha}',
            statuses_url:
              'https://api.github.com/repos/github/octocat/statuses/{sha}',
            languages_url:
              'https://api.github.com/repos/github/octocat/languages',
            stargazers_url:
              'https://api.github.com/repos/github/octocat/stargazers',
            contributors_url:
              'https://api.github.com/repos/github/octocat/contributors',
            subscribers_url:
              'https://api.github.com/repos/github/octocat/subscribers',
            subscription_url:
              'https://api.github.com/repos/github/octocat/subscription',
            commits_url:
              'https://api.github.com/repos/github/octocat/commits{/sha}',
            git_commits_url:
              'https://api.github.com/repos/github/octocat/git/commits{/sha}',
            comments_url:
              'https://api.github.com/repos/github/octocat/comments{/number}',
            issue_comment_url:
              'https://api.github.com/repos/github/octocat/issues/comments{/number}',
            contents_url:
              'https://api.github.com/repos/github/octocat/contents/{+path}',
            compare_url:
              'https://api.github.com/repos/github/octocat/compare/{base}...{head}',
            merges_url: 'https://api.github.com/repos/github/octocat/merges',
            archive_url:
              'https://api.github.com/repos/github/octocat/{archive_format}{/ref}',
            downloads_url:
              'https://api.github.com/repos/github/octocat/downloads',
            issues_url:
              'https://api.github.com/repos/github/octocat/issues{/number}',
            pulls_url:
              'https://api.github.com/repos/github/octocat/pulls{/number}',
            milestones_url:
              'https://api.github.com/repos/github/octocat/milestones{/number}',
            notifications_url:
              'https://api.github.com/repos/github/octocat/notifications{?since,all,participating}',
            labels_url:
              'https://api.github.com/repos/github/octocat/labels{/name}',
            releases_url:
              'https://api.github.com/repos/github/octocat/releases{/id}',
            deployments_url:
              'https://api.github.com/repos/github/octocat/deployments',
          },
        },
        workflow: {
          id: 86832287,
          node_id: 'W_kwDOLVs-YM4FLPSf',
          name: 'Deploy Serverless Application',
          path: '.github/workflows/deploy.yml',
          state: 'active',
          created_at: '2024-02-21T00:55:10.000Z',
          updated_at: '2024-02-21T00:55:10.000Z',
          url: 'https://api.github.com/repos/github/octocat/actions/workflows/86832287',
          html_url:
            'https://github.com/github/octocat/blob/master/.github/workflows/deploy.yml',
          badge_url:
            'https://github.com/github/octocat/workflows/Deploy%20Serverless%20Application/badge.svg',
        },
        repository: {
          id: 760954464,
          node_id: 'R_kgDOLVs-YA',
          name: 'octocat',
          full_name: 'github/octocat',
          private: false,
          custom_properties: {},
          owner: {
            login: 'mridang',
            id: 327432,
            node_id: 'MDQ6VXNlcjMyNzQzMg==',
            avatar_url: 'https://avatars.githubusercontent.com/u/327432?v=4',
            gravatar_id: '',
            url: 'https://api.github.com/users/mridang',
            html_url: 'https://github.com/mridang',
            followers_url: 'https://api.github.com/users/mridang/followers',
            following_url:
              'https://api.github.com/users/mridang/following{/other_user}',
            gists_url: 'https://api.github.com/users/mridang/gists{/gist_id}',
            starred_url:
              'https://api.github.com/users/mridang/starred{/owner}{/repo}',
            subscriptions_url:
              'https://api.github.com/users/mridang/subscriptions',
            organizations_url: 'https://api.github.com/users/mridang/orgs',
            repos_url: 'https://api.github.com/users/mridang/repos',
            events_url: 'https://api.github.com/users/mridang/events{/privacy}',
            received_events_url:
              'https://api.github.com/users/mridang/received_events',
            type: 'User',
            site_admin: false,
          },
          html_url: 'https://github.com/github/octocat',
          description:
            'Birdlittle is Github app acts as a deploy-gate and prevents deploying without workflows passing',
          fork: false,
          url: 'https://api.github.com/repos/github/octocat',
          forks_url: 'https://api.github.com/repos/github/octocat/forks',
          keys_url: 'https://api.github.com/repos/github/octocat/keys{/key_id}',
          collaborators_url:
            'https://api.github.com/repos/github/octocat/collaborators{/collaborator}',
          teams_url: 'https://api.github.com/repos/github/octocat/teams',
          hooks_url: 'https://api.github.com/repos/github/octocat/hooks',
          issue_events_url:
            'https://api.github.com/repos/github/octocat/issues/events{/number}',
          events_url: 'https://api.github.com/repos/github/octocat/events',
          assignees_url:
            'https://api.github.com/repos/github/octocat/assignees{/user}',
          branches_url:
            'https://api.github.com/repos/github/octocat/branches{/branch}',
          tags_url: 'https://api.github.com/repos/github/octocat/tags',
          blobs_url:
            'https://api.github.com/repos/github/octocat/git/blobs{/sha}',
          git_tags_url:
            'https://api.github.com/repos/github/octocat/git/tags{/sha}',
          git_refs_url:
            'https://api.github.com/repos/github/octocat/git/refs{/sha}',
          trees_url:
            'https://api.github.com/repos/github/octocat/git/trees{/sha}',
          statuses_url:
            'https://api.github.com/repos/github/octocat/statuses/{sha}',
          languages_url:
            'https://api.github.com/repos/github/octocat/languages',
          stargazers_url:
            'https://api.github.com/repos/github/octocat/stargazers',
          contributors_url:
            'https://api.github.com/repos/github/octocat/contributors',
          subscribers_url:
            'https://api.github.com/repos/github/octocat/subscribers',
          subscription_url:
            'https://api.github.com/repos/github/octocat/subscription',
          commits_url:
            'https://api.github.com/repos/github/octocat/commits{/sha}',
          git_commits_url:
            'https://api.github.com/repos/github/octocat/git/commits{/sha}',
          comments_url:
            'https://api.github.com/repos/github/octocat/comments{/number}',
          issue_comment_url:
            'https://api.github.com/repos/github/octocat/issues/comments{/number}',
          contents_url:
            'https://api.github.com/repos/github/octocat/contents/{+path}',
          compare_url:
            'https://api.github.com/repos/github/octocat/compare/{base}...{head}',
          merges_url: 'https://api.github.com/repos/github/octocat/merges',
          archive_url:
            'https://api.github.com/repos/github/octocat/{archive_format}{/ref}',
          downloads_url:
            'https://api.github.com/repos/github/octocat/downloads',
          issues_url:
            'https://api.github.com/repos/github/octocat/issues{/number}',
          pulls_url:
            'https://api.github.com/repos/github/octocat/pulls{/number}',
          milestones_url:
            'https://api.github.com/repos/github/octocat/milestones{/number}',
          notifications_url:
            'https://api.github.com/repos/github/octocat/notifications{?since,all,participating}',
          labels_url:
            'https://api.github.com/repos/github/octocat/labels{/name}',
          releases_url:
            'https://api.github.com/repos/github/octocat/releases{/id}',
          deployments_url:
            'https://api.github.com/repos/github/octocat/deployments',
          created_at: '2024-02-21T00:53:42Z',
          updated_at: '2024-10-01T04:41:58Z',
          pushed_at: '2024-10-01T04:41:55Z',
          git_url: 'git://github.com/github/octocat.git',
          ssh_url: 'git@github.com:github/octocat.git',
          clone_url: 'https://github.com/github/octocat.git',
          svn_url: 'https://github.com/github/octocat',
          homepage: 'https://github.com/apps/birdlittle',
          size: 9398,
          stargazers_count: 0,
          watchers_count: 0,
          language: 'TypeScript',
          has_issues: true,
          has_projects: false,
          has_downloads: true,
          has_wiki: false,
          has_pages: false,
          has_discussions: false,
          forks_count: 0,
          mirror_url: null,
          archived: false,
          disabled: false,
          open_issues_count: 6,
          license: {
            key: 'apache-2.0',
            name: 'Apache License 2.0',
            spdx_id: 'Apache-2.0',
            url: 'https://api.github.com/licenses/apache-2.0',
            node_id: 'MDc6TGljZW5zZTI=',
          },
          allow_forking: true,
          is_template: false,
          web_commit_signoff_required: false,
          topics: ['devex', 'github', 'github-app', 'probot', 'probot-app'],
          visibility: 'public',
          forks: 0,
          open_issues: 6,
          watchers: 0,
          default_branch: 'master',
        },
        sender: {
          login: 'mridang',
          id: 327432,
          node_id: 'MDQ6VXNlcjMyNzQzMg==',
          avatar_url: 'https://avatars.githubusercontent.com/u/327432?v=4',
          gravatar_id: '',
          url: 'https://api.github.com/users/mridang',
          html_url: 'https://github.com/mridang',
          followers_url: 'https://api.github.com/users/mridang/followers',
          following_url:
            'https://api.github.com/users/mridang/following{/other_user}',
          gists_url: 'https://api.github.com/users/mridang/gists{/gist_id}',
          starred_url:
            'https://api.github.com/users/mridang/starred{/owner}{/repo}',
          subscriptions_url:
            'https://api.github.com/users/mridang/subscriptions',
          organizations_url: 'https://api.github.com/users/mridang/orgs',
          repos_url: 'https://api.github.com/users/mridang/repos',
          events_url: 'https://api.github.com/users/mridang/events{/privacy}',
          received_events_url:
            'https://api.github.com/users/mridang/received_events',
          type: 'User',
          site_admin: false,
        },
        installation: {
          id: 47530305,
          node_id: 'MDIzOkludGVncmF0aW9uSW5zdGFsbGF0aW9uNDc1MzAzMDU=',
        },
      },
    });

    expect(mockCanaryService.handleGate).toHaveBeenCalledWith(
      47530305,
      11118767062,
      'github',
      'octocat',
      'approved',
    );
  });

  test('handles deployment_protection_rule.requested event', async () => {
    testHandler.dispatch('deployment_protection_rule.requested', {
      id: '1',
      name: 'deployment_protection_rule',
      payload: {
        action: 'requested',
        environment: 'production',
        event: 'push',
        deployment_callback_url:
          'https://api.github.com/repos/github/octocat/actions/runs/11118767062/deployment_protection_rule',
        deployment: {
          url: 'https://api.github.com/repos/github/octocat/deployments/1840060793',
          id: 1840060793,
          node_id: 'DE_kwDOLVs-YM5trRl5',
          task: 'deploy',
          original_environment: 'production',
          environment: 'production',
          description: null,
          created_at: '2024-10-01T04:41:59Z',
          updated_at: '2024-10-01T04:42:00Z',
          statuses_url:
            'https://api.github.com/repos/github/octocat/deployments/1840060793/statuses',
          repository_url: 'https://api.github.com/repos/github/octocat',
          creator: {
            login: 'mridang',
            id: 327432,
            node_id: 'MDQ6VXNlcjMyNzQzMg==',
            avatar_url: 'https://avatars.githubusercontent.com/u/327432?v=4',
            gravatar_id: '',
            url: 'https://api.github.com/users/mridang',
            html_url: 'https://github.com/mridang',
            followers_url: 'https://api.github.com/users/mridang/followers',
            following_url:
              'https://api.github.com/users/mridang/following{/other_user}',
            gists_url: 'https://api.github.com/users/mridang/gists{/gist_id}',
            starred_url:
              'https://api.github.com/users/mridang/starred{/owner}{/repo}',
            subscriptions_url:
              'https://api.github.com/users/mridang/subscriptions',
            organizations_url: 'https://api.github.com/users/mridang/orgs',
            repos_url: 'https://api.github.com/users/mridang/repos',
            events_url: 'https://api.github.com/users/mridang/events{/privacy}',
            received_events_url:
              'https://api.github.com/users/mridang/received_events',
            type: 'User',
            site_admin: false,
          },
          sha: 'bcb5bd0886655f5c19a259b562cb3c1291523e9c',
          ref: 'master',
          payload: {},
          transient_environment: false,
          production_environment: false,
          performed_via_github_app: {
            id: 15368,
            slug: 'github-actions',
            node_id: 'MDM6QXBwMTUzNjg=',
            owner: {
              login: 'github',
              id: 9919,
              node_id: 'MDEyOk9yZ2FuaXphdGlvbjk5MTk=',
              avatar_url: 'https://avatars.githubusercontent.com/u/9919?v=4',
              gravatar_id: '',
              url: 'https://api.github.com/users/github',
              html_url: 'https://github.com/github',
              followers_url: 'https://api.github.com/users/github/followers',
              following_url:
                'https://api.github.com/users/github/following{/other_user}',
              gists_url: 'https://api.github.com/users/github/gists{/gist_id}',
              starred_url:
                'https://api.github.com/users/github/starred{/owner}{/repo}',
              subscriptions_url:
                'https://api.github.com/users/github/subscriptions',
              organizations_url: 'https://api.github.com/users/github/orgs',
              repos_url: 'https://api.github.com/users/github/repos',
              events_url:
                'https://api.github.com/users/github/events{/privacy}',
              received_events_url:
                'https://api.github.com/users/github/received_events',
              type: 'Organization',
              site_admin: false,
            },
            name: 'GitHub Actions',
            description: 'Automate your workflow from idea to production',
            external_url: 'https://help.github.com/en/actions',
            html_url: 'https://github.com/apps/github-actions',
            created_at: '2018-07-30T09:30:17Z',
            updated_at: '2024-04-10T20:33:16Z',
            permissions: {
              actions: 'write',
              administration: 'read',
              checks: 'write',
              contents: 'write',
              deployments: 'write',
              discussions: 'write',
              issues: 'write',
              merge_queues: 'write',
              metadata: 'read',
              packages: 'write',
              pages: 'write',
              pull_requests: 'write',
              repository_hooks: 'write',
              repository_projects: 'write',
              security_events: 'write',
              statuses: 'write',
              vulnerability_alerts: 'read',
            },
            events: [
              'branch_protection_rule',
              'check_run',
              'check_suite',
              'create',
              'delete',
              'deployment',
              'deployment_status',
              'discussion',
              'discussion_comment',
              'fork',
              'gollum',
              'issues',
              'issue_comment',
              'label',
              'merge_group',
              'milestone',
              'page_build',
              'project',
              'project_card',
              'project_column',
              'public',
              'pull_request',
              'pull_request_review',
              'pull_request_review_comment',
              'push',
              'registry_package',
              'release',
              'repository',
              'repository_dispatch',
              'status',
              'watch',
              'workflow_dispatch',
              'workflow_run',
            ],
          },
        },
        pull_requests: [],
        repository: {
          id: 760954464,
          node_id: 'R_kgDOLVs-YA',
          name: 'octocat',
          full_name: 'github/octocat',
          private: false,
          custom_properties: {},
          owner: {
            login: 'mridang',
            id: 327432,
            node_id: 'MDQ6VXNlcjMyNzQzMg==',
            avatar_url: 'https://avatars.githubusercontent.com/u/327432?v=4',
            gravatar_id: '',
            url: 'https://api.github.com/users/mridang',
            html_url: 'https://github.com/mridang',
            followers_url: 'https://api.github.com/users/mridang/followers',
            following_url:
              'https://api.github.com/users/mridang/following{/other_user}',
            gists_url: 'https://api.github.com/users/mridang/gists{/gist_id}',
            starred_url:
              'https://api.github.com/users/mridang/starred{/owner}{/repo}',
            subscriptions_url:
              'https://api.github.com/users/mridang/subscriptions',
            organizations_url: 'https://api.github.com/users/mridang/orgs',
            repos_url: 'https://api.github.com/users/mridang/repos',
            events_url: 'https://api.github.com/users/mridang/events{/privacy}',
            received_events_url:
              'https://api.github.com/users/mridang/received_events',
            type: 'User',
            site_admin: false,
          },
          html_url: 'https://github.com/github/octocat',
          description:
            'Birdlittle is Github app acts as a deploy-gate and prevents deploying without workflows passing',
          fork: false,
          url: 'https://api.github.com/repos/github/octocat',
          forks_url: 'https://api.github.com/repos/github/octocat/forks',
          keys_url: 'https://api.github.com/repos/github/octocat/keys{/key_id}',
          collaborators_url:
            'https://api.github.com/repos/github/octocat/collaborators{/collaborator}',
          teams_url: 'https://api.github.com/repos/github/octocat/teams',
          hooks_url: 'https://api.github.com/repos/github/octocat/hooks',
          issue_events_url:
            'https://api.github.com/repos/github/octocat/issues/events{/number}',
          events_url: 'https://api.github.com/repos/github/octocat/events',
          assignees_url:
            'https://api.github.com/repos/github/octocat/assignees{/user}',
          branches_url:
            'https://api.github.com/repos/github/octocat/branches{/branch}',
          tags_url: 'https://api.github.com/repos/github/octocat/tags',
          blobs_url:
            'https://api.github.com/repos/github/octocat/git/blobs{/sha}',
          git_tags_url:
            'https://api.github.com/repos/github/octocat/git/tags{/sha}',
          git_refs_url:
            'https://api.github.com/repos/github/octocat/git/refs{/sha}',
          trees_url:
            'https://api.github.com/repos/github/octocat/git/trees{/sha}',
          statuses_url:
            'https://api.github.com/repos/github/octocat/statuses/{sha}',
          languages_url:
            'https://api.github.com/repos/github/octocat/languages',
          stargazers_url:
            'https://api.github.com/repos/github/octocat/stargazers',
          contributors_url:
            'https://api.github.com/repos/github/octocat/contributors',
          subscribers_url:
            'https://api.github.com/repos/github/octocat/subscribers',
          subscription_url:
            'https://api.github.com/repos/github/octocat/subscription',
          commits_url:
            'https://api.github.com/repos/github/octocat/commits{/sha}',
          git_commits_url:
            'https://api.github.com/repos/github/octocat/git/commits{/sha}',
          comments_url:
            'https://api.github.com/repos/github/octocat/comments{/number}',
          issue_comment_url:
            'https://api.github.com/repos/github/octocat/issues/comments{/number}',
          contents_url:
            'https://api.github.com/repos/github/octocat/contents/{+path}',
          compare_url:
            'https://api.github.com/repos/github/octocat/compare/{base}...{head}',
          merges_url: 'https://api.github.com/repos/github/octocat/merges',
          archive_url:
            'https://api.github.com/repos/github/octocat/{archive_format}{/ref}',
          downloads_url:
            'https://api.github.com/repos/github/octocat/downloads',
          issues_url:
            'https://api.github.com/repos/github/octocat/issues{/number}',
          pulls_url:
            'https://api.github.com/repos/github/octocat/pulls{/number}',
          milestones_url:
            'https://api.github.com/repos/github/octocat/milestones{/number}',
          notifications_url:
            'https://api.github.com/repos/github/octocat/notifications{?since,all,participating}',
          labels_url:
            'https://api.github.com/repos/github/octocat/labels{/name}',
          releases_url:
            'https://api.github.com/repos/github/octocat/releases{/id}',
          deployments_url:
            'https://api.github.com/repos/github/octocat/deployments',
          created_at: '2024-02-21T00:53:42Z',
          updated_at: '2024-10-01T04:41:58Z',
          pushed_at: '2024-10-01T04:41:55Z',
          git_url: 'git://github.com/github/octocat.git',
          ssh_url: 'git@github.com:github/octocat.git',
          clone_url: 'https://github.com/github/octocat.git',
          svn_url: 'https://github.com/github/octocat',
          homepage: 'https://github.com/apps/birdlittle',
          size: 9398,
          stargazers_count: 0,
          watchers_count: 0,
          language: 'TypeScript',
          has_issues: true,
          has_projects: false,
          has_downloads: true,
          has_wiki: false,
          has_pages: false,
          has_discussions: false,
          forks_count: 0,
          mirror_url: null,
          archived: false,
          disabled: false,
          open_issues_count: 6,
          license: {
            key: 'apache-2.0',
            name: 'Apache License 2.0',
            spdx_id: 'Apache-2.0',
            url: 'https://api.github.com/licenses/apache-2.0',
            node_id: 'MDc6TGljZW5zZTI=',
          },
          allow_forking: true,
          is_template: false,
          web_commit_signoff_required: false,
          topics: ['devex', 'github', 'github-app', 'probot', 'probot-app'],
          visibility: 'public',
          forks: 0,
          open_issues: 6,
          watchers: 0,
          default_branch: 'master',
        },
        sender: {
          login: 'mridang',
          id: 327432,
          node_id: 'MDQ6VXNlcjMyNzQzMg==',
          avatar_url: 'https://avatars.githubusercontent.com/u/327432?v=4',
          gravatar_id: '',
          url: 'https://api.github.com/users/mridang',
          html_url: 'https://github.com/mridang',
          followers_url: 'https://api.github.com/users/mridang/followers',
          following_url:
            'https://api.github.com/users/mridang/following{/other_user}',
          gists_url: 'https://api.github.com/users/mridang/gists{/gist_id}',
          starred_url:
            'https://api.github.com/users/mridang/starred{/owner}{/repo}',
          subscriptions_url:
            'https://api.github.com/users/mridang/subscriptions',
          organizations_url: 'https://api.github.com/users/mridang/orgs',
          repos_url: 'https://api.github.com/users/mridang/repos',
          events_url: 'https://api.github.com/users/mridang/events{/privacy}',
          received_events_url:
            'https://api.github.com/users/mridang/received_events',
          type: 'User',
          site_admin: false,
        },
        installation: {
          id: 47530305,
          node_id: 'MDIzOkludGVncmF0aW9uSW5zdGFsbGF0aW9uNDc1MzAzMDU=',
        },
      },
    });

    expect(mockCanaryService.runCanary).toHaveBeenCalledWith(
      47530305,
      11118767062,
      'production',
      'github',
      'octocat',
    );
  });
});
