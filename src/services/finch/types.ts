export class Release {
  public readonly deploymentId: number;
  public readonly environmentName: string;

  constructor(releaseTxt: string) {
    this.deploymentId = Number(releaseTxt.split('/')[0]);
    this.environmentName = releaseTxt.split('/')[1];
  }
}

export default class Repository {
  public readonly orgName: string;
  public readonly repoName: string;

  constructor(fullName: string) {
    this.orgName = fullName.split('/')[0];
    this.repoName = fullName.split('/')[1];
  }
}
