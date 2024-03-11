import { Inject, Injectable, Logger } from '@nestjs/common';
import { RestEndpointMethods } from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/method-types';
import { Api } from '@octokit/plugin-rest-endpoint-methods/dist-types/types';
import { Octokit } from '@octokit/rest';
import { getZipFile } from '../../utils/archive';
import { Release } from './types';

@Injectable()
export default class CanaryService {
  private readonly logger = new Logger(CanaryService.name);

  public constructor(
    @Inject('GITHUB_FN')
    private readonly octokitFn: (
      installationId: number,
    ) => RestEndpointMethods & Api & Octokit,
    @Inject('WORKFLOW_NAME')
    private readonly workflowPath: string = '.github/workflows/cypress.yml',
  ) {
    //
  }

  async runCanary(
    installationId: number,
    deploymentId: number,
    environmentName: string,
    orgName: string,
    repoName: string,
  ) {
    const octokit = this.octokitFn(installationId);

    const response = await octokit.actions.listRepoWorkflows({
      owner: orgName,
      repo: repoName,
    });

    const workflow = response.data.workflows
      .filter((workflow) => workflow.path === this.workflowPath)
      .pop();

    if (workflow) {
      await octokit.actions.createWorkflowDispatch({
        owner: orgName,
        repo: repoName,
        workflow_id: workflow.id,
        ref: 'refs/heads/master',
        inputs: {
          release_identifier: `${deploymentId}/${environmentName}`,
        },
      });

      this.logger.log(`Triggered workflow ${this.workflowPath}`);
    } else {
      this.logger.warn(
        `No workflow ${this.workflowPath} found for ${orgName}/${repoName}`,
      );
    }
  }

  async handleGate(
    installationId: number,
    runId: number,
    orgName: string,
    repoName: string,
    approvalState: 'approved' | 'rejected',
  ) {
    const octokit = this.octokitFn(installationId);

    const {
      data: { artifacts },
    } = await octokit.request(
      'GET /repos/{owner}/{repo}/actions/runs/{run_id}/artifacts',
      {
        owner: orgName,
        repo: repoName,
        run_id: runId,
      },
    );

    const artifact = artifacts.find((artifact) => artifact.name === 'release');
    if (artifact === undefined) {
      throw new Error('Artifact not found.');
    } else {
      this.logger.log(`Downloading artifact ${artifact.archive_download_url}`);
      const archive = await octokit.request(
        `GET ${artifact.archive_download_url}`,
        {
          headers: {
            accept: 'application/octet-stream',
          },
          request: {
            redirect: 'follow',
          },
          mediaType: {
            format: '',
          },
        },
      );

      const releaseTxt = getZipFile(Buffer.from(archive.data), 'release.txt');
      this.logger.log(
        `Found release identifier ${releaseTxt.trim()} in archive`,
      );
      const releaseId = new Release(releaseTxt.trim());

      await octokit.request(
        'POST /repos/{owner}/{repo}/actions/runs/{run_id}/deployment_protection_rule',
        {
          owner: orgName,
          repo: repoName,
          run_id: releaseId.deploymentId,
          environment_name: releaseId.environmentName,
          state: approvalState,
        },
      );
    }
  }
}
