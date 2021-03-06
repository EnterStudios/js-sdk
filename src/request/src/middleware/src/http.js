import Middleware from './middleware';
import { KinveyError } from 'src/errors';

export default class HttpMiddleware extends Middleware {
  constructor(name = 'Http Middleware') {
    super(name);
  }

  handle() {
    return Promise.reject(new KinveyError('Unable to send network request.',
      'Please override the core HttpMiddleware.'));
  }

  cancel() {
    return Promise.resolve();
  }
}
