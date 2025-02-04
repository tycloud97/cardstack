import config from 'config';
import * as Sentry from '@sentry/node';
import { JobHelpers, LogFunctionFactory, Logger, run as runWorkers } from 'graphile-worker';
import { LogLevel, LogMeta } from '@graphile/logger';
import { Factory, getOwner } from '@cardstack/di';
import logger from '@cardstack/logger';
import { runInitializers } from './main';

// Tasks
import PersistOffChainPrepaidCardCustomizationTask from './tasks/persist-off-chain-prepaid-card-customization';
import PersistOffChainMerchantInfoTask from './tasks/persist-off-chain-merchant-info';
import PersistOffChainCardSpaceTask from './tasks/persist-off-chain-card-space';
import boom from './tasks/boom';
import s3PutJson from './tasks/s3-put-json';
import NotifyMerchantClaimTask from './tasks/notify-merchant-claim';
import NotifyCustomerPaymentTask from './tasks/notify-customer-payment';
import SendNotificationsTask from './tasks/send-notifications';
import RemoveOldSentNotificationsTask from './tasks/remove-old-sent-notifications';

let dbConfig = config.get('db') as Record<string, any>;
const log = logger('hub/worker');

const workerLogFactory: LogFunctionFactory = (scope: any) => {
  return (level: LogLevel, message: any, meta?: LogMeta) => {
    switch (level) {
      case LogLevel.ERROR:
        log.error(message, scope, meta);
        break;
      case LogLevel.WARNING:
        log.warn(message, scope, meta);
        break;
      case LogLevel.INFO:
        log.info(message, scope, meta);
        break;
      case LogLevel.DEBUG:
        log.info(message, scope, meta);
    }
  };
};

export class HubWorker {
  constructor() {
    runInitializers();
  }

  instantiateTask(klass: Factory<unknown>): (payload: any, helpers: JobHelpers) => Promise<void> {
    return async (payload: any, helpers: JobHelpers): Promise<void> => {
      let task = (await getOwner(this).instantiate(klass)) as any;
      return task.perform(payload, helpers);
    };
  }

  async boot() {
    let runner = await runWorkers({
      logger: new Logger(workerLogFactory),
      connectionString: dbConfig.url,
      taskList: {
        boom: boom,
        'send-notifications': this.instantiateTask(SendNotificationsTask),
        'notify-merchant-claim': this.instantiateTask(NotifyMerchantClaimTask),
        'notify-customer-payment': this.instantiateTask(NotifyCustomerPaymentTask),
        'persist-off-chain-prepaid-card-customization': this.instantiateTask(
          PersistOffChainPrepaidCardCustomizationTask
        ),
        'persist-off-chain-merchant-info': this.instantiateTask(PersistOffChainMerchantInfoTask),
        'persist-off-chain-card-space': this.instantiateTask(PersistOffChainCardSpaceTask),
        'remove-old-sent-notifications': this.instantiateTask(RemoveOldSentNotificationsTask),
        's3-put-json': s3PutJson,
      },
      // https://github.com/graphile/worker#recurring-tasks-crontab
      // remove old notifications at midnight every day
      // 5am in utc equivalent to midnight in ny
      // 0 mins, 5 hours, any day (of month), any month, any day (of week), task
      crontab: '0 5 * * * remove-old-sent-notifications ?max=5',
    });

    runner.events.on('job:error', ({ error, job }) => {
      Sentry.withScope(function (scope) {
        scope.setTags({
          jobId: job.id,
          jobTask: job.task_identifier,
        });
        Sentry.captureException(error);
      });
    });

    await runner.promise;
  }
}

declare module '@cardstack/di' {
  interface KnownServices {
    hubWorker: HubWorker;
  }
}
