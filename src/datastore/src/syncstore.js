import CacheStore from './cachestore';
import { CacheRequest, RequestMethod } from 'src/request';
import { KinveyError } from 'src/errors';
import Query from 'src/query';
import Aggregation from 'src/aggregation';
import { KinveyObservable } from 'src/utils';
import url from 'url';

/**
 * The SyncStore class is used to find, create, update, remove, count and group entities. Entities are stored
 * in a cache and synced with the backend.
 */
export default class SyncStore extends CacheStore {
  get syncAutomatically() {
    return false;
  }

  /**
   * Find all entities in the data store. A query can be optionally provided to return
   * a subset of all entities in a collection or omitted to return all entities in
   * a collection. The number of entities returned adheres to the limits specified
   * at http://devcenter.kinvey.com/rest/guides/datastore#queryrestrictions.
   *
   * @param   {Query}                 [query]                             Query used to filter entities.
   * @param   {Object}                [options]                           Options
   * @param   {Properties}            [options.properties]                Custom properties to send with
   *                                                                      the request.
   * @param   {Number}                [options.timeout]                   Timeout for the request.
   * @param   {Boolean}               [options.useDeltaFetch]             Turn on or off the use of delta fetch.
   * @return  {Observable}                                                Observable.
   */
  find(query, options = {}) {
    const stream = KinveyObservable.create((observer) => {
      // Check that the query is valid
      if (query && !(query instanceof Query)) {
        return observer.error(new KinveyError('Invalid query. It must be an instance of the Query class.'));
      }

      // Fetch the cache entities
      const request = new CacheRequest({
        method: RequestMethod.GET,
        url: url.format({
          protocol: this.client.protocol,
          host: this.client.host,
          pathname: this.pathname,
          query: options.query
        }),
        properties: options.properties,
        query: query,
        timeout: options.timeout
      });

      // Execute the request
      return request.execute()
        .then(response => response.data)
        .then(data => observer.next(data))
        .then(() => observer.complete())
        .catch(error => observer.error(error));
    });

    return stream;
  }

  /**
   * Find a single entity in the data store by id.
   *
   * @param   {string}                id                               Entity by id to find.
   * @param   {Object}                [options]                        Options
   * @param   {Properties}            [options.properties]             Custom properties to send with
   *                                                                   the request.
   * @param   {Number}                [options.timeout]                Timeout for the request.
   * @param   {Boolean}               [options.useDeltaFetch]          Turn on or off the use of delta fetch.
   * @return  {Observable}                                             Observable.
   */
  findById(id, options = {}) {
    const stream = KinveyObservable.create((observer) => {
      try {
        // Fetch from the cache
        const request = new CacheRequest({
          method: RequestMethod.GET,
          url: url.format({
            protocol: this.client.protocol,
            host: this.client.host,
            pathname: `${this.pathname}/${id}`,
            query: options.query
          }),
          properties: options.properties,
          timeout: options.timeout
        });

        return request.execute()
          .then(response => response.data)
          .then(data => observer.next(data))
          .then(() => observer.complete())
          .catch(error => observer.error(error));
      } catch (error) {
        return observer.error(error);
      }
    });

    return stream;
  }

  /**
   * Group entities.
   *
   * @param   {Aggregation}           aggregation                         Aggregation used to group entities.
   * @param   {Object}                [options]                           Options
   * @param   {Properties}            [options.properties]                Custom properties to send with
   *                                                                      the request.
   * @param   {Number}                [options.timeout]                   Timeout for the request.
   * @return  {Observable}                                                Observable.
   */
  group(aggregation, options = {}) {
    const stream = KinveyObservable.create((observer) => {
      // Check that the aggregation is valid
      if (!(aggregation instanceof Aggregation)) {
        return observer.error(new KinveyError('Invalid aggregation. It must be an instance of the Aggregation class.'));
      }

      // Fetch the cache entities
      const request = new CacheRequest({
        method: RequestMethod.POST,
        url: url.format({
          protocol: this.client.protocol,
          host: this.client.host,
          pathname: `${this.pathname}/_group`
        }),
        properties: options.properties,
        aggregation: aggregation,
        timeout: options.timeout
      });

      // Execute the request
      return request.execute()
        .then(response => response.data)
        .then(result => observer.next(result))
        .then(() => observer.complete())
        .catch(error => observer.error(error));
    });
    return stream;
  }

  /**
   * Count all entities in the data store. A query can be optionally provided to return
   * a subset of all entities in a collection or omitted to return all entities in
   * a collection. The number of entities returned adheres to the limits specified
   * at http://devcenter.kinvey.com/rest/guides/datastore#queryrestrictions.
   *
   * @param   {Query}                 [query]                          Query used to filter entities.
   * @param   {Object}                [options]                        Options
   * @param   {Properties}            [options.properties]             Custom properties to send with
   *                                                                   the request.
   * @param   {Number}                [options.timeout]                Timeout for the request.
   * @return  {Observable}                                             Observable.
   */
  count(query, options = {}) {
    const stream = KinveyObservable.create((observer) => {
      try {
        if (query && !(query instanceof Query)) {
          throw new KinveyError('Invalid query. It must be an instance of the Query class.');
        }

        // Fetch the entities in the cache
        const request = new CacheRequest({
          method: RequestMethod.GET,
          url: url.format({
            protocol: this.client.protocol,
            host: this.client.host,
            pathname: this.pathname,
            query: options.query
          }),
          properties: options.properties,
          query: query,
          timeout: options.timeout
        });

        return request.execute()
          .then(response => response.data)
          .then(data => observer.next(data ? data.length : 0))
          .then(() => observer.complete())
          .catch(error => observer.error(error));
      } catch (error) {
        return observer.error(error);
      }
    });

    return stream;
  }
}
