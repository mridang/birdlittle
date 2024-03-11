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
