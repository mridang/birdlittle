/**
 * @file Value types that split release identifiers and repository full names.
 */
export class Release {
  public readonly deploymentId: number;
  public readonly environmentName: string;

  constructor(releaseTxt: string) {
    this.deploymentId = Number(releaseTxt.split('/', 1)[0]);
    this.environmentName = releaseTxt.split('/', 2)[1];
  }
}

export default class Repository {
  public readonly orgName: string;
  public readonly repoName: string;

  constructor(fullName: string) {
    this.orgName = fullName.split('/', 1)[0];
    this.repoName = fullName.split('/', 2)[1];
  }
}
