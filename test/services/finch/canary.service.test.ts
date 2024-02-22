import { Octokit } from '@octokit/rest';
import CanaryService from '../../../src/services/finch/canary.service';
import Repository from '../../../src/services/finch/types';

describe('protection.service test', () => {
  const repoName = new Repository(process.env.JEST_GITHUB_REPO as string);
  const githubPat: string = process.env.JEST_GITHUB_PAT as string;

  test('that canaries are triggered"', async () => {
    const canaryService = new CanaryService(() => {
      return new Octokit({
        auth: githubPat,
      });
    });

    await canaryService.runCanary(
      1,
      1,
      'qa',
      repoName.orgName,
      repoName.orgName,
    );
  });
});
