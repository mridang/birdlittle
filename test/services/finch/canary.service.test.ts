import { Octokit } from '@octokit/rest';
import CanaryService from '../../../src/services/finch/canary.service';
import nock from 'nock';
import { buildAxiosFetch } from '@lifeomic/axios-fetch';
import axios from 'axios';
import AdmZip from 'adm-zip';
import { HttpStatus } from '@nestjs/common';

describe('canary.service test', () => {
  beforeEach(() => {
    nock('https://api.github.com')
      .persist()
      .get('/repos/mridang/testing')
      .reply(HttpStatus.OK, {
        id: 748500999,
        node_id: 'R_kgDOLJ04Bw',
        name: 'testing',
        full_name: 'mridang/testing',
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
          events_url: 'https://api.github.com/users/mridang/events{/privacy}',
          received_events_url:
            'https://api.github.com/users/mridang/received_events',
          type: 'User',
          site_admin: false,
        },
        html_url: 'https://github.com/mridang/testing',
        description: 'A test repository to run integration tests against',
        fork: false,
        url: 'https://api.github.com/repos/mridang/testing',
        forks_url: 'https://api.github.com/repos/mridang/testing/forks',
        keys_url: 'https://api.github.com/repos/mridang/testing/keys{/key_id}',
        collaborators_url:
          'https://api.github.com/repos/mridang/testing/collaborators{/collaborator}',
        teams_url: 'https://api.github.com/repos/mridang/testing/teams',
        hooks_url: 'https://api.github.com/repos/mridang/testing/hooks',
        issue_events_url:
          'https://api.github.com/repos/mridang/testing/issues/events{/number}',
        events_url: 'https://api.github.com/repos/mridang/testing/events',
        assignees_url:
          'https://api.github.com/repos/mridang/testing/assignees{/user}',
        branches_url:
          'https://api.github.com/repos/mridang/testing/branches{/branch}',
        tags_url: 'https://api.github.com/repos/mridang/testing/tags',
        blobs_url:
          'https://api.github.com/repos/mridang/testing/git/blobs{/sha}',
        git_tags_url:
          'https://api.github.com/repos/mridang/testing/git/tags{/sha}',
        git_refs_url:
          'https://api.github.com/repos/mridang/testing/git/refs{/sha}',
        trees_url:
          'https://api.github.com/repos/mridang/testing/git/trees{/sha}',
        statuses_url:
          'https://api.github.com/repos/mridang/testing/statuses/{sha}',
        languages_url: 'https://api.github.com/repos/mridang/testing/languages',
        stargazers_url:
          'https://api.github.com/repos/mridang/testing/stargazers',
        contributors_url:
          'https://api.github.com/repos/mridang/testing/contributors',
        subscribers_url:
          'https://api.github.com/repos/mridang/testing/subscribers',
        subscription_url:
          'https://api.github.com/repos/mridang/testing/subscription',
        commits_url:
          'https://api.github.com/repos/mridang/testing/commits{/sha}',
        git_commits_url:
          'https://api.github.com/repos/mridang/testing/git/commits{/sha}',
        comments_url:
          'https://api.github.com/repos/mridang/testing/comments{/number}',
        issue_comment_url:
          'https://api.github.com/repos/mridang/testing/issues/comments{/number}',
        contents_url:
          'https://api.github.com/repos/mridang/testing/contents/{+path}',
        compare_url:
          'https://api.github.com/repos/mridang/testing/compare/{base}...{head}',
        merges_url: 'https://api.github.com/repos/mridang/testing/merges',
        archive_url:
          'https://api.github.com/repos/mridang/testing/{archive_format}{/ref}',
        downloads_url: 'https://api.github.com/repos/mridang/testing/downloads',
        issues_url:
          'https://api.github.com/repos/mridang/testing/issues{/number}',
        pulls_url:
          'https://api.github.com/repos/mridang/testing/pulls{/number}',
        milestones_url:
          'https://api.github.com/repos/mridang/testing/milestones{/number}',
        notifications_url:
          'https://api.github.com/repos/mridang/testing/notifications{?since,all,participating}',
        labels_url:
          'https://api.github.com/repos/mridang/testing/labels{/name}',
        releases_url:
          'https://api.github.com/repos/mridang/testing/releases{/id}',
        deployments_url:
          'https://api.github.com/repos/mridang/testing/deployments',
        created_at: '2024-01-26T05:28:39Z',
        updated_at: '2024-02-20T08:44:58Z',
        pushed_at: '2024-02-23T08:28:13Z',
        git_url: 'git://github.com/mridang/testing.git',
        ssh_url: 'git@github.com:mridang/testing.git',
        clone_url: 'https://github.com/mridang/testing.git',
        svn_url: 'https://github.com/mridang/testing',
        homepage: null,
        size: 34,
        stargazers_count: 0,
        watchers_count: 0,
        language: 'JavaScript',
        has_issues: false,
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
        license: null,
        allow_forking: true,
        is_template: false,
        web_commit_signoff_required: false,
        topics: [],
        visibility: 'public',
        forks: 0,
        open_issues: 6,
        watchers: 0,
        default_branch: 'master',
        permissions: {
          admin: true,
          maintain: true,
          push: true,
          triage: true,
          pull: true,
        },
        security_and_analysis: {
          secret_scanning: {
            status: 'disabled',
          },
          secret_scanning_push_protection: {
            status: 'disabled',
          },
          dependabot_security_updates: {
            status: 'enabled',
          },
          secret_scanning_validity_checks: {
            status: 'disabled',
          },
        },
        network_count: 0,
        subscribers_count: 0,
      })
      .get('/repos/mridang/testing/actions/workflows')
      .reply(HttpStatus.OK, {
        total_count: 4,
        workflows: [
          {
            id: 86719211,
            node_id: 'W_kwDOLJ04B84FKzrr',
            name: 'Run Canary',
            path: '.github/workflows/cypress.yml',
            state: 'active',
            created_at: '2024-02-20T15:44:55.000+07:00',
            updated_at: '2024-02-20T15:47:05.000+07:00',
            url: 'https://api.github.com/repos/mridang/testing/actions/workflows/86719211',
            html_url:
              'https://github.com/mridang/testing/blob/master/.github/workflows/cypress.yml',
            badge_url:
              'https://github.com/mridang/testing/workflows/Run%20Canary/badge.svg',
          },
          {
            id: 83767024,
            node_id: 'W_kwDOLJ04B84E_i7w',
            name: 'Deploy to Staging',
            path: '.github/workflows/deploy.yml',
            state: 'active',
            created_at: '2024-01-26T12:58:09.000+07:00',
            updated_at: '2024-01-26T12:58:09.000+07:00',
            url: 'https://api.github.com/repos/mridang/testing/actions/workflows/83767024',
            html_url:
              'https://github.com/mridang/testing/blob/master/.github/workflows/deploy.yml',
            badge_url:
              'https://github.com/mridang/testing/workflows/Deploy%20to%20Staging/badge.svg',
          },
          {
            id: 84064567,
            node_id: 'W_kwDOLJ04B84FArk3',
            name: 'Release to QA',
            path: '.github/workflows/fail.yml',
            state: 'active',
            created_at: '2024-01-29T17:31:55.000+07:00',
            updated_at: '2024-01-29T17:31:55.000+07:00',
            url: 'https://api.github.com/repos/mridang/testing/actions/workflows/84064567',
            html_url:
              'https://github.com/mridang/testing/blob/master/.github/workflows/fail.yml',
            badge_url:
              'https://github.com/mridang/testing/workflows/Release%20to%20QA/badge.svg',
          },
          {
            id: 83767025,
            node_id: 'W_kwDOLJ04B84E_i7x',
            name: 'Release to Production',
            path: '.github/workflows/release.yml',
            state: 'active',
            created_at: '2024-01-26T12:58:09.000+07:00',
            updated_at: '2024-01-26T12:58:09.000+07:00',
            url: 'https://api.github.com/repos/mridang/testing/actions/workflows/83767025',
            html_url:
              'https://github.com/mridang/testing/blob/master/.github/workflows/release.yml',
            badge_url:
              'https://github.com/mridang/testing/workflows/Release%20to%20Production/badge.svg',
          },
        ],
      })
      .post('/repos/mridang/testing/actions/workflows/86719211/dispatches')
      .reply(HttpStatus.OK, {})
      .get('/repos/mridang/testing/actions/runs/1314065581/artifacts')
      .reply(HttpStatus.OK, {
        total_count: 1,
        artifacts: [
          {
            id: 1314065581,
            node_id: 'MDg6QXJ0aWZhY3QxMzE0MDY1NTgx',
            name: 'release',
            size_in_bytes: 143,
            url: 'https://api.github.com/repos/mridang/testing/actions/artifacts/1314065581',
            archive_download_url:
              'https://api.github.com/repos/mridang/testing/actions/artifacts/1314065581/zip',
            expired: false,
            created_at: '2024-03-11T07:43:09Z',
            updated_at: '2024-03-11T07:43:09Z',
            expires_at: '2024-06-09T07:43:00Z',
            workflow_run: {
              id: 8229268347,
              repository_id: 748500999,
              head_repository_id: 748500999,
              head_branch: 'master',
              head_sha: '09e1a4e946c478762f3b88c90347a17a358d7fc8',
            },
          },
        ],
      })
      .get('/repos/mridang/testing/actions/artifacts/1314065581/zip')
      .reply(
        HttpStatus.OK,
        () => {
          const zip = new AdmZip();
          zip.addFile('release.txt', Buffer.from('666/hell'));
          return zip.toBuffer();
        },
        { 'Content-Type': 'application/zip' },
      )
      .post(
        '/repos/mridang/testing/actions/runs/666/deployment_protection_rule',
      )
      .reply(HttpStatus.OK, {});
  });

  afterEach(() => {
    nock.cleanAll();
  });

  test('that canaries are triggered"', async () => {
    const canaryService = new CanaryService(() => {
      return new Octokit({
        auth: 'no',
        request: {
          fetch: buildAxiosFetch(axios),
        },
      });
    });

    await canaryService.runCanary(1, 1, 'qa', 'mridang', 'testing');
    await canaryService.handleGate(
      1,
      1314065581,
      'mridang',
      'testing',
      'approved',
    );
  });
});
