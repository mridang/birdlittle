import { Probot } from 'probot';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export default class ProbotHandler {
  init(): (p: Probot) => void {
    return (app: Probot) => {
      const logger = new Logger(ProbotHandler.name);

      app.on('installation.deleted', async (context) => {
        const { account } = context.payload.installation;
        logger.log(`Some repositories removed on @${account.login}`);

        for (const repo of context.payload?.repositories || []) {
          logger.log(`Uninstalling schedules and rules for ${repo.full_name}`);
        }
      });
    };
  }
}
