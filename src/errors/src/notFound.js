import BaseError from './base';

export default class NotFoundError extends BaseError {
  constructor(message = 'The item was not found.', debug, code = 404, kinveyRequestId) {
    super('NotFoundError', message, debug, code, kinveyRequestId);
  }
}
